# Persistência das inscrições — Cãocurso 2026

> **Escopo:** o que acontece depois de alguém clicar em «Inscreva-se». Nada além disso.
> **Estado:** construído e verificado de ponta a ponta. **Atualizado:** 2026-08-06.
>
> Para *operar* isto —subir, variáveis, consertar quando quebra— o documento é o
> [`README.md`](../README.md). Este aqui é **por que está assim** e **o que continua
> errado**.

**O fluxo, numa frase:** o tutor se inscreve com o seu pet, a ficha vai para o Supabase, e
o próprio servidor empurra a lista inteira para uma planilha do Google onde o júri e o CRM
a consultam.

**O Supabase é o banco de dados. A planilha é uma janela somente leitura.** Se for preciso
corrigir um dado, corrige-se na origem — a planilha é reescrita por cima no envio
seguinte, então qualquer edição feita nela se perde.

```
LP (Astro, contêiner Docker atrás de Nginx)
   │ POST /api/inscricao   (multipart: a foto é um arquivo)
   ▼
Supabase ◀───────────────── fonte de verdade
   ├─ cao_inscricao         uma linha por participante
   ├─ cao_campanha          uma linha só: janela de datas + teto de vagas
   └─ (as fotos NÃO ficam aqui — ver abaixo)
   │
MinIO  s3.cndr.me
   └─ caocursantes          bucket PRIVADO, WebP já reprocessado
   │
   └──▶ e, logo depois de gravar e sem esperar por isso,
        a LP empurra a lista inteira ──▶ Web App do Apps Script
                                             ▼
                                     Planilha do Google
                                     (júri + CRM, conta nominal)
```

**Não há votação, nem feed público, nem ranking.** O júri escolhe presencialmente no dia
do evento. Isso elimina a moderação, os estados de aprovação, o antifraude e o
backoffice: não são necessários.

---

## 1. Decisões

Todas tomadas. Nenhuma pendente.

| | Valor | Por quê |
|---|---|---|
| Banco de dados | **Supabase** (Postgres) | `sa-east-1` São Paulo: o dado não sai do Brasil |
| Storage da foto | **MinIO**, bucket privado `caocursantes` | Ordem do cliente em 2026-08-06. Ver §4 |
| Espelho para o júri | **Planilha do Google**, reescrita inteira a cada envio | Ver §3 |
| Quem empurra | **A própria LP**, sem worker | Ver §3 |
| Deploy | **VPS com Docker**, `@astrojs/node` standalone | Build em `dist/`, contêiner atrás de Nginx |
| Seleção dos vencedores | **Júri presencial** | Sem software no meio |
| CPF na planilha | **Vai** — é ali que se cruza com o Clube | Obriga acesso por conta nomeada. Ver §3, «Acesso» |

> **O MinIO entrou por ordem, não por cálculo — e vale saber por quê.** Este bloco dizia o
> contrário até 2026-08-06: que o MinIO ficara de fora porque não poupava nada. O
> raciocínio técnico continua correto e é o que segue abaixo; o que mudou é que **deixou de
> ser a pergunta**.
>
> O cálculo era este: com **50 inscrições** e fotos reprocessadas —média **113 KB**, pior
> caso **228 KB**— o total são **6 a 12 MB de 1 GB**. O storage do Supabase sobrava, e o
> MinIO acrescentava uma peça a mais que pode falhar.
>
> Em 2026-08-06 o cliente mandou tirar as fotos do Supabase. É uma decisão de quem é dono
> dos dados, não uma otimização, e a resposta certa a isso não é rediscutir a conta. **O que
> importa é que custou um arquivo** (`src/lib/storage.ts`) porque o banco guarda a `key` e
> nunca a URL — ver §4.
>
> ⚠️ O preço real é o que ficou no §4: **são dois serviços em vez de um**, e o Supabase
> dava uma rede por baixo do código (`allowed_mime_types`) que o MinIO não dá.

---

## 2. Modelo de dados

Duas tabelas, uma vista e uma função. Os campos são os onze do formulário, ✅ verificados
contra `src/components/FormularioInscricao.astro`.

O SQL real vive em `supabase/migrations/` — o que segue é o essencial e o porquê.

### `cao_inscricao` — uma linha por participante

