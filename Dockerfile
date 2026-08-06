# syntax=docker/dockerfile:1

# ============================================================================
# Pet Condor LP — imagen de producción
#
# Debian slim y no Alpine a propósito: sharp trae binarios nativos y los
# prebuilds de musl dan más guerra de la que compensa. La diferencia de tamaño
# no justifica depurar libvips la víspera del lanzamiento.
# ============================================================================

# ------------------------------------------------------------------ builder --
FROM node:22-slim AS builder

WORKDIR /app

# Las dependencias van en su propia capa: mientras package-lock.json no cambie,
# Docker reutiliza el `npm ci` y el build sólo repite lo que de verdad cambió.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Sin credenciales aquí, a propósito. Las variables del esquema están
# declaradas `access: 'secret'`, y esas `astro:env` las valida al ARRANCAR, no
# al construir. Ponerlas como ENV en esta etapa haría que el build dependiera
# de un secreto que no necesita, y dispararía el aviso SecretsUsedInArgOrEnv de
# Docker por una variable que sólo lleva relleno.
RUN npm run build

# ------------------------------------------------------------------ runtime --
FROM node:22-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

# Sólo dependencias de producción. `npm ci` recompila/baja los binarios de
# sharp para ESTA imagen, que es el motivo de no copiarlos del builder.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# `dist/` ya incluye el cliente y todo lo que había en public/.
COPY --from=builder /app/dist ./dist

# El servidor no escribe en disco —la foto va al MinIO— así que no hay motivo
# para que corra como root.
USER node

EXPOSE 4321

# Apunta a /healthz y NO a la portada, y la diferencia importa: la portada no
# toca Supabase, así que responde 200 aunque el .env esté mal y el contenedor
# saldría `healthy` con el formulario roto. /healthz consulta la base, de modo
# que una credencial equivocada deja el contenedor en `unhealthy` al minuto en
# vez de esconderse hasta la primera inscripción real.
#
# Sin curl ni wget en la imagen: lo hace el propio Node.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4321)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "./dist/server/entry.mjs"]
