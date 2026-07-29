# GROUND TRUTH — Pet Condor LP (pet.condor.com.br)

> **Fuente de verdad única.** Extraído del HTML scrapeado, el CSS original y el screenshot
> de referencia. Si cualquier otro documento contradice éste, **éste gana**.
>
> Fuentes verificadas:
> - `/home/diego/armando/Migraciones/petCondor/content/html/index.html` (HTML renderizado)
> - `/home/diego/armando/Migraciones/petCondor/content/pages.json` (página `pet2025`)
> - `/home/diego/armando/Migraciones/petCondor/assets/css/post-683.css` (CSS de la página)
> - `/home/diego/armando/Migraciones/petCondor/assets/fonts/` (Torus TTF)
> - `/home/diego/armando/Migraciones/petCondor/site/public/assets/images/` (105 imágenes)
> - `petCondor.png` (1920×7478, incluye la barra de admin de WordPress arriba — **ignorarla**)

---

## 0. Identidad del proyecto

| Campo | Valor real |
|-------|-----------|
| Marca | **Condor** (rede de supermercados, Paraná, Brasil) |
| Campaña | **Mês Pet** — hub de tres sub-campañas |
| Sub-campañas | **Adote um AuMigo** (adopción) · **Cãocurso** (concurso) · **Galeria** |
| Idioma | **Portugués de Brasil (pt-BR)**, 100%. Sin español. |
| Año | **2025** (la galería muestra la edición **2024**) |
| Dominio | `pet.condor.com.br` |
| Stack original | WordPress + Elementor Pro + JetFormBuilder (a replicar con Astro) |

> ⚠️ **El formulario es de INSCRIPCIÓN AL CONCURSO, no de adopción.**
>
> El sitio original no tiene formulario activo (el de Cãocurso figura como *Encerrado*).
> El modal de este rebuild es un **añadido nuevo e intencional**, y su propósito es:
>
> **registrar UNA mascota con su foto para que pueda recibir votos en el concurso Cãocurso.**
>
> No es un formulario de adopción. No pide dirección, patio ni "¿tienes mascotas?".
> Pide datos del tutor, datos de la mascota, **la foto (obligatoria, es el núcleo)** y la
> aceptación del regulamento + autorización de uso de imagen.
>
> No aplica "pixel-perfect vs original" a este componente; sí aplica el design system.

---

## 1. Paleta real

Valores tomados de `post-683.css` (por frecuencia de uso) y verificados por muestreo de
píxeles sobre `petCondor.png`.

```css
:root {
  /* Azules — el color de autoridad de la marca */
  --c-blue:        #00419A;  /* PRINCIPAL: títulos, cards de evento, texto sobre naranja */
  --c-blue-mid:    #0061B2;  /* footer, botones secundarios, acentos */

  /* Naranjas — el fondo de toda la página */
  --c-orange:      #F09624;  /* fondo base de la página y de las secciones */
  --c-orange-lite: #FFBB3E;  /* paneles redondeados (requisitos, atrações, galeria) */
  --c-orange-deep: #FDB020;  /* acentos, bordes */

  /* Neutros */
  --c-white:       #FFFFFF;
  --c-gray:        #A8A8A8;
  --c-gray-dark:   #3E3E3E;

  /* Alerta */
  --c-red:         #E20614;
}
```

**Colores que la documentación anterior inventó y NO existen en la marca:**
`#F5A623`, `#003D82`, `#00BCD4` (turquesa), `#E91E63` (magenta), `#4CAF50` (verde),
`#F44336`, `#9C27B0` (violeta).

> Los verdes / rosas / morados **sólo** aparecen dentro de los *tiles* de la franja
> separadora, que es una **imagen** (`Pattern.png`), no CSS. No son tokens del sistema.

### Muestreo de píxeles (verificación cruzada)

| Zona | Hex medido | Token |
|------|-----------|-------|
| Fondo hero | `#EE9120` | `--c-orange` |
| Card de evento | `#00419A` | `--c-blue` |
| Panel requisitos | `#FFBB45` | `--c-orange-lite` |
| Card protetora | `#FFFFFF` | `--c-white` |
| Barra patrocinadores | `#FFBB3E` | `--c-orange-lite` |
| Footer | `#0061B2` | `--c-blue-mid` |

