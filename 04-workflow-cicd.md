# Workflow de Git & CI/CD — Concurso de Mascotes (PetVote)

Deriva de `02-spec.md` e `CLAUDE.md`. Define como o código sai da branch até produção, com um agente revisor (Gemini) rodando os testes no pipeline.

> **Monorepo:** o repositório é um monorepo (pnpm workspaces + Turborepo) com `apps/web`, `apps/worker-img`, `packages/*` e `ci/`. O CI usa o grafo do Turborepo (`--filter`/affected) para rodar lint/test/build **só nos projetos afetados** pelo diff, encurtando o pipeline.

## 1. Branches

Duas branches permanentes:

- **`main`** — produção. Só recebe merge vindo de `homologacao`, após QA e aprovação manual.
- **`homologacao`** — ambiente de homologação (staging). Alvo dos PRs de feature.

Branches de trabalho (temporárias, uma por task, apagadas após o merge):

- `feat/<PV-XXX>-descricao` — nova funcionalidade.
- `fix/<PV-XXX>-descricao` — correção.
- `chore/<PV-XXX>-descricao` — infra, config, docs.
- `spike/<PV-XXX>-descricao` — POC/spike; **nunca é mergeada** (só o achado vira PRD/SPEC).

Regra: **um issue = uma branch = um PR**. O ID da task (ex.: `PV-033`) vai no nome da branch, nos commits e no título do PR.

## 2. Fluxo por task

```
task (Spec Ready) → abre branch feat/PV-XXX → commits → push
   → abre PR contra homologacao
   → CI (lint, build, testes) + agente revisor Gemini
   → aprovação humana conforme risco
   → merge em homologacao → deploy automático a homologação
   → QA em homologação
   → PR/promote homologacao → main (aprovação manual) → deploy a produção
```

Estados no board (Multica): `Backlog → Spec Ready → To Do → In Progress → In Review (PR) → QA → Done`.

## 3. Pipeline CI/CD

### Estágio 1 — Validação (em todo PR para `homologacao`)
1. **Lint + typecheck** (ESLint + `tsc --noEmit`).
2. **Build** do Next.js.
3. **Testes unitários** (Vitest/Jest) — foco: lógica de voto, resolução de `peso_voto`.
4. **Testes E2E** (Playwright) do fluxo crítico: cadastro → moderação → publicação → voto idempotente → realtime.
5. **Migrações**: aplicar num Postgres efêmero e validar.

### Estágio 2 — Agente revisor (Gemini)
Um job dedicado roda um **agente de IA usando Gemini** que:
- Lê o **SPEC + cenários Gherkin** (`02-spec.md`) + o **diff do PR**.
- Gera/roda a suíte de testes e verifica **cobertura por cenário Gherkin** (cada critério de aceitação tem teste).
- Confere o **disclosure de IA** do PR (modelo usado, revisão linha a linha).
- Valida aderência ao `CLAUDE.md` (peso no servidor, sem credenciais no cliente, RLS, etc.).
- Marca riscos de segurança/performance **com número de linha**.
- Emite veredicto **aprovar / solicitar mudanças** como comentário no PR.

> Uso de Gemini aqui é aceitável por ser tarefa de revisão/testes (baixo/médio risco). A aprovação do agente é **necessária, mas não suficiente** — a revisão humana continua obrigatória.

### Estágio 3 — Deploy
- Merge em `homologacao` → **deploy automático a homologação**.
- Promoção `homologacao → main` → **deploy a produção**, apenas após QA + **aprovação manual** no ambiente de produção.
- Rollback alvo **< 10 min** (revert do merge + redeploy; feature flags para desligar funcionalidade sem redeploy).

### Gate de aprovação por risco (definido no CLAUDE.md)
- Baixo: agente + 1 humano.
- Médio: agente + 1 humano + E2E.
- Alto (voto, auth, migrações, Condor): agente + **2 humanos** + QA manual em homologação + **feature flag**.

## 4. Esqueleto do workflow (GitHub Actions)

```yaml
name: ci
on:
  pull_request:
    branches: [homologacao]

jobs:
  validar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint typecheck --filter='...[origin/homologacao]'
      - run: pnpm turbo run build --filter='...[origin/homologacao]'
      - run: pnpm turbo run test --filter='...[origin/homologacao]'   # unitários (afetados)
      - run: pnpm --filter web test:e2e                                # Playwright
      - run: pnpm --filter db migrate:test                             # migrações em Postgres efêmero

  revisor-gemini:
    needs: validar
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Agente revisor (Gemini)
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: node ci/agente-revisor.mjs \
              --spec 02-spec.md \
              --diff "${{ github.event.pull_request.diff_url }}" \
              --claude-md CLAUDE.md
        # sai != 0 se faltar cobertura de Gherkin ou violar convenções

  deploy-homologacao:
    needs: [validar, revisor-gemini]
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - run: echo "deploy homologação"

# Workflow separado: promover homologacao -> main com aprovação manual (environment protegido)
```

## 5. Agentes em paralelo (regra de não-conflito)

Múltiplos agentes podem trabalhar **simultaneamente** apenas se **não houver risco de conflito**. Critérios:

- **Sem sobreposição de arquivos:** cada agente atua em conjuntos de arquivos disjuntos.
- **Sem dependência entre tasks:** não paralelizar tasks ligadas por seta em `03-tareas.md` (ex.: `PV-014 → PV-015` são sequenciais).
- **Sem tocar a mesma migração/tabela** no mesmo intervalo.
- **Domínios independentes** podem rodar em paralelo, ex.: imagens (PV-014/015) ‖ eventos (PV-012) ‖ landing (PV-040/041).
- **No monorepo, o limite natural é o workspace:** agentes em `apps/*`/`packages/*` diferentes tendem a não conflitar; mudanças em `packages/db` (schema) ou `packages/config` afetam vários consumidores → tratar como bloqueante e serializar.

Se dois agentes precisam do mesmo arquivo, tabela ou de uma task bloqueante, roda-se **em série**. Cada agente abre **sua própria branch e PR** — nunca dois agentes na mesma branch. Em caso de conflito detectado, o segundo PR rebaseia sobre o primeiro já mergeado.

Exemplo de lote paralelo seguro (após a fundação):
```
Agente A → feat/PV-014 (MinIO)        }
Agente B → feat/PV-012 (tracking)     }  paralelos: arquivos e domínios disjuntos
Agente C → feat/PV-040 (landing)      }
```
Exemplo que NÃO paraleliza: `PV-033` (voto) e `PV-035` (realtime) — 035 depende de 033.

## 6. Conventional Commits + disclosure de IA

- `feat(voto): rpc idempotente registrar_voto [ai-assisted: claude-sonnet]`
- `chore(ci): job do agente revisor gemini [ai-assisted: gemini]`
- PR sempre com: issue fechado, checklist de Gherkin coberto, modelo de IA usado e se houve revisão linha a linha.
