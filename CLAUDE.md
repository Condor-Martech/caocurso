# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# CLAUDE.md — Concurso de Mascotes (PetVote)

Autoridade de convenções deste repositório. Todo agente (e humano) lê este arquivo antes de tocar em código. Deriva de `02-spec.md`; se houver conflito, o SPEC manda e este arquivo deve ser atualizado.

## 0. Estado atual do repositório (leia primeiro)

⚠️ **Este repositório ainda não tem código de produto.** Não há `package.json`, `pnpm-workspace.yaml` nem `turbo.json`. Tudo em §2b/§7 é a estrutura **planejada**, não a existente.

O que **já existe**: git inicializado com as duas branches permanentes (`main` e `homologacao`), `.gitignore`, template de PR (`.github/pull_request_template.md`) e template de commit (`.gitmessage`).

Consequências práticas:
- Não procure `apps/`, `packages/` ou `ci/` — não existem ainda.
- A primeira task de código é **PV-010** (setup do monorepo). Antes dela vêm os spikes do Epic 0.
- Ao scaffoldar, siga exatamente a árvore de §2b — ela é contrato, não sugestão.
- **Não há repositório remoto**, portanto **não há proteção de branch**: a regra de §5 (nunca commitar direto em `main`) é convenção não aplicada. Trabalhe a partir de `homologacao`.

### ⚠️ O backlog vive em Plane, não neste repositório

**Antes de escolher ou começar qualquer task, consulte Plane** — workspace `capsula`, projeto **CaoCurso**. `03-tareas.md` está **congelado**: serve como registro do desglose inicial, não como backlog vivo.

Repartição de autoridade:
- **Plane** manda no **operacional**: estado, ordem, atribuição, o que está bloqueado.
- **Git** manda no **conteúdo**: PRD, SPEC, Gherkin, este arquivo.

Três prefixos de ID convivem, de propósito:

| Prefixo | O que é | Onde aparece |
|---|---|---|
| `PV-XXX` | **Tarefa**, vinda de `03-tareas.md` | Branch, commit e título do PR (§5) |
| `DEC-XX` | **Decisão pendente** — não é tarefa | State `Aguardando decisão`, módulo "Decisões pendentes" |
| `CAOCURSO-n` | ID interno gerado por Plane | Só na UI de Plane |

**Uma `DEC-` não se desenvolve, se resolve.** Tem dono (PO, jurídico, tech lead) e ao ser fechada destrava trabalho. Se a task que você pegou está `Blocked by` uma `DEC-` aberta, **ela não pode ser fechada** — escale a decisão em vez de improvisar uma resposta. O porquê de cada uma fica na Page "Registro de decisões (ADR)" de Plane.

### Mapa dos documentos

| Arquivo | Autoridade sobre | Consultar quando |
|---|---|---|
| `00-prd.md` | Escopo, personas, métricas, o que está **fora** da v1 | Dúvida se algo é requisito |
| `01-poc-spikes.md` | Riscos técnicos abertos, critérios GO/NO-GO e **fallbacks** | Antes de implementar voto, realtime, imagens ou Condor |
| `02-spec.md` | **Fonte da verdade técnica**: schema, RPC, contratos de API, Gherkin | Sempre; é o documento que o agente revisor de CI valida |
| `03-tareas.md` | ⚠️ **Congelado.** Registro do desglose inicial e do grafo original | Só para consultar a origem de um `PV-XXX` |
| **Plane** (`capsula`/CaoCurso) | **Backlog vivo**: estado, dependências, decisões pendentes | **Antes de escolher, paralelizar ou fechar qualquer task** |
| `04-workflow-cicd.md` | Branches, pipeline, regra de não-conflito entre agentes | Ao abrir branch/PR ou mexer em CI |
| `MEMORY.md` | Preferências permanentes do owner (Alejandro) | Ao gerar qualquer documento |

**Idioma:** documentos gerados (PRD/SPEC/tarefas/PR) sempre em **português**; diagramas podem ser em espanhol (`MEMORY.md`). Código, identificadores e nomes de tabela/evento seguem o SPEC (português, sem acento).

## 1. Contexto do produto

