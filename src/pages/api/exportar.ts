import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { EXPORTACAO_TOKEN } from 'astro:env/server';
import { supabase } from '../../lib/supabase';

export const prerender = false;

/**
 * GET /api/exportar — as inscrições, para a planilha do júri e do CRM.
 *
 * Quem chama é um script do Google Apps que vive **dentro da própria planilha**
 * e roda no relógio da Google. A planilha PUXA; nada aqui empurra.
 *
 * ── Por que puxar e não empurrar ────────────────────────────────────────────
 *
 * Empurrar exigiria credenciais da Google no servidor: projeto no Google Cloud,
 * conta de serviço, um JSON de chaves e um processo rodando em algum lugar.
 * Puxando, a única coisa que existe é este endpoint — sem worker, sem
 * contêiner novo, sem nada a mais para o deploy.
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

/** Nomes das colunas, na ordem em que a planilha as escreve. */
const COLUNAS = [
  'Nome do tutor',
  'E-mail',
  'Telefone',
  'Nome do pet',
  'Raça',
  'Sexo',
  'Descrição',
  'Data da inscrição',
  'Foto',
] as const;

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

  /* `excluido_em is null` não é detalhe. Quem exerce o direito de exclusão
     (LGPD art. 18) tem de sumir da planilha, e é isto somado à regra de
     reescrever a aba inteira —nunca acrescentar linhas— que faz com que suma
     de verdade no ciclo seguinte. Com um sync que só acrescenta, essa pessoa
     ficaria na planilha para sempre. */
  const { data, error } = await supabase
    .from('cao_inscricao')
    .select(
      'id, tutor_nome, tutor_email, tutor_telefone, pet_nome, pet_raca, pet_sexo, pet_descricao, criado_em'
    )
    .is('excluido_em', null)
    .order('criado_em', { ascending: true });

  if (error) {
    console.error('exportar:', error.message);
    /* 503 e não 500 de propósito: diz ao script que tente de novo mais tarde.
       E o script, ao receber erro, NÃO deve limpar a aba — ver deploy/planilha.gs. */
    return new Response(JSON.stringify({ erro: 'indisponível' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /* O endereço da foto se monta com a origem desta requisição, não com uma
     constante: assim funciona igual em localhost, em pré-produção e em
     produção, sem uma variável a mais para esquecer de mudar. */
  const base = url.origin;

  const linhas = (data ?? []).map((r) => [
    r.tutor_nome,
    r.tutor_email,
    r.tutor_telefone,
    r.pet_nome,
    r.pet_raca ?? '',
    r.pet_sexo ?? '',
    r.pet_descricao ?? '',
    r.criado_em,
    `${base}/foto/${r.id}`,
  ]);

  return new Response(
    JSON.stringify({
      atualizadoEm: new Date().toISOString(),
      total: linhas.length,
      colunas: COLUNAS,
      linhas,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, no-store',
      },
    }
  );
};

/** Qualquer outro método. */
export const ALL: APIRoute = () => naoEncontrado();