```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()

tutor_nome        text NOT NULL CHECK (length(trim(tutor_nome)) >= 3)
tutor_nascimento  date
tutor_cpf         text CHECK (tutor_cpf IS NULL OR tutor_cpf ~ '^[0-9]{11}$')
tutor_email       text NOT NULL
tutor_telefone    text NOT NULL

pet_nome          text NOT NULL
pet_raca          text                      -- texto livre, como no formulário
pet_sexo          text
pet_especie       text                      -- opcional: o formulário de 2026 não o pede
pet_descricao     text
foto_key          text NOT NULL             -- a KEY no storage, NUNCA a URL

consentimentos    jsonb NOT NULL DEFAULT '[]'
criado_em         timestamptz NOT NULL DEFAULT now()
excluido_em       timestamptz               -- exclusão lógica: LGPD art. 18
```

Dois índices únicos **parciais**, e são parciais de propósito: uma ficha excluída não pode
impedir que a mesma pessoa se inscreva de novo.

```sql
cao_inscricao_cpf_unica        (tutor_cpf)              WHERE excluido_em IS NULL
                                                          AND tutor_cpf IS NOT NULL
cao_inscricao_email_pet_unica  (lower(tutor_email),
                                lower(pet_nome))        WHERE excluido_em IS NULL
```

> **Índice, não checagem em código.** Dois envios simultâneos se atropelam: entre o
> `SELECT` que não encontra nada e o `INSERT` cabe outra requisição. O banco é o único
> lugar onde isso não acontece. O endpoint traduz o `23505` num **409** com mensagem
> humana.
>
> **`tutor_email` é `text`, não `citext`.** A comparação sem maiúsculas vem do índice
> sobre `lower(tutor_email)`, que não exige extensão nenhuma.
>
> **`foto_key` e não `foto_url`.** Com a URL gravada, trocar de storage obrigaria a
> reescrever a tabela. Com a key, a URL se constrói na leitura — e é o que faz de
> `src/lib/storage.ts` o único arquivo que precisa saber onde as fotos vivem.
>
> **`excluido_em` e não `DELETE`.** Quando alguém exerce o direito de exclusão é preciso
> poder demonstrar *quando* aquilo foi atendido. Um `DELETE` não deixa rastro de ter
> cumprido.
>
> **`consentimentos` é um array, não um booleano.** Ver §5.

**RLS ligado e nenhuma política**, mais `REVOKE ALL … FROM anon, authenticated`. Não é
descuido: é o desenho. Só a `service_role` enxerga a tabela, e ela vive exclusivamente no
servidor. Não existe caminho desde o navegador.

`pet_raca` é texto livre porque o formulário é. Consequência: na planilha vão conviver
«SRD», «srd» e «vira-lata» como valores distintos. Com o júri escolhendo presencialmente
dá no mesmo; se um dia for preciso agrupar por raça, o campo tem de virar seletor — não
normalizar depois o que já foi coletado.

### `cao_campanha` — a janela e o teto, fora do código

Uma linha só, garantida por `CREATE UNIQUE INDEX ON cao_campanha ((true))`.

```sql
id              text PRIMARY KEY   -- 'caocurso-2026'
abre_em         timestamptz        -- '2026-08-03 00:00:00-03'
fecha_em        timestamptz        -- '2026-08-21 23:59:59-03'
limite_vagas    integer            -- 50
cpf_obrigatorio boolean            -- true (migração 0003) — ver §6
atualizado_em   timestamptz NOT NULL DEFAULT now()
```

**Isto está no banco e não no `site.ts` por um motivo prático:** mudar a data de
fechamento, subir o teto de 50 ou deixar de exigir o CPF é um `update` de dez segundos,
sem rebuild e sem redeploy. É a diferença entre resolver um pedido do cliente na hora ou
em meia manhã — e a campanha já está aberta.

`lib/inscricao.ts` lê a vista com `select('*')` e não com a lista de colunas, de propósito:
com nomes explícitos, pedir uma coluna que a vista ainda não tem devolve erro, e isso
transforma «falta aplicar uma migração» em «a portada inteira diz Em breve».

⚠️ **As datas levam offset `-03` escrito à mão**, na migração e em qualquer `update`.
`'2026-08-21 23:59:59'` sem fuso é lido como UTC, e o período fecharia às 20:59 do dia 21
em Brasília.

