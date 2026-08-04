# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this isolated Pet Condor LP project.

## Proyecto: Pet Condor LP Rebuild

**Objetivo:** Construir la landing page de **pet.condor.com.br** (campaña *Mês Pet* /
*Cãocurso* de la rede Condor) usando Astro + Tailwind CSS + React.

**Stack:** Astro 7.x (`output: 'server'` + `@astrojs/vercel`) | React 19 | Tailwind CSS v4 | TypeScript | Node.js ≥22.12.0

**Idioma del sitio:** **portugués de Brasil (pt-BR), 100%.** La documentación está en
español; los textos visibles del sitio, no.

**Estado:** LP realineada al **KV 2026**. Build limpio, `astro check` 0 errores,
render verificado contra la referencia visual.

**Carpeta del Proyecto Central (Referencia):** `/home/diego/armando/Migraciones/petCondor/site`

---

## 🔒 Regla de Precedencia

La campaña **cambió de KV en 2026**: el arte de 2025 era naranja, el de 2026 es
azul / ciano / lavanda. Los bloques de la página son los mismos; cambiaron los
assets, los colores y parte del copy.

Manda, en este orden:

1. **`docs/Desktop - CãoCurso.png`** (1366×8000) — el arte aprobado de 2026. Es la
   referencia visual: layout, colores, tipografía y qué es imagen y qué es texto.
2. **`docs/LP Cão Curso.docx`** — el briefing de contenido de 2026 (fechas, textos,
   lista de patrocinadores). **Si el .docx y el PNG discrepan en un dato de contenido,
   gana el .docx** (así se resolvió el período de inscripción: 03/08, no 10/08).
3. **`docs/GROUND_TRUTH.md`** — describe la LP de **2025**. Sigue siendo útil para
   entender de dónde viene el proyecto, pero **su paleta, sus assets y su
   especificación de formulario ya no aplican**. No lo tomes como fuente de verdad
   para el rebuild 2026.

`docs/petCondor.png` (el screenshot de 2025) fue eliminado del repo.

---

## 📚 Documentación Disponible en Esta Carpeta

**Comienza con:** `docs/Desktop - CãoCurso.png` + `docs/LP Cão Curso.docx` 🎯

### Vigente para 2026
1. **Desktop - CãoCurso.png** 🎯 — el arte aprobado. Manda sobre todo
2. **LP Cão Curso.docx** 🎯 — briefing de contenido. Manda en fechas, copy y marcas
3. **CLAUDE.md** — este archivo: paleta, assets, formulario, reglas duras
4. **ARQUITECTURA_PLATAFORMA.md** / **FORMS_PLATAFORMA.md** / **FORMULARIOS_ARQUITECTURA.md**
   — a dónde tiene que ir la persistencia del formulario antes de producción
5. **ANIMACIONES_TRANSICIONES.md** — keyframes y movimiento
6. **RESUMEN_EJECUTIVO.md** / **INDICE_DOCUMENTACION.md** — fases y búsqueda rápida

### 📕 Histórico de 2025 — útil como contexto, **no vinculante**
Describen la campaña naranja anterior. Su paleta, sus 105 assets y su formulario de
8 campos **ya no aplican**; si contradicen al arte 2026, se ignoran.

7. **GROUND_TRUTH.md** — cómo era la LP de 2025 (era la fuente de verdad… de 2025)
8. **DESIGN_SYSTEM.md** — colores y tipografía de 2025
9. **WIREFRAMES_DETALLADAS.md** — estructura de los 11 bloques (sigue siendo válida)
10. **FORM_ESPECIFICACION.md** — el modal de 8 campos, ya retirado
11. **CONTENIDO_DATOS.md** — arrays y textos de 2025
12. **REBUILD_LP_PROMPT.md** / **README_DOCUMENTACION_GENERADA.md** — orientación de 2025

---

## ⛔ Reglas Duras

### Paleta permitida (única y cerrada) — KV 2026

Muestreada píxel a píxel de `docs/Desktop - CãoCurso.png`. Vive en
`src/styles/global.css`, a la vez como alias `:root` y como `@theme` de Tailwind v4
(`--color-brand-*`, que genera las clases `bg-brand-blue`, `text-brand-purple`…).

