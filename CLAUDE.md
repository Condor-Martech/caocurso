# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) no trabalho com este projeto
isolado da LP do Pet Condor.

## Projeto: Pet Condor LP Rebuild

**Objetivo:** construir a landing page de **pet.condor.com.br** (campanha *Mês Pet* /
*Cãocurso* da rede Condor) usando Astro + Tailwind CSS + React.

**Stack:** Astro 7.x (`output: 'server'` + `@astrojs/node` standalone) | React 19 |
Tailwind CSS v4 | TypeScript | Node.js ≥22.12.0 | Supabase (Postgres + Storage) | sharp

**Idioma:** **português do Brasil (pt-BR), 100%** — tanto os textos visíveis do site
quanto a documentação e as mensagens de commit deste repositório.

**Estado:** LP alinhada ao **KV 2026**, com a inscrição **persistida no Supabase** e a
planilha do júri se abastecendo sozinha. Build limpo, `astro check` com 0 erros, sem
caminhos de assets quebrados. A tag `v2026-base` marca o fim do saneamento visual: é para
lá que se volta se um retoque de layout der errado. O que falta antes de abrir ao público
não é arquitetura — é uma decisão de LGPD, um limite de tentativas e o deploy no VPS. Ver
«Estado de implementação».

**Onde isto vive de verdade:** o [`README.md`](README.md) é o manual de operação — como
subir, que variáveis existem, como consertar a planilha, o que fazer quando algo quebra.
Este arquivo descreve **a LP**; o README descreve **o serviço**.

**Pasta do Projeto Central (Referência):** `/home/diego/armando/Migraciones/petCondor/site`

---

## 🔒 Regra de Precedência

A campanha **mudou de KV em 2026**: a arte de 2025 era laranja, a de 2026 é azul / ciano
/ lavanda. Os blocos da página são os mesmos; mudaram os assets, as cores e parte do
copy.

Manda, nesta ordem:

1. **`docs/Desktop - CãoCurso.png`** (1366×8000) — a arte aprovada de 2026. É a
   referência visual: layout, cores, tipografia e o que é imagem e o que é texto.
2. **`docs/LP Cão Curso.docx`** — o briefing de conteúdo de 2026 (datas, textos, lista de
   patrocinadores). **Se o .docx e o PNG divergirem num dado de conteúdo, ganha o .docx**
   (foi assim que se resolveu o período de inscrição: 03/08, não 10/08).
3. **O código.** Quando a arte e o código divergirem num detalhe de implementação, ganha
   o que está construído e verificado — mas qualquer mudança de conteúdo volta ao 1 e ao 2.

> ⚠️ **A arte e o briefing não estão versionados.** Este repositório é público, então
> `docs/*.png` e `docs/*.docx` estão no `.gitignore`: o KV aprovado de uma campanha e o
> briefing interno de marketing não devem ficar indexados. Os arquivos vivem em `docs/`
> na máquina de trabalho e na pasta do projeto central. Quando o repositório passar a
> privado, retira-se a regra e eles entram num commit à parte.

A documentação de 2025 (13 arquivos, 8.619 linhas: `GROUND_TRUTH.md`, `DESIGN_SYSTEM.md`,
`WIREFRAMES_DETALLADAS.md`, `FORM_ESPECIFICACION.md`, `CONTENIDO_DATOS.md`…) **foi
removida do repositório**. Descrevia a campanha laranja, um modal de 8 campos que já não
existe e um nav que não é renderizado; a esta altura confundia mais do que ajudava.
Continua recuperável do histórico do git até `1796aa1`.

---

## 📚 Documentação Disponível Nesta Pasta

São **quatro**, e nenhum sobra. Cada um responde a uma pergunta diferente:

| Arquivo | Responde |
|---|---|
| **`docs/Desktop - CãoCurso.png`** 🎯 | *Como é que fica?* — a arte aprovada 2026. Manda sobre tudo |
| **`docs/LP Cão Curso.docx`** 🎯 | *O que diz o copy?* — o briefing. Manda em datas e marcas |
| **`README.md`** | *Como se opera?* — subir, variáveis, consertar, o que fazer quando quebra |
| **`docs/PLATAFORMA.md`** | *Como estão os dados?* — tabelas, a planilha, o que a LGPD ainda cobra |

Mais este arquivo, que é o que descreve **a LP tal como está construída** — as regras que
não se deduzem lendo o código porque são decisões, não implementação.

> Antes eram treze documentos, 8.619 linhas: a campanha de 2025, um modal que já não
> existe e uma plataforma de votação com feed público, antifraude e moderação que nunca
> foi o escopo. Está tudo no histórico do git.

---

## ⛔ Regras Duras

### Paleta permitida (única e fechada) — KV 2026

Amostrada pixel a pixel de `docs/Desktop - CãoCurso.png`. Vive em
`src/styles/global.css`, ao mesmo tempo como alias `:root` e como `@theme` do Tailwind v4
(`--color-brand-*`, que gera as classes `bg-brand-blue`, `text-brand-purple`…).