A vista `cao_estado_inscricao` junta **numa consulta só** a janela, o limite, a contagem
de fichas vivas e o interruptor do CPF — seis colunas cruas (`id, abre_em, fecha_em,
limite_vagas, inscritos, cpf_obrigatorio`).

> `cpf_obrigatorio` está no fim, e não ao lado de `limite_vagas` onde ficaria bem, porque
> o `CREATE OR REPLACE VIEW` só aceita **acrescentar** colunas ao final: uma coluna nova no
> meio o Postgres entende como renomear a que estava ali, e recusa. Como quem lê é um
> `select('*')` que pega pelo nome, a ordem não importa para o código.
Ela não decide nada: quem transforma isso em `em-breve` / `aberta` / `esgotada` /
`finalizada` é `estadoInscricao()`, em `src/lib/inscricao.ts`, que a lê com **cache de 10
segundos** — sem ele, cada visita à home seria uma consulta ao banco.

A contagem já filtra `excluido_em IS NULL`: **quem exerce o direito de exclusão devolve a
sua vaga ao concurso.**

### `criar_inscricao(dados jsonb)` — por que não é um `INSERT`

```
lê a campanha                                      → P0100 se não existe
confere a janela                                   → P0101 antes de abrir
                                                   → P0102 depois de fechar
PERFORM pg_advisory_xact_lock('cao_inscricao_vagas')   ← só a partir daqui há fila
  conta as fichas vivas                            → P0103 se não há mais vagas
  INSERT
```

**A trava vem depois das checagens de data, e é de propósito.** Quem chega fora do prazo é
rejeitado sem entrar na fila: não faz sentido serializar requisições que vão ser recusadas
de qualquer jeito. O que precisa ser serializado é só o trecho entre contar e inserir.

O advisory lock é o que faz o teto de 50 significar alguma coisa. Sem ele, dez pessoas
disputando a última vaga leem «49 ocupadas» ao mesmo tempo e entram todas. Com ele, nove
recebem **409** e a tabela fecha exatamente em 50.

**Verificado:** 10 requisições simultâneas disputando 1 vaga → exatamente 1 × 201 e
9 × 409.

Os erros são **SQLSTATE próprios** (`P0100`–`P0103`, listados em `src/lib/supabase.ts`) e
não comparações com o texto da mensagem: a mensagem é humana e alguém a vai reescrever um
dia; o código é contrato.

---

## 3. O envio para a planilha

### A LP empurra; não há worker

O desenho anterior deste documento previa uma tabela `outbox` e um processo separado que a
consumisse. **Não se construiu, e não porque tenha ficado pendente:** com 50 fichas, um
worker é uma peça a mais para instalar, monitorar e reiniciar, resolvendo um problema que
não existe nessa escala.

O que existe:

```
POST /api/inscricao
  ├─ sobe a foto ao bucket
  ├─ criar_inscricao()  →  201, a pessoa já está inscrita
  └─ sincronizarPlanilha()   ← SEM await
         └─ monta a lista inteira → POST ao Web App → a aba é reescrita
```

**O `sincronizarPlanilha()` não é esperado de propósito.** A ficha já está salva quando ele
dispara: se a Google estiver fora do ar, o erro vai para o log e ninguém que preencheu onze
campos recebe uma tela de falha por causa da planilha. É a mesma garantia que o outbox
dava, sem o worker.

### Por que empurrar e não a planilha puxar

A primeira versão fazia o contrário: um gatilho de 15 minutos dentro da planilha chamava
`GET /api/exportar`. Trocou-se porque **não dava para testar**. Quem executa o script é uma
máquina da Google, de fora; enquanto `pet.condor.com.br` não estivesse no ar não havia nada
que ela pudesse chamar — a alternativa era abrir um túnel para a máquina de trabalho só
para ver se a coisa funcionava. Empurrando, o único endereço público é o do Web App, e esse
a Google já publica.

De brinde, a linha aparece **na hora** em vez de até um quarto de hora depois.

`GET /api/exportar` continua existindo, agora como **conserto**: a aba apagada sem querer,
uma exclusão LGPD sem inscrições novas depois, um envio que se perdeu. Exige o domínio no
ar e um token próprio.