```css
:root {
  --c-blue:        #00419A;  /* títulos, cards de evento, footer, texto sobre lavanda */
  --c-blue-sec:    #2F8FE5;  /* fondo azul: Hero, Adote, Eventos, Requisitos, Protetoras */
  --c-blue-deep:   #005BAA;  /* zona oscura del degradado del hero */
  --c-purple:      #C38ADB;  /* fondo lavanda: 29-Agosto, Atrações, Formulário, Galeria, Patrocínio */
  --c-purple-deep: #823D9B;  /* blob de la banda Cãocurso */
  --c-cyan:        #3FAFC8;  /* banda Cãocurso (normalmente cubierta por bg-caocurso.webp) */
  --c-orange-pan:  #FFAF1C;  /* panel "Requisitos para adoção" */
  --c-orange-lite: #FFBB3E;  /* card amarilla de la Galeria */
  --c-white:       #FFFFFF;
  --c-red:         #E20614;  /* errores de validación */
}
```

Cualquier otro HEX está prohibido, **y también las utilidades de color por defecto de
Tailwind** (`text-yellow-300`, `bg-purple-50`, `text-gray-600`…): usa los tokens
`brand-*` o `var(--c-*)`. Única excepción documentada: los colores de marca de las
redes sociales, confinados a `src/components/icons/IconeSocial.astro` — un Facebook
repintado de azul corporativo deja de ser Facebook.

Los verdes/rosas/morados de la franja separadora viven dentro de
`pattern-horizontal.svg`, no son tokens del sistema.

**Contraste heredado del KV:** cuatro combinaciones del arte original no llegan a
WCAG AA (nav blanco sobre el azul del hero 3,40; «Em três datas,» azul sobre azul
2,78; «14h às 18h» blanco sobre lavanda 2,63; texto pequeño azul sobre lavanda 3,59).
Se replicaron tal cual porque manda el arte. Si Condor necesita cumplir AA, hay que
retocar la paleta del KV — es decisión de diseño, no un defecto de implementación.

### Tipografía

**Torus** (Paulo Goode), **self-hosted** desde `assets/fonts/`, 6 pesos (Thin, Light,
Regular, SemiBold, Bold, Heavy) convertidos a `.woff2`.
**Prohibido** Montserrat, Inter o cualquier Google Font para el display.

```css
:root { --font-display: 'Torus', system-ui, sans-serif; }
```

### Endpoint del formulario

- **`POST /api/inscricao`** con **`multipart/form-data`** (`petFoto` es un archivo y no
  cabe en un body JSON).
- Requiere `output: 'server'` + un adapter SSR en `astro.config.mjs`, o las rutas API no
  se ejecutan. **Adapter actual: `@astrojs/vercel`** (antes era `@astrojs/node`; la doc
  de `docs/` todavía menciona el de node en varios sitios).
- **Astro 7 rechaza los POST sin `Origin` propio** (protección CSRF por defecto). Desde
  el navegador funciona solo; desde `curl` hay que mandar
  `-H "Origin: http://localhost:4321"` o recibes un **403**, no un error de validación.
- El `<form>` envía por `fetch()` y pinta la respuesta en la página; si el JS falla,
  el POST nativo sigue funcionando.
- **`/api/feedback` NO sirve aquí:** pertenece a la documentación interna del proyecto
  central, exige `pageId` + `content` y devuelve **400** con el payload de inscripción.

⚠️ **Bloqueante conocido para producción:** el endpoint persiste con `fs` en `uploads/`.
En Vercel el sistema de archivos de una función es de sólo lectura salvo `/tmp`, y
`/tmp` es efímero y por instancia: desplegado, `fs.mkdir` falla y responde **500**, y la
deduplicación por tutor+pet tampoco puede funcionar porque cada instancia vería su
propio fichero. Antes de abrir el formulario al público hay que mover la foto a un blob
store y la ficha a una base de datos (ver `docs/ARQUITECTURA_PLATAFORMA.md` y
`docs/FORMS_PLATAFORMA.md`).

