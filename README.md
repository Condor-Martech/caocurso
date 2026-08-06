# Pet Condor — LP do Cãocurso 2026

Landing page de **pet.condor.com.br**, a campanha *Mês Pet* / *Cãocurso* da rede Condor.
Uma página só, com um formulário de inscrição que grava no Supabase.

**Stack:** Astro 7 (`output: 'server'`) · React 19 · Tailwind CSS v4 · TypeScript · Node ≥ 22.12
**Persistência:** Supabase (Postgres + Storage)
**Deploy:** VPS com Docker, atrás de Nginx

> Toda a interface, a documentação e as mensagens de commit deste repositório são em
> **português do Brasil**.

---

## Começando

```bash
npm install
cp .env.example .env      # e preencha (ver «Variáveis de ambiente»)
npm run dev               # http://localhost:4321
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em http://localhost:4321 |
| `npm run build` | Build de produção → `dist/` |
| `npm run preview` | Serve o build local |
| `npx astro check` | Verificação de tipos. **Esperado: 0 erros** |

---

## Como funciona

A página é renderizada **no servidor a cada requisição**. Isso não é um detalhe de
performance: é o que permite mudar datas e vagas no painel do Supabase e ver o resultado na
carga seguinte, sem build e sem deploy.

```
                                    ┌─────────────────────────────┐
   Navegador ──── GET / ──────────► │  Astro (contêiner Docker)   │
                                    │  lê cao_campanha ───────────┼──► Supabase
   ◄──── HTML já com o estado ──────┤  (cache de 10 s)            │
        correto do botão            └─────────────────────────────┘

   Formulário ── POST /api/inscricao (multipart) ──►
        1. valida os 11 campos
        2. reprocessa a foto: confere bytes reais, tira o EXIF, WebP 1600 px
        3. sobe a foto ao bucket privado         ──► Supabase Storage
        4. chama criar_inscricao() — trava, confere vagas, insere ──► Supabase
        5. devolve 201