### Reescrever a aba inteira, não acrescentar linhas

Parece mais caro e é o correto, por um motivo que não é de desempenho:

**O direito de exclusão.** Quando alguém pede que os seus dados sejam apagados, marca-se
`excluido_em` no Supabase. Com um sync que só acrescenta, essa pessoa **continua na
planilha para sempre** — e acabou-se de descumprir justamente o que se acreditava ter
cumprido. Com reescrita completa, ela some sozinha no envio seguinte.

De brinde: as correções se propagam sem fazer nada, é idempotente —o mesmo envio chegando
duas vezes dá no mesmo— e não deixa estados pela metade se falhar no meio.

O script (`deploy/planilha.gs`) toma um `LockService` antes de escrever: duas inscrições
simultâneas são dois `doPost`, e sem trava uma limpa enquanto a outra escreve.

> ⚠️ **A aba se chama `Inscrições` e o script a cria sozinho.** `Página1` fica vazia para
> sempre. Ao recarregar, a Google deixa você na aba em que estava — é o motivo número um
> de alguém achar que «não chegou nada».

### Acesso

- Compartilhada **por conta nominal** dentro do workspace da Condor. **Nunca «qualquer
  pessoa com o link»**: é o vetor de vazamento número um e o Google não registra quem
  baixou.
- Colunas: nome, **nascimento**, **CPF**, e-mail, telefone, nome do pet, raça, sexo,
  descrição, data e o link da foto.
- **O CPF vai, e vai de propósito.** Houve uma versão sem ele —o raciocínio era que é o
  dado que transforma um vazamento chato num vazamento grave— e estava errado para esta
  campanha: o briefing pede «CPF cadastrado no Clube Condor», o cliente o tornou
  obrigatório, e o cruzamento com a base de sócios é **manual, feito nesta aba**. Sem a
  coluna, exigia-se um dado que ninguém podia usar.
- ⚠️ **A consequência é esta lista de acesso, não a coluna.** Com CPF dentro, «qualquer
  pessoa com o link» passa de má prática a incidente à espera de acontecer. Conta nominal,
  e só a quem precisa.
- **Três campos saem formatados, e nenhum por estética.** O CPF vai mascarado
  (`048.123.456-78`), o telefone legível (`(41) 98888-7777`) e o nascimento como texto
  `12/05/1984`. Onze dígitos seguidos são um *número* para o Sheets e um número não guarda
  zeros à esquerda; e uma data-só convertida com `new Date()` chega **um dia atrasada**,
  porque é meia-noite em UTC. O Apps Script ainda força as três colunas a formato de texto,
  que é a segunda rede.
- ⚠️ **No telefone, um `55` na frente de 11 dígitos não se recorta**: `55` também é o DDD de
  Santa Maria (RS). Só a partir de 12 dígitos há espaço para país e DDD.
- Tudo isto vive em `src/lib/planilha-colunas.mjs`, que o servidor **e** o script de
  manutenção importam. É `.mjs` por isso: `planilha.ts` importa `astro:env` e um script de
  node puro não pode carregá-lo. Antes eram duas cópias à mão, e a cópia ficou para trás
  justamente quando o CPF entrou na lista.
- O token do Web App **não é a `service_role`**. Ele acaba guardado nas propriedades de um
  script da Google, legível por quem edite a planilha: se vazar, o que se perde é a
  capacidade de reescrever essa aba. A `service_role` perderia o banco inteiro.

---

## 4. A foto

**MinIO da Condor, bucket `caocursantes`, privado.** Em `s3.cndr.me`, com key
`2026/<uuid>.webp`.

Esteve no Supabase Storage até 2026-08-06, quando o cliente mandou tirá-lo de lá. **O custo
dessa mudança foi um arquivo**: `src/lib/storage.ts`. O endpoint da inscrição, `/foto/<id>`,
a planilha e os links que já estavam escritos nela continuaram funcionando sem tocar em
nada, porque **o banco guarda a key e nunca a URL** (§2). É o único momento em que essa
decisão se cobra sozinha.

### Por que um bucket próprio e não o `lp-content`

O `lp-content`, onde já estão o regulamento e os logos, **deixa listar o seu índice sem
credenciais**:

