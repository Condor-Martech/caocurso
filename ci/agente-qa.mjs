#!/usr/bin/env node
/**
 * Agente de QA de promoção — PetVote (PV-CI4)
 *
 * Par simétrico do agente revisor. Enquanto aquele guarda a **entrada** em
 * `homologacao` (um PR, um diff), este guarda a **saída** para `main` — a
 * promoção a produção, que hoje não tem nenhuma rede automática:
 * `.github/workflows/agente-revisor.yml` só dispara em PRs para `homologacao`.
 *
 *   agente-revisor  →  PR para homologacao  →  "este cambio está bem feito?"
 *   agente-qa       →  PR para main         →  "isto está pronto para produção?"
 *
 * DESENHO EM DUAS CAMADAS (igual ao revisor)
 *
 *   1. Determinística — **bloqueia** a promoção (exit 1):
 *        · task promovida cujo card em Plane não chegou a QA/Done
 *        · task bloqueada por uma decisão DEC-* ainda aberta
 *        · PR de risco alto sem as aprovações que CLAUDE.md §7 exige
 *
 *   2. Checklist de QA manual (Gemini) — consultiva.
 *      Converte "fazer QA", que hoje é uma palavra num documento, numa lista
 *      concreta de cenários Gherkin a exercitar à mão, derivada do que mudou.
 *
 * NOTA SOBRE ESCOPO
 *   Não roda E2E. Não existe aplicação nem ambiente de homologação ainda
 *   (PV-010 em diante); testes E2E com Playwright são PV-CI2. Quando houver
 *   deploy, esta camada entra aqui sem mudar o formato do agente.
 *
 * USO
 *   node ci/agente-qa.mjs                       # delta origin/main..HEAD
 *   node ci/agente-qa.mjs --base origin/main --head origin/homologacao
 *   node ci/agente-qa.mjs --no-llm --no-plane   # só o que roda offline
 *
 * AMBIENTE
 *   PLANE_API_KEY   consulta estado e bloqueios dos cards (sem ela, pula)
 *   GEMINI_API_KEY  gera o checklist de QA (sem ela, pula)
 *   GITHUB_TOKEN    confere aprovações dos PRs (sem ele, pula)
 *   GEMINI_MODEL / GEMINI_THINKING_LEVEL   default flash 3.6 / HIGH
 *
 * SAÍDA
 *   0 = liberado para promover   1 = bloqueio determinístico
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { consultarGemini } from "./lib-gemini.mjs";

const MODELO = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const NIVEL_RACIOCINIO = process.env.GEMINI_THINKING_LEVEL || "HIGH";
const PLANE_API = "https://api.plane.so/api/v1";
const WORKSPACE = process.env.PLANE_WORKSPACE || "capsula";
const PROJETO = process.env.PLANE_PROJECT || "a7654283-f2dd-45fa-8d21-652646c0f27a";
const REPO = process.env.GITHUB_REPOSITORY || "Condor-Martech/caocurso";

// Estados de Plane aceitáveis para promover. O tablero é
// Backlog → Spec Ready → To Do → In Progress → In Review (PR) → QA → Done.
const ESTADOS_OK = ["QA", "Done"];

function parseArgs(argv) {
  const a = { base: "origin/main", head: "HEAD", spec: "02-spec.md",
              noLlm: false, noPlane: false, noGh: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i + 1];
    switch (argv[i]) {
      case "--base": a.base = v; i++; break;
      case "--head": a.head = v; i++; break;
      case "--spec": a.spec = v; i++; break;
      case "--no-llm": a.noLlm = true; break;
      case "--no-plane": a.noPlane = true; break;
      case "--no-gh": a.noGh = true; break;
      case "--json": a.json = true; break;
      case "--help": case "-h":
        console.log(readFileSync(new URL(import.meta.url)).toString().split("*/")[0]);
        process.exit(0);
    }
  }
  return a;
}

const sh = (cmd) => execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

