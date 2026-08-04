/**
 * Convierte el KV 2026 de resolución de imprenta a resolución web.
 *
 * Origen : assets-fonte/  (los PNG originales, hasta 17717×7087 y 234 MB)
 * Destino: public/assets/2026/  (WebP al ancho máximo con que se muestran ×2)
 *
 * Origen : assets-fonte/galeria/  (las fotos del fotógrafo, hasta 8192×5464)
 * Destino: public/assets/galeria/ (WebP a GALERIA_ANCHO)
 *
 * Los originales NO se sirven: 684 MB en public/ revientan el deploy.
 */
import sharp from 'sharp';
import { readdir, mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';

sharp.cache(false);
sharp.concurrency(2);

const SRC = 'assets-fonte';
const OUT = 'public/assets/2026';

const GALERIA_SRC = 'assets-fonte/galeria';
const GALERIA_OUT = 'public/assets/galeria';

/**
 * Ancho de salida de las fotos de la galería.
 *
 * El mosaico las pinta a 207 px de columna como mucho, pero los huecos verticales
 * del mosaico (proporción 0,667 en `Galeria.astro`) recortan a lo ancho una foto
 * apaisada 3:2: para llenar 310 px de alto en una pantalla ×2 hacen falta ~930 px
 * de ancho de origen. Con menos, esos cuatro huecos se ven borrosos.
 */
const GALERIA_ANCHO = 960;

/** ancho máximo de salida por archivo; el resto usa POR_DEFECTO */
const ANCHOS = {
  // Lockups y motes — se muestran a ≤460 px, así que 900 cubre pantallas 2x
  'Selo_MesPet26.png': 760,
  'Selo.png': 800,
  'CaoCurso.png': 700,
  'Mote_MesPet.png': 760,
  'Mote_V09.png': 900,
  'Mote_v09_Amarelo.png': 900,
  'Mote.png': 700,
  'Logo Condor com sombra.png': 480,

  // Mascotas recortadas — la mayor se muestra a 580 px
  'DogCatPrincipal.png': 1200,
  'Dogs_V09.png': 1300,
  'Dogs.png': 1200,
  'DogsCaramelo.png': 1000,
  'Dogs_SalsichaeCaramelo.png': 1200,
  'Dog_Caremlo1.png': 900,
  'ViraLata_01.png': 900,
  'ViraLata_02.png': 900,

  // Fondos y formas — a sangre, tope 1920
  'BG_Lux.png': 1920,
  'BG_MêsPet.png': 1920,
  'BG.png': 1920,
  'BG_Texture.png': 1920,
  'BG.jpg': 1920,
  'Shape.png': 1400,
  'Shape2.png': 1600,
  'Textura_Halftone.png': 1600,

  // Logos de patrocinio — ya vienen pequeños
  'NestlePURINA.png': 600,
  'doogs.png': 574,
  'proção.png': 291,
};
const POR_DEFECTO = 1200;

/** nombres de salida sin espacios ni acentos: van dentro de una URL */
const RENOMBRES = {
  'Selo_MesPet26.png': 'selo-mespet-2026',
  'Selo.png': 'selo-caocurso',
  'CaoCurso.png': 'caocurso-selo',
  'Mote_MesPet.png': 'mote-mespet',
  'Mote_V09.png': 'mote-caocurso',
  'Mote_v09_Amarelo.png': 'mote-caocurso-amarelo',
  'Mote.png': 'mote-passarela',
  'Logo Condor com sombra.png': 'logo-condor',
  'DogCatPrincipal.png': 'hero-cao-gato',
  'Dogs_V09.png': 'caocurso-dogs',
  'Dogs.png': 'dogs',
  'DogsCaramelo.png': 'dogs-caramelo',
  'Dogs_SalsichaeCaramelo.png': 'dogs-salsicha-caramelo',
  'Dog_Caremlo1.png': 'dog-caramelo',
  'ViraLata_01.png': 'viralata-01',
  'ViraLata_02.png': 'viralata-02',
  'BG_Lux.png': 'bg-caocurso',
  'BG_MêsPet.png': 'bg-mespet',
  'BG.png': 'bg-laranja',
  'BG_Texture.png': 'bg-laranja-textura',
  'BG.jpg': 'bg-laranja-plano',
  'Shape.png': 'shape-roxo',
  'Shape2.png': 'shape-roxo-faixa',
  'Textura_Halftone.png': 'textura-halftone',
  'NestlePURINA.png': 'logo-nestle-purina',
  'doogs.png': 'logo-doogs',
  'proção.png': 'logo-procao',
  'Pattern_Horizontal.svg': 'pattern-horizontal.svg',
  'Pattern Cão Curso.svg': 'pattern-caocurso.svg',
};

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

await mkdir(OUT, { recursive: true });
/* sólo ficheros: `galeria/` es un subdirectorio y lo trata el paso de abajo */
const archivos = (await readdir(SRC, { withFileTypes: true }))
  .filter((e) => e.isFile())
  .map((e) => e.name)
  .sort();

let antes = 0;
let despues = 0;

for (const archivo of archivos) {
  const origen = path.join(SRC, archivo);
  const pesoOrigen = (await stat(origen)).size;
  antes += pesoOrigen;

  if (archivo.endsWith('.svg')) {
    const destino = path.join(OUT, RENOMBRES[archivo] ?? archivo);
    await copyFile(origen, destino);
    despues += pesoOrigen;
    console.log(`svg  ${archivo}  →  ${path.basename(destino)}`);
    continue;
  }

  const base = RENOMBRES[archivo] ?? path.parse(archivo).name.toLowerCase();
  const destino = path.join(OUT, `${base}.webp`);
  const ancho = ANCHOS[archivo] ?? POR_DEFECTO;

  const img = sharp(origen, { limitInputPixels: false, unlimited: true });
  const meta = await img.metadata();

  await img
    .resize({ width: Math.min(ancho, meta.width), withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(destino);

  const pesoDestino = (await stat(destino)).size;
  despues += pesoDestino;
  console.log(
    `webp ${archivo.padEnd(30)} ${meta.width}×${meta.height} ${kb(pesoOrigen).padStart(9)}` +
      `  →  ${path.basename(destino).padEnd(28)} ${kb(pesoDestino).padStart(8)}`
  );
}

/* -------------------------------------------------------------------------- */
/* Galería — fotos de la edición anterior                                      */
/* -------------------------------------------------------------------------- */

await mkdir(GALERIA_OUT, { recursive: true });
const fotos = (await readdir(GALERIA_SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();

console.log(`\n--- galeria (${fotos.length} fotos) ---`);

for (const foto of fotos) {
  const origen = path.join(GALERIA_SRC, foto);
  const pesoOrigen = (await stat(origen)).size;
  antes += pesoOrigen;

  /* el nombre viaja en una URL: minúsculas y sin dobles guiones bajos */
  const base = path.parse(foto).name.toLowerCase().replace(/_+/g, '-');
  const destino = path.join(GALERIA_OUT, `${base}.webp`);

  const img = sharp(origen, { limitInputPixels: false, unlimited: true });
  const meta = await img.metadata();

  await img
    .rotate() // respeta la orientación EXIF antes de redimensionar
    .resize({ width: Math.min(GALERIA_ANCHO, meta.width), withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(destino);

  const pesoDestino = (await stat(destino)).size;
  despues += pesoDestino;
  console.log(
    `webp ${foto.padEnd(30)} ${meta.width}×${meta.height} ${kb(pesoOrigen).padStart(9)}` +
      `  →  ${path.basename(destino).padEnd(28)} ${kb(pesoDestino).padStart(8)}`
  );
}

console.log(`\nTOTAL  ${(antes / 1024 / 1024).toFixed(0)} MB  →  ${(despues / 1024 / 1024).toFixed(1)} MB`);