---

## 2. Tipografía real

**Fuente de marca: `Torus`** (Paulo Goode) — geométrica redondeada. Ya está descargada:

```
/home/diego/armando/Migraciones/petCondor/assets/fonts/
├── Paulo-Goode-Torus-Thin.ttf
├── Paulo-Goode-Torus-Light.ttf
├── Paulo-Goode-Torus-Regular.ttf
├── Paulo-Goode-Torus-SemiBold.ttf
├── Paulo-Goode-Torus-Bold.ttf
└── Paulo-Goode-Torus-Heavy.ttf
```

**Self-hostear** (convertir a `.woff2`). No usar Google Fonts para el display.
Montserrat / Roboto / Roboto Slab aparecen en el CSS pero son *defaults de Elementor*,
no de la marca — ignorarlos salvo como fallback.

```css
:root {
  --font-display: 'Torus', system-ui, sans-serif;  /* todo el sitio */
}
```

**NO usar** Montserrat + Inter (era la suposición de la documentación anterior).

### Escala observada (desktop, ancho 1920)

| Elemento | Tamaño aprox. | Peso | Color |
|----------|--------------|------|-------|
| Título de sección (`Em quatro datas…`) | 40–44px | Bold | bicolor azul + blanco |
| Fecha de evento (`2 AGOSTO`) | 28px | Bold | blanco |
| Detalle de evento | 16px | Regular | blanco |
| `30 AGOSTO` | 32px | Bold | azul |
| Título de card (Camarim…) | 16px | Bold | azul |
| Descripción de card | 13px | Regular | azul |
| Bullets de requisitos | 14px | Regular | azul |
| Copyright | 13px | Regular | blanco |

---

## 3. Estructura real de la página (orden exacto)

Derivada de la secuencia de `<h*>` e `<img>` del HTML renderizado.

