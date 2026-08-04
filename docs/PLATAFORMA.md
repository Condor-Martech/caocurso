# Persistência das inscrições — Cãocurso 2026

> **Escopo:** o que acontece depois de alguém clicar em «Inscreva-se». Nada além disso.
> **Atualizado:** 2026-08-04.

**O fluxo, numa frase:** o tutor se inscreve com o seu pet, a ficha é gravada no
Supabase, e um worker mantém uma planilha do Google atualizada para que o time de
marketing —que não é técnico— possa consultá-la.

**O Supabase é o banco de dados. A planilha é uma janela somente leitura.** Se for
preciso corrigir um dado, corrige-se na origem.

```
LP (Astro)
   │ POST /api/inscricao   (multipart: a foto é um arquivo)
   ▼
Supabase ◀───────────────── fonte de verdade
   ├─ cao_inscricao         uma linha por participante
   ├─ foto → storage        (provedor a decidir, ver §4)
   └─ cao_evento_integracao outbox
                │
                ▼ worker
        Planilha do Google ◀── janela para o marketing, somente leitura
```

**Não há votação, nem feed público, nem ranking.** O júri escolhe presencialmente no dia
do evento. Isso elimina a moderação, os estados de aprovação, o antifraude e o
backoffice: não são necessários.

---

## 1. Decisões

**Tomadas:**

| | Valor | Nota |
|---|---|---|
| Banco de dados | **Supabase** (Postgres) | `sa-east-1` São Paulo: o dado não sai do Brasil |
| Espelho para marketing | **Planilha do Google**, somente leitura | Uma aba, reescrita a cada sync |
| Deploy | **VPS com Docker** | O adapter ainda é o da Vercel; migração adiada de propósito |
| Seleção dos vencedores | **Júri presencial** | Sem software no meio |

**Pendentes, sem bloquear nada:**

| | Pergunta | Por que não bloqueia |
|---|---|---|
| **Storage da foto** | MinIO ou Supabase Storage? | Isolado atrás de um módulo, ver §4 |
| **CPF na planilha** | O marketing precisa dele ali? | Por padrão **não**: fica no Supabase |

---

## 2. Modelo de dados

Uma tabela e o outbox. Os campos são os onze do formulário atual, ✅ verificados em
`src/components/FormularioInscricao.astro`.

```sql
CREATE TABLE cao_inscricao (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- tutor
  tutor_nome        text NOT NULL CHECK (length(tutor_nome) >= 3),
  tutor_nascimento  date,
  tutor_cpf         text,                    -- só dígitos, já validado no endpoint
  tutor_email       citext NOT NULL,
  tutor_telefone    text NOT NULL,

  -- pet
  pet_nome          text NOT NULL,
  pet_raca          text,                    -- texto livre, como no formulário
  pet_sexo          text,
  pet_descricao     text,
  foto_key          text NOT NULL,           -- key no storage, NUNCA a URL

  -- consentimento
  consentimentos    jsonb NOT NULL,          -- [{tipo, versao, texto_sha256, em}]

  criado_em         timestamptz NOT NULL DEFAULT now(),
  excluido_em       timestamptz              -- exclusão lógica: LGPD art. 18
);

-- Uma inscrição por CPF. Índice parcial, não uma checagem em código:
-- dois envios simultâneos se atropelam e o segundo tem de falhar no banco.
CREATE UNIQUE INDEX cao_inscricao_cpf_unica
  ON cao_inscricao (tutor_cpf) WHERE excluido_em IS NULL;

CREATE TABLE cao_evento_integracao (
  id         bigserial PRIMARY KEY,
  tipo       text NOT NULL,
  payload    jsonb NOT NULL,
  status     text NOT NULL DEFAULT 'pendente'
             CHECK (status IN ('pendente','enviado','falhou')),
  tentativas smallint NOT NULL DEFAULT 0,
  erro       text,
  criado_em  timestamptz NOT NULL DEFAULT now(),
  enviado_em timestamptz
);
CREATE INDEX ON cao_evento_integracao (criado_em) WHERE status = 'pendente';
```

