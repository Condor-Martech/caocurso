# 🎨 Pet Condor — Design System

Sistema de diseño real del portal **Pet Condor** (`pet.condor.com.br`), campaña **Mês Pet 2025**.

> **Fuente de verdad:** este documento deriva de `GROUND_TRUTH.md`, que a su vez se extrajo de
> `content/html/index.html`, `assets/css/post-683.css`, los 105 assets reales y el screenshot
> `petCondor.png`. Si algo aquí contradice `GROUND_TRUTH.md`, **gana GROUND_TRUTH**.
>
> **Idioma:** todo el **contenido** del sitio es **portugués de Brasil (pt-BR)**, literal.
> La prosa explicativa de este documento está en español.

---

## 🎨 1. Paleta de Colores

### 1.1 Paleta oficial (única permitida)

Valores tomados por frecuencia real de aparición en `post-683.css` y verificados por muestreo de
píxeles sobre `petCondor.png`.

| Muestra | HEX | Token CSS | Frec. en CSS | Uso real en la página |
|---------|-----|-----------|--------------|------------------------|
| 🔵 | `#00419A` | `--c-blue` | 38 | **Color de autoridad.** Títulos de sección (fragmento azul), cards de evento, texto sobre naranja, iconos line-art, bullets de requisitos, título/desc de cards blancas, texto del botón "Encerrado" |
| 🔵 | `#0061B2` | `--c-blue-mid` | 13 | Fondo del **footer**, bordes de botón secundario, acentos |
| 🟠 | `#F09624` | `--c-orange` | 4 | **Fondo base de toda la página** y de casi todas las secciones |
| 🟡 | `#FFBB3E` | `--c-orange-lite` | 3 | **Paneles redondeados**: Requisitos, Atrações, Galeria; y fondo de la sección Patrocínio/Apoio (la barra en sí es **blanca**) |
| 🟡 | `#FDB020` | `--c-orange-deep` | 4 | Acentos y bordes; variante profunda del naranja |
| ⚪ | `#FFFFFF` | `--c-white` | 59 | Cards blancas, texto sobre azul y sobre naranja, reglas finas, iconos sociales |
| ⚫ | `#A8A8A8` | `--c-gray` | 4 | Gris de UI (placeholders, bordes suaves de formulario) |
| ⚫ | `#3E3E3E` | `--c-gray-dark` | 1 | Texto de inputs del formulario |
| 🔴 | `#E20614` | `--c-red` | 2 | Alertas / errores de validación |

```css
:root {
  /* Azules — autoridad de marca */
  --c-blue:        #00419A;
  --c-blue-mid:    #0061B2;

  /* Naranjas — el fondo de toda la página */
  --c-orange:      #F09624;
  --c-orange-lite: #FFBB3E;
  --c-orange-deep: #FDB020;

  /* Neutros */
  --c-white:       #FFFFFF;
  --c-gray:        #A8A8A8;
  --c-gray-dark:   #3E3E3E;

  /* Alerta */
  --c-red:         #E20614;
}
```

**Tailwind v4 (`@theme` en `global.css`):**

```css
@theme {
  --color-blue-brand:  #00419A;
  --color-blue-mid:    #0061B2;
  --color-orange:      #F09624;
  --color-orange-lite: #FFBB3E;
  --color-orange-deep: #FDB020;
  --color-gray-brand:  #A8A8A8;
  --color-gray-dark:   #3E3E3E;
  --color-red-brand:   #E20614;
}
```

### 1.2 Verificación cruzada por muestreo de píxeles

| Zona del screenshot | Hex medido | Token asignado |
|---------------------|-----------|----------------|
| Fondo hero | `#EE9120` | `--c-orange` |
| Card de evento | `#00419A` | `--c-blue` |
| Panel de requisitos | `#FFBB45` | `--c-orange-lite` |
| Card de protetora | `#FFFFFF` | `--c-white` |
| Barra de patrocinadores | `#FFBB3E` | `--c-orange-lite` |
| Footer | `#0061B2` | `--c-blue-mid` |

> Las mínimas diferencias (`#EE9120` vs `#F09624`, `#FFBB45` vs `#FFBB3E`) son compresión JPEG/PNG
> del screenshot. **Usar siempre el valor del CSS**, no el medido.

### 1.3 ⛔ Colores que se creyeron y NO existen

Esta tabla existe **para que nadie los reintroduzca**. Ninguno de estos aparece en el CSS
original ni en los assets como token de sistema.

| HEX inventado | Se decía que era | Realidad |
|---------------|------------------|----------|
| `#F5A623` | "naranja dorado principal" | ❌ El naranja real es `#F09624` |
| `#003D82` | "azul oscuro de marca" | ❌ El azul real es `#00419A` |
| `#00BCD4` | "turquesa de acento" | ❌ No existe. Sólo aparece dentro de la **imagen** `Pattern.png` |
| `#E91E63` | "magenta de acento" | ❌ No existe como token. Sólo dentro de `Pattern.png` y de la imagen `Txt@2x-1.png` |
| `#4CAF50` | "verde positivo" | ❌ No existe. Sólo dentro de `Pattern.png` |
| `#F44336` | "rojo de alerta" | ❌ El rojo real es `#E20614` |
| `#9C27B0` | "violeta decorativo" | ❌ No existe. Sólo dentro de `Pattern.png` |
| `#F5F5F5` / `#F9F9F9` | "fondos alternos claros" | ❌ No hay fondos grises. La página es **casi toda naranja**; el blanco sólo en cards |
| `#333` / `#666` / `#999` | "escala de grises de texto" | ❌ Los únicos grises son `#A8A8A8` y `#3E3E3E`, y sólo en el formulario |

