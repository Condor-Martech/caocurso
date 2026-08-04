/**
 * Datos reales de la LP Pet Condor 2026 (pet.condor.com.br).
 *
 * Fuentes, por orden de precedencia:
 *   1. El briefing del cliente (docs/LP Cão Curso.docx) — manda sobre el mockup.
 *   2. La referencia visual docs/Desktop - CãoCurso.png (1366×8000).
 *   3. Los assets reales de public/assets/.
 *
 * Todo el contenido visible va literal en pt-BR.
 */

export const SITE = {
  nome: 'Mês Pet Condor 2026',
  url: 'https://pet.condor.com.br',
  ano: 2026,
  descricao:
    'No Mês do Pet da Condor: adote um AuMigo, inscreva seu pet no Cãocurso e confira todas as atrações.',

  /* El regulamento de 2026 todavía no existe: sólo está el PDF de 2025, que ya
     no aplica. Antes se apuntaba a /assets/docs/2026_Regulamento_Caocurso.pdf,
     un fichero que nunca se subió, así que el botón daba un 404.
     Decisión del cliente: el botón "Confira o regulamento" se queda VISIBLE
     pero DESHABILITADO, con aire de "em breve". Nada de enlaces rotos.
     Cuando llegue el PDF: subirlo a public/assets/docs/ , poner aquí su ruta y
     `regulamentoDisponivel: true`. */
  regulamentoPdf: null,
  regulamentoDisponivel: false,
} as const;

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

export const eventos: Evento[] = [
  { id: 1, dia: 8, mes: 'AGOSTO', local: 'Condor Araucária BR', horario: '11h às 15h' },
  { id: 2, dia: 15, mes: 'AGOSTO', local: 'Condor Nilo Peçanha', horario: '11h às 15h' },
  { id: 3, dia: 22, mes: 'AGOSTO', local: 'Condor Boa Vista', horario: '11h às 15h' },
];

/* -------------------------------------------------------------------------- */
/* Requisitos — lista de 6 bullets dentro do painel                             */
/* -------------------------------------------------------------------------- */

export const requisitos: string[] = [
  'Ter, no mínimo, 21 anos;',
  'Portar RG, CPF e comprovante de residência;',
  'Responder a uma entrevista sobre os motivos da adoção;',
  'Assinar e concordar com o termo de adoção;',
  'Ter condições financeiras para manter o animalzinho;',
  'Ter local seguro e adequado.',
];

/* -------------------------------------------------------------------------- */
/* Protetoras parceiras                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Los tres campos son nulables a propósito: en 2026 las ONGs todavía no están
 * cerradas y el bloque se maqueta vacío. Ver el array de abajo.
 */
export interface Protetora {
  nome: string | null;
  logo: string | null;
  instagram: string | null;
}

/**
 * ONGs 2026 — EM DEFINIÇÃO.
 *
 * El briefing dice literalmente: "ONGS: Em definição ainda, apenas prever o
 * local". El mockup (recorte y=2000-3000) pinta exactamente eso: tres tarjetas
 * blancas VACÍAS, con sólo el icono de Instagram abajo.
 *
 * Por eso NO se reutilizan las tres protectoras de 2025 (Instituto Seres &
 * Vidas, SOS 4 Patas PR, Marcia Santos): anunciarlas como socias de 2026 sería
 * inventar un dato. Los huecos se rellenan cuando el cliente confirme.
 */
export const protetoras: Protetora[] = [
  { nome: null, logo: null, instagram: null },
  { nome: null, logo: null, instagram: null },
  { nome: null, logo: null, instagram: null },
];

/* -------------------------------------------------------------------------- */
/* Cãocurso — 29 de agosto de 2026                                             */
/* -------------------------------------------------------------------------- */