```
┌─ NAV (sobre el naranja, sin barra propia, alineada a la derecha)
│    Home(#) · Adote um Aumigo(#adote) · Cãocurso(#caocurso) ·
│    Galeria(#galeria) · Regulamento(PDF externo)
│    El item activo lleva subrayado blanco.
│
├─ 1. HERO  ......................................... fondo --c-orange + patrón line-art
│    IZQ:  Selo.png            (logo "MÊS PET" + lockup Condor)
│          Titulo-1024x477.png (texto "NO MÊS DO PET, TEM PREÇO BAIXO PRA CACHORRO."
│                               + script manuscrita "e pra gatos também!")
│    DER:  Pet-2.png           (chihuahua con gafas de sol y chaqueta de cuero)
│          + círculos de colores flotando (pata, hueso, perro, comedero)
│
├─ ═══ FRANJA SEPARADORA (Pattern.png / Pattern@2x.png) ═══
│
├─ 2. ADOTE UM AUMIGO  .............................. #adote
│    IZQ:  Dog.png                    (perro blanco y negro, foto recortada)
│    DER:  Selo-Adote-um-Aumigo.png   (logo "ADOTE UM AuMigo" + lockup Condor)
│          H2: "Dê uma chance para aquele que nunca te abandona."
│
├─ ═══ FRANJA SEPARADORA ═══   (las patas del gato cuelgan por encima)
│
├─ 3. EVENTOS
│    H2 bicolor centrado:  "Em quatro datas," (azul) + "quatro chances de
│                           encontrar o amor mais leal." (blanco)
│    Regla horizontal blanca fina arriba y abajo del grid.
│    Grid 2×2 de cards azul --c-blue, esquinas redondeadas (~12px):
│      ┌ 2 AGOSTO  ─── │ Condor Araucária BR    │ 11h às 15h
│      ┌ 9 AGOSTO  ─── │ Condor Nilo Peçanha    │ 11h às 15h
│      ┌ 16 AGOSTO ─── │ Condor Água Verde      │ 11h às 15h
│      ┌ 23 AGOSTO ─── │ Condor Campo Comprido  │ 11h às 15h
│    (la fecha lleva una regla blanca fina debajo, dentro de la card)
│
├─ 4. REQUISITOS
│    UN SOLO panel redondeado --c-orange-lite (NO tres cards).
│    H2 azul centrado: "Requisitos para adoção:"
│    Lista de 6 bullets en DOS columnas, texto azul:
│      – Ter, no mínimo, 21 anos;
│      – Portar RG, CPF e comprovante de residência;
│      – Responder a uma entrevista sobre os motivos da adoção;
│      – Assinar e concordar com o termo de adoção;
│      – Ter condições financeiras para manter o animalzinho;
│      – Ter local seguro e adequado.
│
├─ 5. PROTETORAS   ⚠️ SECCIÓN QUE FALTABA POR COMPLETO
│    3 cards blancas redondeadas, centradas: logo + nombre + icono Instagram
│      · Instituto Seres & Vidas         → instagram.com/seres_vidas/
│      · Instituto SOS 4 Patas PR        → instagram.com/sos4patas.pr/
│      · Marcia Santos Protetora de Animais → instagram.com/marciasantos.protetora/
│
├─ ═══ FRANJA SEPARADORA ═══
│
├─ 6. CÃOCURSO  ..................................... #caocurso
│    IZQ:  Selo@2x-1024x791.png (logo "CÃOCURSO" + lockup Condor)
│          Txt@2x-1.png         ("Seu pet é a estrela da nossa passarela.",
│                                 magenta con contorno blanco — es una imagen)
│    DER:  Pet-2.png (mismo chihuahua) + círculos de iconos
│
├─ ═══ FRANJA SEPARADORA ═══
│
├─ 7. 30 AGOSTO
│    IZQ:  H2 "30 AGOSTO" azul + regla blanca debajo
│          "Local: Condor Água Verde"           (azul bold)
│          "das " (azul bold) + "14h às 18h"    (blanco bold)
│          "Período de inscrição: 09/08 a 24/08/2025."  (azul bold)
│          botón pequeño azul "Confira o regulamento" → PDF
│    DER:  botón píldora blanco grande "Encerrado" (texto --c-blue)
│    Regla horizontal blanca al cerrar.
│
├─ 8. ATRAÇÕES
│    Panel --c-orange-lite con H2 azul: "Confira as outras atrações disponíveis:"
│    3 cards blancas redondeadas (icono line-art azul ~48px + título + desc):
│      · Camarim       — "Seu PetStar merece esse trato!"      (Capa-1.png)
│      · Caricaturista — "Não perca essa fofura."              (Capa-1@2x.png)
│      · Petfotos      — "Que tal uma foto impressa com seu pet?" (eIOE-8@2x.png)
│
├─ 9. GALERIA  ...................................... #galeria
│    Panel grande redondeado --c-orange-lite.
│    H2 azul "Confira como foi a edição anterior" + regla blanca + H2 azul "2024"
│    Grid 4 columnas × 3 filas = 12 fotos, gap pequeño, retrato (~4:5).
│
├─ 10. PATROCÍNIO / APOIO
│    UNA barra blanca redondeada a lo ancho, en una sola fila:
│      "Patrocínio:" (azul, cursiva) + logos:
│         Friskies · Dog Chow · Natural DOTS · Kelcat · New DOTS · Keldog ·
│         Purina ONE Cães · Purina ONE Gatos
│      "Apoio:" (azul, cursiva) + logos:
│         BRF Pet · Whiskas · Pedigree
│
└─ 11. FOOTER  ...................................... fondo --c-blue-mid (#0061B2)
     IZQ:    Logo-Grande.png (logo Condor blanco)
     CENTRO: "©Condor 2025. Todos os direitos reservados."
     DER:    6 iconos sociales circulares blancos:
        Facebook  → facebook.com/RedeCondor/
        Instagram → instagram.com/redecondor/
        X         → (perfil X/Twitter de Condor)
        YouTube   → youtube.com/user/redecondor
        LinkedIn  → (perfil LinkedIn de Condor)
        TikTok    → tiktok.com/@redecondor
```

---

## 4. La franja separadora (corrección importante)

