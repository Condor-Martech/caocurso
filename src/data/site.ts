import dados from './site.json';

/**
 * CONTENIDO DE LA LP — capa tipada sobre `site.json`.
 *
 * El reparto es deliberado:
 *
 *   · **`site.json`** es el dato. Todo el texto visible, las rutas de imagen y
 *     las fechas. Se puede editar sin saber TypeScript y sin tocar un componente.
 *   · **este archivo** son los tipos y el *porqué*. JSON no admite comentarios, y
 *     media docena de valores de aquí sólo se entienden con su historia detrás:
 *     por qué el período de inscripción no es el que dibuja el mockup, por qué
 *     hay logos a `null`, por qué el orden de la galería no es alfabético.
 *     Borrar esos comentarios es perder el motivo y repetir el error.
 *
 * Fuentes del contenido, por orden de precedencia:
 *   1. El briefing del cliente (docs/LP Cão Curso.docx) — manda sobre el mockup.
 *   2. La referencia visual docs/Desktop - CãoCurso.png (1366×8000).
 *   3. Los assets reales de public/assets/.
 *
 * Todo el contenido visible va literal en pt-BR.
 */

/* -------------------------------------------------------------------------- */
/* Tipos compartidos                                                           */
/* -------------------------------------------------------------------------- */

export interface Imagem {
  src: string;
  alt: string;
  largura: number;
  altura: number;
}

/* -------------------------------------------------------------------------- */
/* Identidad del sitio                                                         */
/* -------------------------------------------------------------------------- */

/**
 * `regulamentoPdf` está a `null` porque el PDF de 2026 todavía no existe: sólo
 * está el de 2025, que ya no aplica. Antes se apuntaba a
 * /assets/docs/2026_Regulamento_Caocurso.pdf, un fichero que nunca se subió, así
 * que el botón daba un 404.
 *
 * Decisión del cliente: el botón «Confira o regulamento» se queda VISIBLE pero
 * DESHABILITADO, con aire de «em breve». Nada de enlaces rotos. Cuando llegue el
 * PDF: subirlo a public/assets/docs/, poner su ruta en el JSON y
 * `regulamentoDisponivel: true`.
 */
export const SITE = dados.site;

export const copyright = dados.site.copyright;

/* -------------------------------------------------------------------------- */
/* Período de inscripción                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Las dos fechas que deciden si el botón dice «Em breve», «Inscreva-se» o
 * «Finalizado». La lógica vive en `src/lib/inscricao.ts`.
 *
 * **El offset `-03:00` está escrito a mano y es deliberado.** `new Date('2026-08-21')`
 * se interpreta como UTC, así que en Brasil el período habría cerrado a las 21:00
 * del día 20 — un día antes, y sin que nadie se entere hasta que lleguen las
 * quejas. Brasil no aplica horario de verano desde 2019, así que -03:00 vale todo
 * el año.
 *
 * Y el cierre es a las 23:59:59 del 21, no a las 00:00: «de 03/08 a 21/08»
 * incluye el día 21 entero.
 *
 * Estas dos fechas se mudan a la tabla `cao_campanha` de Supabase (ver
 * docs/PLATAFORMA.md); mientras tanto viven en el JSON.
 */
export const inscricao = dados.inscricao;

/* -------------------------------------------------------------------------- */
/* Hero — bloque fijo + carrusel de dos ofertas                                */
/* -------------------------------------------------------------------------- */

/**
 * El slide del Cãocurso no lleva `dados` ni `nota` en el JSON: los saca de
 * `caocurso` (fecha, local, horario y período), que es la misma información que
 * usa el bloque 7. Duplicarla en dos sitios es garantizar que un día discrepen.
 *
 * El de adopción tampoco lleva fechas: las compone a partir de `eventos`.
 */
export const hero = dados.hero;

/* -------------------------------------------------------------------------- */
/* Adote um AuMigo (bloque 2)                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Assets de 2025 que siguen vigentes porque el briefing lo autoriza:
 * «Adote um aumigo: podemos utilizar o KV do ano passado».
 *
 * `Dog.png` es el perro CON PATAS, y eso importa: es el único que puede cruzar
 * la franja separadora. `viralata-01.webp` no tiene patas y no sirve aquí.
 */
export const adote = dados.adote;

/* -------------------------------------------------------------------------- */
/* Eventos de adoção — 3 datas reais, agosto de 2026                           */
/* -------------------------------------------------------------------------- */

