# Dónde deben vivir los formularios de las LPs de Condor

> **Estado:** análisis técnico para decisión. No es una decisión tomada.
> **Fecha:** 2026-07-29 · **Método:** 6 investigaciones paralelas + refutación adversarial
> de la afirmación más frágil de cada una (5 de 6 fueron corregidas o descartadas).
> **Complementa:** `docs/ARQUITECTURA_PLATAFORMA.md` (modelo de datos y plataforma).

> ⚠️ **Este documento corrige a `docs/GROUND_TRUTH.md` y a `CLAUDE.md` en un punto duro.**
> Ambos afirman que el sitio original «no tiene formulario activo» y que el modal es una
> pieza nueva del rebuild. Es **falso**, y la corrección está verificada dos veces: por el
> análisis y de forma independiente contra el snapshot archivado
> `web.archive.org/web/20250822190402/https://pet.condor.com.br/`, que devuelve un
> `<form class="jet-form-builder" data-form-id="379" enctype="multipart/form-data">` con
> **10 campos**, incluidos `cpf-tutor`, `raca-pet`, `sexo-pet` y `descricao-pet`.
> El scrape local se tomó con la inscripción ya cerrada; por eso no lo contenía.

---

# Formularios en las LPs de Condor: dónde deben vivir

**TL;DR** — Sí, saquen el formulario de la LP. No, no con un embed de terceros ni con un iframe. El activo reutilizable no es el widget: es el **pipeline de subida de archivo + el backend + el registro de consentimiento**. El factor que decide es `petFoto`, y decide de una forma que ninguna de las dos opciones sobre la mesa resuelve. Antes de discutir arquitectura, hay tres bugs de producción y un error de contenido que hay que corregir esta semana.

---

## 1. La pregunta real

Lo que preguntaron: *"¿el formulario dentro de la LP o embebido desde el backoffice?"*

Lo que están preguntando de verdad: **¿construimos una plataforma de formularios reutilizable, y hasta dónde llega esa plataforma?** Ese es el problema. "Dónde vive el `<form>`" es una consecuencia, no la decisión.

Y hay que reencuadrar tres premisas del enunciado antes de seguir, porque dos son falsas y la tercera es irrelevante:

**(a) El original SÍ tenía formulario. CLAUDE.md se equivoca.** [verificado — fuente primaria]
`CLAUDE.md` afirma: *"el sitio original no tiene formulario activo… el modal es una pieza nueva e intencional de este rebuild"*. Falso. El scrape local (`/home/diego/armando/Migraciones/petCondor/content/html/index.html`, 0 ocurrencias de `<form`) se tomó con la inscripción ya cerrada. El formulario real está archivado dentro de su ventana (9–24 ago 2025): snapshot `20250822190402` de `pet.condor.com.br`, **JetFormBuilder**, `data-form-id="379"`, `enctype="multipart/form-data"`, **10 campos**: `nome-tutor`, `nascimento-tutor`, `cpf-tutor`, `email-tutor`, `telefone-tutor`, `nome-pet`, `raca-pet`, `sexo-pet`, `descricao-pet` (required), `foto-pet` (required, `accept="image/png,image/jpeg"`, `data-max_size="5242880"`).

El modal implementado (`InscricaoModal.jsx`) **pide `petEspecie` e `petIdade`, que no existían**, y **omite CPF, nascimento, raça, sexo y descrição, que eran obligatorios**. `raca-pet` importa: `docs/ARQUITECTURA_PLATAFORMA.md` §4.3 ya señala que el premio "Top Like por raça" depende de un campo que no se captura. Confirmado contra fuente primaria.

**(b) El renderizado schema-driven no es una apuesta: es el statu quo de Condor desde hace 5 años.** [verificado]
Las dos únicas campañas de Condor con formulario web recuperables se renderizaron con builders genéricos dirigidos por schema: *Meu Pet é Show* (2021, `concurso-pet.condor.com.br`, **ACF Frontend Form Element** + Advanced Custom Fields, nombres tipo `acff[post][field_611d609a665d3]`) y *Cãocurso* (2025, JetFormBuilder). Comparten **nome do tutor, CPF, e-mail, telefone, nome do pet, raça, descrição y foto obligatoria**. El riesgo no es "construir una abstracción que nadie usa": es **regresión** — sustituir un builder probado por front hand-coded por campaña.

Matiz de alcance importante: las campañas promocionales de sorteo (`aniversario.condor.com.br`, `campanha.condor.com.br/saboresdasorte/`, `premia.condor.com.br`) **no tienen formulario en la LP**. La mecánica es cadastro en el app Clube Condor + CPF en la caja. La superficie del renderer es el género "concurso", no "toda campaña".

