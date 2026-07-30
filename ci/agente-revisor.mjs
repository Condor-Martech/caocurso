#!/usr/bin/env node
/**
 * Agente revisor de PR — PetVote (PV-CI3)
 *
 * Roda no pipeline a cada PR para `homologacao`. Ver 04-workflow-cicd.md §3 estágio 2.
 *
 * DESENHO EM DUAS CAMADAS
 *
 *   1. Verificações determinísticas — regex e globs, sem LLM. São rápidas,
 *      gratuitas e 100% reprodutíveis, então **bloqueiam** (exit 1):
 *        · segredo no diff
 *        · arquivo proibido versionado (.env, *.csv, chaves)
 *        · commit fora de Conventional Commits
 *        · nível de risco declarado no PR menor que o derivado dos paths
 *
 *   2. Cobertura de Gherkin — a única pergunta que exige julgamento, logo a
 *      única que vai ao LLM (Gemini Pro). Por padrão é **consultiva**: comenta
 *      e não bloqueia. Um veredicto probabilístico que barra um PR correto
 *      treina o time a ignorar o CI. Use --strict para torná-la bloqueante.
 *
 * O nível de risco é **derivado do diff**, nunca aceito por autodeclaração:
 * um agente que abre PR marcaria o nível que acredita, e ninguém verifica.
 *
 * USO
 *   node ci/agente-revisor.mjs                          # diff contra origin/homologacao
 *   node ci/agente-revisor.mjs --diff <url|arquivo|->
 *   node ci/agente-revisor.mjs --no-llm                 # só a camada determinística
 *   node ci/agente-revisor.mjs --strict                 # cobertura também bloqueia
 *   node ci/agente-revisor.mjs --list-models            # valida a chave e lista modelos
 *
 * AMBIENTE
 *   GEMINI_API_KEY  obrigatória (exceto com --no-llm / --list-models)
 *   GEMINI_MODEL    default: gemini-3.1-pro-preview
 *
 * SAÍDA
 *   0 = aprovado   1 = violação determinística   2 = cobertura faltando (--strict)
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const MODELO = process.env.GEMINI_MODEL || "gemini-3.1-pro-preview";
const API = "https://generativelanguage.googleapis.com/v1beta";

// ---------------------------------------------------------------- argumentos
function parseArgs(argv) {
  const a = {
    spec: "02-spec.md", claudeMd: "CLAUDE.md", base: "origin/homologacao",
    diff: null, prBody: null, noLlm: false, strict: false,
    listModels: false, json: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i + 1];
    switch (argv[i]) {
      case "--spec": a.spec = v; i++; break;
      case "--claude-md": a.claudeMd = v; i++; break;
      case "--diff": a.diff = v; i++; break;
      case "--base": a.base = v; i++; break;
      case "--pr-body": a.prBody = v; i++; break;
      case "--no-llm": a.noLlm = true; break;
      case "--strict": a.strict = true; break;
      case "--list-models": a.listModels = true; break;
      case "--json": a.json = true; break;
      case "--help": case "-h":
        console.log(readFileSync(new URL(import.meta.url)).toString().split("*/")[0]);
        process.exit(0);
    }
  }
  return a;
}

