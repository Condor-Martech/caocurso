-- ---------------------------------------------------------------------------
-- O CPF do Clube Condor — obrigatório, mas por interruptor.
--
-- O briefing pede «CPF cadastrado no Clube Condor», que não é um campo a mais:
-- é uma CONDIÇÃO DE PARTICIPAÇÃO. Decisão do cliente em 2026-08-06: **o CPF
-- passa a ser obrigatório**, seja a pessoa sócia do Clube ou não.
--
-- ⚠️ Obrigatório NÃO é verificado. Não existe forma de verificar daqui: não há
-- acesso à base de sócios, e o que se valida é apenas que os dígitos
-- verificadores fecham. O que se ganha exigindo é que NENHUMA ficha entre sem
-- CPF, de modo que o cruzamento contra a base da Condor fique possível para
-- todas em vez de só para as de quem teve vontade de preencher. A verificação
-- em si continua sendo trabalho humano, e antes de 29/08 — nunca na porta do
-- evento, com a pessoa e o cachorro já lá.
--
-- Vive aqui, e não numa constante do código, porque a campanha já está aberta e
-- uma decisão de negócio não pode depender de um deploy. Mesma mecânica das
-- datas e do limite de vagas: um UPDATE, e vale em até 10 segundos — que é o
-- cache de `lib/inscricao.ts`.
--
--   desligar: UPDATE public.cao_campanha SET cpf_obrigatorio = false;
--   ligar:    UPDATE public.cao_campanha SET cpf_obrigatorio = true;
--
-- ⚠️ Mexer no interruptor não é retroativo. Desligá-lo não apaga os CPFs já
-- gravados, e ligá-lo depois de a campanha andar não preenche as fichas que
-- entraram sem ele.
--
-- ⚠️ LGPD: exigir CPF precisa de justificativa, e aqui existe e é limpa — é a
-- condição de participação que o briefing define, não um dado recolhido «por
-- via das dúvidas».
--
-- ⚠️ O CPF **VAI à planilha**, e é a terceira coluna. Este comentário dizia o
-- contrário —«continua FORA da planilha, quem precisar cruzá-lo faz isso no
-- painel do Supabase»— e ficou desatualizado no mesmo dia: sem a coluna, o
-- cruzamento com a base do Clube Condor, que é MANUAL e se faz naquela aba,
-- não tinha como acontecer, e este interruptor exigia um dado que ninguém
-- podia usar. Ver docs/PLATAFORMA.md §3 e src/lib/planilha-colunas.mjs.
--
-- A contrapartida é de operação: a planilha virou um cadastro com CPF, e o
-- compartilhamento tem de ser por conta nomeada.
-- ---------------------------------------------------------------------------

ALTER TABLE public.cao_campanha
  ADD COLUMN IF NOT EXISTS cpf_obrigatorio boolean NOT NULL DEFAULT true;

-- `ADD COLUMN ... DEFAULT` só alcança as linhas que já existem no momento em
-- que roda. Este UPDATE garante o valor mesmo se a coluna tiver sido criada
-- antes com outro padrão — rodar a migração duas vezes deixa o mesmo estado.
UPDATE public.cao_campanha SET cpf_obrigatorio = true WHERE cpf_obrigatorio IS DISTINCT FROM true;

-- A vista é o único caminho pelo qual a LP lê a campanha. Recriada para expor a
-- coluna nova.
--
-- ⚠️ `cpf_obrigatorio` vai NO FIM, e não ao lado de `limite_vagas`, que é onde
-- ficaria bem. Não é gosto: o `CREATE OR REPLACE VIEW` só aceita ACRESCENTAR
-- colunas ao final. Pôr uma no meio faz o Postgres entender que se quer
-- renomear a que estava naquela posição, e ele recusa:
--
--   ERROR: cannot change name of view column "inscritos" to "cpf_obrigatorio"
--
-- A alternativa seria `DROP VIEW` + `CREATE VIEW`, que deixa um instante sem
-- vista — e qualquer visita nesse instante cai no fallback e vê «Em breve».
-- Não vale a pena por uma questão de ordem: quem lê é `select('*')` e pega as
-- colunas pelo nome.
CREATE OR REPLACE VIEW public.cao_estado_inscricao AS
SELECT
  c.id,
  c.abre_em,
  c.fecha_em,
  c.limite_vagas,
  (SELECT count(*) FROM public.cao_inscricao i WHERE i.excluido_em IS NULL) AS inscritos,
  c.cpf_obrigatorio
FROM public.cao_campanha c;

REVOKE ALL ON public.cao_estado_inscricao FROM anon, authenticated;