```css
:root {
  --c-blue:        #00419A;  /* títulos, cards de evento, footer, texto sobre lavanda */
  --c-blue-sec:    #2F8FE5;  /* fundo azul: Hero, Adote, Eventos, Requisitos, Protetoras */
  --c-blue-deep:   #005BAA;  /* zona escura do degradê do hero */
  --c-purple:      #C38ADB;  /* fundo lavanda: 29-Agosto, Atrações, Formulário, Galeria, Patrocínio */
  --c-purple-deep: #823D9B;  /* blob da faixa Cãocurso */
  --c-cyan:        #3FAFC8;  /* faixa Cãocurso (normalmente coberta por bg-caocurso.webp) */
  --c-orange-pan:  #FFAF1C;  /* painel "Requisitos para adoção" */
  --c-orange-lite: #FFBB3E;  /* card amarelo da Galeria */
  --c-white:       #FFFFFF;
  --c-red:         #E20614;  /* erros de validação */
}
```

Qualquer outro HEX é proibido, **e também os utilitários de cor padrão do Tailwind**
(`text-yellow-300`, `bg-purple-50`, `text-gray-600`…): use os tokens `brand-*` ou
`var(--c-*)`. Única exceção documentada: as cores de marca das redes sociais, confinadas
em `src/components/icons/IconeSocial.astro` — um Facebook repintado de azul corporativo
deixa de ser o Facebook.

Os verdes/rosas/roxos da faixa separadora vivem dentro de `pattern-horizontal.svg`, não
são tokens do sistema.

**Contraste herdado do KV:** três combinações da arte original não alcançam o WCAG AA
(«Em três datas,» azul sobre azul 2,78; «14h às 18h» branco sobre lavanda 2,63; texto
pequeno azul sobre lavanda 3,59). Uma quarta —o nav branco sobre o azul do hero, 3,40—
deixou de se aplicar quando o nav foi retirado. Foram replicadas tal e qual porque manda
a arte. Se a Condor precisar cumprir AA, é preciso retocar a paleta do KV — é decisão de
design, não um defeito de implementação.

### Tipografia

**Torus** (Paulo Goode), **self-hosted** a partir de `assets/fonts/`, 6 pesos (Thin,
Light, Regular, SemiBold, Bold, Heavy) convertidos para `.woff2`.
**Proibido** Montserrat, Inter ou qualquer Google Font para o display.

```css
:root { --font-display: 'Torus', system-ui, sans-serif; }
```

### Endpoint do formulário

- **`POST /api/inscricao`** com **`multipart/form-data`** (`petFoto` é um arquivo e não
  cabe num body JSON).
- Exige `output: 'server'` + um adapter SSR em `astro.config.mjs`, ou as rotas de API não
  são executadas. **Adapter atual: `@astrojs/node` em modo `standalone`.**

  O build sai em **`dist/`** — `dist/server/` (o servidor HTTP, 588 KB, dos quais 226 são
  o `entry.mjs`) e `dist/client/` (o estático, 7,8 MB). O site roda num **VPS com
  Docker**, atrás de um Nginx: os artefatos são `Dockerfile`, `docker-compose.yml` e
  `deploy/`.

  ⚠️ **O `.dockerignore` não é opcional.** Sem ele o contexto de build engole
  `assets-fonte/`, quase 1 GB de material de gráfica que não tem nada que fazer numa
  imagem.
- **O Astro 7 rejeita POSTs sem `Origin` próprio** (proteção CSRF por padrão). Do
  navegador funciona sozinho; do `curl` é preciso mandar
  `-H "Origin: http://localhost:4321"` ou você recebe um **403**, não um erro de
  validação.
- O `<form>` envia por `fetch()` e desenha a resposta na página; se o JS falhar, o POST
  nativo continua funcionando.
- **`/api/feedback` NÃO serve aqui:** pertence à documentação interna do projeto central,
  exige `pageId` + `content` e devolve **400** com o payload de inscrição.

**Persistência do endpoint:** nada toca o sistema de arquivos. O caminho completo de uma
inscrição, em ordem:

```
1. valida os 11 campos                        src/pages/api/inscricao.ts
2. reprocessa a foto com sharp                src/lib/foto.ts       → WebP 1600 px q82, sem EXIF
3. sobe ao bucket privado                     src/lib/storage.ts    → key 2026/<uuid>.webp
4. grava a ficha                              rpc criar_inscricao   → tabela cao_inscricao
5. empurra a planilha do júri, sem await      src/lib/planilha.ts   → Web App do Apps Script
```

Cada peça tem o seu módulo, e isso é de propósito: **`src/lib/storage.ts` é o único
arquivo que sabe onde vivem as fotos.** Trocar de provedor é reescrever esse arquivo e
mais nada — o banco guarda a `key`, nunca a URL.

O passo 4 é uma **função do Postgres**, não um `insert` solto. Ela toma um advisory lock
antes de contar as vagas, de modo que dez pessoas disputando a última não podem virar
duas inscrições. Ver `supabase/migrations/0002_cao_campanha_e_vagas.sql`, e a lista de
códigos de erro em `src/lib/supabase.ts`.

O passo 5 é deliberadamente **fire-and-forget**: a ficha já está salva quando ele dispara.
Se a Google estiver fora do ar, o erro vai para o log e ninguém que preencheu onze campos
recebe uma tela de falha por causa da planilha.

> **O formulário NÃO é uma ilha React.** É Astro puro, e continua sendo. O
> `@astrojs/react` segue instalado sem nenhuma ilha; a ideia de migrá-lo era da época em
> que a persistência ainda não existia e não sobreviveu ao contato com o problema real —
> o que o formulário precisava era do servidor, não do cliente. O JavaScript que ele tem
> —abrir e fechar o modal com foco e Escape, as máscaras de CPF, telefone e data, o envio
> por `fetch` e a redução da imagem— são ~390 linhas de script simples, sem framework.