**(c) El rendimiento NO es un argumento en esta decisión.** [verificado, medido en este repo]
El JS de la LP son 205.444 B raw / **64.506 B gzip** (react-dom 57.068 gz + glue 2.916 gz + modal 4.522 gz). Suena mucho hasta que se mira al lado: `public/` tiene **49 imágenes = 9.937.705 B**, de las cuales ~38 se referencian en el HTML servido (~7,8 MB), más 163.320 B de las 6 Torus woff2. **El JS es ~0,76 % del peso de la página.** `Pet-2.png` solo pesa 1.159.337 B — 18× todo el runtime de React comprimido. Y `astro.config.mjs:18` tiene `imageService: false`, es decir, el optimizador de Astro está desactivado a propósito.

Además el modal entra con `client:idle` (`index.astro:42`): ya está fuera de la ruta crítica. Quien argumente esta decisión por milisegundos está optimizando el 0,76 % mientras ignora el 79 %.

> **Descartado del análisis previo:** la hipótesis de que el CMP de Condor (AdOpt) bloquearía un script embebido. **Condor no tiene ningún CMP en producción.** `curl https://www.condor.com.br/` devuelve `"adoptWebsiteCode":null` — una clave de configuración de la plataforma Osuper sin activar, no una instalación. Cero referencias a goadopt.io, OneTrust, Cookiebot, Iubenda, Usercentrics, Didomi ni ningún otro. El contenedor `GTM-5FW8JKC2` descargado íntegro (483 KB) no menciona AdOpt. GA4, Meta Pixel y TikTok Pixel disparan **sin gate de consentimiento**. Ese riesgo no existe. *(Nota lateral, y es un hallazgo más serio que el que fue a buscar: un sitio brasileño corriendo Meta Pixel + TikTok Pixel sin consentimiento previo es en sí mismo una exposición LGPD de Condor.)*

---

## 2. Las opciones

| Criterio | **A. Statu quo** (isla React + endpoint en la LP) | **B. Script de tercero** (Typeform/Tally/HubSpot) | **C. Iframe propio** (backoffice) | **D. Paquete npm + API central** ⭐ | **E. Plataforma schema-driven completa** |
|---|---|---|---|---|---|
| **Hereda Torus + paleta cerrada** | Sí | **No** — ningún proveedor deja inyectar CSS. HubSpot "raw HTML" exige Marketing/Content Hub **Professional o Enterprise**; dominio propio en Typeform es Growth Custom/Enterprise | No — hay que reservir Torus con CORS o cae a system-ui | **Sí** (light DOM, tokens CSS) | Sí |
| **`petFoto` >4,5 MB viable** | **No** (413 de Vercel) | Sí, por accidente (va al dominio del proveedor) | Sí, por accidente | **Sí, por diseño** (presigned) | Sí |
| **Meta Pixel / GA4 ven el submit** | Sí | Solo con puente `postMessage` que el proveedor debe exponer | **No** sin puente + CAPI server-side | **Sí** (mismo documento) | Sí |
| **CSP / Astro** | Limpio | `<script src>` remoto se reescribe a `import "https://…"` salvo `is:inline`; y `security.csp` (estable en Astro 6) **bloquea el `is:inline`** | Igual | **Limpio** — Astro lo bundlea y hashea solo | Limpio |
| **Portable fuera de Astro (WordPress)** | No | Sí | Sí | Sí si el core es framework-agnóstico | Sí |
| **Peso JS de terceros** | 0 | HubSpot **521 KB sin comprimir / 1.226 ms** de main thread por página (third-party-web, 313.527 páginas). Typeform ~28 KB / 6 KB gz | +DNS+TCP+TLS de un origen nuevo (200–600 ms en 4G) | 0 orígenes nuevos | 0 |
| **CLS / LCP / INP medibles** | Sí | Parcial | **No** — los shifts del iframe cuentan contra tu CLS ponderados por área, pero la API JS no los reporta. Lo mismo con LCP e INP: solo aparecen en CrUX, con 28 días de retraso | Sí | Sí |
| **Blast radius de un incidente** | 1 campaña | Proveedor | Todas las campañas | Todas (mitigable con pinning semver) | Todas |
| **Marketing edita sin deploy** | No | Sí | Sí | No (sí con schema remoto) | **Sí** |
| **Esfuerzo** | — | 2–4 d + paywall | 8–14 d + dependencia externa | **3–5 d** | Producto, no feature |

Descartes rápidos con su motivo:

- **Web Component con Shadow DOM:** encapsula exactamente lo que ustedes quieren heredar. *"The page CSS does not affect nodes inside the shadow DOM"* (MDN). Sirve para inmunizarse del CSS del anfitrión; su caso es el contrario (una marca, un design system). Si van a custom element, que sea **light DOM**.
- **Netlify Forms:** parsea el HTML **estático del build**. Con una isla React haría falta un `<form>` oculto espejo con los 8 campos, sincronizado a mano en cada campaña. Anti-patrón puro. Techo de 8 MB por request completa.
- **RJSF / JSON Forms:** solo renderizan. No son backend. Siguen teniendo que decidir dónde se guardan los envíos y cómo se autentican. El backoffice Next.js ya planeado es justamente lo que no dan.

---

## 3. El factor que decide: `petFoto`

No es el CSS, ni el peso, ni CORS. Es el archivo. Y decide de una forma que **invalida el planteamiento original de la pregunta**.

### 3.1 El límite de Vercel es duro y no se esquiva

> *"The maximum payload size for the request body or the response body of a Vercel Function is **4.5 MB**. If a Vercel Function receives a payload in excess of the limit it will return an error 413: FUNCTION_PAYLOAD_TOO_LARGE"* — docs de Vercel, §Request body size, actualizado 2026-07-01, bajo el régimen de **Fluid compute** (activo por defecto).

La duda razonable ("¿y si consumo el body como stream?") está cerrada por fuente primaria: Amy Egan (Vercel), 22-jul-2024, respondiendo a un usuario que intentó exactamente eso — **"The request body is still limited to 4.5 MB with streaming functions."**

El mecanismo explica por qué es estructural: el único conmutador de streaming que existe en la plataforma es `supportsResponseStreaming` en el `.vc-config.json` del Build Output API. **No existe request streaming.** Abajo, la cuota de Lambda es asimétrica: *6 MB para request y response síncronos / 200 MB solo para respuestas en streaming*. El body se bufferiza y se empaqueta en el payload de invocación **antes** de que exista su handler. Da igual `await request.formData()` (`inscricao.ts:57`) que iterar `request.body`: el 413 lo emite la plataforma y su función ni se invoca.

### 3.2 La foto media del público objetivo NO cabe

- JPEG de cámara de 12 MP: **3–9 MB, mediana ~6 MB**.
- Sensor de 50 MP (dominante en el parque Android de gama media en Brasil): **~21 MB JPG / ~27 MB HEIC**.
- iOS Safari transcodifica HEIC→JPEG cuando el `accept` declara tipos de imagen — `InscricaoModal.jsx:613` lo hace — y **el JPEG resultante suele pesar más que el HEIC original**.

Esto reformula el problema: no es *"¿aguantamos 5 MB?"*, es *"la mayoría de las fotos que va a mandar un tutor desde el móvil no caben en una Vercel Function, y no importa en qué dominio esté la función"*.

### 3.3 Y hay un bug abierto hoy, verificado en el repo

```
src/components/InscricaoModal.jsx:14   const MAX_FOTO_BYTES = 5 * 1024 * 1024;
src/pages/api/inscricao.ts:24          const MAX_FOTO_BYTES = 5 * 1024 * 1024;
```

El cliente promete 5 MB. La plataforma corta en 4,5. Con el overhead multipart medido (1.023 B con los 8 campos y un filename realista), **el techo real de la foto es ~4,499 MB**. La franja 4,5–5,0 MB pasa las dos validaciones y muere en el edge con un 413 **que no es JSON** — y `InscricaoModal.jsx:284` hace `await resposta.json().catch(() => ({}))`, así que el usuario ve *"Não foi possível concluir a inscrição"* después de rellenar 8 campos y subir la foto. Pérdida de conversión silenciosa en el último clic.

Segundo bug, independiente: el endpoint hace `fs.mkdir` + `fs.writeFile` sobre `process.cwd()/uploads` y `appendFile` a un `.jsonl`. El propio comentario del archivo (líneas 17-21) lo reconoce. **En Vercel devuelve 500.** El formulario, tal como está desplegado, no convierte nada.

### 3.4 Consecuencia arquitectónica

**Los bytes de la foto no pueden atravesar una función serverless, viva el formulario donde viva.** El flujo obligatorio es:

```
navegador → (redimensiona + re-encodea) → POST /uploads/sign → PUT directo al storage → POST /submissions {key, metadatos}
```

Es literalmente lo que documenta Vercel (*"upload files directly from the browser"*) y lo que hace Form.io, el producto maduro del patrón schema-driven, que **desacopla el storage del schema** por diseño.