Plataforma web de **concurso de mascotes** com inscrição, feed estilo Instagram (carrossel de até 5 fotos), votação pública sem login, páginas de perfil compartilháveis e backoffice de moderação. Documentação-fonte: `00-prd.md`, `01-poc-spikes.md`, `02-spec.md`, `03-tareas.md`.

## 2. Stack e infraestrutura

- **Frontend/SSR:** Next.js (App Router) + TypeScript + Tailwind.
- **Backend/DB:** Supabase **Free** (Postgres + Auth de moderadores). Tratar as cotas do free tier como restrição real.
- **Fotos:** MinIO self-hosted (S3-compatible) + CDN própria. **Nunca** usar Supabase Storage.
- **Processamento de imagem:** worker Node + `sharp` (gera WebP/AVIF). Não processar imagem em Edge Function.
- **Realtime de voto:** Redis (contador + pub/sub) + SSE com throttle.
- **Eventos:** PostHog (produto) e Emarsys (CRM), sempre disparados do servidor.

**Por que este stack é assim:** quase toda decisão de arquitetura existe para caber no **Supabase Free**. Voto vira RPC Postgres (não Edge Function) para não gastar cota de invocação; fotos vão para MinIO (não Supabase Storage) para não gastar banda; realtime vira Redis+SSE (não Supabase Realtime) pelos limites de conexão do Free. Ao propor alternativas, essa restrição é o primeiro filtro.

## 2b. Monorepo (planejado — ver §0)

Projeto será um **monorepo** (pnpm workspaces + Turborepo):

```
apps/web            Next.js (público + backoffice + route handlers: voto, SSE, presign)
apps/worker-img     worker Node + sharp (processa fotos do MinIO)
packages/db         schema, migrações, cliente Supabase, RPC registrar_voto
packages/events     wrapper tracking PostHog + Emarsys (nomes canônicos)
packages/storage    cliente MinIO (presign)
packages/realtime   cliente Redis (contador + pub/sub)
packages/config     tsconfig/eslint/prettier compartilhados
ci/agente-revisor.mjs   agente revisor Gemini
```

Regras: tipos e contratos compartilhados moram em `packages/*` e são importados pelos `apps/*` — **nunca duplicar** (modelo de dados, nomes de eventos). Comandos rodam via Turborepo (`pnpm turbo run build|lint|test`), que processa só os projetos afetados pelo diff. Ao criar dependência entre pacotes, declará-la no `package.json` do workspace.

## 2c. Comandos

Nada está scaffoldado ainda. Estes são os **contratos de script** que o CI (`04-workflow-cicd.md` §4) já assume — ao criar o monorepo em PV-010, eles precisam existir com estes nomes exatos, senão o pipeline quebra:

```bash
pnpm install --frozen-lockfile

# Validação (o que o CI roda em todo PR para homologacao)
pnpm turbo run lint typecheck --filter='...[origin/homologacao]'
pnpm turbo run build          --filter='...[origin/homologacao]'
pnpm turbo run test           --filter='...[origin/homologacao]'   # unitários dos afetados
pnpm --filter web test:e2e                                          # Playwright
pnpm --filter db migrate:test                                       # migrações em Postgres efêmero
```

`--filter='...[origin/homologacao]'` = só os workspaces afetados pelo diff contra `homologacao`. Rodar a suíte inteira localmente é desperdício; use o filtro ou `--filter <workspace>`.

Escopo estreito (convenção esperada, dado Vitest + Playwright do CI):

```bash
pnpm --filter db test                       # um workspace inteiro
pnpm --filter db test -- registrar_voto     # arquivos que casam com o padrão
pnpm --filter db test -- -t "voto duplicado"   # um caso pelo nome
pnpm --filter web test:e2e -- e2e/voto.spec.ts -g "idempot"   # um E2E
```

O agente revisor roda fora do Turborepo:

```bash
node ci/agente-revisor.mjs --spec 02-spec.md --diff <url> --claude-md CLAUDE.md
# sai != 0 se faltar cobertura de Gherkin ou violar convenções
```

## 3. Regras de ouro (não negociáveis)