```

### O ciclo da inscrição

O formulário abre como **modal** a partir do botão do bloco «29 de agosto». Sem JavaScript
ele é uma seção normal no fim da página e o botão é uma âncora até ela — continua sendo
possível se inscrever.

São **11 campos**. Obrigatórios: nome, e-mail e telefone do tutor; nome e **foto** do pet; e
o aceite do regulamento. Opcionais: nascimento, CPF, raça, sexo e descrição.

### Os quatro estados do botão

`src/lib/inscricao.ts` é o único lugar que decide, e é consumido por duas superfícies que
não podem discordar: o botão e o endpoint.

| Estado | Rótulo | Quando |
|---|---|---|
| `em-breve` | Em breve | Antes de `abre_em` — **ou** se a campanha não puder ser lida |
| `aberta` | Inscreva-se | Dentro do período e com vaga |
| `esgotada` | Esgotado | Dentro do período, mas `inscritos >= limite_vagas` |
| `finalizada` | Finalizado | Depois de `fecha_em` |

A data manda sobre a vaga: passado o fechamento diz «Finalizado» mesmo que também estivesse
cheio.

**Falha fechado.** Sem dados legíveis devolve `em-breve`, nunca `aberta`. Ver «Em breve» a
mais é chato e se resolve recarregando; ver «Inscreva-se» e o envio estourar depois de onze
campos e uma foto é pior.

**A vaga quem decide é o banco.** O endpoint também confere antes, mas só para não fazer
alguém subir 2 MB à toa. A resposta que vale é a de `criar_inscricao()`, que trava, conta e
insere na mesma transação — sem isso, dois envios simultâneos com uma vaga sobrando entram
os dois.

---

## Variáveis de ambiente

Copie `.env.example` para `.env`. **O `.env` não é versionado e não entra na imagem Docker**:
é injetado ao subir o contêiner.

| Variável | O que é |
|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | A chave **secreta**, não a anônima. Ignora o RLS |
| `SUPABASE_BUCKET_FOTOS` | Bucket das fotos. Padrão: `fotos-caocurso` |

Onde achar: Dashboard do Supabase → Project Settings → API.

> ⚠️ **A validação é preguiçosa.** `astro:env` só confere as variáveis quando o módulo que as
> usa é importado pela primeira vez. Um contêiner com o `.env` incompleto **sobe, serve a
> página e sai `healthy`** — e só quebra na primeira inscrição. Quem detecta isso é
> `/healthz`, que é o alvo do healthcheck exatamente por esse motivo.

---

## Banco de dados

As migrações estão em `supabase/migrations/` e se aplicam **colando no editor SQL** do
projeto (Dashboard → SQL Editor). São idempotentes.

| Migração | O que cria |
|---|---|
| `0001_cao_inscricao.sql` | Tabela `cao_inscricao`, índices de duplicidade, RLS fechado, bucket privado `fotos-caocurso` |
| `0002_cao_campanha_e_vagas.sql` | Tabela `cao_campanha`, vista `cao_estado_inscricao`, função `criar_inscricao()` |

### As três peças

**`cao_inscricao`** — uma linha por participante. Guarda a `foto_key` do storage, **nunca a
URL**: com a URL gravada, trocar de provedor obrigaria a reescrever a tabela inteira.

O RLS está ligado e **sem nenhuma política**, de propósito: só a `service_role` enxerga a
tabela, e ela vive apenas no servidor. A chave anônima é pública por desenho — sem isso,
qualquer um leria todos os CPFs com uma chamada.

**`cao_campanha`** — uma linha só, com `abre_em`, `fecha_em` e `limite_vagas`. É a
configuração operacional, e mexer nela é a operação normal.

**`criar_inscricao(dados jsonb)`** — o único caminho por onde uma inscrição entra. Toma um
bloqueio de aviso, confere a janela e as vagas, e insere. Devolve o `uuid`.

### Duplicidade

Decidida por índices únicos parciais, não por leitura prévia:

- Uma inscrição por CPF, para quem informou CPF (o campo é opcional)
- Uma inscrição por `e-mail + nome do pet`, que cobre quem não informou

O endpoint traduz o erro `23505` do Postgres num **409** com mensagem legível.

---

## Tarefas do dia a dia

### Mudar as datas ou o número de vagas — **sem deploy**

Dashboard do Supabase → Table Editor → `cao_campanha`. Edite `limite_vagas`, `abre_em` ou
`fecha_em`. A mudança aparece na carga seguinte (há um cache de 10 segundos).

O texto «de 03/08 a 21/08/2026» que aparece no hero e no bloco 7 **também sai daí**, então
não fica desalinhado.

> ⚠️ Sempre escreva as datas **com fuso**: `2026-08-21 23:59:59-03`. Sem o offset, o Postgres
> lê como UTC e o período fecharia às 20:59 do dia 20 — um dia antes.

### Ver a foto de uma inscrição

`https://pet.condor.com.br/foto/<id>`, onde `<id>` é o `id` da linha. O endereço é estável e
não expira; ele consulta a key, assina na hora e redireciona. O bucket continua privado.

### Exportar as inscrições

Dashboard do Supabase → Table Editor → `cao_inscricao` → exportar CSV. Não há sincronização
automática com planilha: a campanha tem data de fechamento e duas ou três exportações cobrem
todo o ciclo.

### Testar o endpoint pela linha de comando

```bash
curl -H "Origin: http://localhost:4321" \
     -F "tutorNome=Teste Silva" -F "tutorEmail=a@b.com" -F "tutorTelefone=41999999999" \
     -F "petNome=Rex" -F "aceiteRegulamento=on" -F "petFoto=@pet.jpg" \
     http://localhost:4321/api/inscricao
```

O `-H "Origin: …"` é **obrigatório**. Sem ele o Astro corta o POST com **403** por CSRF, e
você recebe isso em vez de um erro de validação.

### Reconverter o KV quando o marketing entregar arte nova

```bash
node scripts/optimizar-assets.mjs     # assets-fonte/ → public/assets/2026/ + galeria/
```

Os originais de gráfica ficam em `assets-fonte/` (~1 GB, fora do git e fora de `public/`).
**Nunca sirva os originais.** Fotos novas de galeria: além de rodar o script, revise a ordem
do array `galeria` em `src/data/site.ts` — cada posição cai num buraco do mosaico com a sua
própria proporção.

---

## Deploy

VPS com Docker atrás de Nginx.

```bash
# no servidor, na pasta do projeto
cp .env.example .env      # e preencha
docker compose up -d
```

Depois, o proxy:

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/pet.condor.com.br
sudo ln -s /etc/nginx/sites-available/pet.condor.com.br /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pet.condor.com.br     # só depois do DNS já apontar aqui
```

### Duas coisas no Nginx que não são opcionais

**1. O `map` que normaliza o `Origin`.** Assim que houver HTTPS, sem ele **todo envio do
formulário devolve 403**.

O adaptador de Node deriva o esquema de `req.socket.encrypted` e **não lê `X-Forwarded-Proto`**.
Com o TLS terminando no Nginx, o Astro se acha `http://…` enquanto o navegador manda
`Origin: https://…`. Não batem, e a proteção CSRF corta. A página carrega perfeita; só o
envio quebra, com e sem JavaScript, e no log só aparecem 403 sem mais pista.