**NO son barras de color planas.** Es una tira a sangre completa de **tiles cuadrados
(~65px) de colores, cada uno con un icono de pata o hueso**, alternando:

```
azul · morado · rojo · lila · verde · rosa · naranja   (y repite)
```

Se implementa con la imagen `Pattern.png` / `Pattern@2x.png` como
`background-repeat: repeat-x`, altura ~65px desktop.

En la franja que precede a la sección de eventos, **las patas del gato cuelgan por
encima** de la tira (elemento decorativo superpuesto).

---

## 5. Inventario de assets (ya disponibles)

Ruta: `/home/diego/armando/Migraciones/petCondor/site/public/assets/images/` (105 archivos)

| Propósito | Archivo |
|-----------|---------|
| Logo Mês Pet | `Selo.png`, `Selo@2x.png` |
| Título hero | `Titulo.png`, `Txt@2x.png` |
| Perro hero / Cãocurso | `Pet-2.png` |
| Perro adopción | `Dog.png` |
| Gato (patas colgando) | `Gato.png` |
| Logo Adote um AuMigo | `Selo-Adote-um-Aumigo.png` |
| Logo Cãocurso | `Selo@2x.png` |
| Tagline Cãocurso | `Txt@2x-1.png` |
| Franja separadora | `Pattern.png`, `Pattern@2x.png` |
| Logo Condor footer | `Logo-Grande.png` |
| Protetoras | `InstitutoSeres-e-vidas.png`, `sos-4-patas.png`, `Marcia-Protetora-300x161.jpg` |
| Atrações | `Capa-1.png`, `Capa-1@2x.png`, `eIOE-8@2x.png` |
| Patrocinadores | `Logo-dog-Chow.png`, `AF_LOGO_KELCAT-CROMIA-002@2x.png`, `AF_LOGO_KELDOG_CROMIA-002.png`, `Logo-Purina-One-Caes.png`, `Logo-Purina-One-Gatos.png`, `Image-2@2x-150x150.png`, `Image-3.png` |
| Apoio | `Image-5@2x.png`, `WHISKAS-LOGO.png`, `Pedigree-Rosette-2021-Blue-Wordmark-RGB.png` |
| Regulamento | `2025_Regulamento_Caocurso.pdf` |
| Fondo Cãocurso | `BG-Caocurso.jpg`, `Faixa-Caocurso.jpg` |

**Galería (12 fotos, edición 2024):**
```
IMG_5140-scaled.jpg   IMG_5142-scaled.jpg   IMG_5152-scaled.jpg   IMG_5162-scaled.jpg
IMG_5168-scaled.jpg   IMG_5173-scaled.jpg   IMG_5177-scaled.jpg   IMG_5185-scaled.jpg
IMG_5205-scaled.jpg   IMG_5208-scaled.jpg   IMG_5551-scaled.jpg
WhatsApp-Image-2024-04-29-at-10.08.29-17.jpeg
```

**No usar placeholders de Unsplash.** Todo el material real existe.

---

## 6. El formulario: inscripción al concurso Cãocurso

### Propósito

**Registrar una mascota, con su foto, para que compita y reciba votos en el Cãocurso.**

No es adopción. El flujo es: el tutor abre el modal desde un CTA → rellena sus datos y
los de su mascota → sube **una foto** → acepta el regulamento y la cesión de imagen →
se crea una **ficha de la mascota votable**.

### Campos (8)

| # | Campo | Tipo | Oblig. | Notas |
|---|-------|------|--------|-------|
| 1 | `tutorNome` | text | ✅ | nombre completo del tutor |
| 2 | `tutorEmail` | email | ✅ | para confirmar la inscripción y enviar el enlace de votación |
| 3 | `tutorTelefone` | tel | ✅ | contacto (formato BR) |
| 4 | `petNome` | text | ✅ | nombre de la mascota |
| 5 | `petEspecie` | radio | ✅ | `Cão` / `Gato` |
| 6 | `petIdade` | select/text | ➖ | edad aproximada |
| 7 | `petFoto` | **file** | ✅ | **el núcleo del formulario**. 1 imagen, JPG/PNG/WebP, máx 5 MB, mín 600×600 px |
| 8 | `aceiteRegulamento` | checkbox | ✅ | acepta el regulamento **y autoriza el uso de imagen** de la foto |