### Nav + los 11 bloques de la página

```
Nav (no numerado)
1 Hero · 2 Adote um AuMigo · 3 Eventos · 4 Requisitos · 5 Protetoras ·
6 Cãocurso · 7 «29 de agosto» · 8 Atrações · [Formulário] · 9 Galeria ·
10 Patrocínio/Apoio · 11 Footer
```

Con **4 franjas separadoras** (`<Faixa />`): tras el Hero, tras Adote um AuMigo, antes
de la banda Cãocurso y después de ella.

- **Nunca omitir Nav, Protetoras ni Patrocínio/Apoio.**
- El **Hero mide exactamente una pantalla** en todo dispositivo: `--hero-h`
  (= `100svh` − `--nav-h` − `--faixa-h`), definido en `global.css`. Se le resta
  también la franja para que el cintillo de tiles **entre en la primera pantalla**:
  hero + cintillo suman el alto justo del dispositivo. Las tres imágenes llevan tope
  de alto —`w-[min(<arte>,<px>,<factor de --hero-h>)]`— o en pantallas bajas se
  saldrían. A 1366×768 y 1920×1080 esos topes no llegan a activarse y el bloque sale
  con las medidas del mockup. Sus dos columnas dependen de la variante **`fila:`**
  (ancho **y** orientación), no de `md:`: en tablet vertical el mockup deja media
  pantalla vacía y ahí manda el bloque apilado.
- `Requisitos` es **un panel único con 6 bullets en dos columnas**, no tres cards.
- `Eventos` son **2 tarjetas arriba y 1 centrada debajo**, no una fila de tres.
- El bloque 7 se llama `Evento30Agosto.astro` por herencia de 2025, pero en 2026 la
  fecha es el **29 de agosto**. No renombrar el archivo, sí el contenido.
- El formulario va **embebido entre Atrações y Galeria**, no en un modal.

### Assets — nunca sirvas los originales de imprenta

El KV 2026 llega en resolución de imprenta: **684 MB**, con PNG de 17717×7087 px
(`Textura_Halftone.png` pesaba 234 MB ella sola). Servido desde `public/` eso revienta
el deploy. El flujo es:

```
assets-fonte/            originales tal como los entrega marketing. GITIGNORADO, no se sirve.
  ↓  node scripts/optimizar-assets.mjs
public/assets/2026/      WebP al ancho real de uso ×2. 684 MB → 3,5 MB.

assets-fonte/galeria/    fotos del fotógrafo (8192×5464, 236 MB). GITIGNORADO.
  ↓  node scripts/optimizar-assets.mjs   (mismo script, segundo paso)
public/assets/galeria/   WebP a 960 px. 236 MB → 632 KB.
```

Cuando llegue KV nuevo: se deja en `assets-fonte/`, se añade su ancho de salida y su
nombre web en `scripts/optimizar-assets.mjs` y se vuelve a ejecutar. Los nombres de
salida van **sin espacios ni acentos**: viajan dentro de una URL.

Fotos de galería nuevas: se dejan en `assets-fonte/galeria/`, se ejecuta el script (no
hace falta tocarlo, convierte lo que encuentre) y **se revisa el orden del array
`galeria` en `src/data/site.ts`** — cada posición cae en un hueco del mosaico con su
propia proporción. Los 960 px de ancho no son decorativos: los dos huecos verticales
(0,667) recortan una foto apaisada hasta dejarla en 44 % de su ancho.

Otras carpetas servidas:

- `public/assets/images/` — assets de 2025 que **siguen vigentes**, porque el briefing
  dice *«Adote um aumigo: podemos utilizar o KV do ano passado»*: `Selo-Adote-um-Aumigo.png`
  (el lockup) y `Dog.png` (el perro con patas que cruza la franja).
- `public/assets/galeria/` — 12 fotos de la edición 2025, en WebP, **generadas**: no
  se editan a mano, salen de `assets-fonte/galeria/`.
- `public/assets/patrocinadores/` — logos de patrocinio de 2025 que se reutilizan.

