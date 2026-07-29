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
  },
});
