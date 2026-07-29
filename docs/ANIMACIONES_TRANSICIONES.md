# Animaciones y Transiciones - Pet Condor LP

> **Fuente de verdad:** `GROUND_TRUTH.md`. Todos los colores de este documento son tokens
> reales de la marca Condor. El original (WordPress + Elementor) prácticamente **no anima
> nada**: sólo aparece `transition: all 0.3s` genérico de Elementor. Todo lo que sigue es
> una capa de refinamiento **opcional y sutil** para el rebuild, nunca un cambio de diseño.

## Principios de Animación

- **Duración estándar:** 200-300ms
- **Easing:** ease-out para entrada, ease-in-out para normal
- **Propósito:** Feedback visual, guiar atención, delicia
- **Performance:** Usar CSS transforms y opacity (GPU accelerated)
- **Regla de oro:** si dudas, **no animes**. El original es estático.

### Tokens de color usados aquí

```css
:root {
  --c-blue:        #00419A;  /* cards de evento, títulos, focus */
  --c-blue-mid:    #0061B2;  /* footer, botones secundarios */
  --c-orange:      #F09624;  /* fondo base de la página */
  --c-orange-lite: #FFBB3E;  /* paneles redondeados */
  --c-orange-deep: #FDB020;  /* acentos, bordes */
  --c-white:       #FFFFFF;
  --c-gray:        #A8A8A8;
  --c-gray-dark:   #3E3E3E;
  --c-red:         #E20614;  /* único color de error */
}
```

> ⚠️ No introducir verdes, turquesas, magentas ni violetas. Los colores extra que se ven
> en la franja separadora vienen de la **imagen** `Pattern.png`, no del sistema de color.

---

## Transiciones por Elemento

### Botones

Aplica a: `Confira o regulamento` (azul pequeño), `Encerrado` (píldora blanca),
`Inscrever meu pet` (CTA que abre el modal nuevo de inscripción al Cãocurso).

#### Hover State
```css
transition: background-color 200ms ease-out,
            box-shadow 200ms ease-out,
            transform 200ms ease-out;

/* Cambios en hover */
.btn:hover {
  background-color: var(--c-blue-mid);          /* #0061B2 sobre base #00419A */
  box-shadow: 0 8px 16px rgba(0,65,154,0.25);
  transform: translateY(-2px);
}

/* Píldora blanca "Encerrado" */
.btn-pill:hover {
  background-color: var(--c-white);
  box-shadow: 0 8px 16px rgba(0,65,154,0.20);
  transform: translateY(-2px);
}
```

**Propiedades animadas:**
- `background-color` (200ms)
- `box-shadow` (200ms)
- `transform: translateY(-2px)` (200ms)

#### Active/Click
```css
.btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 4px rgba(0,65,154,0.20);
  transition: transform 100ms ease-in;
}
```

### Cards de Evento (Eventos — 4 cards azules)

Las 4 cards del grid 2×2 — `2 AGOSTO` / Condor Araucária BR, `9 AGOSTO` / Condor Nilo
Peçanha, `16 AGOSTO` / Condor Água Verde, `23 AGOSTO` / Condor Campo Comprido, todas
`11h às 15h` — son
`--c-blue` sobre fondo `--c-orange`. La sombra debe ser **azul**, no negra, para no
ensuciar el naranja.

```css
.event-card {
  background-color: var(--c-blue);
  border-radius: 12px;
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.event-card:hover,
.event-card:focus-within {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgba(0,65,154,0.30);
}

/* La regla blanca bajo la fecha se ensancha ligeramente */
.event-card .event-date-rule {
  transition: opacity 250ms ease-out;
  opacity: 0.6;
}

.event-card:hover .event-date-rule {
  opacity: 1;
}
```

**Propiedades:**
- `transform: translateY(-6px)` (elevación contenida — son cards grandes)
- `box-shadow` azul translúcida (`rgba(0,65,154,0.30)`)
- La card **no cambia de color de fondo**: sigue siendo `--c-blue`

### Cards Blancas (Protetoras y Atrações)