⚠️ **Nunca crees `public/Assets/` con A mayúscula.** Existió y convivió con
`public/assets/`: en Linux son dos carpetas, en macOS y en varios sistemas de deploy
son la misma. Todo va en minúscula.

**Prohibido** proponer placeholders de Unsplash o "Partner 1/2/3". Si falta el logo
oficial de una marca, se pinta su nombre como texto y se deja un `// TODO` — poner el
logo de otra empresa es un error de marca, no un apaño de maquetación.

### El formulario: inline, 11 campos, NO es de adopción

El formulario de 2026 va **embebido en la página** (`FormularioInscricao.astro`), no en
un modal. `InscricaoModal.jsx`, la pieza de 8 campos de 2025, fue eliminado.
Su propósito es **registrar UNA mascota con su foto para el concurso Cãocurso**.

Campos, según el briefing (`docs/LP Cão Curso.docx`):

- **Tutor:** `tutorNome`*, `tutorNascimento`, `tutorCpf` (el del Clube Condor),
  `tutorEmail`*, `tutorTelefone`*
- **Pet:** `petNome`*, `petRaca`, `petSexo`, `petDescricao`, **`petFoto`*** (máx. 2 MB)
- `aceiteRegulamento`* — regulamento + autorización de uso de imagen. **No está en el
  arte**; se añadió a petición del cliente porque un concurso con foto lo necesita (LGPD).

(*) obligatorio. `petEspecie` quedó **opcional**: el formulario de 2026 no lo pide.

- **Prohibido** pedir dirección, patio, "¿tienes mascotas?" o documento de identidad:
  eran del formulario de adopción que imaginó la documentación de 2025.
- Se valida contra `docs/Desktop - CãoCurso.png` y el briefing, no contra
  `docs/FORM_ESPECIFICACION.md`, que describe la versión de 8 campos ya retirada.

---

## 🚀 Quick Start

**El proyecto ya está montado y funcionando.** No hay que crearlo de cero.

```bash
npm install          # sólo la primera vez
npm run dev          # http://localhost:4321
npm run build        # build de producción → .vercel/output
vercel dev           # preview del build (astro preview NO sirve .vercel/output)
npx astro check      # 0 errores esperados
```

---

## ✅ Estado de implementación

| Fase | Alcance | Estado |
|------|---------|--------|
| 1 | Config, tokens, Torus self-hosted (6 pesos woff2), `animations.css`, Layout | ✅ hecho |
| 2 | Los 11 bloques + Nav + Footer | ✅ hecho |
| 3 | Formulario inline (11 campos) + `POST /api/inscricao` multipart | ✅ hecho |
| 4 | Transiciones, scroll reveal con fallback sin JS, `prefers-reduced-motion` | ✅ hecho |
| 5 | **Realineado al KV 2026**: paleta, assets optimizados, copy del briefing | ✅ hecho |

**Verificado (2026-07-31):** `astro check` 0/0/0 · `npm run build` limpio ·
`.vercel/output/static` = 14 MB · 31/31 imágenes cargan y ningún recurso da 404 ·
sin scroll horizontal a 360/390/768/1024/1366 · endpoint probado en 5 casos
(201 válido, 400 sin aceite, 409 duplicado, 400 CPF inválido, 400 menor de edad) ·
render comparado píxel a píxel contra `docs/Desktop - CãoCurso.png`.

**Pendiente de que el cliente aporte material** (no es trabajo de código):

1. **4 logos que no existen:** Fancy Feast, MARS Petcare, Caats y Doguitos. Ahora se
   pintan como texto azul. Están en `Z:\Comunicação e Web\2026\Condor\Campanhas\Pet\LOGOS`.
   Ojo: `WHISKAS-LOGO.png` **no** es Fancy Feast y `Logo-Purina-One-Caes.png` **no** es
   Doguitos — así estaban mal asignados antes.
2. **Regulamento 2026:** no hay PDF. El botón está visible y deshabilitado. Al llegar el
   archivo: `regulamentoDisponivel: true` en `src/data/site.ts` y la rama `<a href>` ya
   está escrita.