```
curl "https://s3.cndr.me/lp-content?list-type=2"   →  200, a lista inteira
```

Uma key de UUID protege contra **adivinhar**, não contra **listar**. Ali dentro, a lista de
todas as fotos dos pets estaria a um comando de distância, e são dados pessoais que também
vão para uma planilha compartilhada. Além disso há ~34 arquivos de outros projetos da
Condor: uma credencial acotada a `caocursantes` não alcança nenhum deles se vazar.

### O que se perdeu ao sair do Supabase

O bucket do Supabase validava por conta própria: `file_size_limit` de 5 MB e
`allowed_mime_types` restrito a `image/webp`. Era uma rede POR BAIXO do código. O MinIO não
tem equivalente — se um dia o código subir o que não deve, já não há quem o pare. O que
resta é `lib/foto.ts`, que só produz WebP, e a validação dos magic bytes.

E agora são **dois serviços em vez de um**: se o Supabase OU o MinIO estiverem fora do ar,
não há inscrição. A foto sobe antes de inserir a ficha.

O caminho de uma foto, do celular ao bucket:

```
celular  →  navegador reduz (canvas, 1600 px, WebP 0,85)   FormularioInscricao.astro
         →  servidor confere os magic bytes                lib/foto.ts
         →  .rotate() aplica a orientação do EXIF
         →  redimensiona a 1600 px e recodifica WebP q82   ← e aqui o EXIF morre
         →  sobe como 2026/<uuid>.webp                     lib/storage.ts
```

**O `.rotate()` tem de vir antes do resto.** Ele aplica a orientação que o EXIF declara
*antes* de o EXIF ser descartado; sem isso, metade das fotos de celular ficam deitadas.

**A redução no navegador não substitui o reprocessamento no servidor.** Ela existe para que
um iPhone não precise subir 6 MB por uma rede móvel; o servidor reprocessa igual, porque o
cliente pode falhar, ser desligado ou mentir.

**O que entra na planilha é `/foto/<id>`, não uma URL do storage.** Um endereço estável
próprio que consulta a key, assina na hora (300 s) e redireciona. As duas alternativas eram
piores: bucket público deixa qualquer um listar e baixar as fotos de todos os pets, e uma
URL assinada gravada na célula morre em cinco minutos e deixa a planilha cheia de links
mortos.

> `/foto/<id>` **não confere identidade nem deixa registro de quem viu o quê.** A versão
> anterior deste documento previa isso; não se construiu. A fronteira de acesso real é a
> planilha compartilhada por conta nominal — quem tem o link tem a foto. Para 50 fotos de
> pets num concurso é proporcional; se um dia houver dado sensível atrás dessa rota, é aí
> que entra a checagem.

---

## 5. LGPD — o que já está e o que continua errado

| # | Ponto | Estado |
|---|---|---|
| 1 | **Consentimento agrupado** | ⛔ **Pendente, e é o único bloqueio real.** Ver abaixo |
| 2 | EXIF com GPS | ✅ Resolvido: `lib/foto.ts` recodifica e descarta metadados |
| 3 | Bucket privado | ✅ Resolvido: `caocursantes` responde 403 sem assinatura, verificado de fora |
| 4 | Direito de exclusão | ✅ Resolvido de verdade — ver abaixo |
| 5 | Base legal | consentimento — falta documentá-la no regulamento |
| 6 | Retenção | ⚠️ sem definir. Prazo pós-campanha + expurgo, **também da planilha** |
| 7 | Menores | ⚠️ o endpoint exige +18 pela data de nascimento quando ela é informada, mas o campo é opcional. O simples é exigir +18 no regulamento |
| 8 | Transferência internacional | ⚠️ o Supabase é Brasil, a planilha não. Cláusulas + acesso nominal |
| 9 | **CPF fora do banco** | ⚠️ desde 2026-08-06 o CPF **vai à planilha** (§3), porque o cruzamento com o Clube Condor é manual e se faz ali. É a decisão certa para a campanha e **sobe o nível de exposição**: a aba deixou de ser uma lista de pets e é um cadastro. Compartilhamento por conta nomeada, e o ponto 6 —retenção— passa a valer também para o CPF |

