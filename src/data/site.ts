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
 * `regulamentoPdf` apunta al MinIO de Condor (`s3.cndr.me`, bucket
 * `lp-content`), no a `public/`. El documento es material de campaña que el
 * marketing sustituye sin tocar el código ni volver a desplegar: subiendo el
 * archivo nuevo con la misma key, el botón ya sirve el nuevo.
 *
 * OJO con el host: la consola de MinIO vive en `minio.cndr.me` y ahí la misma
 * ruta devuelve la SPA en HTML, no el PDF. El endpoint S3 —el que sirve el
 * objeto con `Content-Type: application/pdf`— es `s3.cndr.me`. Pegar la URL que
 * enseña el navegador de la consola (`/browser/lp-content/caocurso%2F…`) abre el
 * gestor de archivos, no el documento.
 *
 * ⚠️ **Hoy sirve el regulamento de 2025**: es el único que existe. El botón dice
 * «Confira o regulamento» sin año, así que no miente, pero las fechas y las
 * reglas de dentro son las del año pasado. Cuando llegue el de 2026 se sube al
 * mismo bucket y se cambia la key aquí.
 *
 * `regulamentoDisponivel` sigue siendo el interruptor: en `false` el botón se
 * pinta igual pero deshabilitado, con aire de «em breve». Nada de enlaces rotos.
 */
export const SITE = dados.site;

export const copyright = dados.site.copyright;

/* -------------------------------------------------------------------------- */
/* Período de inscripción                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Aquí ya sólo quedan los RÓTULOS del botón: «Em breve», «Inscreva-se»,
 * «Esgotado» y «Finalizado». Son copy, y el copy vive en el JSON.
 *
 * **Las fechas y el límite de vacantes ya no están aquí.** Se mudaron a la
 * tabla `cao_campanha` de Supabase, como preveía `docs/PLATAFORMA.md`. El
 * motivo es operacional: la página se renderiza en el servidor en cada
 * petición, así que cambiar la fecha de cierre o el número de plazas en el
 * panel de Supabase se refleja en la carga siguiente, **sin build y sin
 * desplegar**. Esta campaña ya movió sus fechas una vez.
 *
 * Quien las lee es `src/lib/inscricao.ts`, que además cachea el resultado unos
 * segundos para no ir a São Paulo en cada visita.
 *
 * ⚠️ Al escribirlas en la base, siempre con offset. `'2026-08-21 23:59:59'` sin
 * zona se interpreta como UTC y el período cerraría a las 20:59 del día 20 —un
 * día antes— sin que nadie se entere hasta que lleguen las quejas. Brasil no
 * aplica horario de verano desde 2019, así que `-03:00` vale todo el año. Y el
 * cierre va a las 23:59:59 del 21, no a las 00:00: «de 03/08 a 21/08» incluye
 * el día 21 entero.
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
 * ONGs 2026 — CONFIRMADAS, y son las mismas tres de 2025.
 *
 * El briefing decía «ONGS: Em definição ainda, apenas prever o local», y el
 * mockup pintaba tres tarjetas blancas vacías con sólo el icono de Instagram.
 * Por eso estuvieron en `null`: anunciarlas sin confirmación era inventar el
 * dato. El cliente confirmó las tres, así que ahora llevan logo y perfil.
 *
 * Los campos siguen siendo nulables: si una entrada se queda sin `instagram`, la
 * tarjeta pinta el icono sin enlace en vez de un enlace a ninguna parte, y sin
 * `logo` vuelve a ser la tarjeta vacía del mockup. No hay que tocar el
 * componente para quitar una.
 *
 * `largura` y `altura` son las dimensiones REALES del archivo, igual que en
 * `Marca`: de ellas sale la proporción, y de la proporción el tamaño con el que
 * cada logo se pinta. Las tres proporciones son muy distintas —1,13 el sello del
 * Instituto, 2,18 el lockup de SOS 4 Patas— así que igualarlos por ancho o por
 * alto descuadraría la fila.
 */
export interface Protetora {
  nome: string | null;
  logo: string | null;
  largura?: number;
  altura?: number;
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