Ver [`docs/PLATAFORMA.md`](docs/PLATAFORMA.md) para o modelo de dados e a LGPD, e o
[`README.md`](README.md) para operar.

### Os 11 blocos da página

```
1 Hero · 2 Adote um AuMigo · 3 Eventos · 4 Requisitos · 5 Protetoras ·
6 Cãocurso · 7 «29 de agosto» · 8 Atrações · 9 Galeria ·
10 Patrocínio/Apoio · 11 Footer          (+ o formulário, fora do fluxo)
```

Com **4 faixas separadoras** (`<Faixa />`): depois do Hero, depois de Adote um AuMigo,
antes da faixa Cãocurso e depois dela.

- **A LP não tem nav.** O `Nav.astro` existiu, ficou órfão —o `index.astro` não o
  importava— e foi retirado junto com o array `navLinks`. `--nav-h` é mantido em
  `global.css` valendo **0**: se o nav voltar, esse é o único lugar a mexer (com barra no
  fluxo media 72 px abaixo de md e 60 px entre md e lg).
- **Nunca omitir Protetoras nem Patrocínio/Apoio.**
- O **Hero mede exatamente uma tela** em qualquer dispositivo: `--hero-h`
  (= `100svh` − `--nav-h` − `--faixa-h`), definido em `global.css`. Desconta-se também a
  faixa para que a fileira de tiles **caiba na primeira tela**: hero + faixa somam a
  altura exata do dispositivo.
- O Hero é **uma composição só**, não três faixas empilhadas: à esquerda o bloco fixo do
  selo Mês Pet, à direita um **carrossel de duas ofertas** (Cãocurso e Adote um AuMigo).
  As duas compartilham a mesma grade de linhas —`--h-logo`, `--h-msg`, `--h-dados`—
  justamente para que o CTA caia na mesma altura nas duas; se mexer numa linha, mexa nas
  duas. O carrossel é `scroll-snap` nativo e **funciona sem JavaScript**: o JS só
  acrescenta a rotação automática, que para no primeiro gesto do usuário e respeita
  `prefers-reduced-motion`. Os slides **não levam fotos**, só logo, datas e CTA. As suas
  duas colunas dependem da variante **`fila:`** (largura **e** orientação), não de `md:`:
  em tablet na vertical o mockup deixa meia tela vazia e ali manda o bloco empilhado.
  **As setas e o contador só aparecem de tablet na horizontal para cima**: no celular a
  pista se passa com o dedo e aquela faixa inferior é o que dá corpo ao selo.
- `Requisitos` é **um painel único com 6 bullets em duas colunas**, não três cards.
- `Eventos` são **2 cartões em cima e 1 centralizado embaixo**, não uma fileira de três.
- O bloco 7 se chama `Evento30Agosto.astro` por herança de 2025, mas em 2026 a data é o
  **29 de agosto**. Não renomear o arquivo, sim o conteúdo.
- O formulário **não está no fluxo da página**: abre como modal a partir do botão do
  bloco 7. Ver a seção seguinte.

### Assets — nunca sirva os originais de gráfica

O KV 2026 chega em resolução de gráfica: hoje `assets-fonte/` está em **~997 MB**, com PNG
de 17717×7087 px (`Textura_Halftone.png` pesa 229 MB sozinho). Servido a partir de
`public/` isso estoura o deploy. O fluxo é:

```
assets-fonte/            originais tal como o marketing entrega. NO GITIGNORE, não é servido.
  ↓  node scripts/optimizar-assets.mjs
public/assets/2026/      WebP na largura real de uso ×2. → 3,7 MB.

assets-fonte/galeria/    fotos do fotógrafo (8192×5464, 236 MB). NO GITIGNORE.
  ↓  node scripts/optimizar-assets.mjs   (mesmo script, segundo passo)
public/assets/galeria/   WebP a 960 px. 236 MB → 660 KB.
```

⚠️ **O `.gitignore` não impede que um arquivo seja publicado.** Tudo o que estiver sob
`public/` é copiado tal e qual para `dist/client/` e fica servido numa URL,
esteja ou não no git. São dois filtros distintos: o git decide o que é versionado,
`public/` decide o que é publicado. Material de origem que não deva ir para a internet
tem de estar **fora de `public/`**, não só fora do git.

Quando chegar KV novo: deixa-se em `assets-fonte/`, acrescenta-se a sua largura de saída
e o seu nome web em `scripts/optimizar-assets.mjs` e roda-se de novo. Os nomes de saída
vão **sem espaços nem acentos**: viajam dentro de uma URL.

Fotos de galeria novas: deixam-se em `assets-fonte/galeria/`, roda-se o script (não é
preciso mexer nele, converte o que encontrar) e **revisa-se a ordem do array `galeria` em
`src/data/site.ts`** — cada posição cai num buraco do mosaico com a sua própria
proporção. Os 960 px de largura não são decorativos: os dois buracos verticais (0,667)
recortam uma foto deitada até deixá-la em 44 % da sua largura.

Outras pastas servidas:

- `public/assets/images/` — assets de 2025 que **continuam válidos**, porque o briefing
  diz *«Adote um aumigo: podemos utilizar o KV do ano passado»*:
  `Selo-Adote-um-Aumigo.png` (o lockup) e `Dog.png` (o cachorro com patas que atravessa a
  faixa).
- `public/assets/galeria/` — 12 fotos da edição 2025, em WebP, **geradas**: não se editam
  à mão, saem de `assets-fonte/galeria/`.
- `public/assets/patrocinadores/` — os logos chapados que **de fato são servidos**: 5
  arquivos de 2025 reaproveitados (Friskies, Dog Chow, Kelcat, Keldog, brf pet). Os
  outros dois, Doogs e Procão, já saem do KV 2026 em `public/assets/2026/`.

  O material de origem que o marketing mandou —180 arquivos, 78 MB de `.zip`, `.ai` e
  manuais de marca em PDF da Nestlé, Mars e Kelco— vive em
  **`assets-fonte/patrocinadores/`**, não aqui. Esteve sob `public/`, no gitignore, e o
  build o publicava mesmo assim. Dali sai um arquivo chapado por marca, e esse é o único
  que entra em `public/`.

⚠️ **Nunca crie `public/Assets/` com A maiúsculo.** Existiu e conviveu com
`public/assets/`: no Linux são duas pastas, no macOS e em vários sistemas de deploy são a
mesma. Tudo em minúsculo.

**Proibido** propor placeholders do Unsplash ou "Partner 1/2/3". Se faltar o logo oficial
de uma marca, escreve-se o seu nome como texto e deixa-se um `// TODO` — pôr o logo de
outra empresa é um erro de marca, não um jeitinho de diagramação.

### O formulário: modal, 11 campos, NÃO é de adoção

O formulário (`FormularioInscricao.astro`) abre como **modal** a partir do botão do bloco
«29 de agosto». Esteve embutido na página —a arte o desenha assim— e foi tirado do fluxo
a pedido do cliente. Não o devolva ao fluxo «para bater com o mockup»: é uma decisão
tomada, não um desvio.

O `InscricaoModal.jsx`, a peça de 8 campos de 2025, segue removido: este modal é outra
coisa, em Astro e sem React.

#### O botão tem quatro estados, e quem decide é o servidor

`src/lib/inscricao.ts` cruza a hora atual com a janela de inscrição **e com as vagas
restantes**, e devolve `em-breve`, `aberta`, `esgotada` ou `finalizada`. Daí saem os
quatro rótulos —«Em breve», «Inscreva-se», «Esgotado», «Finalizado»— e só o segundo é
clicável.

Quatro coisas que não dá para mexer separadamente:

- **A mesma função é usada pelo `POST /api/inscricao`**, e ali não é decorativa: um botão
  que não aparece não impede um POST com `curl` no dia seguinte ao fechamento. Se você
  tirar essa checagem, «Finalizado» deixa de significar alguma coisa. O mesmo vale para
  «Esgotado» — e ali a última linha de defesa nem sequer é essa: é o advisory lock dentro
  de `criar_inscricao()`, porque entre ler o estado e gravar a ficha cabe outra pessoa.
- **Falha fechado — mas só na primeira leitura.** Se a campanha nunca pôde ser lida —o
  Supabase fora do ar desde o arranque, a tabela vazia— devolve `em-breve`, nunca
  `aberta`: ver «Inscreva-se» e o envio estourar depois de preencher onze campos e subir
  uma foto é pior do que ver «Em breve» a mais. **Se já houve uma leitura boa, um erro
  posterior devolve o último valor conhecido** em vez de fechar a página — um soluço de
  rede de dez segundos não tem por que apagar o botão no meio da campanha. Quem garante
  que isso não vira uma inscrição indevida é `criar_inscricao()`, que confere a janela e
  as vagas no banco a cada envio.
- **As datas e o limite de vagas vivem na tabela `cao_campanha` do Supabase**, não no
  código. É uma linha só, e mudar a data de fechamento ou subir o teto de 50 é um `update`
  — sem rebuild, sem redeploy. `src/lib/inscricao.ts` a lê pela vista
  `cao_estado_inscricao`, com **cache de 10 segundos**: sem ele, cada visita à home seria
  uma consulta. Em `site.ts` só ficaram os rótulos do botão.
- **As datas levam offset `-03:00` escrito à mão**, tanto na migração quanto em qualquer
  `update` que se faça depois. `'2026-08-21 23:59:59'` sem fuso é lido como UTC e o
  período fecharia às 20:59 do dia 21, horário de Brasília.

#### Sem JavaScript o formulário continua funcionando

O bloco vive no documento como uma seção normal e o modal é uma camada por cima. O
interruptor é a classe `.js` que o `Layout.astro` coloca em `<html>` antes de pintar: sem
ela, `.modal` é um cartão lavanda no fim da página e o botão —um
`<a href="#modal-inscricao">`— salta até ele.

Por isso **não é um `<dialog>`**: sem JS um `<dialog>` é `display:none` e não há como
abri-lo, então o formulário deixaria de existir para quem não executa scripts.

E por isso **o componente é sempre renderizado**, nos quatro estados: tirá-lo do HTML
quando o período está fechado deixaria a âncora apontando para o nada.

`role="dialog"` e `aria-modal` são colocados pelo script ao abrir, não pelo HTML:
enquanto é uma seção normal não há diálogo a anunciar.

O seu propósito é **cadastrar UM pet com a sua foto para o concurso Cãocurso**.