> **`foto_key` e não `foto_url`.** Com a URL no banco, trocar de storage obriga a
> reescrever a tabela. Com a key, a URL é construída na leitura e trocar de provedor é
> mudar uma variável de ambiente. É o que permite adiar a decisão da §4.
>
> **`excluido_em` e não `DELETE`.** Quando alguém exerce o seu direito de exclusão é
> preciso poder demonstrar *quando* aquilo foi atendido. Um `DELETE` não deixa rastro de
> ter cumprido.
>
> **`consentimentos` é um array, não um booleano.** Ver §5.

`pet_raca` é texto livre porque o formulário é. Consequência: na planilha vão conviver
«SRD», «srd» e «vira-lata» como valores distintos. Com o júri escolhendo presencialmente
dá no mesmo; se um dia for preciso agrupar por raça, o campo tem de virar seletor — não
normalizar depois o que já foi coletado.

---

## 3. O envio para a planilha

### Nunca dentro do request do usuário

Se a escrita na planilha acontecer enquanto o tutor espera, qualquer soluço da API do
Google —cota, latência, um 503— vira um erro de inscrição: alguém preencheu onze campos
e subiu uma foto, e vê «não foi possível concluir» porque o Google estava lento.

```
POST /api/inscricao
  ├─ BEGIN
  ├─ INSERT cao_inscricao
  ├─ INSERT cao_evento_integracao (pendente)   ← mesma transação
  └─ COMMIT                                    → 201, a pessoa já está inscrita
Worker
  └─ lê pendentes → reescreve a planilha → marca enviado / repete com backoff
```

A inscrição é confirmada com o commit local. A planilha se atualiza um segundo depois,
ou um minuto depois se o Google estiver fora. O usuário nunca fica sabendo.

### Reescrever a aba inteira, não acrescentar linhas

Parece mais caro e é o correto, por um motivo que não é de desempenho:

**O direito de exclusão.** Quando alguém pede que os seus dados sejam apagados, marca-se
`excluido_em` no Supabase. Com um sync que só acrescenta, essa pessoa **continua na
planilha para sempre** — e acabou-se de descumprir justamente o que se acreditava ter
cumprido. Com reescrita completa, ela some sozinha no próximo sync.

De brinde: as correções se propagam sem fazer nada, é idempotente, e não deixa estados
pela metade se falhar no meio. Com milhares de linhas é trivial.

### Acesso

- Compartilhada **por conta nominal** dentro do workspace da Condor. **Nunca «qualquer
  pessoa com o link»**: é o vetor de vazamento número um e o Google não registra quem
  baixou.
- Colunas: nome, e-mail, telefone, nome do pet, raça, sexo, descrição, data. **O CPF
  não**, a menos que o marketing peça para algo concreto — é o dado que transforma um
  vazamento chato num vazamento grave, e para contatar vencedores não acrescenta nada.

---

## 4. A foto — decisão adiada, sem custo

MinIO ou Supabase Storage segue sem decisão. Dá para adiar **se e somente se** duas
regras forem respeitadas desde a primeira linha:

1. **O banco guarda a key, nunca a URL** (§2).
2. **O upload vive num módulo só:** uma função que recebe o arquivo e devolve a key. O
   endpoint, o worker e a planilha falam com essa função e não sabem o que há atrás.
   Quando houver decisão, muda-se ali e em nenhum outro lugar.

**O que é preciso fazer seja qual for o provedor:**

- **Recodificar no servidor.** Resolve três coisas de uma vez: remove o EXIF (§5), valida
  que o arquivo é mesmo uma imagem —conferindo os primeiros bytes, não a extensão— e
  normaliza o peso.
- **Bucket privado.** A foto não tem por que ser acessível pela internet: só a vê quem
  olha o cadastro.

**E para que o link da planilha não envelheça:** a planilha não deve guardar uma URL
assinada —elas expiram, e uma planilha cheia de links mortos não serve— e sim um endereço
estável próprio (`/foto/<id>`) que confira quem é no clique e só então redirecione para
uma URL assinada. A permissão é avaliada no clique, não quando a célula foi escrita. De
quebra, fica registro de quem viu qual foto.

Essa coluna entra na planilha quando a decisão de storage for fechada.

---

