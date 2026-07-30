# Desglose de tarefas — prontas para Multica

Prefixo de IDs sugerido: **PV** (PetVote)
Todas as tarefas iniciam em **Spec Ready** (já têm SPEC em `02-spec.md`). Tablero: `Backlog → Spec Ready → To Do → In Progress → In Review (PR) → QA → Done`.

## Epic 0 — Spikes de risco (vão primeiro)
- **PV-001** — Spike: voto concorrente/idempotente via **RPC Postgres** no Supabase **Free**. Risco: alto. Timebox: 2 dias.
- **PV-002** — Spike: integração de eventos PostHog + Emarsys desde Next.js. Risco: médio. Timebox: 1-2 dias.
- **PV-004** — Spike: pipeline de imagens MinIO (presigned) + worker `sharp` + CDN. Risco: médio. Timebox: 1-2 dias.
- **PV-005** — Spike: realtime do voto (Redis contador+pubsub + SSE com throttle + rebuild). Risco: médio. Timebox: 1-2 dias.
- **PV-003** — Spike (condicional): validação de sócio via API Clube Condor. Risco: médio. Timebox: 1 dia. **Bloqueado por aprovação do PO** e pelo contrato da API Condor.

## Epic CI — Git workflow & CI/CD (ver 04-workflow-cicd.md)
- **PV-CI1** — Configurar branches `main` + `homologacao`, proteções e ambientes (deploy homolog/prod com aprovação manual em prod).
- **PV-CI2** — Pipeline CI: lint/typecheck, build, testes unitários, E2E (Playwright), migrações em Postgres efêmero.
- **PV-CI3** — Job do **agente revisor Gemini** (`ci/agente-revisor.mjs`): lê SPEC+Gherkin+diff, valida cobertura e convenções, comenta no PR. Risco: médio.
- **PV-CI4** — Deploy automático a homologação no merge + workflow de promoção `homologacao→main`.

## Epic 1 — Fundação
- **PV-010** — Setup do **monorepo** (pnpm workspaces + Turborepo): `apps/web`, `apps/worker-img`, `packages/{db,events,storage,realtime,config}`, `ci/`, CLAUDE.md e convenções de branch/PR.
- **PV-011** — Modelo de dados + migrações (`participante`, `cao`, `cao_foto`, `voto`, `regulamento`, view `ranking_likes`) + função `registrar_voto` (RPC) + RLS.
- **PV-012** — Camada de tracking (wrapper PostHog + Emarsys, server-side) — insumo do PV-002.
- **PV-013** — Infra de feature flags, incluindo `ff_condor_x2` (default OFF).
- **PV-014** — Infra MinIO: buckets (`originais/`, `variantes/`), CORS, presigned URLs no servidor, integração com a CDN.
- **PV-015** — Worker de imagens (Node + `sharp`): consumir fila, gerar thumb/medium WebP/AVIF, gravar variantes, atualizar `cao_foto`.

## Epic 2 — Cadastro e mascote
- **PV-020** — Registro de participante.
- **PV-021** — Formulário de inscrição da mascote (dados → DB) + upload de **até 5 fotos** ao MinIO via presigned + geração de slug. Depende de PV-014.
- **PV-022** — Evento `cadastro_mascote` (PostHog + Emarsys).

## Epic 3 — Feed, perfil e votação
- **PV-030** — Feed público **estilo Instagram com carrossel** (até 5 fotos por card), paginado por cursor, imagens via CDN.
- **PV-031** — Página pública de perfil da mascote (galeria/carrossel) + incremento de visualizações + URL curta.
- **PV-032** — Plugin de compartilhamento em redes sociais + evento `perfil_compartilhado`.
- **PV-033** — Route handler de voto chamando a RPC `registrar_voto` (peso no servidor) — depende de PV-001.
- **PV-034** — Anti-fraude: Turnstile + fingerprint + rate-limit + honeypot + evento `voto_bloqueado`.
- **PV-035** — Realtime: Redis (contador `total:cao:{id}` + pub/sub), INCRBY+PUBLISH no voto novo, endpoint SSE com throttle e rebuild a partir do Postgres — depende de PV-005 e PV-033.

## Epic 4 — Landing page
- **PV-040** — Landing page promocional com CTA para o formulário.
- **PV-041** — Widget do feed na landing (amostra de mascotes) + evento `landing_cta_click`.

## Epic 5 — Backoffice (moderadores)
- **PV-050** — Login e senha (Supabase Auth) + proteção de rotas `/admin/*`.
- **PV-055** — Fila de moderação: aprovar/reprovar inscrição (status `pendente`→`aprovado`/`reprovado`) + RLS que oculta não-aprovados do público. Risco: médio (bloqueia publicação pública).
- **PV-051** — CRUD de mascote.
- **PV-052** — Rankings: Top visualizações, Top likes, Top likes por raça.
- **PV-053** — Upload de regulamento.
- **PV-054** — Lista de participantes com mascote + exportação CSV/Excel.

## Epic 6 — Clube Condor (⚠️ pendente aprovação do PO)
- **PV-060** — Validação de sócio no cadastro (grava `dono_condor`) — depende de PV-003 e da aprovação do PO.
- **PV-061** — Aplicar `peso_voto = 2` atrás de `ff_condor_x2` + refletir no ranking ponderado.

## Resumo de dependências críticas
```
PV-001 ──► PV-033 ──► PV-034
PV-002 ──► PV-012 ──► PV-022, PV-032, PV-034, PV-041
PV-004 ──► PV-014 ──► PV-015, PV-021 ──► PV-030, PV-031 (imagens via CDN)
PV-005 ──► PV-035 (realtime Redis+SSE); PV-033 ──► PV-035
PV-011 ──► (quase tudo: cadastro, voto, rankings)
PV-050 ──► PV-055, PV-051, PV-052, PV-053, PV-054
PV-055 ──► PV-030 (feed só mostra aprovados), PV-033 (voto só em aprovado)
Aprovação PO + Contrato Condor ──► PV-003 ──► PV-060 ──► PV-061
```
