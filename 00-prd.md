# PRD — Concurso de Mascotes (codinome: PetVote)

**Estado:** Draft v0.1 — pendente de aprovação
**Owner de produto:** Alejandro
**Stack alvo:** Next.js + Supabase **Free** (Postgres + Auth) · Storage de fotos: **MinIO self-hosted (S3-compatible) com CDN próprio** · Eventos: PostHog + Emarsys

> **Restrições de infraestrutura (v1):** Supabase no plano **Free** (banco pequeno, cotas de banda e de Edge Functions). Para caber no free tier, as fotos não usam Supabase Storage — vão para o **MinIO** dos nossos servidores (já com CDN), e a lógica pesada de voto roda como função Postgres (RPC), não como Edge Function. As imagens devem ser **processadas e otimizadas** antes de serem servidas (ver SPEC §Pipeline de imagens).

## 1. Contexto e problema

A marca deseja rodar um concurso público de fotos de mascotes com engajamento social. Hoje não existe uma plataforma própria para: cadastrar mascotes com foto, expô-las em um feed navegável, receber votos do público de forma controlada (evitando fraude), e dar um benefício de voto extra aos sócios do **Clube Condor**. Também não há um backoffice para os moderadores administrarem o concurso nem uma forma padronizada de disparar eventos de marketing (Emarsys) e de produto (PostHog).

O concurso precisa estar no ar como **web responsive**, sem app nativo, com um fluxo simples de inscrição e votação e um painel administrativo para moderação e apuração.

## 2. Objetivos e métricas de sucesso

| Objetivo | Métrica | Meta inicial |
|---|---|---|
| Gerar inscrições de mascotes | Nº de mascotes cadastradas | ≥ 500 no 1º mês |
| Gerar engajamento por votos | Nº total de votos válidos | ≥ 10.000 no 1º mês |
| Manter integridade da votação | % de votos bloqueados por anti-fraude vs. votos totais | < 5% de falsos positivos |
| Converter sócios Clube Condor | % de votos que usam voto duplo de sócio | medir baseline (sem meta na v1) |
| Instrumentar o funil | Eventos-chave chegando a PostHog e Emarsys | 100% dos eventos do §6 |

## 3. Personas

- **Visitante/Votante** — público geral que navega o feed e vota (não precisa de login para votar).
- **Participante** — dono da mascote; registra-se na plataforma, cria a página da sua mascote e compartilha nas redes.
- **Participante sócio Clube Condor** — participante cuja condição de sócio é validada via API Condor no momento do cadastro; as votações recebidas pela sua mascote valem em dobro.
- **Moderador** — usuário interno do backoffice; faz CRUD das mascotes, sobe o regulamento, consulta rankings e exporta a lista de participantes.
- **Agente de IA (revisor de CI)** — "usuário" do SPEC: valida PRs contra os cenários Gherkin do §02-spec.

## 4. Escopo

### Dentro do escopo (v1)
- **Landing page** promocional: apresenta o concurso, tem CTA para o formulário de inscrição e exibe um **widget do feed** (amostra de mascotes) para estimular o visitante a ir ao feed completo.
- Cadastro de usuário/participante na plataforma.
- Formulário de inscrição da mascote: dados básicos → banco de dados (Supabase); fotos → **MinIO** (upload direto via presigned URL), servidas otimizadas pela CDN.
- **Volume esperado:** ~500 inscrições (banco pequeno, sem risco no free tier). O volume alto é de **votos**, tratado pela função de voto no Postgres.
- Página pública de perfil da mascote, com URL curta compartilhável (plugin de compartilhamento em redes sociais).
- **Até 5 fotos por mascote** (mínimo 1). Cada foto é otimizada e servida pela CDN.
- Feed público **idêntico ao Instagram**: cards com carrossel das fotos da mascote (swipe/setas), botão de voto e compartilhar.
- Regras de votação: **1 voto por IP/usuário** (cookie). O **peso do voto pertence à mascote**: se o dono que a cadastrou for sócio Clube Condor (validado via API Condor no cadastro), **todo voto válido naquela mascote vale 2** (`peso_voto = 2`); caso contrário vale 1. O votante não precisa logar para que o x2 seja aplicado.
- Anti-fraude sem login: Cloudflare Turnstile (captcha invisível) + device fingerprint + rate-limit por IP em Supabase Edge + honeypot.
- Integração de eventos: PostHog (analytics de produto) e Emarsys (CRM/marketing).
- **Moderação com aprovação manual:** toda inscrição de mascote entra como *pendente* e **não aparece no feed/perfil público até um moderador aprovar** no backoffice (proteção contra usuários mal-intencionados). O moderador pode aprovar ou reprovar.
- Backoffice de moderação: login e senha, fila de aprovação, CRUD de mascote, Top visualizações, Top likes, Top likes por raça, upload de regulamento, lista de participantes com a mascote (exportar CSV/Excel).
- Nomenclatura padronizada no banco (prefixo por domínio, ex.: `cao_`).