Extra opcional: `querNovidades` (checkbox, opt-in de novedades).

**Campos que NO van** (eran del formulario de adopción imaginado y hay que eliminarlos):
`direccion`, `tienePatio`, `tieneMascotas`, `descripcionMascotas`, `documento de identidad`.

### Endpoint

`/api/feedback` **existe en el proyecto central pero NO sirve aquí**:

```ts
// Migraciones/petCondor/site/src/pages/api/feedback.ts
const { pageId, content, author, timestamp } = data;
if (!pageId || !content) return 400;   // ← rechaza cualquier otro payload
```

Es el endpoint de feedback de la documentación interna: escribe markdown en
`../docs/feedback`. Con el payload de inscripción devuelve **400**.

**Correcto para este proyecto:**

- Endpoint nuevo: **`POST /api/inscricao`**
- Content-Type: **`multipart/form-data`** — obligatorio, porque `petFoto` es un archivo
  y un archivo no cabe en un body JSON.
- Respuesta de éxito debe devolver el `id` de la ficha creada y su URL de votación.
- Astro debe ir con **`output: 'server'`** + **`@astrojs/node`** (adapter standalone),
  o las rutas API no se ejecutan.

### Consideraciones propias de un concurso con votación

Documentar (aunque la votación en sí quede fuera del MVP):

- **Moderación**: la ficha nace en estado `pendente`; no recibe votos hasta ser aprobada.
  Evita que una foto inadecuada aparezca publicada al instante.
- **Cesión de imagen**: el checkbox de aceptación debe cubrir explícitamente el uso de la
  foto de la mascota en la web y redes de Condor. Es el requisito legal del concurso.
- **Una inscripción por mascota**: deduplicar por email + nombre de mascota.
- **Antifraude de votos**: fuera del MVP, pero dejar anotado que la votación necesitará
  limitación por IP/sesión.

---

## 7. Errata corregida de la documentación previa

| Documento previo decía | Real |
|------------------------|------|
| "NO MÊS DO PET, TEM PREÇO BAIXO **PARA QUEM AMA**!" | "…**PRA CACHORRO.**" + "e pra gatos também!" |
| "Donec malesuada libero vel nulla…" (lorem ipsum) | no existe |
| "CHO CURSO" | **Cãocurso** |
| "Seu pet é o **astreio** da nossa **pasarela**" | "Seu pet é a **estrela** da nossa **passarela**." |
| "Confiro como **fol** a edición anterior" | "Confira como **foi** a edição anterior" |
| "Canóvida Arca Verde · Parque de Ibirapuera · das LCh à 18h" | "Condor Água Verde · das 14h às 18h" |
| Eventos: Clínica Amigos Ñ / Canile Amistad / Ciudad Amistad, `11h às 13h` | Condor Araucária BR / Nilo Peçanha / Água Verde / Campo Comprido, `11h às 15h` |
| Fechas 9 · 9 · 16 · 23 | **2 · 9 · 16 · 23** |
| Requisitos = 3 cards con iconos | panel único con lista de 6 bullets |
| Atrações = Juego / Premios / Talleres | **Camarim / Caricaturista / Petfotos** |
| Footer "© 2024 Pet Condor" | "©Condor **2025**" |
| Social: FB · IG · WhatsApp · Twitter | FB · IG · **X · YouTube · LinkedIn · TikTok** |
| Fondos alternan naranja/blanco | **casi todo naranja**; el blanco sólo en cards |
| Sección de eventos con fondo `#F9F9F9` | naranja |
| Separador = barras de color planas | tiles con iconos de patas/huesos (imagen) |
| — | **faltaba la sección Protetoras** |
| — | **faltaba Patrocínio / Apoio** |
| — | **faltaba el nav del header** |
| "Mascotas desc: si **patio**='Sí'" | si **mascotas**='Sí' |

---

**Última verificación:** 2026-07-29 · contra HTML + CSS + screenshot originales.