O `map` reescreve **apenas o nosso próprio origem** — um `proxy_set_header Origin http://$host`
solto também tiraria o 403, mas reescreveria origens alheios e anularia a proteção inteira.

**2. `client_max_body_size 30M`.** O padrão do Nginx é 1 MB. O formulário sobe uma foto: sem
isso ninguém se inscreve, e o erro **não aparece no log da aplicação** porque a requisição
nunca chega até ela.

Os dois já estão em `deploy/nginx.conf.example`, comentados.

### Sobre a imagem

Debian slim, não Alpine: o sharp traz binários nativos e os prebuilds de musl dão mais
trabalho do que a diferença de tamanho compensa. ~480 MB, build em ~20 s.

O `.dockerignore` deixa `assets-fonte/` (~1 GB) fora do contexto — sem ele o build engasga
antes de começar.

O contêiner **não escreve nada em disco**: a ficha vai para o Supabase e a foto para o
Storage. Se um dia aparecer um volume no `docker-compose.yml`, é sinal de que algo voltou a
guardar estado local.

---

## Estrutura

```
├── astro.config.mjs            adapter node standalone + esquema astro:env
├── Dockerfile                  multi-etapa, usuário node, healthcheck em /healthz
├── docker-compose.yml          porta só em 127.0.0.1, init:true, env_file
├── deploy/nginx.conf.example   proxy reverso — leia os avisos
├── supabase/migrations/        0001 e 0002
├── scripts/optimizar-assets.mjs
├── assets-fonte/               ⚠️ ~1 GB de gráfica. Fora do git e fora de public/
├── src/
│   ├── pages/
│   │   ├── index.astro         os 11 blocos + 4 faixas
│   │   ├── healthz.ts          healthcheck que consulta o Supabase
│   │   ├── foto/[id].ts        endereço estável → URL assinada
│   │   └── api/inscricao.ts    POST multipart
│   ├── lib/
│   │   ├── inscricao.ts        estado do período e das vagas (assíncrono, com cache)
│   │   ├── supabase.ts         cliente service_role, só servidor
│   │   ├── storage.ts          a única peça que sabe onde vivem as fotos
│   │   └── foto.ts             sharp: bytes reais, EXIF fora, WebP
│   ├── components/             um por bloco + Faixa + icons/
│   ├── data/
│   │   ├── site.json           todo o conteúdo visível
│   │   └── site.ts             os tipos e o porquê
│   ├── layouts/Layout.astro
│   └── styles/                 global.css (tokens + Torus) e animations.css
└── public/
    ├── fonts/                  Torus .woff2 ×6, self-hosted
    └── assets/                 2026/ · images/ · galeria/ · patrocinadores/ · docs/
```

### Os 11 blocos

```
1 Hero · 2 Adote um AuMigo · 3 Eventos · 4 Requisitos · 5 Protetoras ·
6 Cãocurso · 7 «29 de agosto» · 8 Atrações · 9 Galeria ·
10 Patrocínio/Apoio · 11 Footer        (+ o formulário, em modal)
```

Com 4 faixas separadoras. **A LP não tem nav.** `--nav-h` fica em `global.css` valendo 0: se
o nav voltar, é o único lugar a mexer.

---

## Regras que não se negociam

**A paleta é fechada.** Vive em `src/styles/global.css`, amostrada do KV 2026. Qualquer outro
HEX é proibido, **inclusive os utilitários de cor do Tailwind** (`text-yellow-300`,
`bg-purple-50`…): use os tokens `brand-*`. Única exceção: as cores das redes sociais, em
`src/components/icons/IconeSocial.astro`.

**A tipografia é Torus**, self-hosted em `public/fonts/`. Proibido Montserrat, Inter ou
qualquer Google Font.

**O lettering vai como imagem, nunca imitado com fontes.** «ADOTE UM AuMigo», «SEU PET É A
ESTRELA» e «e pra gatos também!» são PNG. Imitá-los com `font-serif italic` foi exatamente o
que fez a página não se parecer com a arte.

**Nunca sirva os originais de gráfica.** Passam por `scripts/optimizar-assets.mjs`.