### O ponto 4 esteve resolvido pela metade, e vale saber por quê

Durante um tempo, atender um pedido de exclusão era marcar `excluido_em`. Isso tirava a
pessoa da planilha e devolvia a sua vaga — mas nome, nascimento, CPF, e-mail, telefone e a
foto seguiam inteiros no banco.

**Isso não é apagar, é esconder.** Se a pessoa perguntasse «vocês apagaram meus dados?», a
resposta honesta era «não completamente». O mecanismo parecia pronto porque o efeito
visível —sumir da planilha— era o esperado.

Hoje quem atende é um comando:

```bash
node scripts/limpar-inscricoes.mjs --excluir <uuid> --apagar
```

| Some | Fica |
|---|---|
| A foto, do bucket | O `id` |
| Nome, nascimento, CPF, e-mail, telefone | `criado_em` e `excluido_em` |
| Nome, raça, sexo, espécie e descrição do pet | Os `consentimentos` |

**Os consentimentos ficam de propósito.** Não identificam ninguém —são
`{tipo, versao, texto_sha256, em}`— e são a prova de que houve base legal para tratar
aqueles dados enquanto foram tratados. Apagá-los deixaria a Condor sem como demonstrá-lo.

A foto sai **antes** da ficha: ao contrário, se algo falhasse no meio, perder-se-ia a
`foto_key` e com ela a única forma de saber qual arquivo era daquela pessoa. A planilha se
reescreve no mesmo comando, e repetir a operação não faz nada.

> ⚠️ **Marcar `excluido_em` à mão pelo painel não serve** — é exatamente o meio-caminho
> descrito acima. Ficou anotado no `README.md`.

### O ponto 1, em detalhe — e por que tem prazo

O checkbox único diz hoje:

> *«Li e aceito o regulamento do Cãocurso 2026 e autorizo a Rede Condor a usar a imagem do
> meu pet e os dados enviados na divulgação da campanha.»*

Agrupa **participar**, **ceder a imagem do pet** e **ceder os dados**. Sob a LGPD são
finalidades distintas e não podem ser juntadas num consentimento só. E há uma quarta que o
texto nem menciona: **o time de CRM vai usar esses contatos**, o que é uma finalidade
comercial e não «divulgação da campanha».

A estrutura para fazer certo já está pronta: `consentimentos` é um array de
`{tipo, versao, texto_sha256, em}` justamente para registrar cada aceite em separado, com o
hash do texto exato que a pessoa leu. O que falta é a decisão do cliente sobre **quais
finalidades declarar**.

⚠️ **Isto é irreversível assim que a primeira ficha real entrar.** Não se conserta depois:
voltar a pedir consentimento separado a 50 pessoas que já se inscreveram não é viável, e
usar para CRM dados coletados sob um texto que falava de «divulgação da campanha» é
exatamente o que a lei não permite. **É a única coisa nesta lista que precisa estar
resolvida antes de abrir o formulário ao público.**

---

## 6. O CPF e o Clube Condor — em aberto, de propósito

O briefing pede **«CPF cadastrado no Clube Condor»**. Isso não é um campo a mais: é uma
**condição de participação**. Só que o formulário não tem como verificá-la.

| | Verifica? |
|---|---|
| Que os dígitos verificadores fecham | ✅ `cpfValido()` em `api/inscricao.ts` |
| Que o CPF é de quem o digita | ❌ |
| Que está cadastrado no Clube Condor | ❌ — exigiria acesso à base de sócios |

Daí saem três buracos. Um CPF real de quem não é sócio entra igual. **Um CPF alheio
também** — e esse é o pior, porque CPF não é segredo: acaba-se guardando o dado de alguém
que nunca consentiu, e o índice único **tranca o dono de verdade** quando ele tentar se
inscrever. E, sem alguém que cruze a lista, o dado não serve para nada.

**A assimetria é o fundo da questão.** O custo de guardar CPF é fixo e se paga sempre: é o
dado que transforma um vazamento chato num grave. O benefício —saber quem é sócio— só
existe **se alguém da Condor sentar e cruzar a lista antes de 29/08**. Se ninguém for
fazer isso, o CPF é passivo puro.

Por isso a pergunta não é «obrigatório ou opcional», e sim:

