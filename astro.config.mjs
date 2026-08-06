// @ts-check
import { defineConfig, envField, passthroughImageService } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // 'server' es obligatorio: sin esto la ruta POST /api/inscricao no se ejecuta.
  output: 'server',

  // Despliegue en VPS con Docker. `standalone` incluye un servidor HTTP en el
  // propio build, así que el contenedor arranca con `node dist/server/entry.mjs`
  // y no necesita nada delante salvo el proxy inverso.
  //
  // Escucha en HOST/PORT del entorno; el compose los fija a 0.0.0.0:4321.
  adapter: node({ mode: 'standalone' }),

  // Ninguna imagen de la LP pasa por `astro:assets`: son `<img>` con rutas de
  // /assets/ ya optimizadas por scripts/optimizar-assets.mjs. Sin esto, Astro
  // levantaría su servicio de imágenes basado en sharp para nada.
  //
  // Ojo: esto NO quita sharp del proyecto ni debe hacerlo. `lib/foto.ts` lo usa
  // directamente para reprocesar la foto del formulario, que es lo que borra el
  // EXIF. Son dos usos distintos de la misma librería.
  image: { service: passthroughImageService() },
  integrations: [react()],

  // Credenciales de la persistencia.
  //
  // `context: 'server'` + `access: 'secret'` garantiza dos cosas: que nunca
  // acaben en el bundle del navegador, y que se lean en tiempo de ejecución —
  // que es lo que hace falta en el contenedor del VPS, donde el build y el
  // arranque no comparten entorno. Por eso el Dockerfile no necesita ningún
  // secreto para construir la imagen.
  //
  // ⚠️ Ojo con lo que esto NO hace: la validación es PEREZOSA. Ocurre cuando el
  // módulo que usa cada variable se importa por primera vez, no al arrancar. Un
  // contenedor con el .env incompleto arranca igual, sirve la portada y sólo
  // revienta en la primera petición que toque Supabase. Quien detecta eso es
  // `/healthz`, que es el objetivo del HEALTHCHECK justamente por esto.
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret' }),
      SUPABASE_BUCKET_FOTOS: envField.string({
        context: 'server',
        access: 'secret',
        default: 'fotos-caocurso',
      }),

      // Secreto de un solo propósito para `GET /api/exportar`, que es lo que
      // lee la planilla del jurado. Deliberadamente NO es la service_role: ese
      // token acaba guardado en un script de Google Apps, y quien tenga permiso
      // de edición sobre la planilla puede leerlo. Con éste, lo que se expone
      // si se filtra es esa lista; con la service_role sería la base entera.
      // Se revoca cambiando esta variable.
      //
      // Vacío = endpoint desactivado, que es lo correcto mientras nadie lo use.
      EXPORTACAO_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        default: '',
      }),

      // La planilla del jurado, por empuje: tras cada inscripción el servidor
      // manda la lista entera a un Web App de Apps Script que reescribe la
      // pestaña. Ver src/lib/planilha.ts.
      //
      // Es el camino que funciona hoy: la URL del Web App ya es pública, así
      // que sale desde aquí sin necesidad de que este servidor sea alcanzable
      // desde fuera. Vacías las dos = no se sincroniza nada, que es lo
      // correcto mientras la planilla no exista.
      PLANILHA_WEBHOOK_URL: envField.string({
        context: 'server',
        access: 'secret',
        default: '',
      }),
      PLANILHA_WEBHOOK_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        default: '',
      }),

      // Dirección pública del sitio, sólo para construir el enlace de la foto
      // que va a la planilla. Sin esto se usa el origen de la petición, que en
      // local es http://localhost:4321 — sirve para probar, pero esos enlaces
      // no le valen al jurado. En producción: https://pet.condor.com.br
      SITE_URL: envField.string({ context: 'server', access: 'secret', default: '' }),
    },
  },

  vite: {
    plugins: [tailwindcss()],

    server: {
      // Sin esto, `astro dev` detrás de un túnel responde "Blocked request. This
      // host is not allowed": Vite sólo acepta peticiones cuyo Host conoce, y el
      // de ngrok cambia en cada arranque. El punto inicial cubre cualquier
      // subdominio. Sólo afecta al servidor de desarrollo — el build no lo usa.
      allowedHosts: ['.ngrok-free.app', '.ngrok.app', '.ngrok-free.dev', '.ngrok.io'],
    },
  },
});
