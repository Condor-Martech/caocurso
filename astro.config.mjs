// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // 'server' es obligatorio: sin esto la ruta POST /api/inscricao no se ejecuta.
  output: 'server',

  // Despliegue en Vercel (funciones serverless).
  // `astro dev` sigue funcionando igual; para probar el build localmente hay que
  // usar `vercel dev`, porque `astro preview` no sabe servir .vercel/output.
  adapter: vercel({
    // Astro sirve las imágenes ya optimizadas desde /public: no hace falta
    // pagar el servicio de imágenes de Vercel.
    imageService: false,
  }),
  integrations: [react()],
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
