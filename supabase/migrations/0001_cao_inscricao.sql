-- ============================================================================
-- Cãocurso 2026 — inscrições
--
-- Uma tabela e um bucket. Não há votação, nem feed público, nem ranking: o
-- júri escolhe presencialmente, então não são necessários estados de
-- aprovação, moderação nem antifraude. Ver docs/PLATAFORMA.md.
--
-- Aplicar no editor SQL do projeto (Dashboard → SQL Editor → New query).
-- É idempotente: pode ser executada duas vezes sem estragar nada.
-- ============================================================================

-- ----------------------------------------------------------------- a ficha --

CREATE TABLE IF NOT EXISTS public.cao_inscricao (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- tutor
  tutor_nome        text NOT NULL CHECK (length(trim(tutor_nome)) >= 3),
  tutor_nascimento  date,
  tutor_cpf         text CHECK (tutor_cpf IS NULL OR tutor_cpf ~ '^[0-9]{11}$'),
  tutor_email       text NOT NULL,
  tutor_telefone    text NOT NULL,

  -- pet
  pet_nome          text NOT NULL,
  pet_raca          text,
  pet_sexo          text,
  pet_especie       text,
  pet_descricao     text,

  -- A KEY no storage, NUNCA a URL. Com a URL gravada, trocar de provedor
  -- obrigaria a reescrever a tabela inteira; com a key, a URL é construída na
  -- leitura e trocar de provedor é mudar uma variável de ambiente.
  foto_key          text NOT NULL,

  -- Array, não booleano: sob a LGPD, participar / ceder a imagem do pet /
  -- ceder os dados para divulgação são finalidades distintas, e é preciso
  -- poder demonstrar QUAL texto exato cada pessoa aceitou.
  --   [{ "tipo": "regulamento", "versao": "2026-1",
  --      "texto_sha256": "…", "em": "2026-08-05T18:00:00Z" }]
  consentimentos    jsonb NOT NULL DEFAULT '[]'::jsonb,

  criado_em         timestamptz NOT NULL DEFAULT now(),

  -- Exclusão lógica, não DELETE. Quando alguém exerce o direito de exclusão
  -- (LGPD art. 18) é preciso poder demonstrar QUANDO aquilo foi atendido, e um
  -- DELETE não deixa rastro de ter cumprido.
  excluido_em       timestamptz
);

-- ------------------------------------------------------------- duplicidade --
-- Índices parciais, não checagens em código: dois envios simultâneos se
-- atropelam e o segundo tem de falhar no banco, não numa leitura prévia.

-- Uma inscrição por CPF — só para quem o preencheu, porque o campo é opcional.
CREATE UNIQUE INDEX IF NOT EXISTS cao_inscricao_cpf_unica
  ON public.cao_inscricao (tutor_cpf)
  WHERE excluido_em IS NULL AND tutor_cpf IS NOT NULL;

-- Rede de segurança para quem não informa CPF: mantém a regra que o endpoint
-- já aplicava com o arquivo em disco — reinscrever o mesmo pet com o mesmo
-- e-mail não cria outra ficha.
CREATE UNIQUE INDEX IF NOT EXISTS cao_inscricao_email_pet_unica
  ON public.cao_inscricao (lower(tutor_email), lower(pet_nome))
  WHERE excluido_em IS NULL;

CREATE INDEX IF NOT EXISTS cao_inscricao_criado_em
  ON public.cao_inscricao (criado_em DESC)
  WHERE excluido_em IS NULL;

-- ------------------------------------------------------------------- acesso --
-- RLS ligado e SEM NENHUMA POLÍTICA: a tabela só é acessível pela service_role,
-- que ignora RLS e vive apenas no servidor.
--
-- Isto não é opcional. A chave anônima é pública por desenho — vai no HTML de
-- qualquer cliente. Sem RLS, qualquer pessoa poderia ler todos os CPFs,
-- e-mails e telefones com uma chamada.

ALTER TABLE public.cao_inscricao ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.cao_inscricao FROM anon, authenticated;

-- --------------------------------------------------------- bucket das fotos --
-- Privado. A foto não tem por que ser acessível pela internet: só a vê quem
-- olha o cadastro, e sempre através de /foto/<id>, que assina na hora.
--
-- O limite de 5 MB é folgado de propósito: o que chega aqui já passou pelo
-- reprocessamento do servidor e pesa ~250 KB. É um teto contra abuso, não uma
-- restrição de uso.

-- ⚠️ ESTE BUCKET FICOU MORTO EM 2026-08-06.
--
-- Por ordem do cliente, as fotos passaram para o MinIO da Condor, bucket
-- privado `caocursantes` em `s3.cndr.me`. Ver `src/lib/storage.ts` e
-- `docs/PLATAFORMA.md` §4.
--
-- O bloco fica aqui e NÃO se apaga: uma migração já aplicada se reescreve com
-- muito cuidado, e este trecho é o histórico de por onde as fotos passaram.
-- Rodá-lo de novo apenas recria um bucket vazio que ninguém consulta.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-caocurso',
  'fotos-caocurso',
  false,
  5242880,
  ARRAY['image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public             = false,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