export interface Evento {
  id: number;
  dia: number;
  mes: string;
  local: string;
  horario: string;
}

/**
 * El título va troceado a propósito: en la referencia alterna azul y blanco
 * dentro de la misma frase y se parte en tres líneas fijas. Un string suelto
 * perdería las dos cosas, así que se guarda como líneas de fragmentos.
 *
 * `cor` es un token cerrado, no un color: el componente lo traduce a las clases
 * de la paleta. Así el JSON no puede introducir un HEX fuera del sistema.
 */
export type CorTitulo = 'azul' | 'branco';

export interface FragmentoTitulo {
  texto: string;
  cor: CorTitulo;
}

export const eventosTitulo = dados.eventos.titulo as FragmentoTitulo[][];
export const eventos: Evento[] = dados.eventos.itens;

/* -------------------------------------------------------------------------- */
/* Requisitos — panel único con 6 bullets, NO tres cards                       */
/* -------------------------------------------------------------------------- */

export const requisitosTitulo: string = dados.requisitos.titulo;
export const requisitos: string[] = dados.requisitos.itens;

/* -------------------------------------------------------------------------- */
/* Protetoras parceiras                                                        */
/* -------------------------------------------------------------------------- */

/**
 * ONGs 2026 — EM DEFINIÇÃO.
 *
 * El briefing dice literalmente: «ONGS: Em definição ainda, apenas prever o
 * local». El mockup (recorte y=2000-3000) pinta exactamente eso: tres tarjetas
 * blancas VACÍAS, con sólo el icono de Instagram abajo.
 *
 * Por eso NO se reutilizan las tres protectoras de 2025 (Instituto Seres &
 * Vidas, SOS 4 Patas PR, Marcia Santos): anunciarlas como socias de 2026 sería
 * inventar un dato. Los huecos se rellenan cuando el cliente confirme — los tres
 * campos son nulables justamente para eso.
 */
export interface Protetora {
  nome: string | null;
  logo: string | null;
  instagram: string | null;
}

export const protetorasTitulo: string = dados.protetoras.titulo;
export const protetorasAviso: string = dados.protetoras.aviso;
export const protetoras: Protetora[] = dados.protetoras.itens;

/* -------------------------------------------------------------------------- */
/* Cãocurso — 29 de agosto de 2026                                             */
/* -------------------------------------------------------------------------- */

/**
 * El período va en dos campos porque el mockup lo pinta en dos líneas, más una
 * tercera versión en una sola línea para donde no quepa el salto (meta, alt…).
 *
 * OJO con las fechas: el mockup dice «de 10/08», pero el briefing del cliente
 * cerró el período en 03/08–21/08 y **el briefing manda sobre el mockup**.
 */
export const caocurso = dados.caocurso;

/* -------------------------------------------------------------------------- */
/* Atrações — 4 atrações para 2026                                            */
/* -------------------------------------------------------------------------- */

export interface Atracao {
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
}

export const atracoesTitulo: string[] = dados.atracoes.titulo;
export const atracoes: Atracao[] = dados.atracoes.itens;

/* -------------------------------------------------------------------------- */
/* Galeria — edição anterior (2025)                                            */
/* -------------------------------------------------------------------------- */

/**
 * Las 12 fotos de public/assets/galeria/, generadas por
 * `node scripts/optimizar-assets.mjs` desde los originales del fotógrafo
 * (assets-fonte/galeria/, 236 MB a 8192×5464 — nunca se sirven).
 *
 * **El orden NO es alfabético y no se puede reordenar a la ligera.** Cada
 * posición cae en un hueco del mosaico con su propia proporción (`PROPORCOES` en
 * Galeria.astro) y `object-cover` recorta por el centro. Estas fotos son
 * apaisadas 3:2 —el mosaico se dibujó para verticales 3:4—, así que en los huecos
 * altos van las de sujeto centrado y los anchos (1,5) se reservan para los planos
 * generales, que pierden a la gente de los bordes si se recortan.
 *
 * En el JSON, por columnas del mosaico:
 *   1-3   huecos 0,873 · 1,5 · 0,912   (la 1 primer plano, la 2 plano general)
 *   4-6   huecos 0,907 · 1,5 · 0,873
 *   7-9   huecos 1,5 · 1,5 · 0,667     (rs-3118 es la única vertical 2:3)
 *   10-12 huecos 1,5 · 0,667 · 1,5     (pódio y painel necesitan el ancho entero)
 *
 * Si se cambia una foto, revisar su hueco.
 */
