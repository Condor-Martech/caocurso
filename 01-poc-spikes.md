# POC / Spikes de risco técnico — Concurso de Mascotes (PetVote)

Cada spike vive em branch `spike/` e é descartado; só o achado (GO/NO-GO + evidência) passa ao PRD/SPEC.

## Spike 1 — Contagem de votos concorrente e confiável no Supabase

**Pergunta fechada:** É possível garantir "no máximo 1 registro de voto por (mascote, IP+cookie)" e um total consistente, mesmo sob rajadas de votos concorrentes, usando apenas Supabase (Postgres + Edge Functions)?

**Por que é incerto:** Votação viral gera concorrência alta e estamos no **Supabase Free** (cotas). Sem controle correto há condição de corrida (duplo voto) e contagem inconsistente. Validar a abordagem: constraint `UNIQUE` + `INSERT ... ON CONFLICT DO NOTHING` dentro de **função Postgres `SECURITY DEFINER` (RPC)** — sem Edge Function, para não gastar cota — com o peso (1 ou 2) resolvido no servidor.

**Escopo do spike (timebox 2 dias):** Tabela `voto` com `UNIQUE(cao_id, chave_votante)`; função `registrar_voto` (RPC) que resolve `peso_voto` e insere idempotente; teste de carga (k6/autocannon) disparando N votos concorrentes com a mesma chave e com chaves distintas; medir se o free tier aguenta o pico.

**Critério go/no-go:**
- GO se, sob 1.000 requisições concorrentes com a mesma `chave_votante`, exatamente 1 voto é contabilizado e o total agregado bate com o esperado (considerando `peso_voto`).
- NO-GO → fallback: fila de votos (Supabase Queue / tabela de staging) com consolidação assíncrona idempotente.

## Spike 1b — Realtime do voto (Redis + SSE) com throttle

**Pergunta fechada:** Conseguimos entregar o total de votos "ao vivo" via Redis (contador + pub/sub) + SSE, com throttle, sem estourar recursos quando muitos espectadores olham o mesmo card?

**Por que é incerto:** SSE com muitos clientes simultâneos e a estratégia de throttle/coalescing precisam ser validados; também a reconstrução do contador a partir do Postgres se o Redis reiniciar.

**Escopo do spike (timebox 1-2 dias):** RPC → INCRBY + PUBLISH no Redis → SSE com coalescing (máx. 1 update/mascote/s); simular N espectadores; testar queda/rebuild do Redis.

**Critério go/no-go:**
- GO se o total ao vivo atualiza de forma suave sob carga e o contador é reconstruído corretamente após reiniciar o Redis.
- NO-GO → fallback: polling leve a cada X s lendo o total do Redis/Postgres (sem push).

## Spike 2 — Integração de eventos (PostHog + Emarsys) desde Next.js

**Pergunta fechada:** Conseguimos emitir os eventos-chave do funil (`cadastro_mascote`, `voto_registrado`, `voto_bloqueado`, `perfil_compartilhado`, `landing_cta_click`) para PostHog e Emarsys de forma confiável a partir do stack Next.js/Supabase?

**Por que é incerto:** São dois destinos com contratos diferentes (PostHog = produto/eventos; Emarsys = CRM/contatos e eventos externos). É preciso confirmar autenticação, formato de payload e onde disparar (client vs. server) sem perder eventos e sem vazar credenciais no cliente.

**Escopo do spike (timebox 1-2 dias):** Enviar 1 evento de cada tipo para ambos os destinos a partir de uma Edge Function/route handler; confirmar recepção nos painéis; definir camada única de tracking (wrapper) para o time reutilizar.

**Critério go/no-go:**
- GO se os 5 eventos aparecem em PostHog e o(s) evento(s) mapeado(s) chegam a Emarsys, com credenciais só no servidor.
- NO-GO → fallback: emitir para PostHog em tempo real e sincronizar Emarsys em batch (webhook/cron) a partir do banco.

## Spike 2b — Pipeline de imagens MinIO + worker + CDN

**Pergunta fechada:** Conseguimos fazer upload direto do cliente ao MinIO via presigned URL, processar com um worker (`sharp`) para gerar variantes WebP/AVIF e servi-las pela CDN, com o original nunca exposto?

**Por que é incerto:** Envolve presigned URLs do MinIO, CORS, o worker de processamento e a integração com a CDN existente — precisa ser validado ponta a ponta antes de virar fluxo padrão.

**Escopo do spike (timebox 1-2 dias):** Presign → upload de 1 imagem ao MinIO → worker gera thumb+medium → CDN serve as variantes → medir tempo de processamento e ganho de peso.

**Critério go/no-go:**
- GO se o fluxo completa, a CDN serve as variantes otimizadas e o processamento fica em tempo aceitável (ex. < 5s por foto).
- NO-GO → fallback: transformação on-the-fly na borda (ex. imgproxy) na frente do MinIO.

## Spike 3 (condicional) — Validação de sócio Clube Condor

> ⚠️ Só executar **após aprovação do PO** da mecânica de voto x2. Enquanto não aprovado, permanece atrás da feature flag `ff_condor_x2` e este spike fica em espera.

**Pergunta fechada:** A API do Clube Condor permite validar, no momento do cadastro, se um dono é sócio, com latência aceitável (< 2s) e sem expor credenciais no cliente?

**Por que é incerto:** O contrato da API Condor ainda não foi confirmado (endpoint, auth, rate limits, disponibilidade).

**Escopo do spike (timebox 1 dia, após ter o contrato):** Chamar o endpoint Condor a partir de uma Edge Function e marcar `dono_condor = true/false` na mascote.

**Critério go/no-go:**
- GO se a validação retorna de forma estável dentro do SLA e permite gravar o flag no cadastro.
- NO-GO → fallback: importação periódica de lista de sócios (CSV) validada contra o cadastro, sem chamada em tempo real.