1. **Nenhum código sem SPEC, nenhum SPEC sem PRD.** Toda tarefa referencia seu SPEC.
2. **O peso do voto é SEMPRE resolvido no servidor** (RPC Postgres a partir do estado da mascote). O cliente **nunca** envia `peso`.
3. **A votação usa a RPC `registrar_voto`** (idempotente, `SECURITY DEFINER`), não INSERT direto do cliente nem Edge Function.
4. **Nenhuma credencial no cliente:** chaves de PostHog server-key, Emarsys, Condor e MinIO ficam só no servidor. Presigned URLs do MinIO com expiração curta.
5. **Conteúdo só é público após aprovação do moderador** (`status = 'aprovado'`). Feed, perfil, widget e rankings filtram por aprovados via RLS.
6. **Redis é cache de leitura, não fonte da verdade.** Total sempre reconstruível a partir do Postgres.
7. Se não colaria num canal público de Slack, não cola num prompt (sem PII, segredos ou dados sob NDA).

## 4. Convenções de banco

- Tabelas do SPEC §3 (nomes exatos, sem prefixo genérico): `participante`, `cao`, `cao_foto`, `voto`, `regulamento`, mais a view `ranking_likes`. Novas tabelas do domínio da mascote usam prefixo `cao_`.
- Toda mudança de schema via **migração versionada** (nada de alteração manual no painel).
- RLS **sempre ativa**; escrita de voto só pela RPC (`service_role`); tabelas de backoffice restritas a moderadores autenticados.
- `cao_foto`: 1 a 5 por mascote (`check ordem between 1 and 5` + validação na aplicação).
- **Peso do voto é denormalizado de propósito:** `cao.peso_voto` guarda o peso corrente da mascote e `voto.peso` recebe uma cópia no instante do voto. Votos já registrados não mudam se o dono virar sócio depois — isso é intencional, não um bug. Os rankings somam `voto.peso`, nunca recalculam por `cao.peso_voto`.

## 5. Git workflow (resumo — detalhe em `04-workflow-cicd.md`)

- Um issue = uma branch = um PR (rastreabilidade completa). O ID da task (`PV-XXX`) vai na branch, nos commits e no título do PR.
- Branches permanentes: **`main`** (produção) e **`homologacao`** (homologação/staging). PR de feature aponta para `homologacao`; `main` só recebe merge de `homologacao` após QA + aprovação manual.
- Branches de trabalho: `feat/PV-XXX-...`, `fix/PV-XXX-...`, `chore/PV-XXX-...`, `spike/PV-XXX-...` (spike **nunca** é mergeada). Apagadas após o merge.
- **Conventional Commits** com tag de IA, ex.: `feat(voto): rpc idempotente [ai-assisted: claude-sonnet]`.
- PRs pequenos e focados.

## 5b. CI/CD (detalhe em `04-workflow-cicd.md`)

- Todo PR para `homologacao` passa por: lint/typecheck → build → testes unitários → E2E (Playwright) → migrações em Postgres efêmero.
- Job do **agente revisor com Gemini**: lê SPEC + Gherkin + diff, valida cobertura por cenário, confere disclosure de IA e aderência a este CLAUDE.md, aponta riscos com nº de linha. Aprovação do agente é necessária, **não** suficiente — humano continua obrigatório.
- Merge em `homologacao` → deploy a homologação; promoção `homologacao → main` com aprovação manual → produção. Rollback alvo < 10 min.

## 5c. Agentes em paralelo

Vários agentes só rodam ao mesmo tempo se **não houver conflito**: arquivos disjuntos, sem dependência entre tasks, sem tocar a mesma migração/tabela. Cada agente usa **sua própria branch e PR** — nunca dois na mesma branch. Havendo sobreposição, executa-se em série.

**Confira o campo `Blocked by` em Plane, não a intuição nem o grafo congelado de `03-tareas.md`.** Hoje só ~12 das 38 tasks estão realmente livres, e quase todas são spikes do Epic 0 ou CI — a maioria está travada pelo seu próprio spike. Os gargalos atuais: `PV-050` trava 5 itens, `PV-012` e `PV-011` travam 4 cada, `DEC-01` trava 3.

No monorepo o limite natural é o workspace. Exceções que **sempre** serializam, porque todo mundo depende delas: `packages/db` (schema/migrações) e `packages/config`.

## 6. Template de PR (obrigatório)

