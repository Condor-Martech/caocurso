import { randomUUID } from 'node:crypto';
import {
  MINIO_ENDPOINT,
  MINIO_REGIAO,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET_FOTOS,
} from 'astro:env/server';
import { criarClienteS3 } from './s3.mjs';

/**
 * O ARMAZENAMENTO DAS FOTOS — A ÚNICA PEÇA QUE SABE ONDE ELAS VIVEM.
 *
 * Todo o resto do sistema fala com estas três funções e não faz ideia do que há
 * atrás. Isto não era purismo: em 2026-08-06 a Condor mandou tirar as fotos do
 * Supabase e pô-las no MinIO, e o custo dessa mudança foi **este arquivo e mais
 * nenhum**. O endpoint da inscrição, `/foto/<id>`, a planilha e os links que já
 * estavam escritos nela continuaram funcionando sem tocar em nada.
 *
 * O que tornou isso possível está do outro lado: **o banco guarda a `key`, nunca
 * a URL** (migração 0001). Com a URL gravada, a mesma ordem teria obrigado a
 * reescrever a tabela inteira e a refazer a planilha.
 *
 * ── Onde vivem hoje ─────────────────────────────────────────────────────────
 *
 * MinIO, bucket **`caocursantes`**, key `2026/<uuid>.webp`.
 *
 * É um bucket **próprio e privado**, e não o `lp-content` onde estão o
 * regulamento e os logos. Dois motivos, e nenhum é estético:
 *
 *   · `lp-content` **deixa listar o seu índice sem credenciais**. Uma key de
 *     UUID protege contra adivinhar, não contra listar — quem pedisse o índice
 *     teria a lista de todas as fotos e só faltaria baixá-las.
 *   · Ali dentro há ~34 arquivos de outros projetos da Condor. A credencial
 *     desta LP mora no `.env` de um contêiner; acotada a um bucket só, um
 *     vazamento não alcança nada do resto.
 *
 * ── O bucket é privado, e a foto se vê por `/foto/<id>` ─────────────────────
 *
 * A URL assinada expira em minutos; a de `/foto/<id>` não expira nunca. É o que
 * permite pôr um endereço estável numa planilha do júri sem que apodreça.
 */

const cliente = criarClienteS3({
  endpoint: MINIO_ENDPOINT,
  regiao: MINIO_REGIAO,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

/** Quanto vale uma URL assinada. Só precisa sobreviver ao redirecionamento. */
const VALIDADE_SEGUNDOS = 300;

export class FalhaNoStorage extends Error {}

/**
 * ¿Responde el storage con estas credenciales?
 *
 * Existe para `/healthz`, y no es un adorno. Antes de la migración, la foto
 * viajaba por el mismo cliente de Supabase que el healthcheck ya ejercitaba;
 * ahora son cinco variables y una credencial contra OTRO servidor que nadie
 * comprobaba. Un contenedor con `MINIO_SECRET_KEY` mal pegada arrancaba,
 * respondía `healthy` y sólo fallaba en la primera inscripción real —justo el
 * escenario que `/healthz` existe para evitar.
 *
 * Pide una sola key: es la petición autenticada más barata que hay, y usa el
 * `s3:ListBucket` que la credencial acotada ya tiene.
 */
export async function storageResponde(): Promise<void> {
  await cliente.listar(MINIO_BUCKET_FOTOS, '2026/', 1);
}

/** `caocursantes/2026/<uuid>.webp` — o caminho completo dentro do endpoint. */
const caminhoDe = (key: string) => `${MINIO_BUCKET_FOTOS}/${key}`;

/**
 * Sobe a foto já processada e devolve a sua key.
 *
 * A key é um UUID, e isso importa por dois motivos. **Não é adivinhável**, de
 * modo que ninguém enumera as fotos percorrendo `pet_001`, `pet_002`. E **não
 * leva nenhum dado pessoal**: o nome do arquivo viaja dentro da URL, então pôr
 * ali o nome do tutor seria publicá-lo em cada requisição.
 *
 * ⚠️ O S3 não tem `upsert: false`: um PUT sobrescreve sem avisar. Com UUID v4 a
 * colisão é irreal —são 2¹²² possibilidades— mas convém saber que a rede de
 * proteção que o Supabase dava aqui já não existe.
 */
export async function guardarFoto(bytes: Buffer, contentType: string): Promise<string> {
  const key = `2026/${randomUUID()}.webp`;
  try {
    await cliente.subir(caminhoDe(key), bytes, contentType);
  } catch (e) {
    throw new FalhaNoStorage(e instanceof Error ? e.message : String(e));
  }
  return key;
}

/**
 * URL temporária para ver a foto.
 *
 * **Não consulta o servidor**: assinar é aritmética. Se a key não existir, a
 * URL é válida e devolve 404 ao ser aberta — que para `/foto/<id>` dá no mesmo,
 * porque ali um 404 é exatamente a resposta certa.
 *
 * Mantém a assinatura `Promise<string | null>` de quando isto era Supabase, que
 * sim consultava. Trocá-la obrigaria a mexer no chamador sem ganhar nada.
 */
export async function urlAssinada(key: string): Promise<string | null> {
  try {
    return cliente.urlAssinada(caminhoDe(key), VALIDADE_SEGUNDOS);
  } catch {
    return null;
  }
}

/**
 * Apaga uma foto. Usado quando a ficha não chega a ser gravada: sobe-se a foto
 * primeiro e só depois se insere a linha, então uma falha no banco deixaria um
 * arquivo órfão pagando storage para sempre.
 *
 * Não lança. Se a limpeza falhar, o problema é um arquivo a mais — e quem chama
 * está justamente no meio de tratar outro erro, mais importante do que este.
 */
export async function removerFoto(key: string): Promise<void> {
  try {
    await cliente.apagar(caminhoDe(key));
  } catch {
    // Silêncio deliberado: ver acima.
  }
}