export const galeriaTitulo: string[] = dados.galeria.titulo;

export const galeria = dados.galeria.fotos.map((src, i) => ({
  src,
  alt: dados.galeria.altPadrao.replace('{n}', String(i + 1)),
}));

/* -------------------------------------------------------------------------- */
/* Patrocínio e apoio (2026)                                                   */
/* -------------------------------------------------------------------------- */

/**
 * `logo: null` significa «todavía no tenemos el archivo oficial de esta marca».
 * El componente OCULTA esas entradas y pinta el nombre como texto; **nunca** las
 * sustituye por el logo de otra empresa. Pintar Whiskas donde va Fancy Feast es
 * un error de marca, no un detalle de maquetación.
 *
 * Las cuatro que están a `null` y por qué, para que nadie repita la asignación
 * equivocada que había antes:
 *   · Fancy Feast   — el archivo que había era WHISKAS-LOGO.png, de Whiskas.
 *   · MARS Petcare  — apuntaba a Image-5@2x.png, que es el logo de brf pet.
 *   · Caats         — apuntaba a Image-2@2x-150x150.png, que es «Natural DOTS».
 *   · Doguitos      — apuntaba a Logo-Purina-One-Caes.png, que es Purina ONE.
 *
 * `larguraMax` es el ancho máximo en px con el que el logo queda visualmente a la
 * par de los demás de la fila: los lockups horizontales necesitan más ancho que
 * los sellos cuadrados. Medido sobre el mockup a 1366 px.
 *
 * El orden de las marcas se leyó una a una del mockup, recorte y=7000-8000.
 */
/**
 * `largura` y `altura` son las dimensiones REALES del archivo, no un tamaño de
 * presentación. De ellas sale la proporción, y de la proporción el tamaño con el
 * que cada logo se pinta (ver Patrocinadores.astro).
 *
 * Antes había un `larguraMax` afinado a ojo por marca, y ese era el problema:
 * topar por ancho convierte un lockup de 9,38:1 en una tira de 17 px de alto al
 * lado de un sello cuadrado de 80. Medido en la página, la desproporción entre
 * el logo más y menos presente era de 2,7×.
 *
 * Las marcas sin archivo no llevan dimensiones: se pintan como texto.
 */
export interface Marca {
  nome: string;
  logo: string | null;
  largura?: number;
  altura?: number;
}

export const patrocinio: Marca[] = dados.patrocinio.marcas;
export const apoio: Marca[] = dados.apoio.marcas;

export const gruposMarcas: { titulo: string; marcas: Marca[] }[] = [
  { titulo: dados.patrocinio.titulo, marcas: patrocinio },
  { titulo: dados.apoio.titulo, marcas: apoio },
];

/* -------------------------------------------------------------------------- */
/* Formulário de inscrição                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Cada campo lleva `label` y `placeholder` por separado, y no es redundancia:
 * el `label` va en `sr-only` y **conserva el texto completo** cuando el
 * placeholder se recorta con elipsis en pantallas estrechas. «CPF cadastrado no
 * Clube Condor» son 30 caracteres y no entra en una píldora por debajo de
 * 1024 px; quien use lector de pantalla sigue oyendo el texto entero.
 *
 * El `aceite` NO está en el mockup: lo pidió el cliente y es obligatorio por
 * LGPD. ⚠️ Hoy agrupa tres finalidades distintas —participar, ceder la imagen del
 * pet y ceder los datos para divulgación— y bajo LGPD tendrían que ser
 * consentimientos separados. Está anotado en docs/PLATAFORMA.md §5.
 */
export const formulario = dados.formulario;

/* -------------------------------------------------------------------------- */
/* Footer                                                                      */
/* -------------------------------------------------------------------------- */

export const footer = dados.footer;

/* -------------------------------------------------------------------------- */
/* Redes sociais                                                               */
/* -------------------------------------------------------------------------- */

/* El footer del mockup (recorte y=7000-8000) lleva seis iconos: Facebook,
   Instagram, TikTok, YouTube, LinkedIn y Threads. El sexto era X en la versión
   anterior; en 2026 es Threads. */
export const socialLinks = dados.social;