**Nada de placeholders.** Se faltar o logo de uma marca, escreve-se o nome como texto e
deixa-se um `// TODO`. Pôr o logo de outra empresa é erro de marca.

**Nunca crie `public/Assets/` com A maiúsculo.** No Linux são duas pastas; no macOS e em
vários sistemas de deploy, a mesma.

---

## Quando algo dá errado

| Sintoma | Causa provável |
|---|---|
| **403 em todo envio do formulário**, página carrega bem | Falta o `map` do `Origin` no Nginx. Ver «Deploy» |
| **413** ao enviar, nada no log da aplicação | `client_max_body_size` no Nginx |
| **403 «As inscrições ainda não estão abertas»** com o período aberto | Falha fechado: não conseguiu ler `cao_campanha`. Confira as variáveis e se o projeto do Supabase não está pausado |
| Botão diz **«Em breve»** sem motivo | Mesma causa acima |
| Contêiner **`healthy`** mas a inscrição dá 500 | Credenciais erradas. `/healthz` deveria pegar isso — confira se o healthcheck aponta para lá |
| **403 no `curl`** ao testar o endpoint | Falta `-H "Origin: …"` |
| Imagem não carrega | Confira se o caminho existe em `public/`. Um `src` quebrado **não** é erro de tipos: `astro check` e o build passam igual |
| Projeto do Supabase fora do ar | Projetos gratuitos **pausam após 1 semana sem atividade**. Reative pelo painel |

---

## Limites do plano gratuito do Supabase

| | Limite | Com ~50 inscrições |
|---|---|---|
| Banco | 500 MB | ~50 KB |
| Storage | 1 GB | ~12 MB |
| Egress | 5 GB/mês | irrelevante |
| Upload por arquivo | 50 MB | subimos ~113 KB |

O teto real é o **storage**: cerca de 4.500 inscrições, medido com fotos reais depois do
reprocessamento (média 113 KB, pior caso 228 KB). Bem acima do previsto.

> ⚠️ **Não há limite de tentativas no endpoint.** A capacidade técnica é essa, mas nada impede
> alguém de roteirizar envios. Está identificado como próximo trabalho.

---

## Pendente

**Do cliente, não é trabalho de código:**

- **Logo da Fancy Feast** — a pasta que o marketing mandou está vazia. Hoje sai como texto
- **MARS Petcare, Caats e Doguitos** — têm material em `assets-fonte/patrocinadores/Apoio/`,
  falta tirar o arquivo web. O de MARS é JPEG com fundo cinza e precisa de recorte
- **Regulamento 2026** — não há PDF
- **Protetoras / ONGs** — «em definição» segundo o briefing. Os 3 cartões estão vazios
- **13ª foto da galeria** — a arte mostra 13, o repositório tem 12

**Decisões:**

- **Separar os consentimentos.** O checkbox único agrupa participar, ceder a imagem do pet e
  ceder os dados para divulgação. Sob a LGPD são finalidades distintas. **E se os contatos
  forem alimentar o CRM, isso é uma quarta finalidade que o texto atual não menciona** — tem
  de estar resolvido *antes* de abrir ao público, porque com inscrições já recolhidas não há
  conserto
- **Retenção e expurgo** — prazo pós-campanha, sem definir
- **Direito de exclusão** — a coluna `excluido_em` existe e é respeitada pela vista e por
  `/foto/<id>`, mas não há fluxo para acioná-la

**Técnico:**

- Limite de tentativas em `/api/inscricao`
- Servir imagens e o PDF a partir do MinIO (`lp-content/caocurso/`, já subidos) para trocar
  um logo sem build. O código ainda aponta para `/assets/`
- Sem JavaScript, a resposta do formulário aparece como JSON cru. O dado é gravado, mas é feio

---

## Referências

| O quê | Onde |
|---|---|
| Arte aprovada 2026 | `docs/Desktop - CãoCurso.png` — manda sobre tudo |
| Briefing 2026 | `docs/LP Cão Curso.docx` — manda em datas, copy e marcas |
| Persistência e LGPD | `docs/PLATAFORMA.md` |
| Instruções para agentes | `CLAUDE.md` |

> A arte e o briefing **não são versionados**: este repositório é público e o KV antes da
> campanha e o briefing interno não devem ficar indexados. Ficam em `docs/` na máquina de
> trabalho.

**Se a arte e o briefing divergirem num dado de conteúdo, ganha o briefing.** Foi assim que
se resolveu o período de inscrição: 03/08, não 10/08.
