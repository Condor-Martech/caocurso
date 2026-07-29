# 📐 Wireframes Detallados — Pet Condor LP (pet.condor.com.br)

> **Fuente de verdad:** `GROUND_TRUTH.md`. Este documento sólo desarrolla su §3
> (estructura real) en wireframes ASCII y specs de layout. Si algo aquí contradice
> a `GROUND_TRUTH.md`, **gana GROUND_TRUTH**.
>
> Verificado contra `content/html/index.html`, `assets/css/post-683.css` y `petCondor.png` (1920×7478).
>
> **Idioma:** todo el contenido de pantalla va en **portugués de Brasil**, literal.
> Las notas y tablas de este documento van en español.

---

## 🎨 Tokens que se usan en todo el documento

```css
--c-blue:        #00419A   /* títulos, cards de evento, texto sobre naranja */
--c-blue-mid:    #0061B2   /* footer */
--c-orange:      #F09624   /* FONDO BASE DE LA PÁGINA ENTERA */
--c-orange-lite: #FFBB3E   /* paneles redondeados: requisitos, atrações, galeria, barra patrocínio */
--c-orange-deep: #FDB020   /* acentos, bordes */
--c-white:       #FFFFFF   /* cards, reglas, iconos */
--c-gray:        #A8A8A8
--c-gray-dark:   #3E3E3E
--c-red:         #E20614

--font-display: 'Torus', system-ui, sans-serif;  /* self-hosted, 6 pesos, TODO el sitio */
```

**Radios reales medidos en el CSS:** `20px` (dominante: cards y paneles), `16px`
(cards pequeñas), `25px`/`30px`/`31px` (píldoras y botones), `32px` (panel galería).

**Breakpoints:** Desktop ≥1024px · Tablet 768–1023px · Mobile <768px.

---

## 🧱 Regla de fondos (corrección crítica)

```
❌ ANTES (incorrecto):  las secciones alternaban naranja / blanco / #F9F9F9
✅ REAL:                LA PÁGINA ES NARANJA CASI ENTERA
```

