import { inscricao } from '../data/site';

/**
 * ESTADO DEL PERÍODO DE INSCRIPCIÓN.
 *
 * Un único sitio decide si las inscripciones están por abrir, abiertas o
 * cerradas. Lo consumen dos superficies que NO pueden discrepar:
 *
 *   · el botón de `Evento30Agosto.astro` — «Em breve» / «Inscreva-se» /
 *     «Finalizado»;
 *   · `POST /api/inscricao` — que rechaza fuera de la ventana.
 *
 * Lo segundo no es redundancia: un botón deshabilitado es cosmética, y
 * cualquiera puede hacer POST con `curl` el día después del cierre. Si sólo se
 * comprobara en el render, «Finalizado» no significaría nada.
 *
 * El sitio es `output: 'server'`, así que esto se evalúa en cada petición y el
 * HTML sale ya con el estado correcto: sin parpadeo, y funcionando sin
 * JavaScript.
 *
 * ── De dónde salen las fechas ────────────────────────────────────────────────
 *
 * Hoy, de `src/data/site.json`. Su destino es la tabla `cao_campanha` de Supabase
 * (ver `docs/PLATAFORMA.md`), para poder mover la fecha sin desplegar. Cuando
 * llegue ese momento sólo cambia `janelaInscricao()`; ni el componente ni el
 * endpoint se enteran — por eso la lectura está aislada aquí y no esparcida por
 * los consumidores.
 *
 * Ojo al hacerlo: `janelaInscricao()` pasará a ser asíncrona y a golpear la red
 * en la ruta crítica de la LP. Hará falta cachear el resultado unos segundos, o
 * Supabase lento se convierte en la LP lenta.
 */

export type EstadoInscricao = 'em-breve' | 'aberta' | 'finalizada';

export interface JanelaInscricao {
  abreEm: Date;
  fechaEm: Date;
}

/**
 * La ventana de inscripción, ya parseada.
 *
 * Devuelve `null` si las fechas no son utilizables: mal escritas, o con el
 * cierre antes que la apertura. No lanza, porque un error de dato no debe
 * tumbar la página entera — pero tampoco se lo traga en silencio: quien la
 * llama trata el `null` como cerrado (ver `estadoInscricao`).
 */
export function janelaInscricao(): JanelaInscricao | null {
  const abreEm = new Date(inscricao.abreEm);
  const fechaEm = new Date(inscricao.fechaEm);

  if (Number.isNaN(abreEm.getTime()) || Number.isNaN(fechaEm.getTime())) return null;
  if (abreEm >= fechaEm) return null;

  return { abreEm, fechaEm };
}

/**
 * En qué punto del período estamos.
 *
 * `agora` es inyectable para poder probar los tres estados y los dos bordes sin
 * tocar el reloj del sistema.
 *
 * **Falla cerrado.** Si las fechas no se pueden leer devuelve 'em-breve', no
 * 'aberta': que alguien vea «Em breve» cuando debería poder inscribirse es
 * molesto y se arregla; que vea «Inscreva-se» y el envío reviente después de
 * rellenar once campos y subir una foto es peor, y encima no deja rastro de por
 * qué. Ese criterio vale también para cuando las fechas vengan de Supabase y
 * Supabase no responda.
 */
export function estadoInscricao(agora: Date = new Date()): EstadoInscricao {
  const janela = janelaInscricao();
  if (!janela) return 'em-breve';

  if (agora < janela.abreEm) return 'em-breve';
  if (agora > janela.fechaEm) return 'finalizada';
  return 'aberta';
}

/** Rótulo del botón en cada estado. Los textos salen del JSON, como el resto. */
export const ROTULO_INSCRICAO: Record<EstadoInscricao, string> = inscricao.rotulos;