- Referência ao issue que fecha.
- Checklist dos **cenários Gherkin** cobertos (do `02-spec.md`).
- **Disclosure de IA:** modelo usado e se o código foi revisado linha a linha.
- Checklist: testes unitários, sem segredos no diff, migrações testadas, feature flags quando aplicável.

## 7. Governança por nível de risco

- **Baixo** (docs, config, boilerplate): agente revisor + 1 aprovação humana.
- **Médio** (features de negócio, endpoints não críticos): agente + 1 aprovação + testes E2E se toca fluxos compartilhados.
- **Alto** (voto, autenticação, migrações de dados, integração Condor): agente + **2 aprovações** + QA manual em staging + **feature flag obrigatória**. Alvo de rollback < 10 min.

⚠️ **A porta de risco alto é hoje insatisfazível e está em disputa (`DEC-12`).** O time tem 2 pessoas: descontando o autor, sobra **1 aprovador possível**, não 2. Isso trava exatamente o núcleo do produto (`PV-011` schema, `PV-033` voto, `PV-034` anti-fraude, `PV-050` auth). Enquanto `DEC-12` não fechar, não invente uma regra alternativa por conta própria — escale.

## 8. Feature flags

- `ff_condor_x2` — mecânica de voto x2 do Clube Condor. **Default OFF.** ⚠️ Pendente de aprovação do PO; não tratar como requisito até aprovado.
- Novas flags para qualquer mudança em fluxo de voto/auth.

## 9. Eventos (nomes canônicos)

`cadastro_mascote`, `voto_registrado`, `voto_bloqueado`, `perfil_compartilhado`, `landing_cta_click`. Emitir server-side para PostHog e (quando mapeado) Emarsys. Não renomear sem atualizar o SPEC.

## 10. Testes

- Unitários na lógica de voto e resolução de peso.
- E2E do fluxo crítico: cadastro → moderação → publicação → voto (com idempotência) → realtime.
- Testes de carga (k6/autocannon) para a RPC de voto e o SSE (ver spikes PV-001 e PV-005).

## 11. Definição de pronto (DoD)

Cenários Gherkin do SPEC cobertos; testes passando; sem segredos; migração aplicada em staging; flag configurada (se risco médio/alto); PR aprovado conforme o nível de risco.

## 12. Armadilhas conhecidas nos documentos

Pontos onde os docs se contradizem ou não fecham. **Não copie o SPEC cegamente nestes trechos** — resolva e atualize o SPEC no mesmo PR.

1. **A RPC `registrar_voto` do SPEC §3 não compila.** `v_novo` é declarada `boolean`, recebe `GET DIAGNOSTICS ... ROW_COUNT` e depois é comparada com `v_novo > 0` — não existe operador `boolean > integer` em Postgres. Declare a contagem como `integer` (ex.: `v_linhas integer`) e retorne `v_linhas > 0`. Ao implementar PV-011/PV-033, corrija e sincronize o SPEC.
2. **A RPC ignora `ff_condor_x2`.** Ela lê `cao.peso_voto` direto, mas o Gherkin "Flag desligada trata todos como peso 1" exige peso 1 com a flag OFF. Com a flag OFF e uma linha `peso_voto = 2` no banco, o comportamento atual viola o cenário. Decida onde a flag entra (não gravar `peso_voto = 2` enquanto OFF **ou** a RPC consultar a flag) e registre no SPEC.
3. **SPEC §3 (RLS) diz "escrita de voto só via Edge Function".** Contradiz a regra de ouro nº 3 e o resto do SPEC: é via **RPC**. Vale a RPC.
4. **SPEC §9 cita branches `staging` e `main`.** Está desatualizado; as permanentes são **`homologacao`** e `main` (§5 e `04-workflow-cicd.md`).
5. **SPEC §1 remete a "estrutura em §8", mas a estrutura está em §7** (não existe §8).
6. **`voto.chave_votante` = `hash(ip + cookie + fingerprint)`** e a unicidade é `UNIQUE(cao_id, chave_votante)` — ou seja, **1 voto por votante por mascote**, não 1 voto global. O PRD §8 ainda lista isso como pergunta aberta; o schema já decidiu. Confirmar com o PO antes de mudar.

---
Documentos vivos. Ao mudar arquitetura, atualize `02-spec.md` **e** este CLAUDE.md no mesmo PR.