// ---------------------------------------------------------------- obter diff
async function obterDiff({ diff, base }) {
  if (diff === "-") return readFileSync(0, "utf8");
  if (diff && /^https?:\/\//.test(diff)) {
    const r = await fetch(diff, { headers: { Accept: "application/vnd.github.v3.diff" } });
    if (!r.ok) throw new Error(`falha ao baixar o diff: HTTP ${r.status}`);
    return r.text();
  }
  if (diff && existsSync(diff)) return readFileSync(diff, "utf8");
  // fallback: diff local contra a base
  try {
    execSync(`git rev-parse --verify ${base}`, { stdio: "ignore" });
  } catch {
    // sem a base (checkout raso): compara com o commit anterior
    base = "HEAD~1";
  }
  return execSync(`git diff ${base}...HEAD`, { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
}

function arquivosDoDiff(diff) {
  return [...diff.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((m) => m[1]).filter((f) => f !== "dev/null");
}

function linhasAdicionadas(diff) {
  const out = [];
  let arquivo = null, linha = 0;
  for (const l of diff.split("\n")) {
    const fm = l.match(/^\+\+\+ b\/(.+)$/);
    if (fm) { arquivo = fm[1]; continue; }
    const hm = l.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (hm) { linha = parseInt(hm[1], 10) - 1; continue; }
    if (l.startsWith("+") && !l.startsWith("+++")) { linha++; out.push({ arquivo, linha, texto: l.slice(1) }); }
    else if (!l.startsWith("-")) linha++;
  }
  return out;
}

// ------------------------------------------------- 1. verificações determinísticas
const PADROES_SEGREDO = [
  [/plane_api_[A-Za-z0-9]{16,}/, "token de API do Plane"],
  [/AIza[0-9A-Za-z_\-]{35}/, "chave de API do Google/Gemini"],
  [/gh[pousr]_[A-Za-z0-9]{36,}/, "token do GitHub"],
  [/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/, "chave privada"],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, "JWT (possível service_role do Supabase)"],
  [/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/, "chave secreta de provedor externo"],
  [/(?:api[_-]?key|secret|senha|password|token)\s*[:=]\s*["'][^"'\s]{16,}["']/i, "credencial embutida no código"],
];

const ARQUIVOS_PROIBIDOS = [
  [/(^|\/)\.env$/, ".env"], [/(^|\/)\.env\.(?!example)/, ".env.*"],
  [/\.csv$/i, "*.csv"], [/(^|\/)secret-key-/, "secret-key-*"],
  [/\.(pem|key|p12|pfx)$/i, "arquivo de chave"], [/^\.~lock\./, "lock do LibreOffice"],
];

// Nível de risco derivado dos paths — CLAUDE.md §7.
// A ordem importa: o primeiro padrão que casar define o nível.
const REGRAS_RISCO = [
  [/(^|\/)migrations?\//i, "alto", "migração de banco"],
  [/^packages\/db\//, "alto", "schema, RPC ou RLS"],
  [/^packages\/config\//, "alto", "config compartilhada (todos dependem)"],
  [/registrar_voto|api\/voto|\/voto\//i, "alto", "fluxo de voto"],
  [/auth|login|session|api\/admin\//i, "alto", "autenticação ou backoffice"],
  [/condor/i, "alto", "integração Clube Condor"],
  [/^apps\/web\//, "medio", "aplicação web"],
  [/^apps\/worker-img\//, "medio", "worker de imagens"],
  [/^packages\/(events|storage|realtime)\//, "medio", "pacote compartilhado"],
  [/\.md$|^ci\/|^\.github\/|^\.git|package\.json$|turbo\.json$/, "baixo", "documentação, CI ou config"],
];
const PESO_RISCO = { baixo: 0, medio: 1, alto: 2 };

function derivarRisco(arquivos) {
  let nivel = "baixo";
  const motivos = [];
  for (const f of arquivos) {
    for (const [re, n, motivo] of REGRAS_RISCO) {
      if (re.test(f)) {
        if (PESO_RISCO[n] > PESO_RISCO[nivel]) nivel = n;
        if (PESO_RISCO[n] >= 1) motivos.push(`\`${f}\` → ${n} (${motivo})`);
        break;
      }
    }
  }
  return { nivel, motivos: [...new Set(motivos)] };
}

function riscoDeclarado(prBody) {
  if (!prBody) return null;
  const marcado = [...prBody.matchAll(/^\s*-\s*\[x\]\s*\*\*(Baixo|Médio|Alto)\*\*/gim)].map((m) =>
    m[1].toLowerCase().replace("é", "e"));
  return marcado[0] || null;
}

const RE_CONVENTIONAL = /^(feat|fix|chore|docs|test|refactor|perf|build|ci|style|revert)(\([a-z0-9\-_,\s]+\))?!?: .{3,}/;

function commitsDoRange(base) {
  try {
    return execSync(`git log ${base}..HEAD --format=%s`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split("\n").map((s) => s.trim()).filter(Boolean);
  } catch { return []; }
}

function checksDeterministicos({ diff, arquivos, base, prBody }) {
  const achados = [];

  for (const { arquivo, linha, texto } of linhasAdicionadas(diff)) {
    for (const [re, desc] of PADROES_SEGREDO) {
      if (re.test(texto)) {
        achados.push({ tipo: "segredo", bloqueia: true, arquivo, linha,
          msg: `Possível ${desc} no diff. Nenhuma credencial pode ser versionada (CLAUDE.md §3, regra 4).` });
      }
    }
  }

  for (const f of arquivos) {
    for (const [re, desc] of ARQUIVOS_PROIBIDOS) {
      if (re.test(f)) {
        achados.push({ tipo: "arquivo-proibido", bloqueia: true, arquivo: f,
          msg: `Arquivo do tipo \`${desc}\` não deve ser versionado. Confira o .gitignore.` });
      }
    }
  }

  const commits = commitsDoRange(base);
  for (const c of commits) {
    if (!RE_CONVENTIONAL.test(c)) {
      achados.push({ tipo: "commit", bloqueia: true,
        msg: `Commit fora de Conventional Commits: \`${c.slice(0, 72)}\` (CLAUDE.md §5).` });
    }
  }

  const { nivel, motivos } = derivarRisco(arquivos);
  const declarado = riscoDeclarado(prBody);
  if (declarado && PESO_RISCO[declarado] < PESO_RISCO[nivel]) {
    achados.push({ tipo: "risco", bloqueia: true,
      msg: `Risco declarado no PR: **${declarado}**. Derivado dos arquivos tocados: **${nivel}**. ` +
           `O nível não pode ser autodeclarado abaixo do real — ele define quantas aprovações o merge exige (CLAUDE.md §7).` });
  }

  const comAiTag = commits.filter((c) => /\[ai-assisted\]/.test(c)).length;
  return { achados, nivel, motivos, commits, comAiTag, declarado };
}

// ------------------------------------------------------ 2. cobertura de Gherkin
function extrairCenarios(specPath) {
  const src = readFileSync(specPath, "utf8");
  const cenarios = [];
  let feature = null, tag = null;
  for (const linha of src.split("\n")) {
    const f = linha.match(/^\s*Feature:\s*(.+)$/);
    if (f) { feature = f[1].trim(); continue; }
    const t = linha.match(/^\s*@([a-z0-9\-]+)\s*$/i);
    if (t) { tag = t[1]; continue; }
    const s = linha.match(/^\s*Scenario:\s*(.+)$/);
    if (s) { cenarios.push({ id: tag, feature, titulo: s[1].trim() }); tag = null; }
  }
  return cenarios;
}

const ESQUEMA = {
  type: "object",
  properties: {
    veredicto: { type: "string", enum: ["aprovar", "solicitar_mudancas"] },
    resumo: { type: "string" },
    cenarios: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          afetado: { type: "boolean" },
          coberto: { type: "boolean" },
          justificativa: { type: "string" },
        },
        required: ["id", "afetado", "coberto", "justificativa"],
      },
    },
    riscos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          arquivo: { type: "string" },
          linha: { type: "integer" },
          severidade: { type: "string", enum: ["alta", "media", "baixa"] },
          descricao: { type: "string" },
        },
        required: ["arquivo", "severidade", "descricao"],
      },
    },
  },
  required: ["veredicto", "resumo", "cenarios", "riscos"],
};

function montarPrompt({ cenarios, diff, claudeMd, nivel }) {
  return `Você é o agente revisor de CI do projeto PetVote (concurso de mascotes).
Revise o diff de um pull request. Responda em **português**.

## Sua única tarefa de julgamento

Para cada cenário Gherkin abaixo, decida:
- **afetado**: este diff mexe no comportamento que o cenário descreve?
- **coberto**: se afetado, o diff inclui teste que exercita esse cenário?

Se um cenário não é afetado por este diff, marque afetado=false e coberto=true
(não há nada a cobrir). Só marque coberto=false quando o diff **muda** o
comportamento do cenário e **não** traz teste para ele.

Seja conservador: na dúvida sobre se algo é um teste válido, considere coberto.
Um falso positivo que barra um PR correto é mais caro do que um falso negativo.

## Cenários do SPEC (02-spec.md §5)

${cenarios.map((c) => `- @${c.id} — [${c.feature}] ${c.titulo}`).join("\n")}

## Convenções do projeto (CLAUDE.md, trecho)

${claudeMd.slice(0, 6000)}

## Nível de risco derivado dos arquivos tocados

**${nivel}**

## Diff

\`\`\`diff
${diff.slice(0, 180000)}
\`\`\`

## Também aponte

Riscos concretos de segurança ou correção, com arquivo e linha. Priorize as
regras de ouro do CLAUDE.md: peso do voto resolvido no servidor, nenhuma
credencial no cliente, escrita de voto só pela RPC, conteúdo público só quando
aprovado, Redis nunca como fonte da verdade.

Não relate questões de estilo. Não invente riscos para parecer útil: uma lista
vazia é uma resposta válida e boa.`;
}

async function revisarComGemini({ prompt, apiKey }) {
  const r = await fetch(`${API}/models/${MODELO}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: ESQUEMA,
      },
    }),
  });
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!txt) throw new Error(`resposta sem conteúdo: ${JSON.stringify(j).slice(0, 300)}`);
  return JSON.parse(txt);
}

async function listarModelos(apiKey) {
  const r = await fetch(`${API}/models`, { headers: { "x-goog-api-key": apiKey } });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  for (const m of j.models || []) {
    if ((m.supportedGenerationMethods || []).includes("generateContent")) {
      console.log(`  ${m.name.replace("models/", "")}`);
    }
  }
}

// ---------------------------------------------------------------- relatório
function montarRelatorio({ det, llm, nivel, motivos, arquivos, semLlm }) {
  const L = [];
  const bloqueios = det.achados.filter((a) => a.bloqueia);
  const semCobertura = (llm?.cenarios || []).filter((c) => c.afetado && !c.coberto);

  L.push("## 🤖 Agente revisor");
  L.push("");
  L.push(`**Nível de risco derivado:** \`${nivel}\` · ${arquivos.length} arquivo(s) · ` +
         `${det.commits.length} commit(s), ${det.comAiTag} com \`[ai-assisted]\``);
  if (motivos.length) {
    L.push("");
    L.push("<details><summary>Por que este nível</summary>");
    L.push("");
    motivos.forEach((m) => L.push(`- ${m}`));
    L.push("");
    L.push("</details>");
  }
  L.push("");

  L.push("### Verificações determinísticas");
  L.push("");
  if (!bloqueios.length) {
    L.push("✅ Sem segredos, sem arquivos proibidos, commits no padrão, risco coerente.");
  } else {
    L.push(`❌ **${bloqueios.length} violação(ões) — bloqueiam o merge:**`);
    L.push("");
    for (const a of bloqueios) {
      const onde = a.arquivo ? ` \`${a.arquivo}${a.linha ? `:${a.linha}` : ""}\`` : "";
      L.push(`- **[${a.tipo}]**${onde} ${a.msg}`);
    }
  }
  L.push("");

  L.push("### Cobertura de cenários Gherkin");
  L.push("");
  if (semLlm) {
    L.push("⏭️ Camada de LLM desativada nesta execução.");
  } else if (!llm) {
    L.push("⚠️ Não foi possível consultar o modelo. As verificações determinísticas acima seguem valendo.");
  } else if (!semCobertura.length) {
    const afetados = llm.cenarios.filter((c) => c.afetado);
    L.push(afetados.length
      ? `✅ ${afetados.length} cenário(s) afetado(s), todos com cobertura: ${afetados.map((c) => `\`@${c.id}\``).join(", ")}`
      : "✅ Nenhum cenário do SPEC é afetado por este diff.");
  } else {
    L.push(`⚠️ **${semCobertura.length} cenário(s) afetado(s) sem teste:**`);
    L.push("");
    for (const c of semCobertura) L.push(`- \`@${c.id}\` — ${c.justificativa}`);
  }
  L.push("");

  if (llm?.riscos?.length) {
    L.push("### Riscos apontados");
    L.push("");
    for (const r of llm.riscos) {
      const ic = { alta: "🔴", media: "🟡", baixa: "⚪" }[r.severidade] || "⚪";
      L.push(`- ${ic} \`${r.arquivo}${r.linha ? `:${r.linha}` : ""}\` — ${r.descricao}`);
    }
    L.push("");
  }

  if (llm?.resumo) { L.push(`> ${llm.resumo}`); L.push(""); }

  L.push("---");
  L.push(nivel === "alto"
    ? "⚠️ **Risco alto:** exige 2 aprovações humanas, QA manual em homologação e feature flag (CLAUDE.md §7). " +
      "Ver `DEC-12` em Plane — hoje a porta é insatisfazível com 2 pessoas."
    : "A aprovação deste agente é **necessária, não suficiente**. Revisão humana continua obrigatória.");
  return L.join("\n");
}

// ---------------------------------------------------------------- main
const args = parseArgs(process.argv.slice(2));
const apiKey = process.env.GEMINI_API_KEY;

if (args.listModels) {
  if (!apiKey) { console.error("GEMINI_API_KEY não definida."); process.exit(1); }
  await listarModelos(apiKey);
  process.exit(0);
}

const diff = await obterDiff(args);
if (!diff.trim()) { console.log("Diff vazio — nada a revisar."); process.exit(0); }

const arquivos = arquivosDoDiff(diff);
const prBody = args.prBody && existsSync(args.prBody) ? readFileSync(args.prBody, "utf8") : args.prBody;
const det = checksDeterministicos({ diff, arquivos, base: args.base, prBody });

let llm = null, erroLlm = null;
const semLlm = args.noLlm || !apiKey;
if (!semLlm) {
  try {
    llm = await revisarComGemini({
      apiKey,
      prompt: montarPrompt({
        cenarios: extrairCenarios(args.spec),
        diff,
        claudeMd: existsSync(args.claudeMd) ? readFileSync(args.claudeMd, "utf8") : "",
        nivel: det.nivel,
      }),
    });
  } catch (e) { erroLlm = e.message; }
} else if (!args.noLlm) {
  erroLlm = "GEMINI_API_KEY não definida";
}

const relatorio = montarRelatorio({ det, llm, nivel: det.nivel, motivos: det.motivos, arquivos, semLlm: args.noLlm });
console.log(args.json ? JSON.stringify({ ...det, llm, erroLlm, relatorio }, null, 2) : relatorio);
if (erroLlm && !args.noLlm) console.error(`\n[aviso] camada de LLM indisponível: ${erroLlm}`);

const bloqueios = det.achados.filter((a) => a.bloqueia).length;
const semCobertura = (llm?.cenarios || []).filter((c) => c.afetado && !c.coberto).length;
if (bloqueios) process.exit(1);
if (args.strict && semCobertura) process.exit(2);
process.exit(0);