> **Quem cruza as inscrições contra a base do Clube Condor, e até que data?**
> Se a resposta for «ninguém», o campo não deveria existir — deduplica-se por e-mail.

**Decisão do cliente em 2026-08-06: o CPF passa a ser obrigatório**, seja a pessoa sócia
do Clube ou não. Isso não resolve a verificação —continua sem existir— mas garante que
**todas** as fichas tenham o dado, de modo que o cruzamento seja possível para o conjunto
e não só para quem teve vontade de preencher.

Vive num interruptor e não numa constante: `cao_campanha.cpf_obrigatorio` (migração 0003).
A campanha já está aberta, e uma decisão de negócio não pode depender de um deploy.

```sql
UPDATE public.cao_campanha SET cpf_obrigatorio = false;  -- volta a ser opcional
```

O formulário e o endpoint leem a MESMA coluna. O `required` do HTML é cortesia —qualquer
um o tira pelas ferramentas de desenvolvimento—; a regra é a do servidor.

⚠️ Mexer no interruptor não é retroativo em nenhuma direção: desligá-lo não apaga os CPFs
já gravados, e ligá-lo depois não preenche as fichas que entraram sem ele.

✅ **O CPF vai à planilha** (§3), que é onde o cruzamento com a base do Clube acontece — é
manual, e é feito por uma pessoa em cima daquela aba. Durante um tempo a coluna não existia
e isso deixava a obrigatoriedade sem sentido: exigia-se um dado que ninguém conseguia usar.

⚠️ **Em troca, a planilha passou a ser um documento sensível.** Deixou de ser uma lista de
nomes de pets e é um cadastro com CPF: o compartilhamento tem de ser por conta nomeada, e
só a quem precisa. «Qualquer pessoa com o link» deixa de ser aceitável.

### O que fica desprotegido enquanto isso

Com o CPF opcional, as duas regras de unicidade deixam uma brecha:

| Índice | Impede |
|---|---|
| `cao_inscricao_cpf_unica` | uma inscrição por CPF — **só se o CPF vier** |
| `cao_inscricao_email_pet_unica` | o mesmo e-mail repetir o **mesmo nome de pet** |

Ou seja: **sem CPF, o mesmo e-mail inscreve quantos pets quiser**, bastando mudar o nome.
Com 50 vagas, uma pessoa pode levar boa parte do concurso. Fechar isso é trocar o segundo
índice por `lower(tutor_email)` sozinho — mas aí uma família deixa de poder inscrever dois
pets, e isso também é decisão de negócio.

---

## 7. O que falta

| | O quê | Tamanho |
|---|---|---|
| 1 | **Separar os consentimentos** (§5.1) — depende de decisão do cliente | 1 dia depois da resposta |
| 3 | **O CPF e o Clube Condor** (§6) — depende de saber quem verifica | decisão |
| 4 | Definir retenção e o expurgo pós-campanha, incluindo a planilha | decisão + 1 h |
| 5 | Deploy no VPS — artefatos prontos, executa a equipe de infra | fora deste repositório |

Tudo o mais desta lista, nas versões anteriores deste documento, está construído.

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
- **Toda a análise do limite de 4,5 MB de payload em funções serverless** — o site roda
  num contêiner de vida longa; esse limite não existe aqui. O teto real é o
  `client_max_body_size` do Nginx, que está em 30 MB.
- **O outbox `cao_evento_integracao` e o worker que o consumiria** — ver §3. Com 50 fichas
  é infraestrutura para um problema que não se tem.
- ~~**O MinIO para as fotos**~~ — **deixou de estar descartado em 2026-08-06**, por ordem
  do cliente, e é o que está implementado hoje. Fica riscado e não apagado justamente
  porque esta lista existe para que ninguém reproponha o já discutido: quem a leia tem de
  ver que esta mudou de lado, e por quê. Ver §1 e §4.
- **O n8n como intermediário até a planilha** — um contêiner a mais para fazer um `POST`
  que o próprio servidor faz em quinze linhas.
- **Migrar o formulário para ilha React com `client:visible`** — era da época em que a
  persistência não existia. O que o formulário precisava era do servidor; o
  `@astrojs/react` segue instalado sem nenhuma ilha.

Está tudo no histórico do git até `98d1b95`.
