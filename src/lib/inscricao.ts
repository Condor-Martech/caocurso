import { inscricao } from '../data/site';
import { supabase } from './supabase';

/**
 * ESTADO DEL PERÍODO DE INSCRIPCIÓN.
 *
 * Un único sitio decide si las inscripciones están por abrir, abiertas, llenas
 * o cerradas. Lo consumen dos superficies que NO pueden discrepar:
 *
 *   · el botón de `Evento30Agosto.astro` — «Em breve» / «Inscreva-se» /
 *     «Esgotado» / «Finalizado»;
 *   · `POST /api/inscricao`, que rechaza fuera de la ventana o sin vacantes.
 *
 * Lo segundo no es redundancia: un botón deshabilitado es cosmética, y
 * cualquiera puede hacer POST con `curl` el día después del cierre. Si sólo se
 * comprobara en el render, «Finalizado» no significaría nada.
 *
 * El sitio es `output: 'server'`, así que esto se evalúa en cada petición y el
 * HTML sale ya con el estado correcto: sin parpadeo, y funcionando sin
 * JavaScript.
 *
 * ── De dónde salen las fechas y el límite ────────────────────────────────────
 *
 * De la tabla `cao_campanha` de Supabase, no del JSON. Es lo que permite mover
 * la fecha de cierre o el número de vacantes **sin desplegar**: se cambia en el
 * panel y la siguiente carga de página ya lo refleja. Para una campaña cuyas
 * fechas se mueven, eso es la diferencia entre un cambio de dos minutos y uno
 * que necesita un build.
 *
 * En el JSON sólo quedan los rótulos, que son copy y viven donde vive el resto
 * del texto.
 */

export type EstadoInscricao = 'em-breve' | 'aberta' | 'esgotada' | 'finalizada';

export interface EstadoCampanha {
  abreEm: Date;
  fechaEm: Date;
  limiteVagas: number;
  inscritos: number;
}

/**
 * Cuánto vale una lectura antes de volver a preguntar.
 *
 * Sin esto, cada visita a la portada son 30-50 ms de ida y vuelta a São Paulo
 * antes de pintar nada. Con 10 segundos, el contador de vacantes puede ir esa
 * pizca desfasado — y no importa, porque quien decide de verdad si hay sitio es
 * `criar_inscricao()` en el servidor de base de datos, no este número.
 */
const TTL_MS = 10_000;

let cache: { valor: EstadoCampanha; expiraEn: number } | null = null;

/**
 * La configuración de la campaña, cacheada.
 *
 * Devuelve `null` sólo si nunca se ha podido leer. Si hubo una lectura buena
 * antes, un fallo posterior devuelve **esa**, y no `null`.
 *
 * Esa distinción es el corazón de esta función. Si un hipo de Supabase hiciera
 * caer el estado a «Em breve», un parpadeo de red cerraría el concurso para
 * todo el mundo durante ese rato. Y no hace falta que lo cierre: aunque este
 * valor esté desfasado y alguien vea «Inscreva-se» de más, la función del banco
 * sigue rechazando la vacante 51.
 *
 * Ojo al `expiraEn` en la rama de error: se reprograma igual. Si no, con
 * Supabase caído cada visita reintentaría, y una caída se convertiría en una
 * tormenta de peticiones contra un servicio que ya está mal.
 */
async function lerCampanha(): Promise<EstadoCampanha | null> {
  const agora = Date.now();
  if (cache && agora < cache.expiraEn) return cache.valor;

  try {
    const { data, error } = await supabase
      .from('cao_estado_inscricao')
      .select('abre_em, fecha_em, limite_vagas, inscritos')
      .single();

    if (error || !data) throw error ?? new Error('cao_estado_inscricao vacía');

    const valor: EstadoCampanha = {
      abreEm: new Date(data.abre_em),
      fechaEm: new Date(data.fecha_em),
      limiteVagas: Number(data.limite_vagas),
      inscritos: Number(data.inscritos),
    };

    if (
      Number.isNaN(valor.abreEm.getTime()) ||
      Number.isNaN(valor.fechaEm.getTime()) ||
      valor.abreEm >= valor.fechaEm ||
      !Number.isFinite(valor.limiteVagas)
    ) {
      throw new Error('datos de campaña incoherentes');
    }

    cache = { valor, expiraEn: agora + TTL_MS };
    return valor;
  } catch (e) {
    console.error('Não foi possível ler cao_campanha:', e);
    if (cache) {
      cache.expiraEn = agora + TTL_MS;
      return cache.valor;
    }
    return null;
  }
}

/**
 * El período tal como se muestra: «de 03/08 a 21/08/2026.»
 *
 * Se deriva de las mismas fechas que mandan sobre el botón, y no de un texto
 * aparte, porque si no acaban discrepando: se mueve el cierre en el panel, el
 * botón obedece y la página sigue anunciando la fecha vieja. Esta campaña ya
 * vivió una versión de ese problema.
 *
 * ⚠️ Formateado en `America/Sao_Paulo` y no en UTC, y no es opcional: el cierre
 * es `2026-08-21T23:59:59-03:00`, que en UTC ya es día 22. Con las funciones
 * UTC el texto diría «a 22/08» — un día de más, y justo en el dato que la gente
 * usa para decidir cuándo inscribirse. Brasil no tiene horario de verano desde
 * 2019, pero el nombre del huso lo resuelve igual si algún día vuelve.
 *
 * Devuelve `null` si no se pudo leer la campaña; quien llama cae al texto del
 * JSON, que es preferible a un hueco en blanco.
 */
const FUSO = 'America/Sao_Paulo';
const DIA_MES = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  day: '2-digit',
  month: '2-digit',
});
const DIA_MES_ANO = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export async function periodoInscricao(): Promise<string | null> {
  const campanha = await lerCampanha();
  if (!campanha) return null;
  return `de ${DIA_MES.format(campanha.abreEm)} a ${DIA_MES_ANO.format(campanha.fechaEm)}.`;
}

/** Vacantes libres. `null` si no se pudo leer la campaña. */
export async function vagasRestantes(): Promise<number | null> {
  const c = await lerCampanha();
  if (!c) return null;
  return Math.max(0, c.limiteVagas - c.inscritos);
}

/**
 * En qué punto del período estamos.
 *
 * `agora` es inyectable para poder probar los cuatro estados y los bordes sin
 * tocar el reloj del sistema.
 *
 * **El orden importa.** La fecha manda sobre el cupo: pasado el cierre el botón
 * dice «Finalizado» aunque además estuviera lleno, porque es lo que describe la
 * situación.
 *
 * **Falla cerrado.** Si no hay ningún dato utilizable devuelve 'em-breve',
 * nunca 'aberta': que alguien vea «Em breve» cuando debería poder inscribirse
 * es molesto y se arregla recargando; que vea «Inscreva-se» y el envío reviente
 * después de rellenar once campos y subir una foto es peor, y encima no deja
 * rastro de por qué.
 */
export async function estadoInscricao(
  agora: Date = new Date()
): Promise<EstadoInscricao> {
  const campanha = await lerCampanha();
  if (!campanha) return 'em-breve';

  if (agora < campanha.abreEm) return 'em-breve';
  if (agora > campanha.fechaEm) return 'finalizada';
  if (campanha.inscritos >= campanha.limiteVagas) return 'esgotada';
  return 'aberta';
}

/** Rótulo del botón en cada estado. Los textos salen del JSON, como el resto. */
export const ROTULO_INSCRICAO: Record<EstadoInscricao, string> = inscricao.rotulos;