> ⚠️ **Regla dura:** los verdes / rosas / morados de la franja separadora viven **dentro de un
> PNG**, no en CSS. **No son tokens.** Nunca declararlos como variables ni usarlos en componentes.

---

## ✍️ 2. Tipografía

### 2.1 La fuente de marca: **Torus**

**Torus** (Paulo Goode) — geométrica redondeada. Es la **única** familia de display del sitio.

```
/home/diego/armando/Migraciones/petCondor/assets/fonts/
├── Paulo-Goode-Torus-Thin.ttf       →  weight 100
├── Paulo-Goode-Torus-Light.ttf      →  weight 300
├── Paulo-Goode-Torus-Regular.ttf    →  weight 400   ← el más usado (cuerpo)
├── Paulo-Goode-Torus-SemiBold.ttf   →  weight 600   ← el más usado (títulos)
├── Paulo-Goode-Torus-Bold.ttf       →  weight 700
└── Paulo-Goode-Torus-Heavy.ttf      →  weight 900
```

> ⛔ **PROHIBIDO**: Montserrat, Inter, Roboto, Roboto Slab, Gotham o cualquier Google Font como
> display. Montserrat/Roboto/Roboto Slab **sí** aparecen en `post-683.css`, pero son **defaults
> filtrados de Elementor** (incluido el nav, que declara Montserrat por descuido del tema).
> En el rebuild **todo va en Torus**, incluido el nav.

En el CSS original, `font-family:"Torus", Sans-serif` aparece **26 veces**, siempre con
`font-weight: 600` (títulos) o `font-weight: 400` (cuerpo). Esos son los dos pesos de trabajo.

### 2.2 Cómo self-hostearla

**Paso 1 — Convertir TTF → WOFF2** (≈70 % menos peso, y es el único formato necesario en 2025):

```bash
# Instalar el conversor (una vez)
pip install fonttools brotli

# Convertir los 6 pesos
mkdir -p /home/diego/armando/Sites/petcondor/public/fonts
cd /home/diego/armando/Migraciones/petCondor/assets/fonts
for f in Paulo-Goode-Torus-*.ttf; do
  pyftsubset "$f" \
    --output-file="/home/diego/armando/Sites/petcondor/public/fonts/${f%.ttf}.woff2" \
    --flavor=woff2 \
    --layout-features='*' \
    --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
done
```

> El rango unicode incluye **Latin-1 Supplement**, obligatorio para pt-BR: `ã ç õ é ê á í ú â`
> (`Cãocurso`, `Adoção`, `Água Verde`, `Atrações`, `Petfotos`, `direitos`).
> Verificar siempre que **`Cãocurso` y `Adoção` renderizan** antes de dar por buena la conversión.

**Paso 2 — `@font-face` en `src/styles/global.css`:**

```css
@font-face {
  font-family: 'Torus';
  src: url('/fonts/Paulo-Goode-Torus-Thin.woff2') format('woff2');
  font-weight: 100;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/fonts/Paulo-Goode-Torus-Light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/fonts/Paulo-Goode-Torus-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/fonts/Paulo-Goode-Torus-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/fonts/Paulo-Goode-Torus-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/fonts/Paulo-Goode-Torus-Heavy.woff2') format('woff2');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-display: 'Torus', system-ui, -apple-system, 'Segoe UI', sans-serif;
}

html, body { font-family: var(--font-display); }
```

**Paso 3 — Preload de los dos pesos críticos** en `Layout.astro` (`<head>`):

```html
<link rel="preload" href="/fonts/Paulo-Goode-Torus-SemiBold.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/Paulo-Goode-Torus-Regular.woff2" as="font" type="font/woff2" crossorigin />
```

`font-display: swap` es obligatorio: el hero es la primera pintura y no puede quedar invisible
esperando la fuente.

### 2.3 Escala tipográfica observada

Medida sobre el screenshot real a 1920 px de ancho.

| Elemento | Tamaño | Peso | Color | Notas |
|----------|--------|------|-------|-------|
| Título de sección (`Em quatro datas,…`) | 40–44 px | 600 | **bicolor** azul + blanco | Centrado, dos fragmentos |
| Fecha de evento (`2 AGOSTO`) | 28 px | 700 | `--c-white` | Mayúsculas, regla blanca debajo |
| Detalle de evento (venue / horario) | 16 px | 400 | `--c-white` | |
| `30 AGOSTO` | 32 px | 700 | `--c-blue` | Regla blanca debajo |
| Título de card (`Camarim`, `Petfotos`…) | 16 px | 700 | `--c-blue` | |
| Descripción de card | 13 px | 400 | `--c-blue` | |
| Bullets de requisitos | 14 px | 400 | `--c-blue` | Dos columnas |
| Nav (`Home`, `Adote um Aumigo`…) | 18 px | 600 | `--c-white` | `letter-spacing: -1.4px` |
| Copyright del footer | 13 px | 400 | `--c-white` | |

**Valores declarados literalmente en `post-683.css`** (para cotejar; Elementor los declara sin
escalar, y el navegador los reduce por `--content-width` y por los media queries):

```
64px · 56px · 55px · 50px · 48px · 46px · 42px · 41px · 36px · 32px · 30px
27px · 24px · 22px · 20px · 18px · 16px
1.6rem · 1.3rem (el más frecuente) · 1.2rem · 1.1rem
```

> Cuando haya duda entre el valor declarado y el observado, **manda el observado**: es lo que se
> ve en `petCondor.png` y es contra lo que se compara pixel-perfect.

**Escala de trabajo sugerida (tokens):**

