import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { urlAssinada } from '../../lib/storage';

export const prerender = false;

/**
 * GET /foto/<id> — a foto do pet de uma inscrição.
 *
 * Endereço **estável**: busca a key no banco, pede ao storage uma URL assinada
 * e redireciona. O bucket continua privado; ninguém fala com o storage direto.
 *
 * ── Por que esta indireção e não a URL do storage ───────────────────────────
 *
 * As URLs assinadas expiram em minutos. Se a planilha do júri guardasse uma
 * delas, no dia seguinte seria uma coluna de links mortos — e reescrevê-la a
 * cada poucos minutos para renová-las não é um plano. Este endereço não expira
 * nunca, e a assinatura acontece no clique.
 *
 * De quebra: trocar o storage não obriga a mexer na planilha, porque o que
 * está escrito ali é este endereço e não o do provedor.
 *
 * ── Sobre o controle de acesso ──────────────────────────────────────────────
 *
 * Não há autenticação aqui, e é uma decisão, não um esquecimento. O `id` é um
 * UUID: não se enumera nem se adivinha, e só circula dentro da planilha, que é
 * compartilhada por conta nominal com o júri e o time de CRM. **A planilha é a
 * fronteira de acesso.** Montar login na LP para 50 fotos de cachorro seria
 * desproporcional.
 *
 * Se um dia isso mudar, o lugar a mexer é este arquivo e mais nenhum.
 */

/** Formato de UUID v4 canônico. Evita ir ao banco com lixo. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const naoEncontrada = () => new Response('Foto não encontrada.', { status: 404 });

export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? '';
  if (!UUID.test(id)) return naoEncontrada();

  /* `excluido_em is null` não é um detalhe: quando alguém exerce o direito de
     exclusão (LGPD art. 18), a foto tem de deixar de ser acessível pelo link
     que já estava na planilha. Sem este filtro, a ficha some da planilha no
     próximo sync mas a foto continua sendo servida. */
  const { data, error } = await supabase
    .from('cao_inscricao')
    .select('foto_key')
    .eq('id', id)
    .is('excluido_em', null)
    .maybeSingle();

  if (error || !data?.foto_key) return naoEncontrada();

  const url = await urlAssinada(data.foto_key);
  if (!url) return naoEncontrada();

  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      /* A URL de destino é assinada e de vida curta: nem os intermediários nem
         o navegador devem guardar este redirecionamento, ou serviriam um link
         já expirado. */
      'Cache-Control': 'private, no-store',
    },
  });
};
