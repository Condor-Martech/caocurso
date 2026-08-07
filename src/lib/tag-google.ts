import { GOOGLE_TAG_ID } from 'astro:env/server';

/**
 * La medición de Google, resuelta UNA vez por proceso.
 *
 * Vive fuera del Layout por dos razones. La primera es el aviso de más abajo:
 * el frontmatter de un componente se ejecuta en cada petición, así que un
 * identificador mal pegado escribía una línea de log por cada visita a la
 * portada — justo el ruido que hace que nadie mire el log. Aquí el módulo se
 * evalúa la primera vez que se importa y no vuelve. La segunda es que así el
 * Layout se ocupa de dónde va cada fragmento, y este archivo de si hay alguno.
 *
 * El interruptor es la variable vacía: sin identificador no se imprime ningún
 * script, el navegador no pide nada a un dominio de Google y no se escribe
 * ninguna cookie de medición. Ver README, «Medição do Google».
 */

/* Los cinco prefijos que reparte Google. `GTM-` se instala distinto que el
   resto —de ahí `ehGtm`—; los demás comparten el fragmento de gtag.js. */
const ID_TAG = /^(?:G|GT|AW|DC|GTM)-[A-Z0-9]+$/i;

const pedida = GOOGLE_TAG_ID.trim();

/**
 * El identificador validado, o cadena vacía si no hay o no vale.
 *
 * Se comprueba el formato, y no por desconfiar de quien despliega: este valor
 * acaba DENTRO de un `<script>` del documento, así que uno mal pegado —con
 * comillas, con un espacio, con la URL entera— colaría texto ajeno en la
 * página. Lo que no encaje se ignora, que es el fallo seguro.
 */
export const tagGoogle = ID_TAG.test(pedida) ? pedida : '';

/** Tag Manager y etiqueta de Google se instalan distinto. El prefijo es lo
 *  único que los separa, y marketing manda uno u otro sin avisar de cuál. */
export const ehGtm = tagGoogle.startsWith('GTM-');

if (pedida && !tagGoogle) {
  console.warn(
    `[tag google] GOOGLE_TAG_ID ignorada: «${pedida}» não parece um ID. ` +
      'Esperado G-XXXXXXXXXX (etiqueta do Google) ou GTM-XXXXXXX (Tag Manager).'
  );
}
