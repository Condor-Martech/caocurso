import { randomUUID } from 'node:crypto';
import { SUPABASE_BUCKET_FOTOS } from 'astro:env/server';
import { supabase } from './supabase';

/**
 * O ARMAZENAMENTO DAS FOTOS — A ÚNICA PEÇA QUE SABE ONDE ELAS VIVEM.
 *
 * Todo o resto do sistema fala com estas três funções e não faz ideia de que
 * atrás há Supabase Storage. Isso não é purismo: hoje são ~50 inscrições e
 * 12 MB de fotos, que cabem folgados no plano gratuito, mas se numa próxima
 * edição forem 5.000, mudar para o MinIO de `s3.cndr.me` é reescrever ESTE
 * arquivo e nenhum outro.
 *
 * O que torna isso possível está do outro lado: **o banco guarda a `key`, nunca
 * a URL** (ver a migração 0001). Com a URL gravada, trocar de provedor
 * obrigaria a reescrever a tabela inteira.
 *
 * O bucket é **privado**. A foto só é vista através de `/foto/<id>`, que assina
 * na hora do clique. Isso é o que permite pôr um endereço estável numa planilha
 * sem que ele apodreça: as URLs assinadas expiram em minutos, a de `/foto/<id>`
 * não expira nunca.
 */

/** Quanto vale uma URL assinada. Só precisa sobreviver ao redirecionamento. */
const VALIDADE_SEGUNDOS = 300;

export class FalhaNoStorage extends Error {}

/**
 * Sobe a foto já processada e devolve a sua key.
 *
 * A key é um UUID, e isso importa por dois motivos. **Não é adivinhável**, de
 * modo que ninguém enumera as fotos da campanha percorrendo `pet_001`,
 * `pet_002`. E **não leva nenhum dado pessoal**: o nome do arquivo viaja dentro
 * da URL, então pôr ali o nome do tutor seria publicá-lo em cada requisição.
 *
 * `upsert: false` porque um UUID novo nunca deveria colidir: se colidir, algo
 * está muito errado e é melhor falhar do que sobrescrever a foto de outra
 * pessoa.
 */
export async function guardarFoto(bytes: Buffer, contentType: string): Promise<string> {
  const key = `2026/${randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET_FOTOS)
    .upload(key, bytes, { contentType, upsert: false });

  if (error) {
    throw new FalhaNoStorage(error.message);
  }
  return key;
}

/**
 * URL temporária para ver a foto. `null` se a key não existir.
 *
 * Devolve `null` em vez de lançar porque quem chama —`/foto/<id>`— trata isso
 * como um 404, que é exatamente o que é.
 */
export async function urlAssinada(key: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET_FOTOS)
    .createSignedUrl(key, VALIDADE_SEGUNDOS);

  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * Apaga uma foto. Usado quando a ficha não chega a ser gravada: sobe-se a foto
 * primeiro e só depois se insere a linha, então uma falha no banco deixaria um
 * arquivo órfão pagando storage para sempre.
 *
 * Não lança. Se a limpeza falhar, o problema é um arquivo a mais — e quem
 * chama está justamente no meio de tratar outro erro, mais importante do que
 * este.
 */
export async function removerFoto(key: string): Promise<void> {
  try {
    await supabase.storage.from(SUPABASE_BUCKET_FOTOS).remove([key]);
  } catch {
    // Silêncio deliberado: ver acima.
  }
}