Mismo tratamiento para las **3 cards de protetoras** (Instituto Seres & Vidas,
Instituto SOS 4 Patas PR, Marcia Santos Protetora de Animais) y las **3 cards de
atrações** (Camarim, Caricaturista, Petfotos). Son `--c-white` sobre `--c-orange` o
sobre el panel `--c-orange-lite`.

```css
.white-card {
  background-color: var(--c-white);
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0,65,154,0.10);
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.white-card:hover,
.white-card:focus-within {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0,65,154,0.22);
}

/* Icono line-art azul de Atrações: énfasis suave */
.white-card:hover .card-icon {
  transform: scale(1.08);
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Icono de Instagram en las cards de protetoras */
.white-card .icon-instagram {
  color: var(--c-blue);
  transition: color 200ms ease-out, transform 200ms ease-out;
}

.white-card:hover .icon-instagram {
  color: var(--c-blue-mid);
  transform: scale(1.12);
}
```

**Propiedades:**
- `transform: translateY(-8px)` (elevación)
- `box-shadow` azul dinámica
- `.card-icon` scale 1.08 (énfasis)

> El panel de **Requisitos** es un panel único `--c-orange-lite` con 6 bullets, **no son
> cards**. No lleva hover.

### Galería de Fotos

Grid 4×3 = 12 fotos de la edición **2024**, dentro del panel `--c-orange-lite`.

```css
.gallery-photo {
  overflow: hidden;
  border-radius: 8px;
}

.gallery-photo img {
  display: block;
  width: 100%;
  transition: transform 250ms ease-out, filter 250ms ease-out;
}

.gallery-photo:hover img {
  transform: scale(1.05);
  filter: brightness(1.06);
}
```

> Se escala la `img` **dentro** del contenedor con `overflow: hidden`, no el contenedor:
> así no se rompe el gap del grid.

### Logos de Patrocínio / Apoio

La barra blanca de patrocinadores es una sola fila con 11 logos. Hover mínimo.

```css
.sponsor-logo {
  opacity: 0.85;
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.sponsor-logo:hover {
  opacity: 1;
  transform: scale(1.04);
}
```

### Nav del Header

El item activo lleva subrayado blanco. El subrayado crece desde el centro en hover.

```css
.nav-link {
  position: relative;
  color: var(--c-white);
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: var(--c-white);
  transform: translateX(-50%);
  transition: width 200ms ease-out;
}

.nav-link:hover::after,
.nav-link[aria-current="page"]::after {
  width: 100%;
}
```

---

## Animaciones (Keyframes)

### Entrada de Modal

```css
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  animation: modalSlideIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Duración:** 300ms  
**Easing:** cubic-bezier (custom ease-out)

### Salida de Modal

```css
@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(50px);
  }
}

.modal-content.closing {
  animation: modalSlideOut 250ms cubic-bezier(0.4, 0, 0.8, 1);
}
```

**Duración:** 250ms (más rápido que entrada)

### Fade Overlay

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.modal-backdrop {
  background: rgba(0,65,154,0.55);   /* velo azul de marca, no negro */
  animation: fadeIn 200ms ease-out;
}

.modal-backdrop.closing {
  animation: fadeOut 200ms ease-in;
}
```

### Parpadeo de Error

Único color de alerta permitido: `--c-red` (`#E20614`). El "fondo rosado" se consigue
con alfa sobre el rojo de marca, no con un rojo material inventado.

```css
@keyframes errorPulse {
  0%, 100% { background-color: rgba(226,6,20,0.04); }
  50%      { background-color: rgba(226,6,20,0.12); }
}

.form-field.error {
  animation: errorPulse 500ms ease-in-out;
}
```

### Entrada de Spinner (Loading)

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
  border: 3px solid rgba(0,65,154,0.15);
  border-top-color: #00419A;          /* --c-blue */
  border-radius: 50%;
  width: 20px;
  height: 20px;
}
```

### Entrada de Elementos en Cascade

```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Aplicar a múltiples elementos con delay */
.section-title {
  animation: slideUp 400ms ease-out;
}