| Elemento | Fondo real |
|----------|-----------|
| Body y todas las secciones | `--c-orange` (#F09624) |
| Paneles redondeados (Requisitos, Atrações, Galeria) | `--c-orange-lite` (#FFBB3E) |
| Barra Patrocínio / Apoio | `--c-white` sobre banda `--c-orange-lite` |
| Cards de evento | `--c-blue` (#00419A) |
| Cards de Protetoras y de Atrações | `--c-white` |
| Footer | `--c-blue-mid` (#0061B2) |

**El blanco sólo existe en cards, reglas divisorias, iconos y la barra de
patrocinadores.** No hay ninguna sección con fondo blanco ni `#F9F9F9`.

---

## 🗺️ Mapa global de la página (11 bloques + nav)

```
┌═════════════════════════════════════════════════════════════════════════┐
│  NAV  (sin barra propia — flota sobre el naranja, alineado a la derecha) │
│                    Home  Adote um Aumigo  Cãocurso  Galeria  Regulamento │
│                    ▔▔▔▔                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. HERO                                     fondo --c-orange + line-art  │
│   [Selo.png]                                          [Pet-2.png]        │
│   [Titulo.png ◄ EL TITULAR ES UNA IMAGEN]        ● ● ● círculos iconos   │
├─────────────────────────────────────────────────────────────────────────┤
│ ▨▨▨ FRANJA SEPARADORA — Pattern.png (tiles con patas/huesos, ~65px) ▨▨▨ │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. ADOTE UM AUMIGO                                              #adote   │
│   [Dog.png]              [Selo-Adote-um-Aumigo.png]                      │
│                          "Dê uma chance para aquele que nunca te         │
│                           abandona."                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ ▨▨▨ FRANJA SEPARADORA   ← 🐈 las patas del gato (Gato.png) CUELGAN ▨▨▨  │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. EVENTOS                                                               │
│   "Em quatro datas," (azul) "quatro chances de encontrar o amor          │
│    mais leal." (blanco)                                                  │
│   ────────────────────── regla blanca ──────────────────────             │
│   ┌ 2 AGOSTO ────┐ ┌ 9 AGOSTO ────┐                                      │
│   ┌ 16 AGOSTO ───┐ ┌ 23 AGOSTO ───┐        (4 cards azules, grid 2×2)    │
│   ────────────────────── regla blanca ──────────────────────             │
├─────────────────────────────────────────────────────────────────────────┤
│ 4. REQUISITOS      ▸ UN SOLO panel --c-orange-lite, 6 bullets, 2 col     │
├─────────────────────────────────────────────────────────────────────────┤
│ 5. PROTETORAS      ▸ 3 cards BLANCAS: logo + nombre + Instagram          │
├─────────────────────────────────────────────────────────────────────────┤
│ ▨▨▨ FRANJA SEPARADORA ▨▨▨                                               │
├─────────────────────────────────────────────────────────────────────────┤
│ 6. CÃOCURSO                                                  #caocurso   │
│   [Selo@2x.png]  [Txt@2x-1.png ◄ tagline = IMAGEN]     [Pet-2.png]      │
├─────────────────────────────────────────────────────────────────────────┤
│ ▨▨▨ FRANJA SEPARADORA ▨▨▨                                               │
├─────────────────────────────────────────────────────────────────────────┤
│ 7. 30 AGOSTO                                                             │
│   IZQ: fecha + local + horario + inscrição + botón regulamento           │
│   DER:                                              (  Encerrado  )      │
├─────────────────────────────────────────────────────────────────────────┤
│ 8. ATRAÇÕES        ▸ panel --c-orange-lite + 3 cards blancas             │
│   Camarim · Caricaturista · Petfotos                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ 9. GALERIA                                                     #galeria  │
│   panel --c-orange-lite · "Confira como foi a edição anterior" · 2024    │
│   grid 4 col × 3 filas = 12 fotos EN RETRATO (~4:5)                      │
├─────────────────────────────────────────────────────────────────────────┤
│ 10. PATROCÍNIO / APOIO                                                   │
│   ( una sola barra blanca redondeada a lo ancho, logos en UNA fila )     │
├─────────────────────────────────────────────────────────────────────────┤
│ 11. FOOTER                                    fondo --c-blue-mid         │
│   [Logo-Grande.png]   ©Condor 2025…   ⬤⬤⬤⬤⬤⬤ (6 sociales)              │
└═════════════════════════════════════════════════════════════════════════┘
```

---

## 🧭 Bloque 0 — NAV (header)

> ⚠️ **Faltaba por completo en la documentación anterior.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    Home   Adote um Aumigo   Cãocurso   Galeria   Regu…  │
│                    ▔▔▔▔                                                 │
│                    ▲ item activo: subrayado BLANCO                      │
│                                                                         │
│  ▲ sin barra, sin fondo propio, sin logo: el naranja del hero se ve     │
│    por debajo. Alineado a la DERECHA.                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Items (texto literal pt-BR + destino):**

| Label | href | Nota |
|-------|------|------|
| `Home` | `#` | item activo por defecto → subrayado blanco |
| `Adote um Aumigo` | `#adote` | ancla al bloque 2 |
| `Cãocurso` | `#caocurso` | ancla al bloque 6 |
| `Galeria` | `#galeria` | ancla al bloque 9 |
| `Regulamento` | `/assets/images/2025_Regulamento_Caocurso.pdf` | `target="_blank"` (PDF externo) |

**Especificaciones**

- Contenedor: `display:flex; justify-content:flex-end;` dentro del ancho de página.
- **No** es `position:fixed` ni sticky: forma parte del flujo, encima del hero.
- Sin fondo, sin borde, sin sombra. Color de texto: `--c-white`.
- Tipografía: Torus SemiBold, ~15–16px, sin uppercase forzado.
- Gap entre items: ~28–32px desktop.
- Estado activo: `border-bottom: 2px solid var(--c-white)` con ~6px de separación.
- Hover: mismo subrayado blanco, transición 200ms.
- Anclas: `scroll-behavior: smooth` en `html`.

**Responsive**

- Desktop: fila horizontal alineada a la derecha, padding `24px 48px`.
- Tablet: misma fila, gap 20px, fuente 14px.
- Mobile: menú hamburguesa blanco a la derecha → panel desplegable naranja
  (`--c-orange`) a ancho completo con los 5 items apilados y centrados.

---

## 🐕 Bloque 1 — HERO

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo: --c-orange (#F09624) + patrón line-art de mascotas (muy sutil)   │
│                                                                         │
│  ┌─────────── COLUMNA IZQ (≈55%) ────────┐ ┌── COLUMNA DER (≈45%) ────┐│
│  │                                        │ │                          ││
│  │   ┌────────────────┐                   │ │   ●        ●             ││
│  │   │   Selo.png     │  logo "MÊS PET"   │ │  pata     hueso          ││
│  │   │  + lockup      │                   │ │                          ││
│  │   └────────────────┘                   │ │      ┌──────────────┐    ││
│  │                                        │ │      │  Pet-2.png   │    ││
│  │   ┌────────────────────────────────┐   │ │      │  chihuahua   │    ││
│  │   │        Titulo.png              │   │ │      │  con gafas   │    ││
│  │   │  ◄ ES UNA IMAGEN, NO TEXTO ►   │   │ │      │  de sol y    │    ││
│  │   │  "NO MÊS DO PET, TEM PREÇO     │   │ │      │  chaqueta    │    ││
│  │   │   BAIXO PRA CACHORRO."         │   │ │      │  de cuero    │    ││
│  │   │  + script "e pra gatos também!"│   │ │      └──────────────┘    ││
│  │   └────────────────────────────────┘   │ │   ●        ●             ││
│  │                                        │ │  perro   comedero        ││
│  └────────────────────────────────────────┘ └──────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### ⚠️ El titular es una IMAGEN

`Titulo.png` / `Titulo-1024x477.png` es un lockup tipográfico con la palabra
manuscrita *"e pra gatos também!"* superpuesta. **No se reconstruye con `<h1>` de
texto** — el trazado script no es una fuente disponible.

```html
<h1 class="sr-only">No mês do pet, tem preço baixo pra cachorro. E pra gatos também!</h1>
<img src="/assets/images/Titulo.png"
     srcset="/assets/images/Titulo-1024x477.png 1024w, /assets/images/Titulo.png 1864w"
     alt="No mês do pet, tem preço baixo pra cachorro. E pra gatos também!"
     class="hero__titulo" />
```

El `<h1>` real va oculto visualmente (`sr-only`) para SEO y accesibilidad.

### Especificaciones

| Elemento | Asset | Desktop | Tablet | Mobile |
|----------|-------|---------|--------|--------|
| Selo Mês Pet | `Selo.png` (685w) / `Selo-238x300.png` | 230px ancho | 180px | 140px |
| Titular | `Titulo.png` | `max-width: 620px` | 480px | 100% (máx 340px) |
| Mascota | `Pet-2.png` | 420px ancho | 320px | 240px |
| Círculos de iconos | decorativos | 72–96px ⌀ | 64px | ocultos o 48px |

- Altura del bloque: **no fijar en px**; usar `padding: 32px 0 64px` y dejar que
  el contenido mande. En desktop resulta ≈560–620px.
- Sin gradiente, sin `drop-shadow`, sin rotaciones inventadas: el naranja es plano.
- Los círculos de colores flotantes son decorativos → `aria-hidden="true"`.
- ⚠️ **`Selo@2x.png` NO es el selo del hero** — es el logo de Cãocurso (bloque 6).
  El hero usa `Selo.png` (685×863) y su única variante `Selo-238x300.png`.

**Responsive**

- Desktop: `grid-template-columns: 1.1fr 0.9fr`, `align-items: center`, gap 32px.
- Tablet: mismas 2 columnas pero `1fr 1fr`, gap 24px.
- Mobile: 1 columna. Orden: Selo → Titulo → Pet-2. Todo centrado, padding `24px`.

---

## ▨ Franja separadora (Pattern.png)

> **Corrección:** no son barras de color planas ni cuadrados de colores planos.

```
┌───────────────────────────────────────────────────────────────────────┐
│ 🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾🦴🐾  │ ~65px
└───────────────────────────────────────────────────────────────────────┘
   tiles cuadrados ~65px, cada uno CON UN ICONO de pata o hueso,
   secuencia de color: azul · morado · rojo · lila · verde · rosa · naranja
```

```css
.separador {
  height: 65px;
  background-image: url('/assets/images/Pattern.png');
  background-repeat: repeat-x;
  background-size: auto 65px;
}
@media (min-resolution: 2dppx) {
  .separador { background-image: url('/assets/images/Pattern@2x.png'); }
}
```

**Importante:** los verdes / rosas / morados de estos tiles **están dentro de la
imagen**. No son tokens del design system y no deben declararse como variables CSS.

### 🐈 El gato que cuelga

En la franja **que precede a la sección de Eventos** (la que va después de *Adote
um AuMigo*), `Gato.png` se superpone: las patas del gato **cuelgan por encima** de
la tira, invadiendo el bloque anterior.

```
        ╭──────────╮
        │  Gato    │  ← sobresale hacia ARRIBA de la franja
   ▨▨▨▨▨│ 🐾    🐾 │▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
        ╰──────────╯
```

```css
.separador--gato { position: relative; overflow: visible; }
.separador--gato .gato {
  position: absolute;
  bottom: 0;                 /* apoyado en la franja */
  left: 12%;                 /* medido sobre el screenshot */
  width: 180px;
  z-index: 2;
}
```

**Responsive:** franja 65px desktop · 48px tablet · 36px mobile (`background-size:
auto 36px`). El gato: 180px → 130px → oculto en mobile.

---

## 🐶 Bloque 2 — ADOTE UM AUMIGO (`#adote`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo: --c-orange                                                       │
│                                                                         │
│  ┌────── COLUMNA IZQ (≈45%) ──────┐  ┌──── COLUMNA DER (≈55%) ────────┐ │
│  │                                │  │                                │ │
│  │   ┌────────────────────────┐   │  │  ┌──────────────────────────┐  │ │
│  │   │      Dog.png           │   │  │  │ Selo-Adote-um-Aumigo.png │  │ │
│  │   │  perro blanco y negro  │   │  │  │  logo "ADOTE um AuMigo"  │  │ │
│  │   │  (foto recortada,      │   │  │  │  + lockup Condor         │  │ │
│  │   │   sin fondo)           │   │  │  └──────────────────────────┘  │ │
│  │   │                        │   │  │                                │ │
│  │   │                        │   │  │  H2:                           │ │
│  │   └────────────────────────┘   │  │  "Dê uma chance para aquele    │ │
│  │                                │  │   que nunca te abandona."      │ │
│  └────────────────────────────────┘  └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Especificaciones

- `Dog.png`: `max-width: 480px` desktop. Sin rotación, sin sombra.
- `Selo-Adote-um-Aumigo.png`: `max-width: 420px` desktop.
- **H2 (texto real, no imagen):** `Dê uma chance para aquele que nunca te abandona.`
  - Torus Bold, 34–40px desktop, `line-height: 1.15`.
  - Color: `--c-white` sobre el naranja (contraste verificado en el screenshot).
- Padding del bloque: `48px 0 0` (la franja del gato cierra por abajo).
- Ancla: `id="adote"` en la `<section>`, con `scroll-margin-top: 24px`.

**Responsive**

- Desktop: `grid-template-columns: 0.9fr 1.1fr`, `align-items: center`.
- Tablet: 2 columnas `1fr 1fr`, H2 a 28px.
- Mobile: 1 columna, orden Selo → H2 → Dog.png; H2 a 24px, centrado.

---

## 📅 Bloque 3 — EVENTOS

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo: --c-orange                                                       │
│                                                                         │
│              Em quatro datas,  quatro chances de encontrar              │
│                    ▲ AZUL       o amor mais leal.                       │
│                                        ▲ BLANCO                         │
│                    (H2 bicolor, centrado, Torus Bold ~42px)             │
│                                                                         │
│  ───────────────────────── regla blanca 1px ─────────────────────────    │
│                                                                         │
│    ┌───────────────────────────┐   ┌───────────────────────────┐        │
│    │  2 AGOSTO                 │   │  9 AGOSTO                 │        │
│    │  ─────────────            │   │  ─────────────            │        │
│    │  Condor Araucária BR      │   │  Condor Nilo Peçanha      │        │
│    │  11h às 15h               │   │  11h às 15h               │        │
│    └───────────────────────────┘   └───────────────────────────┘        │
│                                                                         │
│    ┌───────────────────────────┐   ┌───────────────────────────┐        │
│    │  16 AGOSTO                │   │  23 AGOSTO                │        │
│    │  ─────────────            │   │  ─────────────            │        │
│    │  Condor Água Verde        │   │  Condor Campo Comprido    │        │
│    │  11h às 15h               │   │  11h às 15h               │        │
│    └───────────────────────────┘   └───────────────────────────┘        │
│                                                                         │
│  ───────────────────────── regla blanca 1px ─────────────────────────    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Anatomía de la card de evento

```
┌───────────────────────────────────┐  background: var(--c-blue) #00419A
│  padding: 24px 28px               │  border-radius: 20px
│                                   │  color: var(--c-white)
│   2 AGOSTO            ← 28px Bold │
│   ────────────────    ← regla blanca 1px, ancho ~60%, dentro de la card
│                                   │
│   Condor Araucária BR ← 16px Reg. │
│   11h às 15h          ← 16px Reg. │
│                                   │
└───────────────────────────────────┘
```

**Los 4 eventos, literales:**

| Fecha | Local | Horario |
|-------|-------|---------|
| `2 AGOSTO` | `Condor Araucária BR` | `11h às 15h` |
| `9 AGOSTO` | `Condor Nilo Peçanha` | `11h às 15h` |
| `16 AGOSTO` | `Condor Água Verde` | `11h às 15h` |
| `23 AGOSTO` | `Condor Campo Comprido` | `11h às 15h` |

### Especificaciones

- H2 bicolor: dos `<span>` dentro del mismo `<h2>`; `Em quatro datas,` en
  `--c-blue`, el resto en `--c-white`. Centrado, `max-width: 900px; margin: auto`.
- Reglas horizontales: `border-top: 1px solid rgba(255,255,255,.85)`, ancho completo
  del contenedor, una arriba del grid y otra debajo.
- Grid: `grid-template-columns: repeat(2, 1fr); gap: 24px;`
- Las cards **no son botones**: no llevan enlace ni cursor pointer en el original.
- Hover permitido (mejora sutil): `transform: translateY(-2px)`, 200ms. Nada más.

**Responsive**

- Desktop: grid 2×2, cards `min-height: 150px`.
- Tablet: grid 2×2, padding de card 20px, fecha 24px.
- Mobile: 1 columna (4 cards apiladas), gap 16px, H2 a 26px.

---

## ✅ Bloque 4 — REQUISITOS

> ⚠️ **Corrección mayor.** No son 3 cards con iconos ni hay bordes de colores
> (rojo/verde/turquesa). Es **UN solo panel naranja claro con 6 bullets en dos columnas**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo de sección: --c-orange                                            │
│                                                                         │
│   ╭─────────────────────────────────────────────────────────────────╮   │
│   │  PANEL ÚNICO — background: var(--c-orange-lite) #FFBB3E         │   │
│   │  border-radius: 20px · padding: 40px 56px                       │   │
│   │                                                                 │   │
│   │            Requisitos para adoção:                              │   │
│   │            ▲ H2 centrado, Torus Bold ~34px, color --c-blue      │   │
│   │                                                                 │   │
│   │   – Ter, no mínimo, 21 anos;        – Assinar e concordar com   │   │
│   │                                       o termo de adoção;        │   │
│   │   – Portar RG, CPF e comprovante    – Ter condições financeiras │   │
│   │     de residência;                    para manter o animalzinho;│   │
│   │   – Responder a uma entrevista      – Ter local seguro e        │   │
│   │     sobre os motivos da adoção;       adequado.                 │   │
│   │                                                                 │   │
│   ╰─────────────────────────────────────────────────────────────────╯   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Los 6 bullets, literales y en orden:**

1. `Ter, no mínimo, 21 anos;`
2. `Portar RG, CPF e comprovante de residência;`
3. `Responder a uma entrevista sobre os motivos da adoção;`
4. `Assinar e concordar com o termo de adoção;`
5. `Ter condições financeiras para manter o animalzinho;`
6. `Ter local seguro e adequado.`

### Especificaciones

- Panel: `background: var(--c-orange-lite)`, `border-radius: 20px`,
  `max-width: 1100px`, `margin: 0 auto`.
- H2: `Requisitos para adoção:` — Torus Bold, 34px, `--c-blue`, centrado.
- Lista: `<ul>` con `columns: 2; column-gap: 56px;` (o grid de 2 columnas y
  reparto 3+3 — el original reparte en dos columnas de 3).
- Bullets: 14px Torus Regular, `--c-blue`, `line-height: 1.6`. Marcador `–` (guion)
  o `list-style: disc` en `--c-blue`.
- **Sin iconos. Sin sombras. Sin bordes de color. Sin cards.**

**Responsive**

- Desktop: 2 columnas, padding `40px 56px`.
- Tablet: 2 columnas, `column-gap: 32px`, padding `32px 32px`.
- Mobile: **1 columna** (`columns: 1`), padding `24px 20px`, H2 a 24px.

---

## 🏠 Bloque 5 — PROTETORAS

> ⚠️ **Sección que faltaba por completo en la documentación anterior.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo: --c-orange                                                       │
│                                                                         │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐             │
│   │   BLANCA      │   │   BLANCA      │   │   BLANCA      │             │
│   │  ┌─────────┐  │   │  ┌─────────┐  │   │  ┌─────────┐  │             │
│   │  │  LOGO   │  │   │  │  LOGO   │  │   │  │  LOGO   │  │             │
│   │  └─────────┘  │   │  └─────────┘  │   │  └─────────┘  │             │
│   │   Instituto   │   │  Instituto    │   │ Marcia Santos │             │
│   │  Seres &Vidas │   │ SOS 4 Patas PR│   │   Protetora   │             │
│   │               │   │               │   │  de Animais   │             │
│   │      ◙        │   │      ◙        │   │      ◙        │             │
│   │  ▲ Instagram  │   │  ▲ Instagram  │   │  ▲ Instagram  │             │
│   └───────────────┘   └───────────────┘   └───────────────┘             │
│                                                                         │
│              (3 cards centradas, mismo alto, gap 24px)                  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Las 3 protetoras, literales:**

| Nombre | Logo | Instagram |
|--------|------|-----------|
| `Instituto Seres & Vidas` | `InstitutoSeres-e-vidas.png` | `instagram.com/seres_vidas/` |
| `Instituto SOS 4 Patas PR` | `sos-4-patas.png` | `instagram.com/sos4patas.pr/` |
| `Marcia Santos Protetora de Animais` | `Marcia-Protetora-300x161.jpg` | `instagram.com/marciasantos.protetora/` |

### Anatomía de la card

```
┌───────────────────────────────────┐  background: var(--c-white)
│  padding: 28px 24px               │  border-radius: 20px
│  text-align: center               │  sin borde, sin sombra fuerte
│                                   │
│   ┌───────────────────────┐       │  logo: max-height 90px, object-fit contain
│   │        LOGO           │       │
│   └───────────────────────┘       │
│                                   │
│   Nome da protetora    ← 16px Bold, --c-blue
│                                   │
│        ◙  ← icono Instagram, ~28px, --c-blue, enlace target="_blank"
└───────────────────────────────────┘
```

### Especificaciones

- Grid: `repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto;`
- `align-items: stretch` para que las 3 cards tengan la misma altura pese a que
  el nombre de la tercera ocupa dos líneas.
- Icono Instagram: SVG inline monocromo en `--c-blue`, `aria-label` con el nombre
  de la protetora. Hover: opacidad 0.75.
- Enlaces: `rel="noopener noreferrer" target="_blank"`.

**Responsive**

- Desktop: 3 columnas.
- Tablet: 3 columnas, logo `max-height: 70px`, nombre 14px.
- Mobile: 1 columna, cards a ancho completo, gap 16px.

---

## 🏆 Bloque 6 — CÃOCURSO (`#caocurso`)

> ⚠️ Se llama **Cãocurso** (no "CHO CURSO"). Su tagline real es
> **"Seu pet é a estrela da nossa passarela."** — y **es una imagen**, no texto.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo: --c-orange (opcional BG-Caocurso.jpg como textura de sección)    │
│                                                                         │
│  ┌────── COLUMNA IZQ (≈55%) ───────┐  ┌──── COLUMNA DER (≈45%) ───────┐ │
│  │                                 │  │                               │ │
│  │  ┌───────────────────────────┐  │  │    ●          ●               │ │
│  │  │   Selo@2x-1024x791.png    │  │  │                               │ │
│  │  │   logo "CÃOCURSO"         │  │  │    ┌────────────────────┐     │ │
│  │  │   + lockup Condor         │  │  │    │     Pet-2.png      │     │ │
│  │  └───────────────────────────┘  │  │    │  el mismo          │     │ │
│  │                                 │  │    │  chihuahua del     │     │ │
│  │  ┌───────────────────────────┐  │  │    │  hero              │     │ │
│  │  │      Txt@2x-1.png         │  │  │    └────────────────────┘     │ │
│  │  │  ◄ IMAGEN, NO TEXTO ►     │  │  │                               │ │
│  │  │  "Seu pet é a estrela     │  │  │    ●          ●               │ │
│  │  │   da nossa passarela."    │  │  │   círculos de iconos          │ │
│  │  │  magenta con contorno     │  │  │                               │ │
│  │  │  blanco                   │  │  │                               │ │
│  │  └───────────────────────────┘  │  │                               │ │
│  └─────────────────────────────────┘  └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Especificaciones

- `Selo@2x-1024x791.png`: `max-width: 460px` desktop.
- `Txt@2x-1.png`: `max-width: 560px` desktop. Es un lettering con contorno →
  **no reconstruir con CSS**. Alt: `Seu pet é a estrela da nossa passarela.`
  y `<h2 class="sr-only">` con el mismo texto para SEO.
- El magenta del lettering **está dentro del PNG** — no es un token de la paleta.
- `Pet-2.png`: `max-width: 400px` desktop. Es la misma imagen del hero, reutilizada.
- **Aquí NO va el botón "Encerrado"** — ese botón vive en el bloque 7 (30 Agosto).
- Ancla: `id="caocurso"` en la `<section>`.

**Responsive**

- Desktop: `grid-template-columns: 1.1fr 0.9fr`, `align-items: center`.
- Tablet: 2 columnas `1fr 1fr`; Selo 340px, Txt 400px, Pet 300px.
- Mobile: 1 columna, orden Selo → Txt → Pet-2; todo centrado, círculos ocultos.

---

## 📆 Bloque 7 — 30 AGOSTO

> ⚠️ **Corrección total de datos y de layout.** No es un bloque centrado con
> "Canóvida Arca Verde" ni "Parque de Ibirapuera" ni "das LCh à 18h".
> Son **dos columnas**: detalles a la izquierda, píldora "Encerrado" a la derecha.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo: --c-orange                                                       │
│                                                                         │
│  ┌──────── COLUMNA IZQ (≈60%) ─────────┐   ┌──── COLUMNA DER (≈40%) ──┐ │
│  │                                     │   │                          │ │
│  │  30 AGOSTO       ← 32px Bold, azul  │   │                          │ │
│  │  ─────────────   ← regla BLANCA     │   │    ╭──────────────────╮  │ │
│  │                                     │   │    │    Encerrado     │  │ │
│  │  Local: Condor Água Verde  ← azul   │   │    ╰──────────────────╯  │ │
│  │                                     │   │    ▲ píldora BLANCA      │ │
│  │  das 14h às 18h                     │   │      texto --c-blue      │ │
│  │  ▲     ▲                            │   │      border-radius:31px  │ │
│  │  │     └ "14h às 18h" BLANCO bold   │   │                          │ │
│  │  └ "das " AZUL bold                 │   │                          │ │
│  │                                     │   │                          │ │
│  │  Período de inscrição:              │   │                          │ │
│  │  09/08 a 24/08/2025.       ← azul   │   │                          │ │
│  │                                     │   │                          │ │
│  │  ( Confira o regulamento )  ← botón │   │                          │ │
│  │    pequeño azul → PDF               │   │                          │ │
│  └─────────────────────────────────────┘   └──────────────────────────┘ │
│                                                                         │
│  ───────────────────────── regla blanca 1px ─────────────────────────    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Contenido literal:**

| Línea | Texto | Estilo |
|-------|-------|--------|
| Título | `30 AGOSTO` | Torus Bold 32px, `--c-blue` |
| Divisor | — | `border-top: 1px solid var(--c-white)`, ancho parcial (~280px) |
| Local | `Local: Condor Água Verde` | Torus Bold 18px, `--c-blue` |
| Horario | `das ` + `14h às 18h` | `das ` azul bold · `14h às 18h` **blanco** bold |
| Inscrição | `Período de inscrição: 09/08 a 24/08/2025.` | Torus Bold 16px, `--c-blue` |
| Botón PDF | `Confira o regulamento` | fondo `--c-blue`, texto blanco, radius 25px |
| Píldora | `Encerrado` | fondo `--c-white`, texto `--c-blue`, radius 31px |

### Especificaciones

- Layout: `display: grid; grid-template-columns: 1.5fr 1fr; align-items: center;`
- El horario mezcla dos colores en la **misma línea** → dos `<span>` dentro del `<p>`.
- Botón `Confira o regulamento`: `padding: 10px 24px`, 14px SemiBold, enlaza a
  `/assets/images/2025_Regulamento_Caocurso.pdf` con `target="_blank"`.
- Píldora `Encerrado`: **estado, no acción**. Es el mensaje de formulario expirado
  del original (`jet-form-schedule-message expired-message`).
  - `padding: 18px 64px`, Torus Bold ~22px, `cursor: default`, sin hover.
  - Marcarla como `aria-disabled="true"` o renderizarla como `<span>`, no `<button>`.
- Regla blanca al cerrar el bloque, a ancho completo del contenedor.

**Responsive**

- Desktop: 2 columnas, píldora alineada a la derecha.
- Tablet: 2 columnas `1fr 1fr`; píldora `padding: 16px 40px`.
- Mobile: 1 columna. Orden: título → detalles → botón PDF → píldora `Encerrado`
  centrada a ancho casi completo (`max-width: 280px; margin: 24px auto 0`).

---

## 🎪 Bloque 8 — ATRAÇÕES

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo de sección: --c-orange                                            │
│                                                                         │
│   ╭─────────────────────────────────────────────────────────────────╮   │
│   │  PANEL — background: var(--c-orange-lite) · radius 20px         │   │
│   │                                                                 │   │
│   │          Confira as outras atrações disponíveis:                │   │
│   │          ▲ H2 centrado, Torus Bold ~32px, --c-blue              │   │
│   │                                                                 │   │
│   │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │   │
│   │  │   BLANCA    │   │   BLANCA    │   │   BLANCA    │            │   │
│   │  │             │   │             │   │             │            │   │
│   │  │    ✿ 48px   │   │    ✿ 48px   │   │    ✿ 48px   │            │   │
│   │  │  icono line │   │  icono line │   │  icono line │            │   │
│   │  │  art AZUL   │   │  art AZUL   │   │  art AZUL   │            │   │
│   │  │             │   │             │   │             │            │   │
│   │  │  Camarim    │   │Caricaturista│   │  Petfotos   │            │   │
│   │  │             │   │             │   │             │            │   │
│   │  │ Seu PetStar │   │ Não perca   │   │Que tal uma  │            │   │
│   │  │ merece esse │   │ essa fofura.│   │foto impressa│            │   │
│   │  │ trato!      │   │             │   │com seu pet? │            │   │
│   │  └─────────────┘   └─────────────┘   └─────────────┘            │   │
│   ╰─────────────────────────────────────────────────────────────────╯   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Las 3 atrações, literales:**

| Título | Descripción | Icono |
|--------|-------------|-------|
| `Camarim` | `Seu PetStar merece esse trato!` | `Capa-1.png` |
| `Caricaturista` | `Não perca essa fofura.` | `Capa-1@2x.png` |
| `Petfotos` | `Que tal uma foto impressa com seu pet?` | `eIOE-8@2x.png` |

### Anatomía de la card

```
┌─────────────────────────────┐  background: var(--c-white)
│  padding: 28px 22px         │  border-radius: 16px
│  text-align: center         │  SIN borde superior de color
│                             │
│         ✿  ← icono line-art azul, ~48px
│                             │
│      Camarim   ← 16px Bold, --c-blue
│                             │
│  Seu PetStar merece         │  ← 13px Regular, --c-blue
│  esse trato!                │
└─────────────────────────────┘
```

### Especificaciones

- Panel contenedor: `--c-orange-lite`, radius 20px, `max-width: 1100px`,
  padding `40px 48px`.
- Grid interior: `repeat(3, 1fr); gap: 20px;`
- Cards de la **misma altura** (`align-items: stretch`).
- Icono: azul `--c-blue`, trazo fino. Sin círculo de fondo, sin color de acento.

**Responsive**

- Desktop: 3 columnas.
- Tablet: 3 columnas, padding de panel `32px 24px`, título 15px.
- Mobile: 1 columna, gap 14px, panel `24px 16px`.

---

## 🖼️ Bloque 9 — GALERIA (`#galeria`)

> ⚠️ **Corrección:** las fotos son **verticales (~4:5)**, no cuadradas, y el grid
> vive **dentro de un panel naranja claro**, no sobre el fondo pelado.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo de sección: --c-orange                                            │
│                                                                         │
│  ╭──────────────────────────────────────────────────────────────────╮   │
│  │  PANEL GRANDE — background: var(--c-orange-lite) · radius 32px   │   │
│  │                                                                  │   │
│  │            Confira como foi a edição anterior                    │   │
│  │            ▲ H2 centrado, Torus Bold ~34px, --c-blue             │   │
│  │            ────────── regla blanca ──────────                    │   │
│  │                        2024                                      │   │
│  │            ▲ H2 centrado, Torus Bold, --c-blue                   │   │
│  │                                                                  │   │
│  │   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                         │   │
│  │   │      │  │      │  │      │  │      │                         │   │
│  │   │ 📷 1 │  │ 📷 2 │  │ 📷 3 │  │ 📷 4 │   ← RETRATO ~4:5        │   │
│  │   │      │  │      │  │      │  │      │                         │   │
│  │   └──────┘  └──────┘  └──────┘  └──────┘                         │   │
│  │   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                         │   │
│  │   │      │  │      │  │      │  │      │                         │   │
│  │   │ 📷 5 │  │ 📷 6 │  │ 📷 7 │  │ 📷 8 │                         │   │
│  │   │      │  │      │  │      │  │      │                         │   │
│  │   └──────┘  └──────┘  └──────┘  └──────┘                         │   │
│  │   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                         │   │
│  │   │      │  │      │  │      │  │      │                         │   │
│  │   │ 📷 9 │  │ 📷10 │  │ 📷11 │  │ 📷12 │                         │   │
│  │   │      │  │      │  │      │  │      │                         │   │
│  │   └──────┘  └──────┘  └──────┘  └──────┘                         │   │
│  │                                                                  │   │
│  ╰──────────────────────────────────────────────────────────────────╯   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Las 12 fotos reales (edición 2024):**

```
IMG_5140-scaled.jpg   IMG_5142-scaled.jpg   IMG_5152-scaled.jpg   IMG_5162-scaled.jpg
IMG_5168-scaled.jpg   IMG_5173-scaled.jpg   IMG_5177-scaled.jpg   IMG_5185-scaled.jpg
IMG_5205-scaled.jpg   IMG_5208-scaled.jpg   IMG_5551-scaled.jpg
WhatsApp-Image-2024-04-29-at-10.08.29-17.jpeg
```

### Especificaciones

```css
.galeria__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.galeria__grid img {
  aspect-ratio: 4 / 5;      /* RETRATO — no 1/1 */
  object-fit: cover;
  border-radius: 12px;
  width: 100%;
}
```

- Panel: `--c-orange-lite`, `border-radius: 32px`, padding `48px 40px`,
  `max-width: 1200px`, `margin: 0 auto`.
- Cabecera: H2 `Confira como foi a edição anterior` → regla blanca fina →
  H2 `2024`. Ambos en `--c-blue`, centrados.
- `loading="lazy"` en las 12 imágenes. `alt` descriptivo en pt-BR
  (ej. `Mês Pet Condor 2024 — foto 1`).
- Hover (mejora sutil permitida): `transform: scale(1.03)`, 250ms `ease-out`.
- Ancla: `id="galeria"` en la `<section>`.

**Responsive**

- Desktop (≥1024px): 4 columnas × 3 filas, gap 12px.
- Tablet (768–1023px): 3 columnas × 4 filas, gap 10px.
- Mobile (<768px): 2 columnas × 6 filas, gap 8px, panel radius 20px, padding `24px 16px`.

---

## 🤝 Bloque 10 — PATROCÍNIO / APOIO

> ⚠️ **Sección que faltaba por completo.** No son "Partner 1/2/3" ni logos sueltos
> en el footer: es **una sola barra blanca redondeada a lo ancho**, con los logos
> reales en una fila.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ banda: --c-orange-lite                                                  │
│                                                                         │
│ ╭─────────────────────────────────────────────────────────────────────╮ │
│ │  BARRA BLANCA ÚNICA · border-radius: 20px · padding: 24px 32px      │ │
│ │                                                                     │ │
│ │  Patrocínio:  [Friskies][Dog Chow][Natural][Kelcat][Nesse][Keldog]  │ │
│ │   ▲ azul,                          [Purina ONE Cães][ONE Gatos]     │ │
│ │     cursiva                                                         │ │
│ │                                                                     │ │
│ │  Apoio:  [BRF Pet]  [Whiskas]  [Pedigree]                           │ │
│ │   ▲ azul, cursiva                                                   │ │
│ ╰─────────────────────────────────────────────────────────────────────╯ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Logos reales (nada de placeholders):**

| Grupo | Marca | Asset |
|-------|-------|-------|
| `Patrocínio:` | Friskies | `Logo-Friskies@2x.png` |
| | Dog Chow | `Logo-dog-Chow.png` |
| | Natural DOTS | `Image-2@2x-150x150.png` |
| | Kelcat | `AF_LOGO_KELCAT-CROMIA-002@2x.png` |
| | New DOTS | `Image-3.png` |
| | Keldog | `AF_LOGO_KELDOG_CROMIA-002.png` |
| | Purina ONE Cães | `Logo-Purina-One-Caes.png` |
| | Purina ONE Gatos | `Logo-Purina-One-Gatos.png` |
| `Apoio:` | BRF Pet | `Image-5@2x.png` |
| | Whiskas | `WHISKAS-LOGO.png` |
| | Pedigree | `Pedigree-Rosette-2021-Blue-Wordmark-RGB.png` |

### Especificaciones

- **Una única barra blanca**, no una card por logo, no una card por grupo.
- Etiquetas `Patrocínio:` y `Apoio:` — H2 pequeños, `--c-blue`, `font-style: italic`,
  ~18px, alineados a la izquierda de su fila.
- Fila de logos: `display: flex; flex-wrap: wrap; align-items: center; gap: 28px;`
- Normalización de logos: `max-height: 48px; width: auto; object-fit: contain;`
  (los assets vienen a escalas muy distintas).
- Sin filtros (`grayscale`) — los logos van a color, como en el original.
- La barra ocupa todo el ancho del contenedor (`max-width: 1200px`).

**Responsive**

- Desktop: `Patrocínio:` + sus 8 logos en una fila; `Apoio:` + 3 logos en la siguiente.
- Tablet: mismo esquema, `gap: 20px`, `max-height: 38px`, permite wrap a 2 líneas.
- Mobile: etiqueta arriba centrada, logos en grid `repeat(3, 1fr)` con `gap: 16px`,
  `max-height: 30px`; barra con `border-radius: 16px` y padding `20px 16px`.

---

## 🔵 Bloque 11 — FOOTER

```
┌─────────────────────────────────────────────────────────────────────────┐
│ fondo: --c-blue-mid (#0061B2) · padding: 32px 48px · color: blanco     │
│                                                                         │
│  ┌──────────┐      ┌────────────────────────┐      ┌────────────────┐  │
│  │ Logo-    │      │ ©Condor 2025.          │      │ ⬤ ⬤ ⬤ ⬤ ⬤ ⬤ │  │
│  │ Grande   │      │ Todos os direitos      │      │ f  ig  X  yt   │  │
│  │ .png     │      │ reservados.            │      │ in  tt         │  │
│  │ (blanco) │      │ ▲ 13px Regular, blanco │      │ ▲ 6 círculos   │  │
│  └──────────┘      └────────────────────────┘      └────────────────┘  │
│      IZQ                    CENTRO                        DER           │
└─────────────────────────────────────────────────────────────────────────┘
```

**Copyright literal:** `©Condor 2025. Todos os direitos reservados.`

**Las 6 redes sociales, en orden:**

| Red | URL |
|-----|-----|
| Facebook | `https://www.facebook.com/RedeCondor/` |
| Instagram | `https://www.instagram.com/redecondor/` |
| X | `https://twitter.com/RedeCondor` (icono `twitter.svg` en assets) |
| YouTube | `https://www.youtube.com/user/redecondor` |
| LinkedIn | `https://br.linkedin.com/company/redecondor` |
| TikTok | `https://www.tiktok.com/@redecondor` |

### Especificaciones

- Layout: `display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;`
- `Logo-Grande.png`: `max-height: 56px`, versión blanca, alineado a la izquierda.
- Iconos sociales: círculos blancos de ~34px ⌀ con el glifo en `--c-blue-mid`
  (o glifo blanco con borde blanco — verificar contra el screenshot al implementar).
  Gap 12px. `target="_blank" rel="noopener noreferrer"` y `aria-label` por red.
- **No hay logos de patrocinadores en el footer** — viven en el bloque 10.

**Responsive**

- Desktop: 3 columnas (logo · copyright · sociales).
- Tablet: 3 columnas, logo `max-height: 44px`, iconos 30px.
- Mobile: 1 columna centrada, orden logo → sociales → copyright, gap 20px,
  padding `28px 20px`.

---

## 📏 Espaciado y contenedores

### Contenedor de página

```
Desktop  (≥1024px): max-width 1200px · padding 0 48px
Tablet   (768–1023): max-width 100%   · padding 0 32px
Mobile   (<768px):   max-width 100%   · padding 0 20px
```

### Ritmo vertical

```
┌───────────────────────────┐
│  BLOQUE N                 │
├───────────────────────────┤  padding-bottom del bloque: 56px desktop / 32px mobile
│  ▨ FRANJA (Pattern.png)   │  65px / 48px / 36px — SIN margen: pega a ambos lados
├───────────────────────────┤  padding-top del bloque siguiente: 56px / 32px
│  BLOQUE N+1               │
└───────────────────────────┘
```

- Las franjas van **a sangre completa** (`width: 100vw`), fuera del contenedor.
- Entre bloques **sin franja** (p. ej. Requisitos → Protetoras): separación 48px
  desktop / 28px mobile. **Nunca** cambia el color de fondo entre ellos.

### Dónde va cada franja separadora (4 en total)

```
Hero  ▨  Adote  ▨🐈  Eventos … Requisitos … Protetoras  ▨  Cãocurso  ▨  30 Agosto …
```

Ni Requisitos, ni Protetoras, ni Atrações, ni Galeria, ni Patrocínio llevan franja
antes o después: se separan sólo por espaciado sobre el mismo naranja.

---

## 🚫 Tabla de errores de la versión anterior (ya corregidos aquí)

| Antes decía | Real |
|-------------|------|
| No existía el nav del header | Nav a la derecha, 5 items, activo con subrayado blanco |
| No existía la sección Protetoras | 3 cards blancas con logo + nombre + Instagram |
| No existía Patrocínio / Apoio | Una barra blanca a lo ancho con 11 logos reales |
| Hero: `<h1>` de texto "…PARA QUEM AMA!" | `Titulo.png`, **imagen** — "…PRA CACHORRO." + "e pra gatos também!" |
| Tagline hero "Donec malesuada libero…" | No existe (era lorem ipsum) |
| Fondos alternando naranja / blanco / `#F9F9F9` | Naranja en toda la página; blanco sólo en cards y barra de patrocinadores |
| Separador = barras planas de 16px | Tiles ~65px con iconos de patas y huesos (`Pattern.png`) |
| Sin el gato colgando | `Gato.png` cuelga sobre la franja previa a Eventos |
| Eventos: Clínica Amigos Ñ / Canile Amistad / Ciudad Amistad, `11h às 13h` | Condor Araucária BR / Nilo Peçanha / Água Verde / Campo Comprido, `11h às 15h` |
| Fechas 9 · 9 · 16 · 23 | **2 · 9 · 16 · 23** |
| Requisitos = 3 cards con iconos y borde de color | 1 panel `--c-orange-lite` + 6 bullets en 2 columnas |
| "CHO CURSO" | **Cãocurso** |
| "Seu pet é o astreio da nossa pasarela" (texto) | "Seu pet é a estrela da nossa passarela." — **imagen** `Txt@2x-1.png` |
| Botón "Encerrado" dentro de Cãocurso | Vive en el bloque 7 (30 Agosto), columna derecha |
| 30 Agosto: "Canóvida Arca Verde", "Parque de Ibirapuera", "das LCh à 18h", centrado | "Condor Água Verde", "das 14h às 18h", inscrição 09/08 a 24/08/2025, layout 2 columnas |
| Atrações = Juego / Premios / Talleres, sin panel | Camarim / Caricaturista / Petfotos dentro de un panel `--c-orange-lite` |
| "Confiro como fol a edición anterior" | "Confira como foi a edição anterior" |
| Galería cuadrada (1:1), sin panel | Retrato ~4:5 dentro de panel `--c-orange-lite` |
| Footer con logos de partners y 4 redes | Sin partners; 6 redes: FB · IG · X · YouTube · LinkedIn · TikTok |
| Footer "© 2024 Pet Condor" | "©Condor **2025**. Todos os direitos reservados." |
| Colores `#F5A623` `#003D82` `#00BCD4` `#4CAF50` `#F44336` | `#F09624` `#00419A` `#0061B2` `#FFBB3E` `#FDB020` |

---

## ✅ Checklist de verificación visual

Comparar contra `petCondor.png` (ignorando la barra de admin de WordPress arriba).

**Estructura**

- [ ] El nav aparece arriba a la derecha, sin barra de fondo, con `Home` subrayado
- [ ] Los 11 bloques están en el orden de GROUND_TRUTH §3
- [ ] Protetoras existe, entre Requisitos y la franja previa a Cãocurso
- [ ] Patrocínio / Apoio existe, entre Galeria y el Footer
- [ ] Hay exactamente 4 franjas separadoras y ninguna sobra

**Color y tipografía**

- [ ] Ninguna sección tiene fondo blanco ni `#F9F9F9`
- [ ] Sólo se usan los 9 tokens de la paleta
- [ ] Todo el texto renderiza en Torus (self-hosted), no en Montserrat/Inter
- [ ] Los paneles de Requisitos / Atrações / Galeria son `#FFBB3E`

**Contenido pt-BR**

- [ ] Fechas de eventos: 2 · 9 · 16 · 23 AGOSTO, todas `11h às 15h`
- [ ] Requisitos: 6 bullets, dos columnas, un solo panel
- [ ] Cãocurso escrito con cedilla y tilde
- [ ] 30 AGOSTO: Condor Água Verde, das 14h às 18h, 09/08 a 24/08/2025
- [ ] Copyright: `©Condor 2025. Todos os direitos reservados.`
- [ ] Cero español en pantalla

**Assets**

- [ ] Cero placeholders de Unsplash y cero "Partner 1/2/3"
- [ ] Las 12 fotos de la galería son los archivos reales de 2024
- [ ] Los 11 logos de patrocínio/apoio son los archivos reales
- [ ] `Titulo.png` y `Txt@2x-1.png` se usan como imagen, con `sr-only` de respaldo

**Layout**

- [ ] Galería: 4 columnas en desktop, fotos en retrato (~4:5)
- [ ] 30 Agosto: dos columnas, píldora `Encerrado` a la derecha
- [ ] Las patas del gato cuelgan sobre la franja previa a Eventos
- [ ] Mobile: todo colapsa a 1 columna salvo la galería (2 columnas)