```css
:root {
  --fs-hero:      clamp(2.25rem, 3.4vw, 3.5rem);   /* 36 → 56px */
  --fs-section:   clamp(1.75rem, 2.6vw, 2.75rem);  /* 28 → 44px */
  --fs-date:      clamp(1.375rem, 1.8vw, 1.75rem); /* 22 → 28px */
  --fs-lg:        1.3rem;   /* 20.8px — el tamaño Elementor más frecuente */
  --fs-base:      1rem;     /* 16px */
  --fs-sm:        0.875rem; /* 14px */
  --fs-xs:        0.8125rem;/* 13px */
}
```

---

## 🧩 3. Componentes Base

Todos derivados de lo que **realmente existe** en la página. Nada inventado.

### 3.1 Card de evento (`EventCard`)

Las 4 cards de la sección **Eventos**, en grid 2×2.

```
┌──────────────────────────────────┐  fondo #00419A
│                                  │
│  2 AGOSTO                        │  28px / 700 / blanco
│  ────────────────────            │  regla blanca fina (1px, ~40% ancho)
│                                  │
│  Condor Araucária BR             │  16px / 400 / blanco
│  11h às 15h                      │  16px / 400 / blanco
│                                  │
└──────────────────────────────────┘  radius ~12px
```

```css
.event-card {
  background: var(--c-blue);
  border-radius: 12px;
  padding: 24px 28px;
  color: var(--c-white);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.event-card__date {
  font-size: 28px;
  font-weight: 700;
  text-transform: uppercase;
  padding-bottom: 10px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.9);
}
.event-card__venue,
.event-card__time {
  font-size: 16px;
  font-weight: 400;
}
```

**Contenido real (pt-BR), no inventar:**

| Fecha | Local | Horário |
|-------|-------|---------|
| `2 AGOSTO` | `Condor Araucária BR` | `11h às 15h` |
| `9 AGOSTO` | `Condor Nilo Peçanha` | `11h às 15h` |
| `16 AGOSTO` | `Condor Água Verde` | `11h às 15h` |
| `23 AGOSTO` | `Condor Campo Comprido` | `11h às 15h` |

> ⛔ Nunca `9 · 9 · 16 · 23`, nunca `11h às 13h`, nunca "Clínica Amigos Ñ".

---

### 3.2 Panel de sección (`SectionPanel`)

El patrón que usan **Requisitos**, **Atrações** y **Galeria**: un solo bloque amarillo con
esquinas muy redondeadas, apoyado sobre el naranja de la página.

```
╭────────────────────────────────────────────────────╮   fondo #FFBB3E
│                                                    │   radius 20px (25px en paneles grandes)
│           Requisitos para adoção:                  │   H2 azul, centrado
│                                                    │
│   – Ter, no mínimo, 21 anos;    – Assinar e con…   │   2 columnas, texto azul
│   – Portar RG, CPF e compro…    – Ter condições…   │
│   – Responder a uma entrevi…    – Ter local segu…  │
│                                                    │
╰────────────────────────────────────────────────────╯
```

```css
.section-panel {
  background: var(--c-orange-lite);
  border-radius: 20px;      /* 25px para Galeria y Atrações (paneles grandes) */
  padding: 40px 48px;
  color: var(--c-blue);
}
.section-panel__title {
  font-size: clamp(1.5rem, 2.2vw, 2rem);
  font-weight: 600;
  color: var(--c-blue);
  text-align: center;
  margin-bottom: 28px;
}
.section-panel__list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 48px;
  font-size: 14px;
  color: var(--c-blue);
}
```

> ⚠️ **Requisitos es UN SOLO panel con 6 bullets en dos columnas.**
> No son tres cards con iconos. Los 6 bullets literales van en `CONTENIDO_DATOS.md`.

Radios reales encontrados en `post-683.css`: `20px` (22 usos), `16px` (9), `31px` (4),
`25px` (2), `32px` (1), `30px` (1).

---

### 3.3 Card blanca (`WhiteCard`) — Protetoras y Atrações

Misma anatomía en las dos secciones; cambia sólo el contenido interior.

```
┌────────────────────────┐  fondo #FFFFFF
│                        │  radius 16px
│         ╭─╮            │  icono line-art azul #00419A, ~48px
│         ╰─╯            │  (Protetoras: logo de la ONG en vez del icono)
│                        │
│      Camarim           │  16px / 700 / azul
│  Seu PetStar merece    │  13px / 400 / azul
│    esse trato!         │
│                        │
└────────────────────────┘
```

```css
.white-card {
  background: var(--c-white);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  color: var(--c-blue);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.white-card__icon {
  width: 48px;
  height: 48px;
  color: var(--c-blue);   /* line-art: stroke currentColor, sin relleno */
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.white-card__title { font-size: 16px; font-weight: 700; color: var(--c-blue); }
.white-card__desc  { font-size: 13px; font-weight: 400; color: var(--c-blue); }
```

**Atrações (3 cards, contenido literal pt-BR):**

| Título | Descripción | Asset |
|--------|-------------|-------|
| `Camarim` | `Seu PetStar merece esse trato!` | `Capa-1.png` |
| `Caricaturista` | `Não perca essa fofura.` | `Capa-1@2x.png` |
| `Petfotos` | `Que tal uma foto impressa com seu pet?` | `eIOE-8@2x.png` |

**Protetoras (3 cards, logo + nombre + icono Instagram):**