### Fora do escopo (v1) — explicitamente adiado
- App nativo iOS/Android — v1 é apenas web responsive; PWA fica para depois.
- Login obrigatório para votar — decisão explícita: votar é aberto, controlado por anti-fraude (não por autenticação).
- Sistema de pagamentos/premiação automatizada — a premiação é operacional/manual.
- Comentários e mensagens entre usuários no feed — apenas voto e compartilhamento na v1.
- Moderação automática de imagem por IA — moderação é manual pelo backoffice na v1.

## 5. Histórias de usuário

- Como **visitante**, quero uma landing page atraente com um widget do feed, para me estimular a me inscrever e/ou entrar no feed das mascotes.
- Como **participante**, quero registrar-me e cadastrar minha mascote com foto, para que ela concorra no concurso.
- Como **participante**, quero uma página pública da minha mascote com link curto, para compartilhá-la nas redes e receber votos.
- Como **visitante**, quero navegar um feed de mascotes e votar com um clique, para apoiar minha favorita sem precisar de cadastro.
- Como **sócio Clube Condor**, quero que meu voto valha em dobro, para aproveitar o benefício de sócio.
- Como **moderador**, quero aprovar ou reprovar cada inscrição antes de publicá-la, para impedir conteúdo mal-intencionado no concurso.
- Como **moderador**, quero fazer login e administrar as mascotes (CRUD), para manter o concurso limpo e correto.
- Como **moderador**, quero ver rankings (visualizações, likes, likes por raça) e exportar a lista de participantes, para apurar resultados.
- Como **moderador**, quero subir o regulamento, para que fique publicado e acessível.

## 6. Critérios de aceitação (nível PRD)

- Uma mascote recém-cadastrada fica com status *pendente* e não aparece no feed, no perfil público, no widget da landing nem nos rankings até ser aprovada por um moderador.
- A landing page exibe o widget do feed (amostra de mascotes) e um CTA que leva ao formulário de inscrição e ao feed completo.
- Um usuário consegue registrar-se e cadastrar uma mascote com pelo menos uma foto, e a foto persiste no Storage.
- Cada mascote tem uma página pública acessível por URL curta, com botão de compartilhar em redes.
- Um votante anônimo consegue registrar **no máximo 1 voto** por mascote (chave IP + cookie); tentativas adicionais são rejeitadas.
- (⚠️ **Pendente de aprovação do PO** — hoje é decisão de dev) Toda votação numa mascote cujo dono é sócio Clube Condor validado conta com `peso_voto = 2`; nas demais, `peso_voto = 1`.
- Requisições automatizadas de voto (sem passar Turnstile / mesmo fingerprint em rajada) são bloqueadas antes de contabilizar.
- Os eventos-chave (`cadastro_mascote`, `voto_registrado`, `voto_bloqueado`, `perfil_compartilhado`) são enviados a PostHog e a Emarsys.
- No backoffice, apenas usuários autenticados acessam; moderador faz CRUD de mascote, vê os 3 rankings, sobe regulamento e exporta a lista de participantes em CSV/Excel.
- O ranking de likes reflete o total real de votos (incluindo o efeito do voto duplo de sócio) sem contagem duplicada indevida.

## 7. Riscos conhecidos

Ver `01-poc-spikes.md`. Riscos principais: (a) **contagem de votos concorrente e confiável** no Supabase sob rajadas; (b) **integração de validação Clube Condor** (contrato de API ainda a confirmar).

## 8. Perguntas abertas

- ⚠️ **A mecânica Clube Condor (voto x2) precisa ser aprovada pelo PO antes de virar requisito.** Hoje é uma decisão de dev, não de produto. Enquanto não aprovada, entra atrás de **feature flag** (`ff_condor_x2`, default OFF) e não bloqueia o restante do escopo.
- Contrato exato da API do Clube Condor para validar sócio (endpoint, autenticação, latência) — a confirmar.
- Um voto é por mascote ou global por concurso? (assumido: **por mascote** — confirmar).
- O voto duplo do sócio vale por mascote ou é um limite diário? (assumido: por mascote, por rodada de voto — confirmar).
- Período do concurso e critério de desempate — a definir com o negócio.
- Requisitos legais/LGPD sobre os dados coletados no cadastro — validar com jurídico.
