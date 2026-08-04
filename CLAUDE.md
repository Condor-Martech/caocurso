# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) no trabalho com este projeto
isolado da LP do Pet Condor.

## Projeto: Pet Condor LP Rebuild

**Objetivo:** construir a landing page de **pet.condor.com.br** (campanha *Mês Pet* /
*Cãocurso* da rede Condor) usando Astro + Tailwind CSS + React.

**Stack:** Astro 7.x (`output: 'server'` + `@astrojs/vercel`) | React 19 | Tailwind CSS v4 | TypeScript | Node.js ≥22.12.0

**Idioma:** **português do Brasil (pt-BR), 100%** — tanto os textos visíveis do site
quanto a documentação e as mensagens de commit deste repositório.

**Estado:** LP realinhada ao **KV 2026** e **saneada**. Build limpo, `astro check` com 0
erros, sem caminhos de assets quebrados. O rebuild está commitado e marcado com a tag
`v2026-base`: é para esse ponto que se volta. Próximo trabalho: persistência do
formulário no Supabase, com espelho numa planilha do Google para o marketing.

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

São **três arquivos**, e nenhum sobra:

1. **`docs/Desktop - CãoCurso.png`** 🎯 — a arte aprovada 2026. Manda sobre tudo
2. **`docs/LP Cão Curso.docx`** 🎯 — o briefing. Manda em datas, copy e marcas
3. **`docs/PLATAFORMA.md`** — para onde vai a persistência: Supabase, o espelho na
   planilha do Google, o modelo de dados, LGPD e a ordem de trabalho

Mais este arquivo, que é o que descreve a LP tal como está construída.

> Antes eram treze documentos, 8.619 linhas: a campanha de 2025, um modal que já não
> existe e uma plataforma de votação com feed público, antifraude e moderação que nunca
> foi o escopo. Hoje são 259 linhas. Está tudo no histórico do git.

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
  são executadas. **Adapter atual: `@astrojs/vercel`.**

  ⚠️ **Mas produção NÃO é a Vercel: o site vai para um VPS com Docker.** A decisão está
  tomada; a migração do adapter está *adiada de propósito*, não esquecida. Não otimize
  para a Vercel nem tome o build de `.vercel/output` como artefato de deploy. Quando for
  a hora: `@astrojs/node` em modo `standalone`, fora o `vercel.json` e a opção
  `imageService: false` (é do adapter da Vercel), e um Dockerfile multi-stage com
  `.dockerignore` — sem ele o contexto de build engole `assets-fonte/`, quase 1 GB.
- **O Astro 7 rejeita POSTs sem `Origin` próprio** (proteção CSRF por padrão). Do
  navegador funciona sozinho; do `curl` é preciso mandar
  `-H "Origin: http://localhost:4321"` ou você recebe um **403**, não um erro de
  validação.
- O `<form>` envia por `fetch()` e desenha a resposta na página; se o JS falhar, o POST
  nativo continua funcionando.
- **`/api/feedback` NÃO serve aqui:** pertence à documentação interna do projeto central,
  exige `pageId` + `content` e devolve **400** com o payload de inscrição.

**Persistência do endpoint:** hoje grava com `fs` em `uploads/`. Na Vercel isso era um
bloqueio duro —sistema de arquivos somente leitura fora de `/tmp`, efêmero e por
instância: `fs.mkdir` falha, responde **500**, e a deduplicação por tutor+pet não tem como
funcionar porque cada instância vê o seu próprio arquivo—. **Num VPS com Docker e um
volume montado deixa de ser:** gravável, persistente e com uma instância só. Ou seja, já
não impede o deploy; continua sendo o caminho errado a médio prazo. **Destino decidido: a
ficha vai para o Supabase**; o storage da foto (MinIO ou Supabase Storage) segue sem
decisão e não bloqueia, porque o banco guarda a `key` e não a URL. É o próximo trabalho
depois do saneamento. Na migração, o formulário passa a ser uma **ilha React** —por isso
o `@astrojs/react` continua instalado mesmo sem nenhuma ilha hoje— e deve ser montado com
`client:visible`: ele vive bem abaixo da dobra, então os ~60 KB de React não têm por que
entrar na primeira tela. E a ilha é renderizada no servidor: o `<form>` conserva `action`
e `method` reais, de modo que continua funcionando sem JavaScript. Se montar vazia no
cliente, isso se perde. Ver `docs/PLATAFORMA.md`.

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

O KV 2026 chega em resolução de gráfica: hoje `assets-fonte/` está em **920 MB**, com PNG
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
`public/` é copiado tal e qual para `.vercel/output/static/` e fica servido numa URL,
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

#### O botão tem três estados, e quem decide é o servidor

`src/lib/inscricao.ts` compara a hora atual com a janela de inscrição e devolve
`em-breve`, `aberta` ou `finalizada`. Daí saem os três rótulos —«Em breve»,
«Inscreva-se», «Finalizado»— e só o do meio é clicável.

Três coisas que não dá para mexer separadamente:

- **A mesma função é usada pelo `POST /api/inscricao`**, e ali não é decorativa: um botão
  que não aparece não impede um POST com `curl` no dia seguinte ao fechamento. Se você
  tirar essa checagem, «Finalizado» deixa de significar alguma coisa.
- **Falha fechado.** Se as datas não puderem ser lidas, devolve `em-breve`, nunca
  `aberta`. Vale também para quando as datas vierem do Supabase e o Supabase não
  responder: ver «Inscreva-se» e o envio estourar depois de preencher onze campos e subir
  uma foto é pior do que ver «Em breve» a mais.
- **As datas levam offset `-03:00` escrito à mão** em `site.ts`. `new Date('2026-08-21')`
  é lido como UTC e o período teria fechado às 21:00 do dia 20 — um dia antes.

#### Sem JavaScript o formulário continua funcionando

O bloco vive no documento como uma seção normal e o modal é uma camada por cima. O
interruptor é a classe `.js` que o `Layout.astro` coloca em `<html>` antes de pintar: sem
ela, `.modal` é um cartão lavanda no fim da página e o botão —um
`<a href="#modal-inscricao">`— salta até ele.

Por isso **não é um `<dialog>`**: sem JS um `<dialog>` é `display:none` e não há como
abri-lo, então o formulário deixaria de existir para quem não executa scripts.

E por isso **o componente é sempre renderizado**, nos três estados: tirá-lo do HTML
quando o período está fechado deixaria a âncora apontando para o nada.

`role="dialog"` e `aria-modal` são colocados pelo script ao abrir, não pelo HTML:
enquanto é uma seção normal não há diálogo a anunciar.

O seu propósito é **cadastrar UM pet com a sua foto para o concurso Cãocurso**.

Campos, conforme o briefing (`docs/LP Cão Curso.docx`):

- **Tutor:** `tutorNome`*, `tutorNascimento`, `tutorCpf` (o do Clube Condor),
  `tutorEmail`*, `tutorTelefone`*
- **Pet:** `petNome`*, `petRaca`, `petSexo`, `petDescricao`, **`petFoto`*** (máx. 2 MB)
- `aceiteRegulamento`* — regulamento + autorização de uso de imagem. **Não está na
  arte**; foi acrescentado a pedido do cliente porque um concurso com foto precisa disso
  (LGPD).

(*) obrigatório. `petEspecie` ficou **opcional**: o formulário de 2026 não o pede.

- **Proibido** pedir endereço, quintal, "você tem pets?" ou documento de identidade: eram
  do formulário de adoção que a documentação de 2025 imaginou.
- Valida-se contra `docs/Desktop - CãoCurso.png` e o briefing, não contra a especificação
  de 2025, que descrevia uma versão de 8 campos já retirada.

---

## 🚀 Quick Start

**O projeto já está montado e funcionando.** Não é preciso criá-lo do zero.

```bash
npm install          # só na primeira vez
npm run dev          # http://localhost:4321
npm run build        # build de produção → .vercel/output
vercel dev           # preview do build (astro preview NÃO serve .vercel/output)
npx astro check      # 0 erros esperados
```

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

**Verificado (2026-08-04):** `astro check` 0/0/0 · `npm run build` limpo · os 34 caminhos
de `/assets/` referenciados a partir de `src/` existem em `public/` · árvore do git
limpa, rebuild 2026 commitado e marcado com `v2026-base` · endpoint testado em 5 casos
(201 válido, 400 sem aceite, 409 duplicado, 400 CPF inválido, 400 menor de idade).

`.vercel/output/static` = **7,8 MB** (eram 86 antes de tirar os kits de marca de
`public/`). Nenhum `.zip`, `.ai` nem `Thumbs.db` fica publicado.

⚠️ A função serverless pesa **41 MB, dos quais 36 são os binários nativos do sharp**
(`node_modules/@img`). `imageService: false` desativa o serviço de imagens da Vercel, mas
deixa o próprio do Astro, que é o sharp. Como aqui todas as imagens são `<img>` com
caminhos de `/assets/` já otimizados e não se usa `astro:assets`, o sharp nunca chega a
ser executado: são 36 MB mortos que só alongam o cold start. Saem colocando
`image: { service: passthroughImageService() }`.

**Pendente de o cliente fornecer material** (não é trabalho de código):

1. **1 logo que não existe:** Fancy Feast — a pasta que o marketing mandou está vazia. É
   escrito como texto azul. Atenção: `WHISKAS-LOGO.png` **não** é Fancy Feast. MARS
   Petcare, Caats e Doguitos **já têm material** em
   `public/assets/patrocinadores/Apoio/`; falta tirar de cada pasta o arquivo web e
   repontar o `site.ts`. `Logo-Purina-One-Caes.png` **não** é Doguitos.
2. **Regulamento 2026:** não há PDF. O botão está visível e desabilitado. Quando o
   arquivo chegar: `regulamentoDisponivel: true` em `src/data/site.ts` e o ramo `<a href>`
   já está escrito.
3. **Protetoras / ONGs:** *«em definição»* segundo o briefing. Os 3 cartões estão vazios,
   com o link do Instagram pronto para ser ativado quando os dados chegarem.