Y aquí está el punto que cierra el debate original: **este arreglo es ortogonal a "embed vs nativo"**. Si eligen un embed de tercero, el problema desaparece por accidente (el archivo va al dominio del proveedor). Eso **no es una razón para embeber** — es una razón para arreglar el upload. Lo que se repite en cada campaña, y lo que hoy no existe en ninguna, es el pipeline.

Dos corolarios que hay que asumir de entrada:

- **El servidor deja de ver el archivo.** Supabase valida `allowed_mime_types` contra el Content-Type **declarado por el cliente**, sin mirar magic bytes (issues abiertos supabase/storage #576 y #639: un GIF renombrado a `.jpg` pasa). La validación real tiene que ser posterior: leer los primeros bytes del objeto, verificar dimensiones y tamaño reales, re-encodear. Encaja exacto con el `status: 'pendente'` que ya existe en `inscricao.ts:130`.
- **EXIF/GPS.** Una foto de mascota hecha en casa lleva las coordenadas del domicilio del tutor. Publicar originales en la galería de votación del Cãocurso es difundir la dirección de miles de personas identificables. El strip en cliente (`createImageBitmap` con `imageOrientation: 'from-image'` + canvas) funciona y **de paso convierte 6–20 MB en 300–800 KB**, pero es código que el usuario controla y se salta con un `fetch` directo a la URL firmada. **El strip defendible ante la ANPD es el del servidor.** Las image transformations de Supabase no sirven: actúan al *servir*, no al almacenar, y son Pro+.

---

## 4. Recomendación

**Paquete npm privado versionado + API central en el backoffice. Renderizado en light DOM como isla de primera parte en la LP. La foto va del navegador al storage, nunca por una función.**

No iframe. No `<script>` de tercero. El iframe queda como **plan B documentado** solo para LPs que la agencia no controle (un WordPress de un partner, un hotsite ajeno) — y en ese caso, con el auto-resize escrito a mano: **iframe-resizer v5 pasó de MIT a GPLv3 en junio de 2024**, y la GPL es transitiva.

### Arquitectura

```
┌─────────────────────── LP de campaña (Astro, CDN) ───────────────────────┐
│                                                                          │
│   index.astro                                                            │
│     └── <FormCondor client:idle schema={SCHEMA_BUILD} />                 │
│              ↑ import desde @condor/forms  (bundleado por Vite,          │
│                hasheado por Astro, pineado por semver en package.json)   │
│              · light DOM · tokens CSS de la campaña · Torus del host      │
│              · hook [data-abrir-inscricao] preservado                     │
└──────────┬────────────────────────────┬───────────────────┬──────────────┘
           │ 1. GET /forms/:slug/schema │ 2. POST /uploads/  │ 4. POST /submissions
           │    (build o SSR, con       │    sign            │    {uploadKey, campos,
           │     fallback embebido)     │    (tras Turnstile)│     consentimientos,
           │                            │                    │     schemaVersion}
           ▼                            ▼                    ▼
┌──────────────────────── Backoffice (Next.js, gru1) ──────────────────────┐
│  Dueño de: schema JSON versionado · submissions · consentimientos LGPD   │
│            moderación · export · webhooks/outbox                         │
│  Defensas: allowlist de Origin · Turnstile · rate limit · honeypot        │
│            dedup por CPF/e-mail/teléfono                                  │
└───────────────┬──────────────────────────────────────────────────────────┘
                │                          ▲
                │ 5. worker: magic bytes,  │ 3. PUT directo navegador→storage
                │    dimensiones, re-encode│    (URL firmada, emitida EN EL SUBMIT)
                │    → strip EXIF → OK     │
                ▼                          │
        ┌──────────────────────────────────┴──────┐
        │  Postgres + Storage (Supabase / InsForge) │
        └───────────────────────────────────────────┘
```

Contrato mínimo del componente, copiado de Feathery — que es la única prueba comercial de que el patrón "SDK que monta DOM real, no iframe" funciona: `className`, `style`, `fieldProps` por nombre de campo, **`components` para sustituir controles concretos** (el uploader con preview del Cãocurso es exactamente el caso que necesita override), `onSubmit`.

### Camino de migración por etapas

**Etapa 0 — esta semana, independiente de toda la decisión.** Son bugs de producción, no arquitectura.
1. `MAX_FOTO_BYTES` → 4 MB en `InscricaoModal.jsx:14` y `inscricao.ts:24`, y los textos de UI (`:209`, `:604`). Mejor aún: comprimir en cliente y que el límite deje de importar.
2. `querNovidades: true` en `InscricaoModal.jsx:32` → **`false`**. Un opt-in de marketing premarcado es indefendible ante la ANPD y es un cambio de una línea.
3. `:focus-visible { outline: 3px solid var(--c-white) }` (`global.css:264-268`) es invisible dentro del modal blanco; y el input de foto es `sr-only` sin `focus:not-sr-only`. El campo obligatorio núcleo no tiene foco visible.
4. Optimizar imágenes. `imageService: false` está apagando el optimizador de Astro. Las 12 JPGs de galería (350–770 KB cada una) más `Pet-2.png` (1,16 MB) y `Selo@2x.png` (840 KB) valen ~100× más que todo el debate sobre React.
5. **Llevar a negocio la pregunta de los campos**: el formulario real tenía CPF, nascimento, raça, sexo y descrição. No es decisión de ingeniería, pero hay que tomarla con el dato correcto delante.

**Etapa 1 — mover la persistencia al backoffice (1,5–2,5 d en el lado LP).**
El acoplamiento LP↔endpoint es **una línea**: el literal `'/api/inscricao'` en `InscricaoModal.jsx:281`. `grep` de `Astro.request|cookies|locals|clientAddress|redirect` sobre `src/` devuelve 0 resultados. Cambiarlo por variable de entorno → borrar `src/pages/api/inscricao.ts` → `output: 'static'`. La LP pasa de renderizarse en una función serverless en cada visita (verificado: `.vercel/output/config.json` mapea `^/$` → `_render`, y no hay `index.html` en `/static`) a HTML en CDN.

*Decisión abierta aquí:* **conservar el adapter Vercel con `output:'static'`** da HTML en CDN **más una única función para `/_actions`** — probado en scratchpad: el build prerenderiza las páginas y aun así emite `_render.func` con `{"src":"^/_actions(?:/(.*?))?/?$"}`, precedido de `{"handle":"filesystem"}`. Ese es el sitio natural para un proxy tipado que oculte la API key y aplique allowlist de origen, si no quieren exponer el endpoint del backoffice en el HTML. Cuesta un archivo por LP, no un backend.

**Etapa 2 — extraer el chasis a paquete (3–5 d).**
No extraigan "el formulario del Cãocurso". Extraigan lo genérico, que es ~250 de las 694 líneas y son precisamente las difíciles: focus trap + ESC + scroll lock + devolución de foco (`:121-159`), y todo el manejo de fichero con preview, `URL.createObjectURL` y su revocación en cleanup (`:186-241`). Los ~390 restantes son labels pt-BR y reglas del Cãocurso: encapsularlos no ahorra nada y saca el copy del control del equipo de contenido.

**Primer commit obligatorio: tipar el schema.** `tsconfig.json` extiende `astro/tsconfigs/strict`, pero `base.json` trae `allowJs: true` **sin `checkJs`**: `npx astro check` da 0 errores sobre 22 archivos y **no type-chequea ni una línea del modal**. Un refactor de esta pieza hoy no tiene red.

**Etapa 3 — la segunda campaña valida la abstracción.** Schema JSON versionado servido por el backoffice (`GET /forms/:slug/schema`), con el JSON del último build embebido como fallback: una caída del backoffice nunca tumba una LP, y marketing cambia un label sin redeploy. `schemaVersion` guardado en cada submission.

**Etapa 4 — builder visual en el backoffice.** Solo si aparece demanda real de marketing de editar sin pasar por ingeniería. Es producto, no feature.

---

## 5. Lo que se gana y lo que se pierde

**Se gana**

- Una definición por campaña en vez de un modal recodificado. Con dos formularios reales auditados compartiendo 8 campos de 10/13, el solapamiento está verificado, no supuesto.
- Validación idéntica cliente/servidor derivada del mismo schema. Hoy la regla de 600 px mínimos vive en un `img.onload` (`:215-228`) que corre **después** de `setFoto(arquivo)` (`:230`): si el usuario envía rápido, `erroFoto` sigue vacío y pasa. Y el servidor no comprueba dimensiones en absoluto. La regla es hoy cosmética y evadible.
- **LGPD centralizada**: un solo sitio donde vive el texto de consentimiento versionado, el timestamp, la IP, la retención y el borrado. El ónus de la prueba es del controlador.
- **Analítica instrumentada una vez.** `grep` de `gtag|dataLayer|posthog|GTM-` sobre `src/` y `public/` → **0 resultados**. Esta LP no emite un solo evento: nadie sabe cuántos abren el modal y abandonan. `form_open`, `field_error`, `form_submit`, `form_success` construidos una vez y no olvidados por campaña es más valor que ahorrar 250 líneas de React. *Encuadren la decisión así ante el equipo; encuadrada como reutilización de código, el ROI no llega.*
- El endpoint actual **no es un activo que se sacrifique**: hay que reescribirlo entero en cualquier escenario.

**Se pierde**

- **El formulario deja de ser un lienzo libre.** El schema cubrirá el 80-90 % y el resto necesitará escape hatches (`components`, slots). Hay que resistir meter lógica condicional compleja en el schema: ahí es donde estos sistemas se convierten en un lenguaje de programación mal diseñado. Es el fracaso clásico de RJSF/JSON Forms en producción.
- **Acoplamiento de versión.** Un cambio en `@condor/forms` puede romper una LP de campaña anterior que siga en línea. Semver estricto y versión pineada por proyecto.
- **Versionado invertido:** npm da pinning, pero también significa que un hotfix del formulario obliga a redeployar N LPs. Si quieren hotfix instantáneo, hay que aceptar loader remoto — y con él las trampas de `is:inline` y CSP. Decídanlo explícitamente, no por defecto.
- **Radio de explosión.** Hoy un incidente afecta a una campaña. Con servicio compartido, a todas a la vez. Res. CD/ANPD 15/2024: **3 días útiles** para comunicar a la ANPD y a los titulares, registro conservado 5 años.
- **Un paso de release entre el equipo y su propio formulario.** Si solo lo consume una LP, se pagaron 3-5 días por 250 líneas.

---

## 6. Trampas

Errores concretos que van a cometer si eligen mal:

1. **`<script src="https://backoffice…">` en un `.astro` sin `is:inline`.** Astro lo reescribe a `<script type="module">` cuyo contenido íntegro es `import "https://backoffice…"`. Verificado en el HTML emitido. Convertido a módulo, el fetch cross-origin exige CORS, se ejecuta diferido y en strict mode. Y si algún día activan `security.csp` (estable desde Astro 6), **el `is:inline` queda bloqueado por el propio meta que Astro inyecta**: probado en Chrome headless, el sha256 del script `is:inline` no aparece en `script-src`. CSP tampoco convive con `<ClientRouter />`. Dos restricciones que se acumulan sobre el mismo patrón.
2. **Publicar el paquete npm y olvidar `@source`.** Tailwind v4 ignora `node_modules` por defecto. Verificado: `tracking-widest` y `mb-6` → 0 ocurrencias en el CSS emitido hasta añadir `@source "../../node_modules/@condor/forms";`. **Sin error de build, sin warning.** El formulario sale a medio estilar y solo se ve mirando la página. Con N campañas al año, esto se olvida. (Buena noticia: es una línea documentada, no un problema de días — el coste de "distribuir estilos" está sobreestimado en cualquier presupuesto que diga lo contrario.)
3. **"Optimizar" `client:idle` a `client:visible`.** El modal hace `if (!aberto) return null`. `client:visible` usa `IntersectionObserver`; un componente que no pinta nada no tiene caja que observar. Probado en Chrome: el `<astro-island client="visible">` conserva `ssr=""` y **nunca hidrata**. CTA muerto, sin error en consola ni fallo de build. Dejen la directiva actual documentada como decisión, no como detalle.
4. **Tratar CORS como control de acceso.** `multipart/form-data` es uno de los tres Content-Type CORS-safelisted: **no hay preflight, el cuerpo se envía siempre**, CORS solo decide si el JS puede *leer* la respuesta. `curl` y cualquier bot lo ignoran. Hoy lo único que protege el endpoint es `security.checkOrigin: true`, default de Astro (`node_modules/astro/dist/core/config/schemas/defaults.js:44`) — seguridad **por accidente de framework**, que se apaga al externalizar. Y ese mecanismo tuvo bypass (CVE-2024-56140, `Content-Type: application/x-www-form-urlencoded; abc`).
5. **413 cross-origin = error de CORS inexplicable.** Los 413 los emite el edge de Vercel, no su código, así que no pasan por el middleware que añade `Access-Control-Allow-Origin`. Si mueven el formulario a otro dominio sin arreglar el tamaño, el modo de fallo pasa de "error genérico" a "error de CORS que solo ocurre con fotos grandes". El equipo depuraría cabeceras durante días mientras el problema es el peso.
6. **Barra de progreso con `XMLHttpRequest.upload`.** Registrar un listener de progreso rompe la condición de "simple request" y aparece un `OPTIONS` previo en cada envío, sobre red móvil. Con `fetch` no ocurre.
7. **Rate limit duro por IP en Brasil.** CGNAT es el modo por defecto en fija: un IPv4 público sirve a cientos de clientes. Bloquear por IP en una operadora móvil brasileña puede tirar a un barrio entero de la campaña. En IPv6 el problema es inverso: un atacante controla un /64 entero. Normalizar a /64 y /56, y **bajo CGNAT nunca bloquear duro** — desafiar o encolar para moderación. **El ancla correcta es CPF + Clube Condor**, que aparece en el 100 % de las campañas auditadas (con formulario y sin él): si el voto se ancla ahí, el problema de CGNAT desaparece.
8. **Confiar en `allowed_mime_types` de Supabase.** Valida el Content-Type declarado, no el contenido. Y `Access-Control-Allow-Origin: *` está fijo a nivel de proyecto y no se puede restringir por dashboard (discussion #7038 abierta): la URL firmada es **la única barrera**. Las signed upload URL caducan a **2 h, valor fijo**: emítanlas en el submit, no al abrir el modal, y registren la key esperada en la BD para detectar objetos huérfanos.
9. **reCAPTCHA v3.** El tramo gratuito bajó de 1.000.000 a **10.000 assessments/mes** el 1-abr-2024, y hasta ese tramo exige proyecto GCP con billing activo. Con varias LPs se agota rápido. Turnstile: 20 widgets, 10 hostnames por widget, **challenges ilimitados**, token single-use de 300 s, no exige enrutar tráfico por el CDN de Cloudflare. Y añadir `condor.com.br` como hostname **incluye automáticamente todos sus subdominios** — un widget para todas las campañas presentes y futuras bajo ese dominio.
10. **Proof-of-work.** El coste recae en el dispositivo del usuario: grava a la madre con Android de entrada subiendo la foto del perro desde datos móviles, y casi no grava al atacante con una VM. Descartar como defensa principal.
11. **Vender el +21,6 % de Deloitte como coeficiente.** Verificado contra el PDF primario: es *funnel progression rate* del paso 1 del formulario al envío, **solo móvil**, del vertical Lead Generation = **6 marcas / 505k sesiones** (no 37 marcas / 30 M), datos de finales de 2019, informe ©2020. Y el "0,1 s" es *"the cumulative impact of all four speed metrics"*, dos de las cuales (First Meaningful Paint, Estimated Input Latency) están deprecadas en Lighthouse 6.0 y eliminadas en la 8.0. Sirve para dirección y orden de magnitud. **Como coeficiente es aritméticamente imposible.**
12. **No existe estudio A/B público que demuestre que un embed convierte peor que un formulario nativo.** Lo busqué. Si alguien audita el análisis y encuentra un porcentaje inventado, se cae la credibilidad de toda la recomendación — que sí se sostiene sobre mecanismos verificables.
13. **iOS + iframe.** WebKit bug 158629 abierto: el foco dentro de un iframe hace scrollear mal al documento padre; reportes reproducidos de que el tap para cambiar de input no registra sin cerrar antes el teclado. Con 8 campos y un `<input type=file>` obligatorio es el escenario de máxima exposición, en el dispositivo que trae la mayoría del tráfico pago. *(Nota: el `<input type=file>` en sí **sí funciona** en iframe cross-origin — MDN lo declara exento por razones históricas del bloqueo de `showPicker()`. Lo prohibido es `window.showOpenFilePicker()`. Regla dura para el componente: nunca `showOpenFilePicker`.)*
14. **Romper `[data-abrir-inscricao]`.** Dos CTAs ya dependen del hook (`Nav.astro:143`, `Evento30Agosto.astro:49`). Si el reemplazo no lo expone, cada campaña futura reinventa cómo se abre el modal — lo contrario del objetivo declarado.

---

## 7. Esfuerzo

Días-persona. Marco explícitamente qué está anclado en código leído y qué es proyección.

| Camino | Días | Desglose | Confianza |
|---|---|---|---|
| **Etapa 0** — bugs + a11y + imágenes | **1–2 d** | Límites (2 líneas), `querNovidades`, focus ring, `imageService` + conversión de las 13 imágenes >100 KB | Alta — anclado en código verificado |
| **(A) Repuntar POST al backoffice + `output:'static'`** | **1,5–2,5 d** | 0,5 d código (env var, mapear `campo`→`setErros`, aceptar `'on'\|'true'`); 0,5–1 d CORS en 3 entornos; 0,5 d borrar api route + verificar build estático; 0,5 d smoke test con foto real | Alta. **No incluye construir el endpoint destino** |
| **Pipeline de upload en el backoffice** *(obligatorio, cualquier camino)* | **4–6 d** | Presigned + registro de keys emitidas + worker de magic bytes/dimensiones + re-encode/EXIF strip + cola de moderación con SLA | Media — no hay una línea de esto en el repo |
| **(D) Paquete compartido (chasis)** | **3–5 d** | 1 d scaffolding (workspace, build de librería, React como peerDependency); 1,5–2 d refactor a config-driven + tipado del schema; **~1 d estilos** (`@source` + sustituir los 13 hexes fuera de paleta por tokens; los tokens ya existen dos veces, en `@theme` de `global.css:58-80` y en el alias `:root` de `:83-92`); 0,5 d docs | Media-alta |
| **(D+) Consumirlo en una segunda LP** | **1 d** | Lo único que valida la abstracción. Sin esto, el paquete es dinero perdido | Media |
| **(C) Embed propio (iframe/script)** | **8–14 d** | 2 d loader + estrategia; 2–3 d puente postMessage (altura, ESC, foco, evento de éxito); 1–2 d temas por campaña; 1 d servir Torus con CORS; 1–2 d CSP/allowlist en condor.com.br; 1 d carga diferida al clic; 2 d QA cross-browser con subida real desde móvil | Media. **+ dependencia de calendario externo (TI de Condor) que no controlan** |
| **(B) Embed de tercero** | 2–4 d | …pero "que parezca de Condor" está detrás del paywall alto en los dos proveedores más establecidos | Alta |
| **(E) Plataforma schema-driven completa** | **sin cifra** | DSL + renderer + motor de validación isomorfo + presigned + admin de definición + versionado de consentimientos + export + outbox. No hay una línea de esto escrita en el repo, así que cualquier número que dé sería inventado. Es producto, no feature — y hay fecha dura de concurso | — |

**El salto de coste está entre (D) y (C), no entre (A) y (D).** Y (A) es obligatorio en todos los escenarios porque el endpoint actual no sobrevive a Vercel: alguien va a tocar `InscricaoModal.jsx:281` esta semana, se decida lo que se decida.

---

## Decisiones que el equipo aún no tomó (y que no voy a asumir)

1. **¿El backoffice va en `*.condor.com.br` o en dominio de la agencia?** `com.br` está en la Public Suffix List, así que `pet.condor.com.br` y `forms.condor.com.br` son **same-site**: cookies `SameSite=Lax` funcionan, sin third-party cookies, sin CHIPS, sin storage particionado, y sin romperse en Safari (que bloquea 3P cookies desde 2020, ajeno a la marcha atrás de Chrome en abril de 2025). Es la decisión de mayor apalancamiento de toda la lista y es gratis. Si acaba en dominio propio, el modelo de sesión tiene que ser **stateless por token desde el día uno**. *Ojo: same-site ≠ same-origin. Sigue habiendo CORS.*
   *Y no compren el atajo:* el subdominio **no** elimina el análisis LGPD. Turnstile exige cargar `api.js` desde `challenges.cloudflare.com` (*"proxying or caching this file will cause Turnstile to fail"*), procesa IP, TLS fingerprint y User-Agent, y Cloudflare **se declara controlador** de parte de esa señal. Sigue habiendo tercero, mención en la política y transferencia internacional (Res. CD/ANPD 19/2024, **gracia vencida el 23/08/2025**). Un captcha de seguridad es candidato a *estritamente necessário*, donde el consentimiento es la base **inadecuada** según la ANPD: va en el banner como "necessários — sempre ativos" + LIA documentado. Validen con el encarregado de Condor antes de comprometerlo por escrito.
2. **¿Se añaden CPF, nascimento, raça, sexo y descrição?** El formulario real los tenía y `raca-pet` condiciona un premio. CPF es además la clave de cruce con Clube Condor y el ancla anti-fraude. Es decisión de negocio.
3. **Clube Condor como identidad (decisión D1 de `docs/ARQUITECTURA_PLATAFORMA.md`).** `clubecondor.com` declara cadastro **exclusivamente por app** (o en tienda) y login por CPF+senha, **sin signup/login web ni API/OAuth públicos**. Eso empuja al Escenario B, con CPF como clave de cruce entre campañas. Pero es evidencia externa, no confirmación de Condor: pregúntenlo.
4. **Stack del componente compartido: vanilla core o React.** Decídanlo **por escrito antes de escribir la primera línea**, no en el PR. No por peso (es el 0,76 % de la página), sino por portabilidad: `pet.condor.com.br` corría **WordPress 7.0 + Elementor**, y la campaña de 2021 también. La pregunta "¿esto va a tener que funcionar fuera de Astro?" tiene respuesta empírica, y es que sí. Si el core es agnóstico con adaptador React fino, cubren ambos. Si lo escriben en React por comodidad porque el backoffice es Next.js, cierran esa puerta.
5. **Hotfix instantáneo vs pinning.** No se pueden tener los dos. Elijan.