Campos, conforme o briefing (`docs/LP Cão Curso.docx`):

- **Tutor:** `tutorNome`*, `tutorNascimento`, `tutorCpf` (o do Clube Condor),
  `tutorEmail`*, `tutorTelefone`*
- **Pet:** `petNome`*, `petRaca`, `petSexo`, `petDescricao`, **`petFoto`*** (máx. **25 MB**)
- `aceiteRegulamento`* — regulamento + autorização de uso de imagem. **Não está na
  arte**; foi acrescentado a pedido do cliente porque um concurso com foto precisa disso
  (LGPD).

(*) obrigatório. `petEspecie` ficou **opcional**: o formulário de 2026 não o pede.

**Os 25 MB não são generosidade, são o mínimo que funciona.** O limite era 2 MB e um
iPhone recente manda 4-6 MB numa foto normal: metade dos celulares seria rejeitada na
cara do usuário. Hoje o caminho é outro — o navegador **reduz a imagem antes de subir**
(canvas, lado maior 1600 px, WebP 0,85) e o servidor a reprocessa igual com sharp, de modo
que ao bucket chega sempre algo em torno de 100-250 KB, venha o que vier. Os 25 MB só
existem para o caso de o JavaScript do cliente falhar; o Nginx acompanha com
`client_max_body_size 30M`.

O reprocessamento no servidor **não é opcional nem é sobre peso**: é o que apaga o EXIF.
Uma foto de pet é tirada em casa, e o arquivo cru do celular leva as coordenadas de GPS
dentro. Essa foto acaba numa planilha compartilhada com o júri e com o CRM.

- **Proibido** pedir endereço, quintal, "você tem pets?" ou documento de identidade: eram
  do formulário de adoção que a documentação de 2025 imaginou.
- Valida-se contra `docs/Desktop - CãoCurso.png` e o briefing, não contra a especificação
  de 2025, que descrevia uma versão de 8 campos já retirada.

---

## 🚀 Quick Start

**O projeto já está montado e funcionando.** Não é preciso criá-lo do zero.

```bash
npm install                      # só na primeira vez
cp .env.example .env             # e preencher — sem isto o formulário não grava
npm run dev                      # http://localhost:4321
npm run build                    # build de produção → dist/
node ./dist/server/entry.mjs     # rodar o build
npx astro check                  # 0 erros esperados
```

Ou, do jeito que produção vai rodar:

```bash
docker compose up -d --build
curl -s localhost:4321/healthz   # 200 = o Supabase responde. 503 = não.
```

> ⚠️ **A validação do `.env` é preguiçosa.** O `astro:env` só confere as variáveis quando
> o módulo que as usa é importado pela primeira vez. Um contêiner com o `.env` incompleto
> **sobe, serve a home e sai `healthy`** — e só quebra na primeira inscrição. Quem detecta
> isso é `/healthz`, que existe exatamente por esse motivo e é o alvo do `HEALTHCHECK`.

---

## ✅ Estado de implementação

| Fase | Escopo | Estado |
|------|--------|--------|
| 1 | Config, tokens, Torus self-hosted (6 pesos woff2), `animations.css`, Layout | ✅ feito |
| 2 | Os 11 blocos + Footer | ✅ feito |
| 3 | Formulário inline (11 campos) + `POST /api/inscricao` multipart | ✅ feito |
| 4 | Transições, scroll reveal com fallback sem JS, `prefers-reduced-motion` | ✅ feito |
| 5 | **Realinhado ao KV 2026**: paleta, assets otimizados, copy do briefing | ✅ feito |
| 6 | **Saneamento**: ponto base no git (`v2026-base`), nav retirado, caminhos quebrados fechados | ✅ feito |
| 7 | **Persistência**: Supabase (tabela + bucket privado), foto reprocessada, deploy em Docker | ✅ feito |
| 8 | **Vagas e planilha**: 4º estado «Esgotado», teto de 50, espelho automático na planilha do júri | ✅ feito |

**Verificado (2026-08-06):** `astro check` 0/0/0 · `npm run build` limpo · endpoint testado
em 5 casos (201 válido, 400 sem aceite, 409 duplicado, 400 CPF inválido, 400 menor de
idade) · 10 requisições simultâneas disputando 1 vaga → exatamente 1 × 201 e 9 × 409 ·
planilha testada de ponta a ponta contra uma hoja real (inscrição → `{"ok":true}` do Apps
Script → linha na aba → link da foto abrindo a imagem).

`dist/client` = **7,8 MB** (eram 86 antes de tirar os kits de marca de `public/`). Nenhum
`.zip`, `.ai` nem `Thumbs.db` fica publicado. A imagem Docker ronda os 480 MB.

> O `sharp` **é dependência viva**, não peso morto: `src/lib/foto.ts` o usa para
> reprocessar cada foto que entra. O que está desativado é o *serviço de imagens do
> Astro* (`image: { service: passthroughImageService() }`), porque nenhuma imagem da LP
> passa por `astro:assets` — são `<img>` com caminhos de `/assets/` já otimizados. São
> dois usos distintos da mesma biblioteca; tirar o sharp quebra o formulário.

**Pendente — e nenhum é arquitetura:**

