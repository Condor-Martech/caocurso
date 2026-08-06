import type { APIRoute } from 'astro';
import { supabase } from '../lib/supabase';
import { storageResponde } from '../lib/storage';

export const prerender = false;

/**
 * GET /healthz — ¿puede este contenedor aceptar una inscripción?
 *
 * Es el objetivo del HEALTHCHECK del Dockerfile, y la portada NO sirve para eso.
 *
 * ── Por qué no basta con pedir «/» ──────────────────────────────────────────
 *
 * `astro:env` valida las variables cuando el módulo que las usa se importa por
 * primera vez, no al arrancar. Como la portada no toca Supabase, un contenedor
 * con el `.env` a medias —una errata al pegar la service_role, la URL sin
 * https://— **arranca, sirve la página y sale `healthy`**. El fallo sólo
 * aparece en el primer POST real, con un 500, y para entonces ya hay alguien
 * que rellenó once campos y subió una foto.
 *
 * Al importar el cliente aquí se evalúa el esquema de entorno, y la consulta
 * comprueba además que las credenciales son válidas contra el proyecto de
 * verdad: no que existan, sino que funcionan.
 *
 * `head: true` no trae ninguna fila; sólo la cuenta. Es una petición mínima que
 * el healthcheck puede repetir cada 30 segundos sin consumir nada.
 *
 * ── Y desde 2026-08-06, DOS servicios ───────────────────────────────────────
 *
 * Las fotos se fueron al MinIO. Antes viajaban por el mismo cliente de Supabase
 * que esta ruta ya ejercitaba; ahora son cinco variables más y una credencial
 * contra otro servidor. Comprobar sólo Supabase dejaba pasar exactamente el
 * fallo que esta ruta existe para atrapar: un contenedor con la clave del MinIO
 * mal pegada salía `healthy` y reventaba en la primera inscripción.
 *
 * Se comprueban los dos, y el mensaje dice CUÁL falló — un 503 que no distingue
 * obliga a adivinar justo cuando hay prisa.
 */
export const GET: APIRoute = async () => {
  try {
    const { error } = await supabase
      .from('cao_inscricao')
      .select('id', { head: true, count: 'exact' });

    if (error) {
      console.error('healthz: Supabase respondeu com erro:', error.message);
      return new Response(`erro no Supabase: ${error.message}`, { status: 503 });
    }

    try {
      await storageResponde();
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : String(e);
      console.error('healthz: MinIO respondeu com erro:', detalhe);
      return new Response(`erro no MinIO: ${detalhe}`, { status: 503 });
    }

    return new Response('ok', {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    /* Aquí cae el caso importante: si falta una variable de entorno, el propio
       import de `supabase` lanza EnvInvalidVariables. */
    console.error('healthz:', e);
    return new Response('indisponível', { status: 503 });
  }
};