3. **Protetoras / ONGs:** *«em definição»* según el briefing. Las 3 tarjetas están
   vacías, con el enlace de Instagram listo para activarse cuando lleguen los datos.
4. **Fotos de la galería:** el arte muestra 13 fotos y en el repo hay 12, que además no
   son la misma selección que usó el diseñador.

Ver `docs/RESUMEN_EJECUTIVO.md` para el detalle de cada fase.

---

## 🎯 Archivo de Imagen Referencia

**Ubicación:** `docs/Desktop - CãoCurso.png` (1366×8000)
**Propósito:** Comparación pixel-perfect durante desarrollo
**Uso:** tenerla visible en otra ventana, o partirla en tiras de 1000 px y comparar
banda por banda contra una captura de página completa del render.

**Ojo — dos trampas al comparar:**

- Lo que parece texto suele ser **lettering, y va como imagen**: «ADOTE UM AuMigo»,
  «SEU PET É A ESTRELA / da nossa passarela!» y «e pra gatos também!» son PNG. Imitarlos
  con `font-serif italic` fue exactamente lo que hizo que la página no se pareciera.
  Lo que sí es texto real: «PREÇO BAIXO PRA CACHORRO».
- La **Galeria sale vacía en cualquier captura de página completa**: las fotos son
  `loading="lazy"` y con una ventana gigante el navegador nunca dispara la carga. Hay
  que hacer scroll de verdad antes de capturar. No es un fallo de maquetación.

---

## 🔄 Relación con Central

Esta carpeta es **aislada y autosuficiente**:
- Documentación completa aquí
- Proyecto separado
- Puede divergir de central cuando se mejore

**Central** (`/home/diego/armando/Migraciones/petCondor/site`) es:
- Hub de decisiones
- Fuente de los assets de **2025** y de las fuentes Torus
- Punto de sincronización si es necesario

**Fuentes originales para verificar dudas de 2025:**
- `/home/diego/armando/Migraciones/petCondor/content/html/index.html`
- `/home/diego/armando/Migraciones/petCondor/assets/css/post-683.css`
- `/home/diego/armando/Migraciones/petCondor/assets/fonts/` (Torus TTF ×6)

