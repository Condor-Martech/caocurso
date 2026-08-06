import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from 'astro:env/server';

/**
 * CLIENTE DO SUPABASE — SÓ SERVIDOR.
 *
 * Usa a `service_role`, que **ignora o RLS**. É deliberado: a tabela
 * `cao_inscricao` tem RLS ligado e nenhuma política (ver a migração 0001), de
 * modo que só esta chave a enxerga. Não existe caminho desde o navegador.
 *
 * Por isso este módulo nunca pode ser importado de um componente com `client:`
 * nem de um script do navegador. O `astro:env` já o impede —as variáveis são
 * `context: 'server'`— mas convém saber o porquê: essa chave lê todos os CPFs,
 * e-mails e telefones da campanha.
 *
 * `persistSession: false` porque aqui não há usuário nem sessão que guardar: é
 * um processo de servidor falando com o banco, não alguém logado.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/** Código do Postgres para violação de índice único. */
export const PG_DUPLICADO = '23505';

/**
 * Os códigos que `criar_inscricao()` levanta (migração 0002).
 *
 * São SQLSTATE próprios em vez de comparar o texto da mensagem: a mensagem é
 * humana e alguém a vai reescrever um dia; o código é contrato.
 */
export const PG_CAMPANHA_AUSENTE = 'P0100';
export const PG_AINDA_NAO_ABRIU = 'P0101';
export const PG_PERIODO_ENCERRADO = 'P0102';
export const PG_VAGAS_ESGOTADAS = 'P0103';