4. **Fotos da galeria:** a arte mostra 13 fotos e no repositório há 12, que além disso não
   são a mesma seleção que o designer usou.

O que vem depois está em `docs/PLATAFORMA.md` §6.

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
├── astro.config.mjs           (output: 'server' + @astrojs/vercel, imageService: false)
├── vercel.json                (framework astro, região gru1 São Paulo)
├── scripts/
│   └── optimizar-assets.mjs   (assets-fonte/ → public/assets/2026/ + galeria/, WebP)
├── assets-fonte/              ⚠️ 920 MB de gráfica + fotos. NO GITIGNORE.
├── src/
│   ├── pages/
│   │   ├── index.astro        (MAIN — os 11 blocos + 4 Faixa)
│   │   └── api/
│   │       └── inscricao.ts   (POST multipart/form-data)
│   ├── components/
│   │   ├── Hero.astro                (bloco 1)
│   │   ├── AdoteAumigo.astro         (bloco 2)
│   │   ├── Eventos.astro             (bloco 3 — 2 cards + 1 centralizado)
│   │   ├── Requisitos.astro          (bloco 4 — painel + 6 bullets, NÃO cards)
│   │   ├── Protetoras.astro          (bloco 5 — 3 cartões vazios, ONGs sem definir)
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
│   │   └── inscricao.ts       (estado do período: em-breve / aberta / finalizada.
│   │                           Consumido pelo botão E pelo endpoint)
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
│       ├── 2026/              (KV 2026 otimizado — 3,5 MB)
│       ├── images/            (assets 2025 ainda válidos: AuMigo, Dog.png)
│       ├── galeria/           (12 fotos da edição 2025, WebP gerados)
│       ├── patrocinadores/    (logos reaproveitados de 2025)
│       └── docs/2025_Regulamento_Caocurso.pdf
│
└── docs/
    ├── Desktop - CãoCurso.png  🎯 ARTE 2026 — manda sobre tudo (não versionado)
    ├── LP Cão Curso.docx       🎯 BRIEFING 2026 — manda em conteúdo (não versionado)
    └── PLATAFORMA.md           (Supabase + planilha do Google, modelo de dados, LGPD)
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
| Assets 2026 (web) | `public/assets/2026/` | 3,5 MB, prontos para servir |
| Assets 2026 (origem) | `assets-fonte/` | 920 MB de gráfica, no gitignore |
| Conversor de assets | `scripts/optimizar-assets.mjs` | origem → WebP web |
| Plataforma e persistência | `docs/PLATAFORMA.md` | Supabase + planilha do Google, modelo de dados, LGPD |
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
npm run build         # Build de produção → .vercel/output (adapter Vercel)
vercel dev            # Preview do build (astro preview NÃO serve .vercel/output)

# Reconverter o KV quando o marketing entregar arte nova
node scripts/optimizar-assets.mjs   # assets-fonte/ → public/assets/2026/

# Testar o endpoint de inscrição.
# O -H "Origin: …" é OBRIGATÓRIO: sem ele o Astro 7 corta o POST com um 403 (CSRF).
curl -H "Origin: http://localhost:4321" \
     -F "tutorNome=Teste Silva" -F "tutorEmail=a@b.com" -F "tutorTelefone=41999999999" \
     -F "petNome=Rex" -F "aceiteRegulamento=on" -F "petFoto=@pet.jpg" \
  http://localhost:4321/api/inscricao

# Limpeza
rm -rf .astro dist .vercel   # Limpar cache/build
rm -rf uploads               # Fichas de teste do formulário
npm install                  # Reinstalar deps
```

---

## 📞 Quando Precisar de Ajuda

1. **Como é que fica?** → `docs/Desktop - CãoCurso.png`
2. **O que diz o copy / as datas?** → `docs/LP Cão Curso.docx`
3. **Que cor / que asset eu uso?** → «Regras Duras» deste arquivo
4. **Como converto arte nova?** → `scripts/optimizar-assets.mjs`
5. **Campos do formulário?** → `src/components/FormularioInscricao.astro` + `src/pages/api/inscricao.ts`
5b. **Por que o botão diz o que diz?** → `src/lib/inscricao.ts`
6. **Onde isto vai viver de verdade?** → `docs/PLATAFORMA.md`
7. **Animações?** → `src/styles/animations.css`, comentado no próprio arquivo
8. **Como era em 2025?** → histórico do git, até `1796aa1`

---

## 🎯 Próximo Passo

👉 **Olhe** `docs/Desktop - CãoCurso.png` e leia «Regras Duras» acima.

👉 **Depois:** `npm run dev` — a LP está construída e alinhada ao KV 2026.

👉 **O que falta não é código:** o logo da Fancy Feast, o PDF do regulamento, as ONGs e a
13ª foto da galeria. E, antes de abrir o formulário ao público, mover a persistência para
fora do sistema de arquivos (ver o aviso do endpoint).

---

**Estado:** ✅ LP alinhada ao KV 2026, build limpo, render verificado contra a arte.

**Versão:** 4.1 (saneada — ponto base `v2026-base`)

**Última atualização:** 2026-08-04