export const caocurso = {
  data: '29 de agosto',
  local: 'Condor Água Verde',
  horario: 'das 14h às 18h',

  /* El mockup pinta el período en dos líneas, y por eso van en dos campos.
     OJO con las fechas: el mockup dice "de 10/08", pero el briefing del cliente
     cerró el período en 03/08–21/08 y el briefing manda sobre el mockup. */
  inscricaoRotulo: 'Período de inscrição:',
  inscricaoPeriodo: 'de 03/08 a 21/08/2026.',

  /* La misma frase en una línea, para donde no quepa el salto (meta, alt…). */
  inscricao: 'Período de inscrição: de 03/08 a 21/08/2026.',

  /* Las mismas dos fechas, pero en máquina: son las que deciden si el botón dice
     «Em breve», «Inscreva-se» o «Finalizado» (ver src/lib/inscricao.ts).

     El offset -03:00 va escrito a mano y es deliberado. `new Date('2026-08-21')`
     se interpreta como UTC, así que en Brasil el período habría cerrado a las
     21:00 del día 20 — un día antes, y sin que nadie se entere hasta que lleguen
     las quejas. Brasil no aplica horario de verano desde 2019, así que -03:00 es
     constante todo el año.

     Y el cierre es a las 23:59:59 del 21, no a las 00:00: «de 03/08 a 21/08»
     incluye el día 21 entero.

     Estas dos fechas se mudan a la tabla `cao_campanha` de Supabase (ver
     docs/PLATAFORMA.md); mientras tanto viven aquí. */
  inscricaoAbreEm: '2026-08-03T00:00:00-03:00',
  inscricaoFechaEm: '2026-08-21T23:59:59-03:00',

  tagline: 'SEU PET É A ESTRELA da nossa passarela!',
} as const;

/* -------------------------------------------------------------------------- */
/* Atrações — 4 atrações para 2026                                            */
/* -------------------------------------------------------------------------- */

export interface Atracao {
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
}

export const atracoes: Atracao[] = [
  {
    id: 1,
    titulo: 'Camarim',
    descricao: 'Seu PetStar merece esse trato!',
    icone: 'camarim',
  },
  {
    id: 2,
    titulo: 'Caricaturista',
    descricao: 'Não perca essa fofura.',
    icone: 'caricaturista',
  },
  {
    id: 3,
    titulo: 'Petfotos',
    descricao: 'Que tal uma foto impressa com seu pet?',
    icone: 'petfotos',
  },
  {
    id: 4,
    titulo: 'Petplace',
    descricao: 'Um espaço exclusivo para o seu pet!',
    icone: 'petplace',
  },
];

/* -------------------------------------------------------------------------- */
/* Galeria — edição anterior (2025)                                            */
/* -------------------------------------------------------------------------- */

/* Las 12 fotos que hay en public/assets/galeria/, generadas por
   `node scripts/optimizar-assets.mjs` desde los originales del fotógrafo
   (assets-fonte/galeria/, 236 MB a 8192×5464 — nunca se sirven).

   El orden NO es alfabético: cada posición cae en un hueco del mosaico con su
   propia proporción (`PROPORCOES` en Galeria.astro) y `object-cover` recorta por
   el centro. Estas fotos son apaisadas 3:2 —el mosaico se dibujó para verticales
   3:4—, así que en los huecos altos hay que poner las de sujeto centrado y
   reservar los anchos (1,5) para los planos generales, que pierden a la gente de
   los bordes si se recortan. Si se cambia una foto, revisar su hueco. */
export const galeria = [
  // columna 1 — huecos 0,873 · 1,5 · 0,912
  '/assets/galeria/img-1714.webp', // primer plano centrado
  '/assets/galeria/img-1501.webp', // plano general del palco
  '/assets/galeria/rs-2953.webp',
  // columna 2 — huecos 0,907 · 1,5 · 0,873
  '/assets/galeria/rs-3143.webp',
  '/assets/galeria/rs-2925.webp',
  '/assets/galeria/rs-3238.webp',
  // columna 3 — huecos 1,5 · 1,5 · 0,667
  '/assets/galeria/rs-3037.webp',
  '/assets/galeria/rs-3150.webp',
  '/assets/galeria/rs-3118.webp', // única vertical 2:3: encaja sin recorte
  // columna 4 — huecos 1,5 · 0,667 · 1,5
  '/assets/galeria/rs-3669.webp', // pódio, necesita el ancho entero
  '/assets/galeria/rs-3366.webp', // composición vertical: aguanta el 0,667
  '/assets/galeria/rs-3713.webp', // painel Mês Pet, necesita el ancho entero
].map((src, i) => ({
  src,
  alt: `Cãocurso Condor 2025 — foto ${i + 1}`,
}));