1. **Consentimento agrupado (LGPD).** Uma casilla só cobre regulamento, uso de imagem e
   uso dos dados pelo CRM. Se o CRM vai mesmo usar esses contatos, precisa de aceite
   próprio e separado. **É decisão do cliente, e é irreversível uma vez que os dados
   comecem a entrar** — pedir de novo a 50 pessoas depois não é viável. Ver
   `docs/PLATAFORMA.md` §5.
2. **Limite de tentativas em `POST /api/inscricao`.** Hoje não há nenhum: nada impede
   alguém de queimar as 50 vagas num script. ~30 min de trabalho.
2b. **O CPF é obrigatório, por interruptor.** Decisão do cliente em 2026-08-06. Mas
   obrigatório **não é verificado**: o briefing pede «cadastrado no Clube Condor» e não há
   acesso à base de sócios, então o que se confere é só o dígito verificador. O que se
   ganha é que todas as fichas tenham o dado para o cruzamento, que é humano. Liga-se e
   desliga-se com um `UPDATE` em `cao_campanha.cpf_obrigatorio`, sem deploy. Ver
   `docs/PLATAFORMA.md` §6.
3. **Deploy no VPS.** Os artefatos estão prontos (`Dockerfile`, `docker-compose.yml`,
   `deploy/nginx.conf.example`) e quem os executa é a equipe de infra, não este repositório.
   As duas linhas inegociáveis do Nginx estão no `README.md`.

**Pendente de o cliente fornecer material** (não é trabalho de código):

1. **1 logo que não existe:** Fancy Feast — a pasta que o marketing mandou está vazia. É
   escrito como texto azul. Atenção: `WHISKAS-LOGO.png` **não** é Fancy Feast. MARS
   Petcare, Caats e Doguitos **já têm material** em
   `assets-fonte/patrocinadores/Apoio/`; falta tirar de cada pasta o arquivo web e
   repontar o `site.ts`. `Logo-Purina-One-Caes.png` **não** é Doguitos.
2. **Regulamento 2026:** o botão já está **ativo**, mas apontando para o PDF **de 2025**
   (`regulamentoPdf` em `site.json`, hospedado no MinIO). Quando o de 2026 chegar é trocar
   essa URL — o interruptor `regulamentoDisponivel` já está em `true` e o ramo que mostra
   «disponível em breve» segue escrito para o caso de precisar voltar atrás.
3. **Fotos da galeria:** a arte mostra 13 fotos e no repositório há 12, que além disso não
   são a mesma seleção que o designer usou.

> **As protetoras já não estão pendentes.** As três chegaram e estão renderizadas com logo
> e Instagram: Instituto Seres & Vidas, Marcia Santos e Instituto SOS 4 Patas Paraná.

---

## 🎯 Arquivo de Imagem Referência

**Local:** `docs/Desktop - CãoCurso.png` (1366×8000)
**Propósito:** comparação pixel-perfect durante o desenvolvimento
**Uso:** mantê-la visível em outra janela, ou cortá-la em tiras de 1000 px e comparar
faixa a faixa contra uma captura de página inteira do render.

**Atenção — duas armadilhas ao comparar:**

- O que parece texto costuma ser **lettering, e vai como imagem**: «ADOTE UM AuMigo»,
  «SEU PET É A ESTRELA / da nossa passarela!» e «e pra gatos também!» são PNG. Imitá-los
  com `font-serif italic` foi exatamente o que fez a página não se parecer com a arte. O
  que é texto de verdade: «PREÇO BAIXO PRA CACHORRO».
- A **Galeria sai vazia em qualquer captura de página inteira**: as fotos são
  `loading="lazy"` e com uma janela gigante o navegador nunca dispara o carregamento. É
  preciso rolar de verdade antes de capturar. Não é falha de diagramação.

---

## 🔄 Relação com o Central

Esta pasta é **isolada e autossuficiente**:
- Documentação completa aqui
- Projeto separado
- Pode divergir do central quando for melhorada

**Central** (`/home/diego/armando/Migraciones/petCondor/site`) é:
- Hub de decisões
- Fonte dos assets de **2025** e das fontes Torus
- Ponto de sincronização se necessário

**Fontes originais para tirar dúvidas de 2025:**
- `/home/diego/armando/Migraciones/petCondor/content/html/index.html`
- `/home/diego/armando/Migraciones/petCondor/assets/css/post-683.css`
- `/home/diego/armando/Migraciones/petCondor/assets/fonts/` (Torus TTF ×6)

