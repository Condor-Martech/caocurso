-- ============================================================================
-- Cãocurso 2026 — configuração da campanha e limite de vagas
--
-- Traz para o banco o que antes vivia em src/data/site.json: as datas do
-- período e, novo, o número de vagas. O motivo é operacional, não estético —
-- a página é renderizada no servidor a cada requisição, então mudar aqui o
-- limite ou a data de fechamento aparece no botão na carga seguinte, **sem
-- build e sem deploy**. Marketing mexe pelo painel.
--
-- Aplicar no editor SQL do projeto. É idempotente.
-- ============================================================================

-- --------------------------------------------------------- a configuração --

CREATE TABLE IF NOT EXISTS public.cao_campanha (
  id            text PRIMARY KEY,

  -- ⚠️ Sempre com fuso. '2026-08-21 23:59:59' sem offset é lido como UTC e o
  -- período fecharia às 20:59 do dia 21 no Brasil — três horas antes, e ninguém
  -- percebe até chegarem as reclamações.
  abre_em       timestamptz NOT NULL,
  fecha_em      timestamptz NOT NULL,

  -- O número de participantes. Mexer aqui é a operação normal: não precisa de
  -- deploy nem de mexer no repositório.
  limite_vagas  integer NOT NULL CHECK (limite_vagas > 0),

  atualizado_em timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT cao_campanha_janela_coerente CHECK (abre_em < fecha_em)
);

-- Uma linha e só uma. Sem isto, um INSERT distraído cria uma segunda campanha
-- e passa a ser sorte qual delas a página lê.
CREATE UNIQUE INDEX IF NOT EXISTS cao_campanha_linha_unica
  ON public.cao_campanha ((true));

INSERT INTO public.cao_campanha (id, abre_em, fecha_em, limite_vagas)
VALUES (
  'caocurso-2026',
  '2026-08-03 00:00:00-03',
  '2026-08-21 23:59:59-03',
  50
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.cao_campanha ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cao_campanha FROM anon, authenticated;

-- ------------------------------------------------- o que a página consulta --
-- Tudo o que `estadoInscricao()` precisa numa consulta só: as duas datas, o
-- limite e quantas vagas já foram tomadas. Uma viagem por render (com cache de
-- alguns segundos), não quatro.
--
-- `excluido_em IS NULL` não é detalhe: quem exerce o direito de exclusão
-- (LGPD art. 18) devolve a sua vaga ao concurso.

CREATE OR REPLACE VIEW public.cao_estado_inscricao AS
SELECT
  c.id,
  c.abre_em,
  c.fecha_em,
  c.limite_vagas,
  (SELECT count(*) FROM public.cao_inscricao i WHERE i.excluido_em IS NULL) AS inscritos
FROM public.cao_campanha c;

REVOKE ALL ON public.cao_estado_inscricao FROM anon, authenticated;

-- ----------------------------------------------- a inscrição, com o limite --
--
-- ⚠️ POR QUE UMA FUNÇÃO E NÃO UM `SELECT count(*)` NO ENDPOINT.
--
-- Contar e depois inserir é uma corrida. Com uma vaga sobrando, dois envios
-- simultâneos leem 49 os dois, os dois inserem, e a campanha fecha com 51.
-- É o mesmo raciocínio já aplicado à duplicidade: quem decide é o banco, não
-- uma leitura anterior.
--
-- O bloqueio de aviso serializa a contagem com a inserção. Ele é da transação:
-- é solto no commit ou no rollback, sem precisar de limpeza. Com 50 vagas a
-- contenção é nula.
--
-- A função também confere a janela. Não é redundância com o endpoint: um botão
-- que não aparece não impede um POST de `curl` no dia seguinte ao fechamento,
-- e aqui é o único lugar por onde a inscrição pode entrar.

CREATE OR REPLACE FUNCTION public.criar_inscricao(dados jsonb)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_campanha public.cao_campanha%ROWTYPE;
  v_agora    timestamptz := now();
  v_total    integer;
  v_id       uuid;
BEGIN
  SELECT * INTO v_campanha FROM public.cao_campanha LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'campanha não configurada' USING ERRCODE = 'P0100';
  END IF;

  IF v_agora < v_campanha.abre_em THEN
    RAISE EXCEPTION 'inscrições ainda não abertas' USING ERRCODE = 'P0101';
  END IF;

  IF v_agora > v_campanha.fecha_em THEN
    RAISE EXCEPTION 'período encerrado' USING ERRCODE = 'P0102';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('cao_inscricao_vagas'));

  SELECT count(*) INTO v_total
    FROM public.cao_inscricao
   WHERE excluido_em IS NULL;

  IF v_total >= v_campanha.limite_vagas THEN
    RAISE EXCEPTION 'vagas esgotadas' USING ERRCODE = 'P0103';
  END IF;

  INSERT INTO public.cao_inscricao (
    tutor_nome, tutor_nascimento, tutor_cpf, tutor_email, tutor_telefone,
    pet_nome, pet_raca, pet_sexo, pet_especie, pet_descricao,
    foto_key, consentimentos
  ) VALUES (
    dados->>'tutor_nome',
    (dados->>'tutor_nascimento')::date,
    dados->>'tutor_cpf',
    dados->>'tutor_email',
    dados->>'tutor_telefone',
    dados->>'pet_nome',
    dados->>'pet_raca',
    dados->>'pet_sexo',
    dados->>'pet_especie',
    dados->>'pet_descricao',
    dados->>'foto_key',
    COALESCE(dados->'consentimentos', '[]'::jsonb)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.criar_inscricao(jsonb) FROM anon, authenticated;