.event-card,
.white-card {
  animation: slideUp 400ms ease-out both;
  /* Delay basado en índice */
  animation-delay: calc(var(--card-index) * 100ms);
}
```

**Uso:**
```html
<div class="event-card" style="--card-index: 0;">2 AGOSTO · Condor Araucária BR · 11h às 15h</div>
<div class="event-card" style="--card-index: 1;">9 AGOSTO · Condor Nilo Peçanha · 11h às 15h</div>
<div class="event-card" style="--card-index: 2;">16 AGOSTO · Condor Água Verde · 11h às 15h</div>
<div class="event-card" style="--card-index: 3;">23 AGOSTO · Condor Campo Comprido · 11h às 15h</div>
```

---

## Estados de Formulario

Aplica al **modal de inscripción al Cãocurso** (registrar una mascota con su foto para
que reciba votos), que es un añadido nuevo del rebuild — el original no tiene formulario
activo. **No es un formulario de adopción.**

Envía a **`POST /api/inscricao`** con **`multipart/form-data`** (obligatorio: `petFoto`
es un archivo y no cabe en un body JSON), lo que exige `output: 'server'` +
`@astrojs/node` en `astro.config.mjs`. **`/api/feedback` no sirve aquí**: devuelve 400.

### Input Focus

```css
.form-input {
  transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
  border: 1px solid #A8A8A8;                  /* --c-gray */
  box-shadow: 0 0 0 0 rgba(0,65,154,0);
}

.form-input:focus {
  border-color: #00419A;                      /* --c-blue */
  box-shadow: 0 0 0 3px rgba(0,65,154,0.18);
  outline: none;
}
```

**Cambios:**
- `border-color` → azul `--c-blue`
- `box-shadow` → anillo azul suave
- Sin outline (reemplazado por shadow)

### Input Valid

> **Corrección:** el estado válido **no usa verde**. El verde no es un color de la marca
> Condor. La confirmación se expresa con el azul de autoridad `--c-blue` (borde más
> grueso) + un check azul en el margen derecho.

```css
.form-input.valid {
  border-color: #00419A;                      /* --c-blue */
  border-width: 2px;
  /* check line-art azul embebido como data-URI (stroke #00419A) */
  background-image: url('data:image/svg+xml;...');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}
```

### Input Error

```css
.form-input.error {
  border-color: #E20614;                      /* --c-red */
  animation: shake 200ms ease-in-out;
}

.form-error-msg {
  color: #E20614;
  font-size: 13px;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-2px); }
  75%      { transform: translateX(2px); }
}
```

**Efecto:** Pequeño movimiento horizontal

### Preview de la Foto (revelado)

El formulario **no tiene campos condicionales de adopción** (`Já tem animais em casa?`,
descripción de mascotas, patio y dirección **no existen**). El único bloque que aparece
y desaparece es el **preview de `petFoto`** una vez el tutor selecciona la imagen.

```css
.photo-preview {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 300ms ease-out, opacity 300ms ease-out;
}

.photo-preview.show {
  max-height: 500px;
  opacity: 1;
}
```

**Propósito:** revelar la miniatura de la foto elegida (`petFoto`) y su nombre de archivo
en cuanto pasa la validación de formato/peso (JPG/PNG/WebP, máx 5 MB, mín 600×600 px).

---

## Micro-interacciones

### Botón Copiar Link

Texto del tooltip en **pt-BR**.

```css
.copy-btn {
  position: relative;
  transition: color 200ms ease-out, transform 200ms ease-out;
}

.copy-btn:hover::after {
  content: "Copiado!";
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: #3E3E3E;                        /* --c-gray-dark */
  color: #FFFFFF;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  animation: fadeIn 200ms ease-out;
}
```

### Loading State en Botón

```css
.btn.loading {
  color: transparent;
  position: relative;
  pointer-events: none;
}

.btn.loading::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  top: 50%;
  left: 50%;
  margin: -7px 0 0 -7px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

**Label mientras envía:** `Enviando...` → al terminar: `Inscrição enviada!`

### Éxito/Confirmación