**Para 2026 a fonte é o marketing**, não o central: o KV e os logos vivem em
`Z:\Comunicação e Web\2026\Condor\Campanhas\Pet\` (subpastas `KV`, `Cão Curso\KV`,
`LOGOS` e `Cão Curso\LP\Referência`).

---

## 📁 Estrutura Real

```
/home/diego/armando/Sites/petcondor/
├── astro.config.mjs           (output: 'server' + @astrojs/node standalone,
│                               passthroughImageService, env.schema com 7 variáveis)
├── Dockerfile                 (multi-stage node:22-slim, USER node, HEALTHCHECK /healthz)
├── docker-compose.yml         (127.0.0.1:4321, init: true, env_file: .env)
├── .env.example               (a planta das 7 variáveis; o .env NÃO é versionado)
├── deploy/
│   ├── nginx.conf.example     (proxy reverso — leia o `map` do Origin antes de tocar)
│   └── planilha.gs            (o Apps Script que recebe e reescreve a aba do júri)
├── supabase/
│   └── migrations/
│       ├── 0001_cao_inscricao.sql        (tabela, índices únicos, RLS, bucket privado)
│       └── 0002_cao_campanha_e_vagas.sql (cao_campanha, vista, criar_inscricao())
├── scripts/
│   └── optimizar-assets.mjs   (assets-fonte/ → public/assets/2026/ + galeria/, WebP)
├── assets-fonte/              ⚠️ ~997 MB de gráfica + fotos. NO GITIGNORE.
├── src/
│   ├── pages/
│   │   ├── index.astro        (MAIN — os 11 blocos + 4 Faixa)
│   │   ├── healthz.ts         (200 se o Supabase responde, 503 se não. Alvo do HEALTHCHECK)
│   │   ├── foto/[id].ts       (302 para uma URL assinada de 300 s. O bucket segue privado)
│   │   └── api/
│   │       ├── inscricao.ts   (POST multipart/form-data)
│   │       └── exportar.ts    (GET com token — o conserto manual da planilha)
│   ├── components/
│   │   ├── Hero.astro                (bloco 1)
│   │   ├── AdoteAumigo.astro         (bloco 2)
│   │   ├── Eventos.astro             (bloco 3 — 2 cards + 1 centralizado)
│   │   ├── Requisitos.astro          (bloco 4 — painel + 6 bullets, NÃO cards)
│   │   ├── Protetoras.astro          (bloco 5 — 3 ONGs, com logo e Instagram)
│   │   ├── Caocurso.astro            (bloco 6 — faixa sangrada)
│   │   ├── Evento30Agosto.astro      (bloco 7 — é o 29 de agosto; nome herdado)
│   │   ├── Atracoes.astro            (bloco 8 — 4 cards, ícones SVG inline)
│   │   ├── FormularioInscricao.astro (formulário em modal, 11 campos)
│   │   ├── Galeria.astro             (bloco 9 — mosaico 2025)
│   │   ├── Patrocinadores.astro      (bloco 10)
│   │   ├── Footer.astro              (bloco 11)
│   │   ├── Faixa.astro               (faixa separadora = pattern-horizontal.svg)
│   │   └── icons/IconeSocial.astro   (selos de redes, em cor de marca)
│   ├── lib/
│   │   ├── inscricao.ts       (estado da campanha: em-breve / aberta / esgotada /
│   │   │                       finalizada. Consumido pelo botão E pelo endpoint)
│   │   ├── supabase.ts        (o cliente service_role. SÓ servidor)
│   │   ├── storage.ts         (o ÚNICO módulo que sabe onde vivem as fotos)
│   │   ├── foto.ts            (sharp: valida os magic bytes, gira, apaga o EXIF, WebP)
│   │   └── planilha.ts        (monta e empurra a lista ao Web App do júri)
│   ├── data/
│   │   ├── site.json          (TODO o conteúdo visível: 179 strings, 15 blocos)
│   │   └── site.ts            (os tipos e o porquê: comentários que o JSON não aceita)
│   ├── layouts/
│   │   └── Layout.astro       (lang="pt-BR")
│   └── styles/
│       ├── global.css         (tokens 2026 + @font-face Torus ×6 + .faixa + .emerge
│       │                       + --hero-h/--nav-h e a variante fila:)
│       └── animations.css
├── public/
│   ├── fonts/                 (Torus .woff2 ×6, self-hosted)
│   └── assets/
│       ├── 2026/              (KV 2026 otimizado — 3,7 MB)
│       ├── images/            (assets 2025 ainda válidos: AuMigo, Dog.png)
│       ├── galeria/           (12 fotos da edição 2025, WebP gerados)
│       ├── patrocinadores/    (logos reaproveitados de 2025)
│       └── docs/2025_Regulamento_Caocurso.pdf
│
├── docs/
│   ├── Desktop - CãoCurso.png  🎯 ARTE 2026 — manda sobre tudo (não versionado)
│   ├── LP Cão Curso.docx       🎯 BRIEFING 2026 — manda em conteúdo (não versionado)
│   └── PLATAFORMA.md           (modelo de dados, a planilha, LGPD)
│
└── README.md                   (o manual de operação: subir, variáveis, consertar)
```

---

## ✅ Antes de Começar

- [ ] Abrir `docs/Desktop - CãoCurso.png` — a arte 2026, manda sobre tudo
- [ ] Ler `docs/LP Cão Curso.docx` — o briefing de conteúdo 2026
- [ ] Ler a seção «Regras Duras» deste arquivo (paleta, assets, formulário)
- [ ] `npm install && npm run dev`
- [ ] Se for mexer na persistência ou no formulário: `docs/PLATAFORMA.md`

---

## 🎨 Recursos Disponíveis

| Recurso | Local | Propósito |
|---------|-------|-----------|
| **Arte 2026** | `docs/Desktop - CãoCurso.png` | **Manda sobre tudo** |
| **Briefing 2026** | `docs/LP Cão Curso.docx` | Manda em dados de conteúdo |
| Assets 2026 (web) | `public/assets/2026/` | 3,7 MB, prontos para servir |
| Assets 2026 (origem) | `assets-fonte/` | ~997 MB de gráfica, no gitignore |
| Conversor de assets | `scripts/optimizar-assets.mjs` | origem → WebP web |
| Operar o serviço | `README.md` | Subir, variáveis, consertar a planilha, o que fazer quando quebra |
| Modelo de dados e LGPD | `docs/PLATAFORMA.md` | Tabelas, a planilha, o que ainda está errado |
| Animações | `src/styles/animations.css` | 8 keyframes, comentados no próprio arquivo |
| Fontes Torus | `public/fonts/` (origem em `…/petCondor/assets/fonts/`) | 6 pesos woff2 |
| 📕 Docs de **2025** | histórico do git, até `1796aa1` | Removidos do repositório: a sua paleta, assets e campos já não se aplicam |

---

## 💡 Notas Importantes

1. **Manda a arte 2026** (`docs/Desktop - CãoCurso.png`); em dados de conteúdo, manda o
   briefing (`docs/LP Cão Curso.docx`).
2. **Não mudar o design.** Replicar exatamente, não melhorar.
3. **O lettering vai como imagem, nunca imitado com fontes.** É o erro que foi preciso
   desfazer: `font-serif italic` não é o logotipo do AuMigo.
4. **Conteúdo em pt-BR, literal.** Nada de lorem ipsum, nada de outro idioma no site.
5. **Formulário crítico.** Inscrição no Cãocurso: 11 campos validados, para
   `POST /api/inscricao` (multipart). Não se compara com o site de 2025.
6. **Nunca sirva os originais de gráfica.** Passam por `scripts/optimizar-assets.mjs`.
7. **Antes de dar uma imagem por boa, confira que ela carrega.** Meia dúzia de caminhos
   apontava para `public/Assets/`, uma pasta que já não existe: o `astro check` e o build
   passam do mesmo jeito, porque um `src` quebrado não é um erro de tipos.
8. **Mobile-first.** Mesmo replicando o desktop, garantir o celular desde o início.

---

## 🔗 Comandos Úteis

```bash
# Desenvolvimento
npm run dev           # Start server (localhost:4321)