## 5. LGPD — o que está errado hoje

Dois pontos são código atual, ✅ verificados.

| # | Ponto | Estado | Ação |
|---|---|---|---|
| 1 | **Consentimento agrupado** | ⛔ Um único checkbox mistura três finalidades | Separar, ver abaixo |
| 2 | **EXIF com GPS** | ⛔ `inscricao.ts` grava os bytes crus do navegador | Recodificar no servidor (§4) |
| 3 | Base legal | consentimento | Documentá-la no regulamento |
| 4 | Retenção | sem definir | Prazo pós-campanha + expurgo, **também da planilha** |
| 5 | Direito de exclusão | sem implementar | `excluido_em` + o sync por reescrita (§3) |
| 6 | Menores | sem contemplar | ⚠️ Um concurso de pets atrai adolescentes. O art. 14 tem regime reforçado. **O simples é exigir +18 no regulamento** |
| 7 | Transferência internacional | ⚠️ a planilha está no Google | O Supabase é Brasil, mas o espelho não. Cláusulas + acesso nominal |

**Sobre o ponto 1.** O checkbox único diz hoje:

> *«Li e aceito o regulamento do Cãocurso 2026 e autorizo a Rede Condor a usar a imagem
> do meu pet e os dados enviados na divulgação da campanha.»*

Agrupa **participar**, **ceder a imagem do pet** e **ceder os dados para divulgação**.
Sob a LGPD são finalidades distintas e não podem ser juntadas num único consentimento.
São necessários registros separados e nenhum pré-marcado — por isso `consentimentos` é um
array de `{tipo, versao, texto_sha256, em}` e não um booleano: é preciso poder demonstrar
qual texto exato cada pessoa aceitou.

**Sobre o ponto 2.** As fotos de celular levam coordenadas de GPS por padrão. Uma foto de
pet é feita em casa, então o arquivo contém o endereço do tutor. Hoje
`src/pages/api/inscricao.ts` grava `Buffer.from(await foto.arrayBuffer())` tal e qual:
sem recodificar, sem mexer em nada. O pipeline da galeria limpa —o sharp descarta
metadados a menos que se peça o contrário— mas o do formulário não existe.

---

## 6. Ordem de trabalho

| | O quê | Depende de |
|---|---|---|
| 1 | Schema no Supabase: `cao_inscricao` + outbox | — |
| 2 | Repontar o `POST /api/inscricao` de `fs` para o Supabase, com o upload isolado no seu módulo | — |
| 3 | Separar os consentimentos (§5.1) | — |
| 4 | Worker: outbox → reescrita da planilha | 1 |
| 5 | Recodificar a foto no servidor + bucket privado | decisão de storage |
| 6 | `/foto/<id>` com permissão no clique, e a sua coluna na planilha | 5 |

Os quatro primeiros não dependem da decisão de storage.

---

## O que foi descartado, para que ninguém volte a propor

Este documento tinha 646 linhas e vinha de outros três que somavam 1.619. Quase tudo
descrevia um projeto maior do que o que existe. Foi removido, e o motivo importa:

- **Votação, feed público, ranking, antifraude, CGNAT, OTP, Turnstile, encurtador de
  links, `votos_cache`, slugs compartilháveis** — não há votação.
- **Moderação, estados de aprovação, fila com SLA, papéis de júri, auditoria** — o júri
  escolhe presencialmente.
- **Miniaturas, CDN, o cálculo de 3,7 TB de banda** — sem feed ninguém vê 25 fotos por
  sessão.
- **Catálogo de raças com SRD** — era para o prêmio «Top por raça»; `pet_raca` é texto
  livre.
- **Plataforma de formulários por campanha, catálogo de campos, schema versionado,
  `@condor/forms-core`** — continua sendo boa ideia para a saída do WordPress, mas é
  outro projeto e não é este.
- **A avaliação InsForge vs Supabase** — decidido.
- **Toda a análise do limite de 4,5 MB das funções da Vercel** — num VPS com Docker esse
  limite não existe. O que continuava obrigatório por outros motivos (EXIF, validação de
  conteúdo) está na §4.

Está tudo no histórico do git até `98d1b95`.