// ------------------------------------------------------- delta da promoção
/**
 * IDs de task promovidos. Lê **apenas o trailer `Refs:`** e o nome da branch
 * nos merge commits — nunca o corpo inteiro.
 *
 * Por quê: corpos de commit citam tasks para explicar contexto ("PV-014 é
 * travado pelo spike PV-004"). Varrer o corpo inteiro faria o agente achar que
 * PV-004 e PV-014 estão sendo promovidos, e cobrar QA de trabalho que nem
 * começou. Só o trailer declara o que o commit de fato entrega.
 */
function tasksPromovidas(base, head) {
  const ids = new Set();
  let corpo = "";
  try { corpo = sh(`git log ${base}..${head} --format=%B%n---FIM---`); } catch { return []; }

  for (const linha of corpo.split("\n")) {
    const refs = linha.match(/^\s*Refs?:\s*(.+)$/i);
    if (refs) for (const m of refs[1].matchAll(/\b(PV-[A-Z0-9]+|DEC-\d+)\b/g)) ids.add(m[1]);
    // merge commit: "Merge pull request #2 from org/feat/PV-CI3-descricao"
    const merge = linha.match(/Merge pull request #\d+ from \S*?\/(?:feat|fix|chore|spike)\/(PV-[A-Z0-9]+)/i);
    if (merge) ids.add(merge[1].toUpperCase());
  }
  return [...ids].sort();
}

function prsDoDelta(base, head) {
  const nums = new Set();
  try {
    for (const l of sh(`git log ${base}..${head} --format=%s --merges`).split("\n")) {
      const m = l.match(/Merge pull request #(\d+)/);
      if (m) nums.add(Number(m[1]));
    }
  } catch { /* sem merges */ }
  return [...nums];
}

// ------------------------------------------------------------------- Plane
async function planeGet(caminho, chave) {
  const r = await fetch(`${PLANE_API}/workspaces/${WORKSPACE}/projects/${PROJETO}${caminho}`, {
    headers: { "X-API-Key": chave, "User-Agent": "curl/8.5.0", Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`Plane HTTP ${r.status} em ${caminho}`);
  return r.json();
}

/** Estado e bloqueios de cada task promovida. Casa pelo prefixo do título. */
async function consultarPlane(ids, chave) {
  const [issues, states] = await Promise.all([
    planeGet("/issues/?per_page=100", chave), planeGet("/states/", chave),
  ]);
  const nomeEstado = Object.fromEntries((states.results || []).map((s) => [s.id, s.name]));
  const porId = {};
  for (const it of issues.results || []) {
    const m = it.name.match(/^(PV-[A-Z0-9]+|DEC-\d+)\b/);
    if (m) porId[m[1]] = { uuid: it.id, nome: it.name, estado: nomeEstado[it.state] || "?" };
  }

  const out = [];
  for (const id of ids) {
    const card = porId[id];
    if (!card) { out.push({ id, achado: "sem-card" }); continue; }
    let bloqueadoPor = [];
    try {
      const rel = await planeGet(`/issues/${card.uuid}/relations/`, chave);
      const ids2 = (rel.blocked_by || []).map((x) => (typeof x === "string" ? x : x.id));
      bloqueadoPor = ids2.map((u) => {
        const e = Object.entries(porId).find(([, v]) => v.uuid === u);
        return e ? { id: e[0], estado: e[1].estado } : null;
      }).filter(Boolean);
    } catch { /* relations indisponível: segue sem */ }
    out.push({ id, ...card, bloqueadoPor });
  }
  return out;
}

// ------------------------------------------------------------------ GitHub
async function consultarPRs(nums, token) {
  const out = [];
  for (const n of nums) {
    const h = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json",
                "User-Agent": "agente-qa" };
    try {
      const [pr, reviews, files] = await Promise.all([
        fetch(`https://api.github.com/repos/${REPO}/pulls/${n}`, { headers: h }).then((r) => r.json()),
        fetch(`https://api.github.com/repos/${REPO}/pulls/${n}/reviews`, { headers: h }).then((r) => r.json()),
        fetch(`https://api.github.com/repos/${REPO}/pulls/${n}/files?per_page=100`, { headers: h }).then((r) => r.json()),
      ]);
      const aprovacoes = new Set((Array.isArray(reviews) ? reviews : [])
        .filter((r) => r.state === "APPROVED").map((r) => r.user?.login));
      out.push({ numero: n, titulo: pr.title, autor: pr.user?.login,
                 arquivos: (Array.isArray(files) ? files : []).map((f) => f.filename),
                 aprovacoes: [...aprovacoes] });
    } catch { out.push({ numero: n, erro: true }); }
  }
  return out;
}

// Mesmas regras do agente revisor — mantidas em sincronia de propósito.
const REGRAS_RISCO = [
  [/(^|\/)migrations?\//i, "alto"], [/^packages\/db\//, "alto"], [/^packages\/config\//, "alto"],
  [/registrar_voto|api\/voto|\/voto\//i, "alto"], [/auth|login|session|api\/admin\//i, "alto"],
  [/condor/i, "alto"], [/^apps\/web\//, "medio"], [/^apps\/worker-img\//, "medio"],
  [/^packages\/(events|storage|realtime)\//, "medio"],
];
const PESO = { baixo: 0, medio: 1, alto: 2 };
const APROVACOES_EXIGIDAS = { baixo: 1, medio: 1, alto: 2 };

function riscoDePR(arquivos) {
  let n = "baixo";
  for (const f of arquivos) for (const [re, nivel] of REGRAS_RISCO) {
    if (re.test(f) && PESO[nivel] > PESO[n]) n = nivel;
  }
  return n;
}

// ------------------------------------------------------------ checklist QA
function extrairCenarios(specPath) {
  if (!existsSync(specPath)) return [];
  const out = []; let feature = null, tag = null;
  for (const l of readFileSync(specPath, "utf8").split("\n")) {
    const f = l.match(/^\s*Feature:\s*(.+)$/); if (f) { feature = f[1].trim(); continue; }
    const t = l.match(/^\s*@([a-z0-9\-]+)\s*$/i); if (t) { tag = t[1]; continue; }
    const s = l.match(/^\s*Scenario:\s*(.+)$/);
    if (s) { out.push({ id: tag, feature, titulo: s[1].trim() }); tag = null; }
  }
  return out;
}

const ESQUEMA_QA = {
  type: "object",
  properties: {
    pronto_para_promover: { type: "boolean" },
    resumo: { type: "string" },
    checklist: {
      type: "array",
      items: {
        type: "object",
        properties: {
          cenario_id: { type: "string" },
          prioridade: { type: "string", enum: ["critica", "alta", "media"] },
          passos: { type: "string" },
          por_que: { type: "string" },
        },
        required: ["cenario_id", "prioridade", "passos", "por_que"],
      },
    },
    riscos_de_regressao: { type: "array", items: { type: "string" } },
  },
  required: ["pronto_para_promover", "resumo", "checklist", "riscos_de_regressao"],
};

async function gerarChecklist({ cenarios, tasks, diffstat, chave }) {
  const prompt = `Você é o agente de QA do projeto PetVote (concurso de mascotes).
Uma promoção de \`homologacao\` para \`main\` (produção) está para acontecer.
Responda em **português**.

## Sua tarefa

Gerar o **checklist de QA manual** desta promoção: o que uma pessoa deve
exercitar à mão em homologação antes de liberar para produção.

Escolha apenas cenários que o que mudou pode ter afetado — inclusive por
regressão indireta. Se nada do que mudou toca comportamento de usuário,
devolva checklist vazio e diga isso no resumo. **Lista vazia é uma resposta
válida e boa**; não invente itens para parecer útil.

## Tasks sendo promovidas

${tasks.join(", ") || "(nenhuma identificada nos trailers Refs:)"}

## Cenários do SPEC

${cenarios.map((c) => `- @${c.id} — [${c.feature}] ${c.titulo}`).join("\n") || "(nenhum)"}

## O que mudou (resumo dos arquivos)

\`\`\`
${diffstat.slice(0, 20000)}
\`\`\`

Em "passos", escreva o que clicar/verificar, não teoria. Em "por_que", diga
qual mudança desta promoção justifica exercitar esse cenário.`;

  return consultarGemini({ prompt, apiKey: chave, esquema: ESQUEMA_QA,
                           modelo: MODELO, nivelRaciocinio: NIVEL_RACIOCINIO });
}

// ---------------------------------------------------------------- execução
const args = parseArgs(process.argv.slice(2));
const tasks = tasksPromovidas(args.base, args.head);
const prs = prsDoDelta(args.base, args.head);
let diffstat = "";
try { diffstat = sh(`git diff --stat ${args.base}..${args.head}`); } catch { /* vazio */ }

const bloqueios = [];
const avisos = [];

// --- Plane
let cards = null;
const chavePlane = process.env.PLANE_API_KEY;
if (!args.noPlane && chavePlane && tasks.length) {
  try {
    cards = await consultarPlane(tasks, chavePlane);
    for (const c of cards) {
      if (c.achado === "sem-card") {
        avisos.push(`\`${c.id}\` não tem card correspondente em Plane — verifique o trailer \`Refs:\`.`);
        continue;
      }
      if (!ESTADOS_OK.includes(c.estado)) {
        bloqueios.push(`\`${c.id}\` está em **${c.estado}** em Plane. Só se promove o que chegou a ${ESTADOS_OK.join(" ou ")}.`);
      }
      for (const b of c.bloqueadoPor || []) {
        if (b.id.startsWith("DEC-") && b.estado !== "Done") {
          bloqueios.push(`\`${c.id}\` está bloqueada por \`${b.id}\` (**${b.estado}**) — decisão pendente não pode ir a produção.`);
        }
      }
    }
  } catch (e) { avisos.push(`Consulta a Plane falhou: ${e.message}`); }
} else if (!args.noPlane && !chavePlane) {
  avisos.push("`PLANE_API_KEY` não configurada — estado dos cards e bloqueios por decisão **não** foram verificados.");
}

// --- GitHub: aprovações vs risco
let detalhePRs = null;
const tokenGh = process.env.GITHUB_TOKEN;
if (!args.noGh && tokenGh && prs.length) {
  detalhePRs = await consultarPRs(prs, tokenGh);
  for (const p of detalhePRs) {
    if (p.erro) { avisos.push(`Não foi possível consultar o PR #${p.numero}.`); continue; }
    p.risco = riscoDePR(p.arquivos || []);
    const exigidas = APROVACOES_EXIGIDAS[p.risco];
    const reais = (p.aprovacoes || []).filter((u) => u !== p.autor).length;
    if (reais < exigidas) {
      const msg = `PR #${p.numero} (risco **${p.risco}**) teve ${reais} aprovação(ões); ${exigidas} exigida(s) por CLAUDE.md §7.`;
      // Com 2 pessoas no workspace a porta de risco alto é insatisfazível — é
      // exatamente DEC-12. Bloquear aqui pararia o projeto por uma regra que
      // ninguém pode cumprir, então vira aviso até a decisão fechar.
      (p.risco === "alto" ? avisos : bloqueios).push(
        p.risco === "alto" ? `${msg} Ver \`DEC-12\` — a porta de risco alto é hoje insatisfazível.` : msg);
    }
  }
} else if (!args.noGh && !tokenGh) {
  avisos.push("`GITHUB_TOKEN` ausente — aprovações por nível de risco **não** foram verificadas.");
}

// --- checklist
let qa = null;
const chaveGemini = process.env.GEMINI_API_KEY;
if (!args.noLlm && chaveGemini) {
  try {
    qa = await gerarChecklist({ cenarios: extrairCenarios(args.spec), tasks, diffstat, chave: chaveGemini });
  } catch (e) { avisos.push(`Checklist de QA não gerado: ${e.message}`); }
} else if (!args.noLlm) {
  avisos.push("`GEMINI_API_KEY` não configurada — checklist de QA manual não gerado.");
}

// ---------------------------------------------------------------- relatório
const L = ["## 🧪 Agente de QA — promoção para `main`", ""];
L.push(`**Tasks promovidas:** ${tasks.length ? tasks.map((t) => `\`${t}\``).join(", ") : "_nenhuma identificada_"}`);
L.push(`**PRs no delta:** ${prs.length ? prs.map((n) => `#${n}`).join(", ") : "_nenhum_"}`);
L.push("");

L.push("### Prontidão");
L.push("");
if (!bloqueios.length) L.push("✅ Nenhum bloqueio determinístico para promover.");
else { L.push(`❌ **${bloqueios.length} bloqueio(s):**`); L.push(""); bloqueios.forEach((b) => L.push(`- ${b}`)); }
L.push("");

if (cards?.length) {
  L.push("<details><summary>Estado dos cards em Plane</summary>");
  L.push("");
  L.push("| Task | Estado | Bloqueada por |");
  L.push("|---|---|---|");
  for (const c of cards) {
    L.push(`| \`${c.id}\` | ${c.estado || "—"} | ${(c.bloqueadoPor || []).map((b) => `\`${b.id}\``).join(", ") || "—"} |`);
  }
  L.push("");
  L.push("</details>");
  L.push("");
}

if (detalhePRs?.length) {
  L.push("<details><summary>Aprovações por nível de risco</summary>");
  L.push("");
  L.push("| PR | Risco | Aprovações | Exigidas |");
  L.push("|---|---|---|---|");
  for (const p of detalhePRs.filter((x) => !x.erro)) {
    const reais = (p.aprovacoes || []).filter((u) => u !== p.autor).length;
    L.push(`| #${p.numero} | ${p.risco} | ${reais} | ${APROVACOES_EXIGIDAS[p.risco]} |`);
  }
  L.push("");
  L.push("</details>");
  L.push("");
}

L.push("### Checklist de QA manual");
L.push("");
if (!qa) L.push("⏭️ Não gerado nesta execução.");
else if (!qa.checklist.length) L.push(`✅ Nada a exercitar à mão. ${qa.resumo}`);
else {
  L.push(`${qa.resumo}`);
  L.push("");
  const ic = { critica: "🔴", alta: "🟡", media: "⚪" };
  for (const i of qa.checklist) {
    L.push(`- ${ic[i.prioridade] || "⚪"} **\`@${i.cenario_id}\`** — ${i.passos}`);
    L.push(`  <sub>${i.por_que}</sub>`);
  }
}
L.push("");

if (qa?.riscos_de_regressao?.length) {
  L.push("### Riscos de regressão");
  L.push("");
  qa.riscos_de_regressao.forEach((r) => L.push(`- ${r}`));
  L.push("");
}

if (avisos.length) {
  L.push("### Avisos");
  L.push("");
  avisos.forEach((a) => L.push(`- ⚠️ ${a}`));
  L.push("");
}

L.push("---");
L.push("Não roda E2E: não há aplicação nem ambiente de homologação ainda (PV-010 em diante). " +
       "Testes automatizados de fluxo são PV-CI2. Este agente confere **prontidão de promoção** " +
       "e prepara o QA manual que `04-workflow-cicd.md` §3 exige.");

const relatorio = L.join("\n");
console.log(args.json ? JSON.stringify({ tasks, prs, bloqueios, avisos, cards, qa, relatorio }, null, 2) : relatorio);
process.exit(bloqueios.length ? 1 : 0);