```css
@keyframes checkmark {
  0% {
    stroke-dashoffset: 50;
    opacity: 0;
  }
  50% { opacity: 1; }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

.success-icon {
  stroke: #00419A;                            /* --c-blue, no verde */
  animation: checkmark 600ms ease-out;
}
```

---

## Scroll Animations (Intersección)

### Fade-in en Scroll

```css
.fade-in-on-scroll {
  opacity: 0;
  transition: opacity 600ms ease-out;
}

.fade-in-on-scroll.visible {
  opacity: 1;
}
```

**JavaScript (Intersection Observer):**
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
  observer.observe(el);
});
```

### Parallax en Hero

Muy sutil. El hero es `Selo.png` + `Titulo-1024x477.png` a la izquierda y `Pet-2.png`
(chihuahua) con los círculos de iconos a la derecha, sobre `--c-orange`.

```css
.hero {
  background-color: #F09624;                  /* --c-orange */
}

/* En JS, actualizar --scroll-offset en scroll (máx. ~20px) */
.hero-pet,
.hero-circle {
  transform: translateY(var(--scroll-offset, 0px));
  will-change: transform;
}
```

> No usar `background-attachment: fixed`: rompe el rendimiento en mobile y el fondo del
> hero es un color plano con line-art, no una foto.

---

## Transiciones entre Secciones

### La Franja Separadora — ⚠️ CORRECCIÓN IMPORTANTE

**Lo que decía antes este documento era incorrecto.** No existe ningún "patrón de barras"
de color generado por CSS que se deslice en bucle.

**Lo real:** la franja es una **imagen de tiles** — `Pattern.png` / `Pattern@2x.png` —
cuadrados de ~65px, cada uno con un icono de pata o hueso, alternando colores
(azul · morado · rojo · lila · verde · rosa · naranja). Se pinta con
`background-repeat: repeat-x`. Esos colores viven **dentro del PNG** y no son tokens del
design system.

**Por defecto va ESTÁTICA. El original no la anima.**

```css
/* ✅ Implementación correcta (por defecto) */
.pattern-strip {
  height: 65px;
  background-image: image-set(
    url('/assets/images/Pattern.png') 1x,
    url('/assets/images/Pattern@2x.png') 2x
  );
  background-repeat: repeat-x;
  background-position: 0 0;
  background-size: auto 65px;
  /* sin animation — es correcto así */
}

@media (max-width: 768px) {
  .pattern-strip {
    height: 44px;
    background-size: auto 44px;
  }
}
```

**Si (y sólo si) se quiere movimiento**, es un desplazamiento de `background-position`
muy lento y casi imperceptible, en **una** de las franjas como mucho, y siempre
`opt-in` con una clase:

```css
/* ⚙️ Opcional, NO por defecto */
@keyframes patternDrift {
  from { background-position: 0 0; }
  to   { background-position: 65px 0; }   /* exactamente 1 tile: bucle sin salto */
}

.pattern-strip.is-drifting {
  animation: patternDrift 12s linear infinite;
}
```

**Reglas del drift opcional:**
- El desplazamiento debe ser **exactamente el ancho de un tile** (65px), o el bucle salta.
- `12s` mínimo. Cualquier cosa por debajo de 8s se lee como un banner publicitario.
- No animar `transform` aquí: movería el fondo y el contenido superpuesto (patas del gato).
- Se desactiva entero bajo `prefers-reduced-motion`.

| Antes decía (incorrecto) | Real |
|--------------------------|------|
| `.color-bars` con barras de color CSS | imagen `Pattern.png` con `repeat-x` |
| `background-size: 200px 100%` | `background-size: auto 65px` (alto del tile) |
| `animation: barSlide 3s linear infinite` | **sin animación**; drift opcional a 12s |
| Movimiento por defecto | **estático por defecto** |

### Patas del Gato sobre la Franja

En la franja que precede a la sección de **Eventos**, las patas del gato (`Gato.png`)
cuelgan por encima de la tira. Es el único elemento decorativo con animación propia
recomendada: un **float muy sutil**, como si el gato se balanceara.

```css
@keyframes catPawsFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(4px) rotate(-0.6deg); }
}