# Verificação
npm run astro check   # TypeScript check

# Build
npm run build                  # Build de produção → dist/
node ./dist/server/entry.mjs   # Rodar o build

# Como produção vai rodar
docker compose up -d --build
curl -s localhost:4321/healthz # 200 = o Supabase responde. 503 = não.
docker logs petcondor-lp -f    # aqui aparecem os erros de envio à planilha

# Reconverter o KV quando o marketing entregar arte nova
node scripts/optimizar-assets.mjs   # assets-fonte/ → public/assets/2026/

# Testar o endpoint de inscrição.
# O -H "Origin: …" é OBRIGATÓRIO: sem ele o Astro 7 corta o POST com um 403 (CSRF).
curl -H "Origin: http://localhost:4321" \
     -F "tutorNome=Teste Silva" -F "tutorEmail=a@b.com" -F "tutorTelefone=41999999999" \
     -F "petNome=Rex" -F "aceiteRegulamento=on" -F "petFoto=@pet.jpg" \
  http://localhost:4321/api/inscricao

# Limpeza
rm -rf .astro dist           # Limpar cache/build
npm install                  # Reinstalar deps
```

As fichas de teste **não se apagam com `rm`**: vivem no Supabase. Dashboard → Table
Editor → `cao_inscricao`, e a foto correspondente no bucket `fotos-caocurso`. A coluna
`excluido_em` existe para o apagamento lógico da LGPD — uma ficha com data ali some da
planilha no envio seguinte, mas continua no banco.

---

## 📞 Quando Precisar de Ajuda

1. **Como é que fica?** → `docs/Desktop - CãoCurso.png`
2. **O que diz o copy / as datas?** → `docs/LP Cão Curso.docx`
3. **Que cor / que asset eu uso?** → «Regras Duras» deste arquivo
4. **Como converto arte nova?** → `scripts/optimizar-assets.mjs`
5. **Campos do formulário?** → `src/components/FormularioInscricao.astro` + `src/pages/api/inscricao.ts`
5b. **Por que o botão diz o que diz?** → `src/lib/inscricao.ts`
6. **Como subo isto / como conserto?** → `README.md`
6b. **Onde estão os dados e o que a LGPD ainda cobra?** → `docs/PLATAFORMA.md`
6c. **A planilha não atualiza?** → `README.md`, tabela de sintomas. Comece pela aba: os
    dados caem em «Inscrições», não em «Página1»
7. **Animações?** → `src/styles/animations.css`, comentado no próprio arquivo
8. **Como era em 2025?** → histórico do git, até `1796aa1`

---

## 🎯 Próximo Passo

👉 **Olhe** `docs/Desktop - CãoCurso.png` e leia «Regras Duras» acima.

👉 **Depois:** `npm run dev` — a LP está construída e alinhada ao KV 2026.

👉 **O que falta de código são duas coisas pequenas:** o limite de tentativas em
`POST /api/inscricao` e apontar o regulamento de 2026 quando ele chegar.

👉 **O que falta de verdade não é código:** a decisão do cliente sobre o consentimento do
CRM —e essa é irreversível assim que a primeira ficha entrar— e o deploy no VPS, que faz a
equipe de infra. O logo da Fancy Feast e a 13ª foto da galeria seguem esperando material.

---

**Estado:** ✅ LP alinhada ao KV 2026 · inscrição no Supabase · planilha do júri automática
· testado de ponta a ponta contra uma planilha real.

**Versão:** 5.0 (persistência e planilha — a base visual segue em `v2026-base`)

**Última atualização:** 2026-08-06
