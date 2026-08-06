import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { EXPORTACAO_TOKEN } from 'astro:env/server';
import { montarPlanilha } from '../../lib/planilha';

export const prerender = false;

/**
 * GET /api/exportar — as inscrições, para a planilha do júri e do CRM.
 *
 * ── Este NÃO é o caminho normal ─────────────────────────────────────────────
 *
 * O normal é o contrário: depois de cada inscrição o servidor **empurra** a
 * lista inteira para o Web App da planilha (`src/lib/planilha.ts`). Assim a
 * linha aparece na hora e nada precisa alcançar este servidor de fora.
 *
 * Isto aqui é o conserto: quando a planilha ficar para trás —porque a Google
 * esteve fora do ar num envio, ou porque alguém apagou a aba sem querer— é o
 * que permite reconstruí-la sem esperar a próxima inscrição. Exige que o
 * domínio esteja no ar, e por isso não serve para os primeiros testes.
 *
 * ── O token ─────────────────────────────────────────────────────────────────
 *
 * `EXPORTACAO_TOKEN`, e **nunca a service_role**. O token acaba guardado nas
 * propriedades de um script da Google, e quem puder editar a planilha consegue
 * lê-lo. Se este vazar, o que se expõe é esta lista; se fosse a service_role,
 * seria o banco inteiro — CPFs incluídos.
 *
 * Sem token configurado o endpoint responde 404, não 401: um 401 confirma que a
 * rota existe e convida a tentar. Enquanto ninguém usa a planilha, o melhor é
 * que a rota simplesmente não pareça existir.
 *
 * ── O CPF não vai ───────────────────────────────────────────────────────────
 *
 * Para premiar e para contatar não acrescenta nada, e é o dado que transforma
 * um vazamento chato num vazamento grave. Fica no Supabase, onde só a
 * service_role o enxerga. Se o CRM precisar dele como chave de cruzamento, é
 * uma linha — mas que seja decisão consciente.
 */

/**
 * Compara sem vazar tempo. Um `===` devolve na primeira letra diferente, e essa
 * diferença de microssegundos é suficiente para adivinhar o token caractere a
 * caractere. `timingSafeEqual` exige buffers do mesmo tamanho, então o tamanho
 * se compara antes — isso vaza o comprimento, o que não ajuda um atacante.
 */
function tokenConfere(recebido: string, esperado: string): boolean {
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const naoEncontrado = () => new Response('Não encontrado.', { status: 404 });

export const GET: APIRoute = async ({ request, url }) => {
  if (!EXPORTACAO_TOKEN) return naoEncontrado();

  const cabecalho = request.headers.get('authorization') ?? '';
  const recebido = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : '';
  if (!recebido || !tokenConfere(recebido, EXPORTACAO_TOKEN)) {
    return naoEncontrado();
  }

  /* Mesma montagem que o envio automático usa: uma consulta só, num lugar só.
     Se as colunas mudarem, mudam nos dois caminhos ao mesmo tempo. */
  let planilha;
  try {
    planilha = await montarPlanilha(url.origin);
  } catch (e) {
    console.error('exportar:', e instanceof Error ? e.message : e);
    /* 503 e não 500 de propósito: diz ao script que tente de novo mais tarde.
       E o script, ao receber erro, NÃO deve limpar a aba — ver deploy/planilha.gs. */
    return new Response(JSON.stringify({ erro: 'indisponível' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(planilha), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
};

/** Qualquer outro método. */
export const ALL: APIRoute = () => naoEncontrado();