.cat-paws {
  position: absolute;
  bottom: 100%;                 /* cuelgan desde arriba de la franja */
  right: 12%;
  z-index: 2;
  transform-origin: top center; /* pivota desde donde "se agarra" */
  animation: catPawsFloat 4.5s ease-in-out infinite;
  will-change: transform;
  pointer-events: none;
}

/* Contenedor de la franja */
.pattern-strip--cat {
  position: relative;
  overflow: visible;            /* imprescindible: las patas sobresalen */
}
```

**Parámetros:**

| Propiedad | Valor | Por qué |
|-----------|-------|---------|
| Amplitud | `4px` | Casi imperceptible; más se ve como GIF |
| Rotación | `-0.6deg` | Da vida orgánica sin desalinear el recorte |
| Duración | `4.5s` | Ritmo de respiración, no de rebote |
| Easing | `ease-in-out` | Suaviza los extremos del recorrido |
| Origen | `top center` | El movimiento nace del punto de agarre |

> ⚠️ `overflow: visible` en la franja es obligatorio, y `z-index` debe dejar las patas
> **por encima** del `Pattern` pero por debajo del nav.

### Fondos de Sección

> **Corrección:** los fondos **no alternan naranja/blanco**. Casi toda la página es
> `--c-orange`; el blanco sólo aparece en cards y en la barra de patrocinadores; los
> paneles grandes (Requisitos, Atrações, Galeria) son `--c-orange-lite`; el footer es
> `--c-blue-mid`.

```css
.section            { background-color: #F09624; }  /* --c-orange       */
.panel--rounded     { background-color: #FFBB3E; }  /* --c-orange-lite  */
.card--white        { background-color: #FFFFFF; }  /* --c-white        */
.site-footer        { background-color: #0061B2; }  /* --c-blue-mid     */
```

No hay transición de fondo entre secciones: el corte lo hace la franja de tiles.

---

## Efectos Decorativos

### Círculos de Iconos Flotantes (Hero y Cãocurso)

Alrededor de `Pet-2.png` flotan círculos de colores con iconos (pata, hueso, perro,
comedero). Cada uno con un desfase distinto para que no floten en sincronía.

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-10px); }
}

.hero-circle {
  animation: float 3s ease-in-out infinite;
  animation-delay: calc(var(--circle-index) * 400ms);
}
```

```html
<img class="hero-circle" style="--circle-index: 0;" src="..." alt="">
<img class="hero-circle" style="--circle-index: 1;" src="..." alt="">
<img class="hero-circle" style="--circle-index: 2;" src="..." alt="">
```

> Los círculos son parte del arte original: **no se les baja la opacidad**. Se mantienen
> a `opacity: 1`.

### Pulso Suave del Selo

`Selo.png` (Mês Pet) y `Selo-Adote-um-Aumigo.png` admiten un latido mínimo al entrar en
viewport. Una sola vez, no en bucle.

```css
@keyframes pulseOnce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.selo.visible {
  animation: pulseOnce 900ms ease-in-out 1;
}
```

---

## Desactivar Animaciones si Preferencia del Usuario

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Los infinitos decorativos se apagan del todo */
  .cat-paws,
  .hero-circle,
  .pattern-strip.is-drifting {
    animation: none !important;
    transform: none !important;
  }
}
```

---

## Performance: Hardware Acceleration

Usar `transform` y `opacity` para animaciones (GPU-accelerated):

```css
/* ✅ Bien (acelerado) */
.event-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgba(0,65,154,0.30);
}

/* ❌ Malo (reflow) */
.event-card:hover {
  top: -6px;
  width: 105%;
}
```

**Notas:**
- `will-change: transform` sólo en los elementos que animan de verdad
  (`.event-card`, `.white-card`, `.cat-paws`, `.hero-pet`). Abusar de él consume memoria.
- `background-position` (franja) **no** está acelerado por GPU; por eso el drift es
  lento, opcional, y como mucho en una franja.
- Transiciones explícitas por propiedad en vez de `transition: all` — Elementor usaba
  `all 0.3s` y ese es justamente el patrón a no heredar.

---

## Testing de Animaciones

### Checklist

- [ ] Animaciones en Chrome, Firefox, Safari
- [ ] Performance en mobile (60fps si es posible)
- [ ] Respeta `prefers-reduced-motion`
- [ ] La franja `Pattern.png` está **estática** por defecto
- [ ] Las patas del gato (`Gato.png`) no se recortan (`overflow: visible`)
- [ ] Hover de las 4 cards de evento con sombra azul, no negra
- [ ] Hover de las 3 cards de protetoras y las 3 de atrações
- [ ] Ningún verde / turquesa / magenta en estados de formulario
- [ ] Sin memory leaks (cleanup de observers)
- [ ] Accesibilidad: `aria-live` para cambios dinámicos
- [ ] Keyboard: `:focus-within` replica los hover de card
- [ ] Timing: duraciones consistentes

### DevTools Debug

En Chrome DevTools:
1. Abrir Console
2. `document.documentElement.style.animation = 'none'` (pause)
3. Verificar render performance (Rendering tab)
4. Rendering → "Emulate CSS media feature prefers-reduced-motion" para validar el bloque

---

## Resumen de Duraciones

| Elemento | Duración | Easing |
|----------|----------|--------|
| Hover botón | 200ms | ease-out |
| Active botón | 100ms | ease-in |
| Hover card de evento | 250ms | cubic-bezier(0.4,0,0.2,1) |
| Hover card blanca (protetoras / atrações) | 250ms | cubic-bezier(0.4,0,0.2,1) |
| Hover foto de galería | 250ms | ease-out |
| Hover logo patrocinador | 200ms | ease-out |
| Nav underline | 200ms | ease-out |
| Modal entrada | 300ms | cubic-bezier(0.4,0,0.2,1) |
| Modal salida | 250ms | cubic-bezier(0.4,0,0.8,1) |
| Backdrop fade | 200ms | ease-out / ease-in |
| Input focus | 200ms | ease-out |
| Error shake | 200ms | ease-in-out |
| Error pulse | 500ms | ease-in-out |
| Preview de foto (reveal) | 300ms | ease-out |
| Scroll fade-in | 600ms | ease-out |
| Cascade slideUp | 400ms + 100ms/índice | ease-out |
| Checkmark éxito | 600ms | ease-out |
| Spinner | 0.8–1s | linear (infinite) |
| **Franja `Pattern.png`** | **— (estática)** | **—** |
| Franja drift (opcional) | 12s | linear (infinite) |
| Patas del gato (float) | 4.5s | ease-in-out (infinite) |
| Círculos del hero (float) | 3s | ease-in-out (infinite) |
| Pulso del selo | 900ms | ease-in-out (1×) |

---

## Archivo CSS Centralizado

Crear `src/styles/animations.css`:

```css
/* Keyframes */
@keyframes modalSlideIn   { ... }
@keyframes modalSlideOut  { ... }
@keyframes fadeIn         { ... }
@keyframes fadeOut        { ... }
@keyframes slideUp        { ... }
@keyframes shake          { ... }
@keyframes errorPulse     { ... }
@keyframes spin           { ... }
@keyframes checkmark      { ... }
@keyframes float          { ... }   /* círculos del hero */
@keyframes catPawsFloat   { ... }   /* patas del gato sobre la franja */
@keyframes pulseOnce      { ... }   /* selos */
@keyframes patternDrift   { ... }   /* OPT-IN, no por defecto */

/* Clases reutilizables */
.animate-fade-in     { ... }
.animate-slide-up    { ... }
.transition-smooth   { ... }
.hover-lift          { ... }   /* .event-card + .white-card */
.cat-paws            { ... }
.pattern-strip       { ... }   /* estática */

/* Motion preferences */
@media (prefers-reduced-motion: reduce) { ... }
```

Luego importar en `global.css`:
```css
@import './animations.css';
```

> `animations.css` **no define colores propios**: consume las variables del `:root` del
> design system (`--c-blue`, `--c-red`, …). Si aparece un hex suelto fuera de la paleta,
> es un bug.