| Nombre | Instagram | Asset |
|--------|-----------|-------|
| `Instituto Seres & Vidas` | `instagram.com/seres_vidas/` | `InstitutoSeres-e-vidas.png` |
| `Instituto SOS 4 Patas PR` | `instagram.com/sos4patas.pr/` | `sos-4-patas.png` |
| `Marcia Santos Protetora de Animais` | `instagram.com/marciasantos.protetora/` | `Marcia-Protetora-300x161.jpg` |

> ⛔ Nunca "Juego / Premios / Talleres". Nunca "Partner 1 / 2 / 3". Nunca Unsplash.

---

### 3.4 Botón píldora blanco — `Encerrado`

El bloque grande de la sección **30 AGOSTO** (columna derecha). Es un estado, no un CTA activo:
la inscripción ya cerró.

```
     ╭──────────────────────────────╮
     │          Encerrado           │   texto #00419A
     ╰──────────────────────────────╯   fondo #FFFFFF, píldora
```

```css
.btn-pill-white {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--c-white);
  color: var(--c-blue);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.4vw, 2.25rem);
  font-weight: 600;
  padding: 20px 56px;
  border: 1px solid var(--c-white);
  border-radius: 31px;      /* valor real del CSS original */
  cursor: default;
}
```

- Etiqueta literal: **`Encerrado`** (pt-BR, una sola palabra, capitalizada así).
- No lleva hover ni link: representa un estado terminado.
- Si se marca semánticamente como `<button>`, debe ir `disabled` + `aria-disabled="true"`.

---

### 3.5 Botón pequeño azul — `Confira o regulamento`

En la columna izquierda de **30 AGOSTO**, bajo el bloque de datos. Enlaza al PDF real.

```
  ╭──────────────────────────────╮
  │   Confira o regulamento      │   texto/icono #00419A, borde #0061B2
  ╰──────────────────────────────╯
```

```css
.btn-sm-blue {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--c-blue);
  fill: var(--c-blue);
  background: var(--c-white);
  border: 1px solid var(--c-blue-mid);
  border-radius: 32px;      /* valor real del CSS original */
  padding: 10px 22px;
  transition: background 200ms ease-out, color 200ms ease-out;
}
.btn-sm-blue:hover {
  background: var(--c-blue);
  color: var(--c-white);
  fill: var(--c-white);
}
```

- Etiqueta literal: **`Confira o regulamento`**.
- Destino: `2025_Regulamento_Caocurso.pdf` (asset real), `target="_blank" rel="noopener"`.

---

### 3.6 Título de sección bicolor (`SectionTitle`)

El recurso tipográfico más característico de la página: **el primer fragmento en azul, el resto
en blanco**, sobre el naranja, centrado, con **regla blanca fina** delimitando el bloque.

```
        ───────────────────────────────────────────      regla blanca 1px
          Em quatro datas,  quatro chances de
             encontrar o amor mais leal.
             └─ azul ──┘   └──── blanco ──────┘
        ───────────────────────────────────────────      regla blanca 1px
```

```astro
---
// SectionTitle.astro
const { lead, rest } = Astro.props;
---
<h2 class="section-title">
  <span class="section-title__lead">{lead}</span>
  <span class="section-title__rest">{rest}</span>
</h2>
```

```css
.section-title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 2.6vw, 2.75rem);  /* 28 → 44px */
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  text-wrap: balance;
}
.section-title__lead { color: var(--c-blue); }
.section-title__rest { color: var(--c-white); }

/* Regla blanca fina que abre y cierra el bloque */
.rule-white {
  border: 0;
  border-top: 1px solid var(--c-white);
  width: 100%;
  margin: 28px 0;
}
```

**Instancia real:** `lead = "Em quatro datas,"` · `rest = "quatro chances de encontrar o amor mais leal."`

La misma regla blanca fina aparece: bajo la fecha dentro de la card de evento, bajo el `30 AGOSTO`,
entre `Confira como foi a edição anterior` y `2024` en Galeria, y al cerrar la sección 30 Agosto.

---

### 3.7 Franja separadora (`PatternStrip`) — ⚠️ corrección crítica

> ## 🚨 **NO SON BARRAS DE COLOR PLANAS.**
>
> Es una **tira a sangre (full-bleed) de tiles cuadrados de ~65 px**, cada uno de un color
> distinto y **cada uno con un icono de pata o de hueso dibujado dentro**. Se implementa
> **con una imagen** (`Pattern.png` / `Pattern@2x.png`) en `repeat-x`.
> No con `linear-gradient`, no con divs de colores, no con emojis.

```
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ 🦴   │ 🐾   │ 🦴   │ 🐾   │ 🦴   │ 🐾   │ 🦴   │ 🐾   │ 🦴   │  ~65px
│azul  │morado│rojo  │lila  │verde │rosa  │naranja│azul │morado│  de alto
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
 └──────── secuencia que se repite horizontalmente, a sangre ────────┘
```

Secuencia de color de los tiles: **azul · morado · rojo · lila · verde · rosa · naranja** (y repite).

**Assets reales:**

| Archivo | Dimensiones |
|---------|-------------|
| `Pattern.png` | 414 × 43 px (1x) |
| `Pattern@2x.png` | 1458 × 150 px (2x, el que se debe usar) |

```css
.pattern-strip {
  width: 100%;
  height: 65px;
  background-image: url('/assets/images/Pattern@2x.png');
  background-repeat: repeat-x;
  background-position: center;
  background-size: auto 65px;   /* fija la altura del tile; el ancho se repite */
  /* full-bleed: escapa del contenedor si hace falta */
  margin-inline: calc(50% - 50vw);
}

@media (max-width: 768px) {
  .pattern-strip {
    height: 44px;
    background-size: auto 44px;
  }
}
```

**Dónde aparece (4 veces):**