**Para 2026 la fuente es marketing**, no central: el KV y los logos viven en
`Z:\Comunicação e Web\2026\Condor\Campanhas\Pet\` (subcarpetas `KV`, `Cão Curso\KV`,
`LOGOS` y `Cão Curso\LP\Referência`).

---

## 📁 Estructura Real

```
/home/diego/armando/Sites/petcondor/
├── astro.config.mjs           (output: 'server' + @astrojs/vercel, imageService: false)
├── vercel.json                (framework astro, región gru1 São Paulo)
├── scripts/
│   └── optimizar-assets.mjs   (assets-fonte/ → public/assets/2026/ + galeria/, WebP)
├── assets-fonte/              ⚠️ 684 MB de imprenta + 236 MB de fotos. GITIGNORADO.
├── src/
│   ├── pages/
│   │   ├── index.astro        (MAIN — Nav + los 11 bloques + 4 Faixa)
│   │   └── api/
│   │       └── inscricao.ts   (POST multipart/form-data)
│   ├── components/
│   │   ├── Nav.astro                 (enlaces desktop + drawer móvil)
│   │   ├── Hero.astro                (bloque 1)
│   │   ├── AdoteAumigo.astro         (bloque 2)
│   │   ├── Eventos.astro             (bloque 3 — 2 cards + 1 centrada)
│   │   ├── Requisitos.astro          (bloque 4 — panel + 6 bullets, NO cards)
│   │   ├── Protetoras.astro          (bloque 5 — 3 tarjetas vacías, ONGs sin definir)
│   │   ├── Caocurso.astro            (bloque 6 — banda a sangre)
│   │   ├── Evento30Agosto.astro      (bloque 7 — es el 29 de agosto; nombre heredado)
│   │   ├── Atracoes.astro            (bloque 8 — 4 cards, iconos SVG inline)
│   │   ├── FormularioInscricao.astro (formulario embebido, 11 campos)
│   │   ├── Galeria.astro             (bloque 9 — mosaico 2025)
│   │   ├── Patrocinadores.astro      (bloque 10)
│   │   ├── Footer.astro              (bloque 11)
│   │   ├── Faixa.astro               (franja separadora = pattern-horizontal.svg)
│   │   └── icons/IconeSocial.astro   (insignias de redes, a color de marca)
│   ├── data/
│   │   └── site.ts            (TODOS los datos: nav, eventos, requisitos, protetoras,
│   │                           caocurso, atrações, galeria, patrocinio, apoio, redes)
│   ├── layouts/
│   │   └── Layout.astro       (lang="pt-BR")
│   └── styles/
│       ├── global.css         (tokens 2026 + @font-face Torus ×6 + .faixa + .emerge
│       │                       + --hero-h/--nav-h y la variante fila:)
│       └── animations.css
├── public/
│   ├── fonts/                 (Torus .woff2 ×6, self-hosted)
│   └── assets/
│       ├── 2026/              (KV 2026 optimizado — 3,5 MB)
│       ├── images/            (assets 2025 aún vigentes: AuMigo, Dog.png)
│       ├── galeria/           (12 fotos de la edición 2025, WebP generados)
│       ├── patrocinadores/    (logos reutilizados de 2025)
│       └── docs/2025_Regulamento_Caocurso.pdf
│
└── docs/
    ├── Desktop - CãoCurso.png  🎯 ARTE 2026 — manda sobre todo
    ├── LP Cão Curso.docx       🎯 BRIEFING 2026 — manda en contenido
    ├── ARQUITECTURA_PLATAFORMA.md · FORMS_PLATAFORMA.md · FORMULARIOS_ARQUITECTURA.md
    ├── ANIMACIONES_TRANSICIONES.md · INDICE_DOCUMENTACION.md · RESUMEN_EJECUTIVO.md
    └── 📕 de 2025 (histórico): GROUND_TRUTH.md · DESIGN_SYSTEM.md ·
        WIREFRAMES_DETALLADAS.md · FORM_ESPECIFICACION.md · CONTENIDO_DATOS.md ·
        REBUILD_LP_PROMPT.md · README_DOCUMENTACION_GENERADA.md
```

---

## ✅ Antes de Empezar

- [ ] Abrir `docs/Desktop - CãoCurso.png` — el arte 2026, manda sobre todo
- [ ] Leer `docs/LP Cão Curso.docx` — el briefing de contenido 2026
- [ ] Leer la sección «Reglas Duras» de este archivo (paleta, assets, formulario)
- [ ] `npm install && npm run dev`
- [ ] Sólo si necesitas contexto histórico: `docs/GROUND_TRUTH.md` describe la LP de 2025

---

## 🎨 Recursos Disponibles

| Recurso | Ubicación | Propósito |
|---------|-----------|-----------|
| **Arte 2026** | `docs/Desktop - CãoCurso.png` | **Manda sobre todo** |
| **Briefing 2026** | `docs/LP Cão Curso.docx` | Manda en datos de contenido |
| Assets 2026 (web) | `public/assets/2026/` | 3,5 MB, listos para servir |
| Assets 2026 (origen) | `assets-fonte/` | 684 MB de imprenta, gitignorado |
| Conversor de assets | `scripts/optimizar-assets.mjs` | origen → WebP web |
| Arquitectura de forms | `docs/ARQUITECTURA_PLATAFORMA.md`, `docs/FORMS_PLATAFORMA.md` | Persistencia real |
| Animaciones | `docs/ANIMACIONES_TRANSICIONES.md` | Transiciones |
| Búsqueda rápida | `docs/INDICE_DOCUMENTACION.md` | Índice |
| Fuentes Torus | `public/fonts/` (origen en `…/petCondor/assets/fonts/`) | 6 pesos woff2 |
| 📕 Docs de **2025** | `GROUND_TRUTH`, `DESIGN_SYSTEM`, `WIREFRAMES_DETALLADAS`, `FORM_ESPECIFICACION`, `CONTENIDO_DATOS` | Contexto histórico. **Su paleta, assets y campos ya no aplican** |

---

## 💡 Notas Importantes

1. **Manda el arte 2026** (`docs/Desktop - CãoCurso.png`); en datos de contenido, manda
   el briefing (`docs/LP Cão Curso.docx`). `GROUND_TRUTH.md` describe 2025.
2. **No cambiar diseño.** Replicar exactamente, no mejorar.
3. **El lettering va como imagen, nunca imitado con fuentes.** Es el error que hubo que
   deshacer: `font-serif italic` no es el logotipo de AuMigo.
4. **Contenido en pt-BR, literal.** Nada de lorem ipsum, nada de español en el sitio.
5. **Formulario crítico.** Inscripción al Cãocurso: 11 campos validados, a
   `POST /api/inscricao` (multipart). No se compara con el sitio de 2025.
6. **Nunca sirvas los originales de imprenta.** Pasan por `scripts/optimizar-assets.mjs`.
7. **Antes de dar por buena una imagen, comprueba que carga.** Media docena de rutas
   apuntaban a `public/Assets/`, una carpeta que ya no existe: `astro check` y el build
   pasan igual, porque un `src` roto no es un error de tipos.
8. **Mobile-first.** Aunque se replica desktop, asegurar mobile desde inicio.

---

## 🔗 Comandos Útiles

```bash
# Desarrollo
npm run dev           # Start server (localhost:4321)

