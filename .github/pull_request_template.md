<!--
Template obrigatório — CLAUDE.md §6.
PRs de feature apontam para `homologacao`, nunca para `main`.
Branch: feat|fix|chore|spike / PV-XXX - descricao
-->

## Task

- **ID:** PV-XXX <!-- o mesmo que está na branch e nos commits -->
- **Plane:** CAOCURSO-XX <!-- link do work item -->
- **Módulo (épico):**

## O que muda

<!-- Uma ou duas frases. PRs pequenos e focados. -->

## Nível de risco

<!-- CLAUDE.md §7 — marque um. Define quantas aprovações são necessárias. -->

- [ ] **Baixo** (docs, config, boilerplate) → agente revisor + 1 aprovação humana
- [ ] **Médio** (features de negócio, endpoints não críticos) → agente + 1 aprovação + E2E se toca fluxo compartilhado
- [ ] **Alto** (voto, autenticação, migrações de dados, integração Condor) → agente + **2 aprovações** + QA manual em homologação + **feature flag obrigatória**

## Cenários Gherkin cobertos

<!--
Copie de 02-spec.md §5 os cenários que este PR cobre e marque os que têm teste.
O agente revisor de CI valida esta cobertura cenário a cenário.
-->

- [ ] `Feature: ... / Scenario: ...`

## Disclosure de IA

<!-- CLAUDE.md §6 — obrigatório, o agente revisor confere. -->

- **Modelo usado:**
- [ ] O código foi revisado **linha a linha** por um humano
- [ ] Os commits levam a tag `[ai-assisted: <modelo>]`

## Checklist

- [ ] Testes unitários da lógica afetada
- [ ] **Nenhum segredo no diff** (chaves de PostHog, Emarsys, Condor, MinIO, Supabase)
- [ ] Migrações testadas em Postgres efêmero
- [ ] Feature flag configurada, quando aplicável
- [ ] Peso do voto continua resolvido **no servidor** (se toca votação)
- [ ] RLS revisada (se toca tabelas públicas)
- [ ] `02-spec.md` atualizado, se a arquitetura mudou

## Como testar

<!-- Passos para o revisor humano reproduzir em homologação. -->