1. Entre **Hero** y **Adote um AuMigo**
2. Entre **Adote um AuMigo** y **Eventos** → aquí **las patas del gato (`Gato.png`) cuelgan por
   encima** de la tira, como elemento decorativo superpuesto (`position: absolute; z-index: 2`)
3. Entre **Protetoras** y **Cãocurso**
4. Entre **Cãocurso** y **30 Agosto**

> ⚠️ Los verdes / rosas / morados de estos tiles **viven dentro del PNG**. No son tokens del
> design system y no deben declararse como variables CSS jamás.

---

### 3.8 Nav (header)

```css
.nav__item {
  font-family: var(--font-display);   /* Torus, NO Montserrat */
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -1.4px;
  color: var(--c-white);
}
.nav__item[aria-current="page"]::after,
.nav__item:hover::after {
  content: '';
  display: block;
  height: 2px;
  background: var(--c-white);   /* subrayado blanco del item activo */
}
```

Sin barra de fondo propia: flota sobre el naranja del hero, alineada a la derecha.
Items (pt-BR): `Home` (#) · `Adote um Aumigo` (#adote) · `Cãocurso` (#caocurso) ·
`Galeria` (#galeria) · `Regulamento` (PDF externo).

---

### 3.9 Barra de Patrocínio / Apoio

Una **sola barra blanca redondeada** a todo el ancho, en una sola fila, sobre `--c-orange-lite`.

```css
.sponsor-bar {
  background: var(--c-white);
  border-radius: 20px;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 28px;
}
.sponsor-bar__label {
  color: var(--c-blue);
  font-style: italic;
  font-weight: 600;
  white-space: nowrap;
}
.sponsor-bar img { max-height: 44px; width: auto; object-fit: contain; }
```

Etiquetas literales: **`Patrocínio:`** y **`Apoio:`** (azul, cursiva).
Logos reales — Patrocínio: Friskies · Dog Chow · Natural DOTS · Kelcat · New DOTS · Keldog ·
Purina ONE Cães · Purina ONE Gatos. Apoio: BRF Pet · Whiskas · Pedigree.
Archivos en `GROUND_TRUTH.md §5`. **Nunca "Partner 1/2/3".**

---

### 3.10 Footer

```css
.footer {
  background: var(--c-blue-mid);   /* #0061B2 */
  color: var(--c-white);
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.footer__social a {
  display: inline-flex;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid var(--c-white);
  color: var(--c-white);
  align-items: center; justify-content: center;
}
```

Copyright literal: **`©Condor 2025. Todos os direitos reservados.`** (13px / 400 / blanco).
6 redes: Facebook · Instagram · X · YouTube · LinkedIn · TikTok.

---

## 📐 4. Espaciado, Contenedor y Breakpoints

### 4.1 Escala de espaciado

```css
:root {
  --sp-xs:  4px;
  --sp-sm:  8px;
  --sp-md: 12px;
  --sp-lg: 16px;
  --sp-xl: 24px;
  --sp-2xl: 32px;
  --sp-3xl: 48px;
  --sp-4xl: 64px;
  --sp-5xl: 96px;   /* separación vertical entre bloques mayores */
}
```

- **Ritmo vertical entre bloques:** 64–96 px en desktop, 40–56 px en mobile.
- **Padding interno de panel amarillo:** 40 px vertical / 48 px horizontal (desktop).
- **Gap del grid de eventos (2×2):** 24 px.
- **Gap del grid de galería (4×3):** 12 px.
- **Gap del grid de cards blancas (3 col):** 24 px.

### 4.2 Contenedor

El CSS original trabaja con `--content-width: 94%` (y `100%` en secciones a sangre). Traducción:

```css
.container {
  width: min(94%, 1200px);
  margin-inline: auto;
}
.container--wide { width: 94%; }        /* galería, barra de patrocinadores */
.container--bleed { width: 100%; }      /* hero, franjas separadoras, footer */
```

| Viewport | Ancho útil |
|----------|-----------|
| Desktop ≥1280px | `min(94%, 1200px)` centrado |
| Laptop 1024–1279px | 94 % |
| Tablet 768–1023px | 100 % − 24 px de padding |
| Mobile <768px | 100 % − 16 px de padding |

### 4.3 Breakpoints

El CSS original usa **`480px`, `767/768px` y `1024px`**. Los tokens Tailwind se alinean a eso:

```css
/* sm  → 480px   mobile grande      */
/* md  → 768px   tablet             */
/* lg  → 1024px  laptop             */
/* xl  → 1280px  desktop            */
/* 2xl → 1536px  desktop grande     */
```

**Colapso de grids (mobile-first):**

| Grid | <768px | 768–1023px | ≥1024px |
|------|--------|-----------|---------|
| Eventos | 1 col | 2 col | 2 col (2×2) |
| Requisitos (bullets) | 1 col | 2 col | 2 col |
| Protetoras / Atrações | 1 col | 3 col | 3 col |
| Galería | 2 col | 3 col | **4 col × 3 filas = 12 fotos** |
| Patrocínio/Apoio | wrap libre | wrap libre | 1 sola fila |
| Hero (texto / perro) | apilado | apilado | 2 col |

Galería: fotos en **retrato ~4:5** (no 1:1), gap 12 px, radius 8 px.

---

## ♿ 5. Contraste y Accesibilidad — datos reales, sin maquillaje

Ratios calculados con la fórmula WCAG 2.1 sobre la paleta oficial.
**Umbrales:** AA texto normal **4.5:1** · AA texto grande (≥24 px, o ≥18.66 px bold) **3:1** ·
AAA texto normal **7:1**.

### 5.1 Texto sobre los naranjas — 🚨 el punto débil

| Combinación | Ratio | AA normal | AA grande | Veredicto |
|-------------|-------|:---------:|:---------:|-----------|
| `#00419A` sobre `#F09624` (azul sobre naranja base) | **4.09:1** | ❌ | ✅ | ⚠️ **NO llega a 4.5:1** |
| `#FFFFFF` sobre `#F09624` (blanco sobre naranja base) | **2.31:1** | ❌ | ❌ | 🚨 **Falla incluso para títulos** |
| `#00419A` sobre `#FFBB3E` (azul sobre panel amarillo) | **5.59:1** | ✅ | ✅ | ✅ Cumple |
| `#FFFFFF` sobre `#FFBB3E` | **1.69:1** | ❌ | ❌ | 🚨 Prohibido |
| `#00419A` sobre `#FDB020` | **5.13:1** | ✅ | ✅ | ✅ Cumple |
| `#FFFFFF` sobre `#FDB020` | **1.84:1** | ❌ | ❌ | 🚨 Prohibido |
| `#0061B2` sobre `#F09624` | **2.71:1** | ❌ | ❌ | 🚨 Prohibido |
| `#0061B2` sobre `#FFBB3E` | **3.71:1** | ❌ | ✅ | ⚠️ Sólo texto grande |
| `#E20614` sobre `#FFBB3E` | **2.91:1** | ❌ | ❌ | 🚨 Prohibido para errores |

### 5.2 Texto sobre azul y sobre blanco — aquí todo va bien

| Combinación | Ratio | AA normal | AAA | Veredicto |
|-------------|-------|:---------:|:---:|-----------|
| `#FFFFFF` sobre `#00419A` (card de evento) | **9.45:1** | ✅ | ✅ | ✅ Excelente |
| `#FFFFFF` sobre `#0061B2` (footer) | **6.26:1** | ✅ | ❌ | ✅ Cumple AA |
| `#00419A` sobre `#FFFFFF` (card blanca) | **9.45:1** | ✅ | ✅ | ✅ Excelente |
| `#0061B2` sobre `#FFFFFF` | **6.26:1** | ✅ | ❌ | ✅ Cumple AA |
| `#3E3E3E` sobre `#FFFFFF` (inputs del form) | **10.70:1** | ✅ | ✅ | ✅ Excelente |
| `#E20614` sobre `#FFFFFF` (error del form) | **4.92:1** | ✅ | ❌ | ✅ Cumple AA |
| `#A8A8A8` sobre `#FFFFFF` (placeholder) | **2.38:1** | ❌ | ❌ | ⚠️ Sólo placeholder, nunca contenido |
| `#A8A8A8` sobre `#00419A` | **3.97:1** | ❌ | ✅ | ⚠️ Sólo decorativo |

### 5.3 Qué hacer — honestamente

El diseño original **no cumple AA en dos sitios**, y hay que decirlo:

1. **`#FFFFFF` sobre `#F09624` (2.31:1)** — es la mitad del **título de sección bicolor**, el
   fragmento blanco. Falla incluso el umbral de texto grande.
2. **`#00419A` sobre `#F09624` (4.09:1)** — es el otro fragmento del título, y también los
   textos azules que caen directamente sobre el naranja de la página.

**Mitigaciones, en orden de preferencia (sin romper el pixel-perfect):**

| # | Acción | Coste visual |
|---|--------|--------------|
| 1 | **Mantener el diseño y todo el texto sobre naranja en tamaño grande + peso 600.** Con ≥24 px el azul (4.09:1) supera el umbral AA de texto grande (3:1) y queda conforme. El blanco (2.31:1) sigue sin cumplir. | Ninguno |
| 2 | **Nunca poner texto de párrafo (<18 px) directamente sobre `--c-orange`.** El cuerpo va siempre dentro de un panel `--c-orange-lite` (5.59:1 ✅) o de una card blanca / azul (9.45:1 ✅). Esto ya es lo que hace el sitio real: los bullets, las descripciones y los detalles viven todos dentro de contenedores. | Ninguno |
| 3 | **Para el fragmento blanco del título**, añadir un `text-shadow: 0 1px 3px rgba(0,0,0,.35)` sutil. Sube la legibilidad percibida sin cambiar el color ni el layout. **No sube el ratio WCAG medido** — es una mejora perceptual, no una conformidad. | Casi nulo |
| 4 | **Si el cliente exige conformidad AA estricta**, la única solución real es oscurecer el naranja de fondo a ~`#C87716` (blanco → 4.5:1). **Eso cambia la marca** y sale de la paleta permitida: no hacerlo sin aprobación explícita del cliente. | Alto |

**Documentar la excepción.** En el informe de accesibilidad hay que registrar:
*"El contraste blanco-sobre-naranja del título de sección (2.31:1) es una decisión de marca
heredada del sitio original. Se mitiga con tamaño ≥40 px, peso 600 y sombra sutil. No alcanza
WCAG AA 1.4.3."* Mentir sobre esto es peor que la falla.

### 5.4 Reglas duras de contraste

- ✅ Blanco sobre `--c-blue` o `--c-blue-mid` → **siempre permitido**
- ✅ `--c-blue` sobre blanco, `--c-orange-lite` o `--c-orange-deep` → **siempre permitido**
- ⚠️ `--c-blue` sobre `--c-orange` → **sólo ≥24 px y peso ≥600**
- 🚨 Blanco sobre cualquier naranja → **sólo en el título bicolor**, nunca en cuerpo de texto
- 🚨 `--c-blue-mid` sobre cualquier naranja → **prohibido**
- 🚨 `--c-red` sobre naranja → **prohibido**. Los errores del formulario van sobre blanco (4.92:1 ✅)
- 🚨 `--c-gray` (`#A8A8A8`) nunca para contenido informativo; sólo placeholders y bordes

### 5.5 Accesibilidad más allá del color

- [ ] Foco visible en todo elemento interactivo: `outline: 3px solid var(--c-white); outline-offset: 2px` sobre azul/naranja; `outline: 3px solid var(--c-blue)` sobre blanco
- [ ] Área táctil mínima **44 × 44 px** (iconos sociales del footer: forzar `min-width/min-height`)
- [ ] `alt` descriptivo **en pt-BR** en todas las imágenes de contenido; `alt=""` + `aria-hidden` en las decorativas (círculos flotantes, franja separadora)
- [ ] `Pattern.png` es puramente decorativo → `role="presentation"` / `aria-hidden="true"`
- [ ] Textos que son imágenes → `alt` con el texto literal completo, en pt-BR:
      · `Titulo-1024x477.png` → `"NO MÊS DO PET, TEM PREÇO BAIXO PRA CACHORRO. e pra gatos também!"`
      (⛔ nunca "PARA QUEM AMA")
      · `Txt@2x-1.png` → `"Seu pet é a estrela da nossa passarela."`
      (⛔ nunca "astreio" / "pasarela")
- [ ] `lang="pt-BR"` en `<html>`
- [ ] `prefers-reduced-motion: reduce` → desactivar animaciones de entrada y flotación de círculos
- [ ] Navegación por teclado completa en el modal de **inscripción al Cãocurso** (focus trap +
      `Esc` para cerrar); el input `file` de `petFoto` debe ser alcanzable y etiquetado

---

## 🎬 6. Transiciones y Estados

| Elemento | Duración | Easing | Efecto |
|----------|----------|--------|--------|
| Hover botón azul pequeño | 200 ms | `ease-out` | Invierte fondo/texto |
| Hover card blanca | 300 ms | `ease-out` | `translateY(-4px)` + sombra suave |
| Hover foto de galería | 250 ms | `ease-out` | `scale(1.04)` con `overflow:hidden` en el marco |
| Hover icono social | 200 ms | `ease-out` | Fondo blanco, icono `--c-blue-mid` |
| Entrada de sección | 400 ms | `ease-in-out` | Fade + `translateY(16px)`, vía `IntersectionObserver` |

**Estados:**

- **Default** — color base, sin sombra o sombra mínima
- **Hover** — cambio de fondo/elevación, `cursor: pointer`
- **Focus-visible** — outline de 3 px (ver §5.5), **nunca** `outline: none` sin sustituto
- **Active** — `transform: scale(0.98)`
- **Disabled** — `opacity: .55`, `cursor: not-allowed`, `aria-disabled="true"` (caso `Encerrado`)

> Detalles completos de keyframes en `ANIMACIONES_TRANSICIONES.md` (Fase 4).

---

## 🖼️ 7. Iconografía y Elementos de Marca

### Iconografía

- **Estilo:** **line-art**, trazo abierto, sin relleno (`fill: none; stroke: currentColor`)
- **Color:** **`--c-blue`** sobre blanco; **`--c-white`** sobre azul. Nada más.
- **Tamaños:** 24 px (nav/social), 36 px (footer social), 48 px (cards de Atrações)
- ⛔ **No** iconos "flat coloridos" multicolor. Los únicos elementos multicolor de la página son
  los círculos flotantes del hero y los tiles de `Pattern.png`, y **son imágenes**.

### Logos y mascotas (assets reales)

| Elemento | Archivo | Ubicación |
|----------|---------|-----------|
| Logo Mês Pet | `Selo.png` / `Selo@2x.png` | Hero, izquierda |
| Título del hero | `Titulo.png` / `Titulo-1024x477.png` | Hero, izquierda |
| Chihuahua | `Pet-2.png` | Hero derecha + Cãocurso derecha |
| Perro de adopción | `Dog.png` | Adote um AuMigo, izquierda |
| Gato (patas colgando) | `Gato.png` | Superpuesto a la franja separadora #2 |
| Logo Adote um AuMigo | `Selo-Adote-um-Aumigo.png` | Adote um AuMigo, derecha |
| Logo Cãocurso | `Selo@2x-1024x791.png` | Cãocurso, izquierda |
| Tagline Cãocurso | `Txt@2x-1.png` | Cãocurso (es **imagen**, magenta con contorno blanco) |
| Logo Condor | `Logo-Grande.png` | Footer, izquierda (blanco) |

Los **círculos de colores flotantes** del hero (pata, hueso, perro, comedero) son decoración
posicionada en absoluto alrededor del `Pet-2.png`. Son imágenes, no CSS.

> ⛔ **Los 105 assets ya existen** en
> `/home/diego/armando/Migraciones/petCondor/site/public/assets/images/`.
> Prohibido Unsplash, prohibido `placeholder.com`, prohibido "Partner 1/2/3".

---

## 🎯 8. Tono Visual

- **Amigable y cálido** — geométrica redondeada (Torus), esquinas muy redondeadas, naranja dominante
- **Autoridad de marca en azul** — todo lo informativo y estructural es `#00419A`
- **Lúdico pero ordenado** — las franjas de patas/huesos aportan juego; el resto es rejilla limpia
- **Contraste alto dentro de contenedores** — el texto siempre vive dentro de un panel o card, nunca suelto sobre el naranja en tamaño pequeño
- **Densidad baja** — máximo 2–3 elementos principales por bloque, mucho aire vertical

---

## ✅ 9. Checklist de Implementación

### Paleta
- [ ] Las 9 variables CSS (`--c-*`) declaradas en `global.css`
- [ ] Bloque `@theme` de Tailwind v4 con los 8 colores de marca
- [ ] `grep -riE '#(F5A623|003D82|00BCD4|E91E63|4CAF50|F44336|9C27B0|F5F5F5|F9F9F9)' src/` → **0 resultados**
- [ ] Ningún verde / rosa / morado declarado como variable (sólo dentro de `Pattern.png`)

### Tipografía
- [ ] Los 6 TTF de Torus convertidos a `.woff2` en `public/fonts/`
- [ ] 6 bloques `@font-face` con `font-display: swap` y los pesos 100/300/400/600/700/900
- [ ] `preload` de SemiBold (600) y Regular (400) en `<head>`
- [ ] `grep -riE 'Montserrat|Inter|fonts.googleapis|fonts.gstatic' src/` → **0 resultados**
- [ ] `Cãocurso`, `Adoção`, `Água Verde`, `Atrações` renderizan con los acentos correctos
- [ ] Nav en **Torus** 18px/600/`letter-spacing:-1.4px`, no Montserrat

### Componentes
- [ ] `EventCard` — `#00419A`, radius 12px, fecha 28px/700 + regla blanca debajo, venue + horario
- [ ] Los 4 eventos con datos reales (2/9/16/23 AGOSTO · `11h às 15h` · las 4 tiendas Condor)
- [ ] `SectionPanel` — `#FFBB3E`, radius 20–25px (Requisitos, Atrações, Galeria)
- [ ] Requisitos = **1 panel con 6 bullets en 2 columnas**, no 3 cards
- [ ] `WhiteCard` — blanco, radius 16px, icono line-art azul 48px, título azul 700, desc azul 400
- [ ] `btn-pill-white` `Encerrado` — blanco, texto `#00419A`, radius 31px, `aria-disabled`
- [ ] `btn-sm-blue` `Confira o regulamento` → `2025_Regulamento_Caocurso.pdf`
- [ ] `SectionTitle` bicolor (lead azul + rest blanco) + `rule-white` 1px
- [ ] `PatternStrip` con `Pattern@2x.png` `repeat-x`, 65px, full-bleed, ×4 en la página
- [ ] `Gato.png` superpuesto sobre la franja #2

### Layout
- [ ] Contenedor `min(94%, 1200px)`, variantes `--wide` y `--bleed`
- [ ] Breakpoints 480 / 768 / 1024 / 1280 / 1536
- [ ] Galería 4×3 = 12 fotos reales, retrato ~4:5, gap 12px
- [ ] Todos los grids colapsan según la tabla §4.3
- [ ] Sin scroll horizontal en ningún breakpoint (probar 320px)

### Los 11 bloques presentes y en orden
- [ ] 1 Nav · 2 Hero · 3 Adote um AuMigo · 4 Eventos · 5 Requisitos · 6 **Protetoras** ·
      7 Cãocurso · 8 30 Agosto · 9 Atrações · 10 Galeria · 11 **Patrocínio/Apoio** + Footer

### Contraste
- [ ] Auditoría con los ratios de §5.1–5.2 verificados en la implementación real
- [ ] Ningún texto <18px directamente sobre `--c-orange`
- [ ] Errores del formulario en `#E20614` **sobre fondo blanco**, nunca sobre naranja
- [ ] Excepción de `blanco sobre #F09624` (2.31:1) documentada en el informe, no ocultada
- [ ] Foco visible en el 100 % de los interactivos
- [ ] `lang="pt-BR"` en `<html>`

### Contenido
- [ ] 100 % del copy en **pt-BR literal** (cotejado contra `CONTENIDO_DATOS.md` y `GROUND_TRUTH.md`)
- [ ] Cero lorem ipsum, cero español en la UI
- [ ] Los 105 assets reales referenciados; cero placeholders externos
- [ ] Copyright: `©Condor 2025. Todos os direitos reservados.`
- [ ] Formulario = **inscripción al concurso Cãocurso** (no adopción) → **`POST /api/inscricao`**
      con **`multipart/form-data`** (obligatorio: `petFoto` es un archivo, no cabe en JSON),
      Astro con `output: 'server'` + `@astrojs/node` (ver `FORM_ESPECIFICACION.md`)
- [ ] **`/api/feedback` NO se usa**: es el endpoint de feedback del proyecto central y devuelve
      400 con el payload de inscripción

---

## 📚 Referencias

| Necesitas | Documento |
|-----------|-----------|
| Verdad absoluta sobre cualquier dato | **`GROUND_TRUTH.md`** ← gana siempre |
| Estructura y dimensiones por sección | `WIREFRAMES_DETALLADAS.md` |
| Textos, arrays y assets literales | `CONTENIDO_DATOS.md` |
| Campos, validación y endpoint del formulario | `FORM_ESPECIFICACION.md` |
| Keyframes y movimiento | `ANIMACIONES_TRANSICIONES.md` |
| Fases y cronograma | `RESUMEN_EJECUTIVO.md` |

**Fuentes primarias:**
- `/home/diego/armando/Migraciones/petCondor/content/html/index.html`
- `/home/diego/armando/Migraciones/petCondor/assets/css/post-683.css`
- `/home/diego/armando/Migraciones/petCondor/assets/fonts/` (6 TTF de Torus)
- `/home/diego/armando/Migraciones/petCondor/site/public/assets/images/` (105 assets)
- `petCondor.png` (screenshot 1920×7478 — ignorar la barra de admin de WordPress)

---

**Última verificación:** 2026-07-29 · contra HTML + CSS + assets + screenshot originales.