# Verificación
npm run astro check   # TypeScript check

# Build
npm run build         # Production build → .vercel/output (adapter Vercel)
vercel dev            # Preview del build (astro preview NO sirve .vercel/output)

# Reconvertir el KV cuando marketing entregue arte nuevo
node scripts/optimizar-assets.mjs   # assets-fonte/ → public/assets/2026/

# Probar el endpoint de inscripción.
# El -H "Origin: …" es OBLIGATORIO: sin él Astro 7 corta el POST con un 403 (CSRF).
curl -H "Origin: http://localhost:4321" \
     -F "tutorNome=Teste Silva" -F "tutorEmail=a@b.com" -F "tutorTelefone=41999999999" \
     -F "petNome=Rex" -F "aceiteRegulamento=on" -F "petFoto=@pet.jpg" \
  http://localhost:4321/api/inscricao

# Limpieza
rm -rf .astro dist .vercel   # Clean cache/build
rm -rf uploads               # Fichas de prueba del formulario
npm install                  # Reinstall deps
```

---

## 📞 Cuando Necesites Ayuda

1. **¿Cómo se ve?** → `docs/Desktop - CãoCurso.png`
2. **¿Qué dice el copy / las fechas?** → `docs/LP Cão Curso.docx`
3. **¿Qué color / qué asset uso?** → «Reglas Duras» de este archivo
4. **¿Cómo convierto arte nuevo?** → `scripts/optimizar-assets.mjs`
5. **¿Campos del formulario?** → `src/components/FormularioInscricao.astro` + `src/pages/api/inscricao.ts`
6. **¿Dónde va a vivir esto de verdad?** → `docs/ARQUITECTURA_PLATAFORMA.md`, `docs/FORMS_PLATAFORMA.md`
7. **¿Animaciones?** → `docs/ANIMACIONES_TRANSICIONES.md`
8. **¿Cómo era en 2025?** → `docs/GROUND_TRUTH.md` (histórico, no vinculante)

---

## 🎯 Próximo Paso

👉 **Mira** `docs/Desktop - CãoCurso.png` y lee «Reglas Duras» arriba.

👉 **Luego:** `npm run dev` — la LP está construida y alineada al KV 2026.

👉 **Lo que queda no es código:** los 4 logos que faltan, el PDF del regulamento, las
ONGs y la 13ª foto de la galería. Y, antes de abrir el formulario al público, mover la
persistencia fuera del sistema de archivos (ver el aviso del endpoint).

---

**Estado:** ✅ LP alineada al KV 2026, build limpio, render verificado contra el arte.

**Versión:** 3.0 (realineada al KV 2026)

**Última actualización:** 2026-07-31