/* -------------------------------------------------------------------------- */
/* Patrocínio e apoio (2026)                                                   */
/* -------------------------------------------------------------------------- */

/**
 * `logo: null` significa "todavía no tenemos el archivo oficial de esta marca".
 * El componente debe OCULTAR esas entradas, nunca sustituirlas por el logo de
 * otra empresa: pintar Whiskas donde va Fancy Feast es un error de marca, no un
 * detalle de maquetación.
 *
 * `larguraMax` es el ancho máximo en px con el que el logo queda visualmente
 * a la par de los demás en la fila (los lockups horizontales necesitan más
 * ancho que los sellos cuadrados). Medido sobre el mockup a 1366 px.
 */
export interface Marca {
  nome: string;
  logo: string | null;
  larguraMax: number;
}

/* Orden y marcas leídos uno a uno del mockup, recorte y=7000-8000. */
export const patrocinio: Marca[] = [
  { nome: 'Nestlé Purina', logo: '/assets/2026/logo-nestle-purina.webp', larguraMax: 160 },
  { nome: 'Friskies', logo: '/assets/patrocinadores/Logo-Friskies@2x.png', larguraMax: 100 },
  { nome: 'Dog Chow', logo: '/assets/patrocinadores/Logo-dog-Chow.png', larguraMax: 95 },
  // TODO: falta el logo oficial de Fancy Feast. El archivo que había aquí
  // (WHISKAS-LOGO.png) es de Whiskas, otra marca del portafolio de 2025.
  { nome: 'Fancy Feast', logo: null, larguraMax: 110 },
  {
    nome: 'Kelcat',
    logo: '/assets/patrocinadores/AF_LOGO_KELCAT-CROMIA-002@2x.png',
    larguraMax: 100,
  },
  {
    nome: 'Keldog',
    logo: '/assets/patrocinadores/AF_LOGO_KELDOG_CROMIA-002.png',
    larguraMax: 105,
  },
];

export const apoio: Marca[] = [
  // TODO: falta el logo oficial de MARS Petcare. Antes apuntaba a Image-5@2x.png,
  // que es el logo de brf pet (el mismo archivo servía a dos marcas distintas).
  { nome: 'MARS Petcare', logo: null, larguraMax: 90 },
  { nome: 'brf pet', logo: '/assets/patrocinadores/Image-5@2x.png', larguraMax: 100 },
  // TODO: falta el logo oficial de Caats. Antes apuntaba a Image-2@2x-150x150.png,
  // que es el logo de "Natural DOTS".
  { nome: 'Caats', logo: null, larguraMax: 75 },
  { nome: 'Doogs', logo: '/assets/2026/logo-doogs.webp', larguraMax: 95 },
  { nome: 'Procão', logo: '/assets/2026/logo-procao.webp', larguraMax: 110 },
  // TODO: falta el logo oficial de Doguitos. Antes apuntaba a
  // Logo-Purina-One-Caes.png, que es el logo de Purina ONE.
  { nome: 'Doguitos', logo: null, larguraMax: 85 },
];

/* -------------------------------------------------------------------------- */
/* Redes sociais                                                               */
/* -------------------------------------------------------------------------- */

/* El footer del mockup (recorte y=7000-8000) lleva seis iconos: Facebook,
   Instagram, TikTok, YouTube, LinkedIn y Threads. El sexto era X en la versión
   anterior; en 2026 es Threads. */
export const socialLinks = [
  { nome: 'Facebook', url: 'https://www.facebook.com/RedeCondor/', icon: 'facebook' },
  { nome: 'Instagram', url: 'https://www.instagram.com/redecondor/', icon: 'instagram' },
  { nome: 'TikTok', url: 'https://www.tiktok.com/@redecondor', icon: 'tiktok' },
  { nome: 'YouTube', url: 'https://www.youtube.com/user/redecondor', icon: 'youtube' },
  { nome: 'LinkedIn', url: 'https://www.linkedin.com/company/rede-condor/', icon: 'linkedin' },
  { nome: 'Threads', url: 'https://www.threads.net/@redecondor', icon: 'threads' },
];

export const copyright = '©Condor 2026. Todos os direitos reservados.';
