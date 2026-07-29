# Contenido y Datos: Pet Condor LP

> **Fuente de datos del proyecto.** Todos los textos de esta página están en
> **portugués de Brasil (pt-BR)** y son **literales** del original `pet.condor.com.br`.
> La prosa explicativa (encabezados, notas, tablas de guía) está en español.
>
> Verificado contra:
> - `/home/diego/armando/Migraciones/petCondor/content/html/index.html`
> - `/home/diego/armando/Migraciones/petCondor/assets/css/post-683.css`
> - `/home/diego/armando/Migraciones/petCondor/site/public/assets/images/` (105 assets reales)
>
> ⚠️ Si algo aquí contradice `GROUND_TRUTH.md`, **gana GROUND_TRUTH.md**.

---

## 📑 Índice

1. [Textos literales por bloque](#1-textos-literales-por-bloque-pt-br)
2. [Datos dinámicos (arrays)](#2-datos-dinámicos-arrays)
3. [Estructura de directorios de assets](#3-estructura-de-directorios-de-assets)
4. [Paleta — CSS custom properties](#4-paleta--css-custom-properties)
5. [Tipografía — @font-face Torus](#5-tipografía--font-face-torus)
6. [Meta tags SEO](#6-meta-tags-seo-pt-br)
7. [Contrato del endpoint POST /api/inscricao](#7-contrato-del-endpoint-post-apiinscricao)
8. [SITE_CONFIG](#8-site_config)
9. [Erratas corregidas](#9-erratas-corregidas-respecto-a-la-versión-previa-de-este-documento)

---

## 1. Textos literales por bloque (pt-BR)

La página tiene **11 bloques + footer**, en este orden exacto:

```
Nav → Hero → Adote um AuMigo → Eventos → Requisitos → Protetoras →
Cãocurso → 30 Agosto → Atrações → Galeria → Patrocínio/Apoio → Footer
```

---

### 🧭 Bloque 0 — NAV

Menú alineado a la derecha, **sobre el naranja** (sin barra propia).
El item activo lleva subrayado blanco.

```
Home  ·  Adote um Aumigo  ·  Cãocurso  ·  Galeria  ·  Regulamento
```

| Label (literal) | Destino |
|-----------------|---------|
| `Home` | `#` |
| `Adote um Aumigo` | `#adote` |
| `Cãocurso` | `#caocurso` |
| `Galeria` | `#galeria` |
| `Regulamento` | `/assets/docs/2025_Regulamento_Caocurso.pdf` (PDF, `target="_blank"`) |

> **Nota:** en el nav la marca se escribe `Adote um Aumigo` (con `u` minúscula);
> en el **logo** de la sección se escribe `ADOTE UM AuMigo`. Respetar ambas grafías.

---

### 🐕 Bloque 1 — HERO

Fondo `--c-orange` + patrón line-art. **Todo el texto del hero es imagen**, no HTML.

| Elemento | Asset | Contenido |
|----------|-------|-----------|
| Sello | `Selo.png` | Logo **MÊS PET** + lockup Condor |
| Título | `Titulo-1024x477.png` | `NO MÊS DO PET, TEM PREÇO BAIXO PRA CACHORRO.` + script manuscrita `e pra gatos também!` |
| Mascota | `Pet-2.png` | Chihuahua con gafas de sol y chaqueta de cuero |
| Decoración | círculos flotantes | Iconos: pata, hueso, perro, comedero |

**Textos alternativos (`alt`) sugeridos — pt-BR:**

```
Selo.png              → "Mês Pet Condor"
Titulo-1024x477.png   → "No mês do pet, tem preço baixo pra cachorro. E pra gatos também!"
Pet-2.png             → "Cachorro com óculos escuros e jaqueta de couro"
```

> ⚠️ El original **no tiene CTA en el hero**. El botón que abre el modal de **inscripción
> al Cãocurso** es un **añadido nuevo** de este rebuild (ver `FORM_ESPECIFICACION.md`).
> No es un formulario de adopción.

---

### ═══ FRANJA SEPARADORA ═══

No es una barra de color plana. Es la imagen `Pattern.png` / `Pattern@2x.png`
(tiles de ~65px con iconos de patas y huesos), `background-repeat: repeat-x`.

En la franja que precede a **Eventos**, las patas del gato (`Gato.png`) cuelgan por encima.

---

### 🐾 Bloque 2 — ADOTE UM AUMIGO (`#adote`)

| Columna | Asset / Texto |
|---------|---------------|
| IZQ | `Dog.png` — perro blanco y negro recortado |
| DER | `Selo-Adote-um-Aumigo.png` — logo **ADOTE UM AuMigo** + lockup Condor |

**H2 literal:**

```
Dê uma chance para aquele que nunca te abandona.
```

---

### 📅 Bloque 3 — EVENTOS

**H2 bicolor centrado** (dos tramos, mismo párrafo):

```
Em quatro datas,                                    ← azul  (--c-blue)
quatro chances de encontrar o amor mais leal.       ← blanco
```

Regla horizontal blanca fina arriba y abajo del grid.
Grid **2×2** de cards `--c-blue`, esquinas redondeadas (~12px), texto blanco.

| Fecha | Local | Horario |
|-------|-------|---------|
| `2 AGOSTO` | `Condor Araucária BR` | `11h às 15h` |
| `9 AGOSTO` | `Condor Nilo Peçanha` | `11h às 15h` |
| `16 AGOSTO` | `Condor Água Verde` | `11h às 15h` |
| `23 AGOSTO` | `Condor Campo Comprido` | `11h às 15h` |

> La fecha lleva una regla blanca fina debajo, **dentro** de la card.
> En el HTML original la cuarta card trae `11h  às 15h` (doble espacio). Es una errata
> del original: normalizar a `11h às 15h`.

---

### 📋 Bloque 4 — REQUISITOS

**H2 azul centrado:**

```
Requisitos para adoção:
```

**Lista de 6 bullets, texto azul, en DOS columnas:**

```
– Ter, no mínimo, 21 anos;
– Portar RG, CPF e comprovante de residência;
– Responder a uma entrevista sobre os motivos da adoção;
– Assinar e concordar com o termo de adoção;
– Ter condições financeiras para manter o animalzinho;
– Ter local seguro e adequado.
```

> ⚠️ **NOTA CRÍTICA — NO SON CARDS.**
> Los requisitos son una **lista de 6 bullets dentro de UN ÚNICO panel redondeado**
> de color `--c-orange-lite` (`#FFBB3E`). No hay tres tarjetas, no hay iconos por
> requisito, no hay colores de borde por requisito. El separador de cada línea es
> un guion medio literal `–` (U+2013), no `•` ni `-`.

---

### 🏠 Bloque 5 — PROTETORAS

3 cards **blancas** redondeadas, centradas: logo + nombre + icono Instagram.
Sin H2 propio en el original.

| Nombre (literal, 2 líneas) | Logo | Instagram |
|----------------------------|------|-----------|
| `Instituto`<br>`Seres & Vidas` | `InstitutoSeres-e-vidas-300x266.png` | `https://www.instagram.com/seres_vidas/` |
| `Instituto SOS 4 Patas PR` | `sos-4-patas.png` | `https://www.instagram.com/sos4patas.pr/` |
| `Marcia Santos`<br>`Protetora de Animais` | `Marcia-Protetora-300x161.jpg` | `https://www.instagram.com/marciasantos.protetora/` |

---

### 🏆 Bloque 6 — CÃOCURSO (`#caocurso`)

Bloque **100% imágenes** (no hay texto HTML).

| Columna | Asset | Contenido |
|---------|-------|-----------|
| IZQ | `Selo@2x-1024x791.png` | Logo **CÃOCURSO** + lockup Condor |
| IZQ | `Txt@2x-1.png` | `Seu pet é a estrela da nossa passarela.` (magenta con contorno blanco) |
| DER | `Pet-2.png` | Mismo chihuahua + círculos de iconos |

> El tagline `Seu pet é a estrela da nossa passarela.` **es una imagen**.
> Usarlo como `alt` para accesibilidad y SEO.

---

### 🗓️ Bloque 7 — 30 AGOSTO

**Columna izquierda:**

```
30 AGOSTO                              ← H2 azul + regla blanca debajo
Local: Condor Água Verde               ← azul bold
das 14h às 18h                         ← "das " azul bold + "14h às 18h" blanco bold
Período de inscrição: 09/08 a 24/08/2025.   ← azul bold
[ Confira o regulamento ]              ← botón pequeño azul → PDF
```

**Columna derecha:**

```
[ Encerrado ]                          ← botón píldora blanco grande, texto --c-blue
```

Regla horizontal blanca al cerrar el bloque.

> El HTML original repite `Confira o regulamento` dos veces (variante desktop + variante
> mobile de Elementor). En el rebuild va **un solo botón**, responsive.
> El botón `Encerrado` está **deshabilitado** — la inscripción del Cãocurso ya cerró.

---

### 🎪 Bloque 8 — ATRAÇÕES

Panel `--c-orange-lite` con **H2 azul**:

```
Confira as outras atrações disponíveis:
```

3 cards blancas redondeadas (icono line-art azul ~48px + título + descripción):

| Título | Subtítulo (literal) | Icono |
|--------|---------------------|-------|
| `Camarim` | `Seu PetStar merece esse trato!` | `Capa-1.png` |
| `Caricaturista` | `Não perca essa fofura.` | `Capa-1@2x.png` |
| `Petfotos` | `Que tal uma foto impressa com seu pet?` | `eIOE-8@2x.png` |

---

### 🖼️ Bloque 9 — GALERIA (`#galeria`)

Panel grande redondeado `--c-orange-lite`.

```
Confira como foi a edição anterior     ← H2 azul
────────────────────────────────       ← regla blanca
2024                                   ← H2 azul
```

Grid **4 columnas × 3 filas = 12 fotos**, gap pequeño, retrato (~4:5), lightbox al clic.

---

### 🤝 Bloque 10 — PATROCÍNIO / APOIO

**UNA barra blanca redondeada a lo ancho, en una sola fila.**
Las etiquetas van en azul, cursiva:

```
Patrocínio:   [8 logos]        Apoio:   [3 logos]
```

**Patrocínio (8):** Friskies · Dog Chow · Natural DOTS · Kelcat · New DOTS · Keldog · Purina ONE Cães · Purina ONE Gatos

**Apoio (3):** BRF Pet · Whiskas · Pedigree

---

### 🔵 Bloque 11 — FOOTER

Fondo `--c-blue-mid` (`#0061B2`).

| Zona | Contenido |
|------|-----------|
| IZQ | `Logo-Grande.png` — logo Condor blanco |
| CENTRO | `©Condor 2025. Todos os direitos reservados.` |
| DER | 6 iconos sociales circulares blancos |

**Labels literales de los iconos (tal cual el original):**

```
Facebook · Instagram · X · Youtube · Linkedin-in · Tiktok
```

> El original **no tiene** links de "Política de Privacidade" ni "Termos" en el footer.
> No inventarlos.

---

## 2. Datos dinámicos (arrays)

Ubicación sugerida: `src/data/content.ts`

### 2.1 `navLinks`

```ts
export const navLinks = [
  { id: 'home',        label: 'Home',              href: '#',          external: false },
  { id: 'adote',       label: 'Adote um Aumigo',   href: '#adote',     external: false },
  { id: 'caocurso',    label: 'Cãocurso',          href: '#caocurso',  external: false },
  { id: 'galeria',     label: 'Galeria',           href: '#galeria',   external: false },
  { id: 'regulamento', label: 'Regulamento',
    href: '/assets/docs/2025_Regulamento_Caocurso.pdf', external: true }
];
```

---

### 2.2 `eventos`

Las **4 fechas reales** de *Adote um AuMigo*, agosto de **2025**.

```ts
export const eventos = [
  {
    id: 1,
    dia: 2,
    mes: 'AGOSTO',
    fechaLabel: '2 AGOSTO',
    fechaISO: '2025-08-02',
    local: 'Condor Araucária BR',
    horario: '11h às 15h'
  },
  {
    id: 2,
    dia: 9,
    mes: 'AGOSTO',
    fechaLabel: '9 AGOSTO',
    fechaISO: '2025-08-09',
    local: 'Condor Nilo Peçanha',
    horario: '11h às 15h'
  },
  {
    id: 3,
    dia: 16,
    mes: 'AGOSTO',
    fechaLabel: '16 AGOSTO',
    fechaISO: '2025-08-16',
    local: 'Condor Água Verde',
    horario: '11h às 15h'
  },
  {
    id: 4,
    dia: 23,
    mes: 'AGOSTO',
    fechaLabel: '23 AGOSTO',
    fechaISO: '2025-08-23',
    local: 'Condor Campo Comprido',
    horario: '11h às 15h'
  }
];
```

**Datos del evento del Cãocurso (bloque 30 Agosto) — no es parte del array anterior:**

```ts
export const caocurso = {
  fechaLabel: '30 AGOSTO',
  fechaISO: '2025-08-30',
  local: 'Condor Água Verde',
  horarioPrefijo: 'das ',
  horario: '14h às 18h',
  inscripcionLabel: 'Período de inscrição:',
  inscripcion: '09/08 a 24/08/2025.',
  ctaRegulamento: 'Confira o regulamento',
  regulamentoUrl: '/assets/docs/2025_Regulamento_Caocurso.pdf',
  estado: 'Encerrado',          // botón píldora blanco, deshabilitado
  tagline: 'Seu pet é a estrela da nossa passarela.'
};
```

---

### 2.3 `requisitos`

> ⚠️ **Es una LISTA dentro de UN PANEL ÚNICO, no un grid de cards.**
> Este array alimenta seis `<li>` dentro de un solo contenedor
> `--c-orange-lite`, repartidos en dos columnas por CSS
> (`columns: 2` o `grid-template-columns: repeat(2, 1fr)`).
> **No** hay `icon`, **no** hay `borderColor`, **no** hay `description`.

```ts
export const requisitos = [
  'Ter, no mínimo, 21 anos;',
  'Portar RG, CPF e comprovante de residência;',
  'Responder a uma entrevista sobre os motivos da adoção;',
  'Assinar e concordar com o termo de adoção;',
  'Ter condições financeiras para manter o animalzinho;',
  'Ter local seguro e adequado.'
];

export const requisitosTitulo = 'Requisitos para adoção:';
export const requisitosBullet = '–';   // U+2013 EN DASH, literal del original
```

---

### 2.4 `protetoras`

```ts
export const protetoras = [
  {
    id: 'seres-vidas',
    nome: 'Instituto Seres & Vidas',
    nomeLinhas: ['Instituto', 'Seres & Vidas'],
    logo: '/assets/images/protetoras/InstitutoSeres-e-vidas-300x266.png',
    instagram: 'https://www.instagram.com/seres_vidas/'
  },
  {
    id: 'sos-4-patas',
    nome: 'Instituto SOS 4 Patas PR',
    nomeLinhas: ['Instituto SOS 4 Patas PR'],
    logo: '/assets/images/protetoras/sos-4-patas.png',
    instagram: 'https://www.instagram.com/sos4patas.pr/'
  },
  {
    id: 'marcia-santos',
    nome: 'Marcia Santos Protetora de Animais',
    nomeLinhas: ['Marcia Santos', 'Protetora de Animais'],
    logo: '/assets/images/protetoras/Marcia-Protetora-300x161.jpg',
    instagram: 'https://www.instagram.com/marciasantos.protetora/'
  }
];
```

---

### 2.5 `atracoes`

```ts
export const atracoesTitulo = 'Confira as outras atrações disponíveis:';

export const atracoes = [
  {
    id: 'camarim',
    titulo: 'Camarim',
    subtitulo: 'Seu PetStar merece esse trato!',
    icone: '/assets/images/atracoes/Capa-1.png'
  },
  {
    id: 'caricaturista',
    titulo: 'Caricaturista',
    subtitulo: 'Não perca essa fofura.',
    icone: '/assets/images/atracoes/Capa-1@2x.png'
  },
  {
    id: 'petfotos',
    titulo: 'Petfotos',
    subtitulo: 'Que tal uma foto impressa com seu pet?',
    icone: '/assets/images/atracoes/eIOE-8@2x.png'
  }
];
```

---

### 2.6 `galeria`

12 fotos reales de la **edição 2024**, en el orden exacto del original.

```ts
export const galeriaTitulo = 'Confira como foi a edição anterior';
export const galeriaAno    = '2024';

export const galeria = [
  { id: 1,  src: '/assets/images/galeria/IMG_5142-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 2,  src: '/assets/images/galeria/IMG_5551-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 3,  src: '/assets/images/galeria/IMG_5185-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 4,  src: '/assets/images/galeria/IMG_5208-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 5,  src: '/assets/images/galeria/IMG_5168-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 6,  src: '/assets/images/galeria/IMG_5152-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 7,  src: '/assets/images/galeria/WhatsApp-Image-2024-04-29-at-10.08.29-17.jpeg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 8,  src: '/assets/images/galeria/IMG_5140-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 9,  src: '/assets/images/galeria/IMG_5173-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 10, src: '/assets/images/galeria/IMG_5205-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 11, src: '/assets/images/galeria/IMG_5177-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' },
  { id: 12, src: '/assets/images/galeria/IMG_5162-scaled.jpg', alt: 'Edição 2024 do Mês Pet Condor' }
];
```

> Los JPG originales son de 1920×2560 px. Optimizar a WebP (~600px de ancho para el
> thumbnail del grid) y conservar el JPG original para el lightbox.

---

### 2.7 `patrocinio` y `apoio`

```ts
export const patrocinioLabel = 'Patrocínio:';

export const patrocinio = [
  { id: 'friskies',    nome: 'Friskies',          logo: '/assets/images/marcas/Logo-Friskies@2x.png' },
  { id: 'dog-chow',    nome: 'Dog Chow',          logo: '/assets/images/marcas/Logo-dog-Chow.png' },
  { id: 'natural-dots',nome: 'Natural DOTS',      logo: '/assets/images/marcas/Image-2@2x-150x150.png' },
  { id: 'kelcat',      nome: 'Kelcat',            logo: '/assets/images/marcas/AF_LOGO_KELCAT-CROMIA-002@2x.png' },
  { id: 'nesse-dots',  nome: 'New DOTS',        logo: '/assets/images/marcas/Image-3.png' },
  { id: 'keldog',      nome: 'Keldog',            logo: '/assets/images/marcas/AF_LOGO_KELDOG_CROMIA-002.png' },
  { id: 'purina-caes', nome: 'Purina ONE Cães',   logo: '/assets/images/marcas/Logo-Purina-One-Caes.png' },
  { id: 'purina-gatos',nome: 'Purina ONE Gatos',  logo: '/assets/images/marcas/Logo-Purina-One-Gatos.png' }
];

export const apoioLabel = 'Apoio:';

export const apoio = [
  { id: 'brf-pet',  nome: 'BRF Pet',  logo: '/assets/images/marcas/Image-5@2x.png' },
  { id: 'whiskas',  nome: 'Whiskas',  logo: '/assets/images/marcas/WHISKAS-LOGO.png' },
  { id: 'pedigree', nome: 'Pedigree', logo: '/assets/images/marcas/Pedigree-Rosette-2021-Blue-Wordmark-RGB.png' }
];
```

| Archivo | Marca real (verificada visualmente) |
|---------|-------------------------------------|
| `Image-2@2x-150x150.png` | **Natural DOTS** (wordmark verde azulado) |
| `Image-3.png` | **New DOTS** (wordmark amarillo/azul) |
| `Image-5@2x.png` | **BRF Pet** (silueta perro + gato, negro) |

> Los logos no llevan enlace en el original: son `<img>` sueltos. No inventar URLs.

---

### 2.8 `socialLinks`

URLs reales de **Rede Condor** (las mismas del footer original).

```ts
export const socialLinks = [
  { id: 'facebook',  label: 'Facebook',    url: 'https://www.facebook.com/RedeCondor/' },
  { id: 'instagram', label: 'Instagram',   url: 'https://www.instagram.com/redecondor/' },
  { id: 'x',         label: 'X',           url: 'https://twitter.com/RedeCondor' },
  { id: 'youtube',   label: 'Youtube',     url: 'https://www.youtube.com/user/redecondor' },
  { id: 'linkedin',  label: 'Linkedin-in', url: 'https://br.linkedin.com/company/redecondor' },
  { id: 'tiktok',    label: 'Tiktok',      url: 'https://www.tiktok.com/@redecondor' }
];

export const copyright = '©Condor 2025. Todos os direitos reservados.';
```

> El icono de X usa el glifo nuevo (𝕏), aunque la URL siga apuntando a `twitter.com`.
> El asset `twitter.svg` ya existe en la carpeta de imágenes.

---

## 3. Estructura de directorios de assets

Copiar desde `/home/diego/armando/Migraciones/petCondor/site/public/assets/images/`
y desde `/home/diego/armando/Migraciones/petCondor/assets/fonts/`.

```
public/
├── assets/
│   ├── fonts/
│   │   ├── torus-thin.woff2          ← de Paulo-Goode-Torus-Thin.ttf
│   │   ├── torus-light.woff2         ← de Paulo-Goode-Torus-Light.ttf
│   │   ├── torus-regular.woff2       ← de Paulo-Goode-Torus-Regular.ttf
│   │   ├── torus-semibold.woff2      ← de Paulo-Goode-Torus-SemiBold.ttf
│   │   ├── torus-bold.woff2          ← de Paulo-Goode-Torus-Bold.ttf
│   │   └── torus-heavy.woff2         ← de Paulo-Goode-Torus-Heavy.ttf
│   │
│   ├── images/
│   │   ├── hero/
│   │   │   ├── Selo.png                     (logo MÊS PET)
│   │   │   ├── Titulo-1024x477.png          (título del hero)
│   │   │   └── Pet-2.png                    (chihuahua)
│   │   ├── adote/
│   │   │   ├── Dog.png
│   │   │   └── Selo-Adote-um-Aumigo.png
│   │   ├── caocurso/
│   │   │   ├── Selo@2x-1024x791.png         (logo CÃOCURSO)
│   │   │   ├── Txt@2x-1.png                 (tagline passarela)
│   │   │   ├── BG-Caocurso.jpg
│   │   │   └── Faixa-Caocurso.jpg
│   │   ├── protetoras/
│   │   │   ├── InstitutoSeres-e-vidas-300x266.png
│   │   │   ├── sos-4-patas.png
│   │   │   └── Marcia-Protetora-300x161.jpg
│   │   ├── atracoes/
│   │   │   ├── Capa-1.png                   (Camarim)
│   │   │   ├── Capa-1@2x.png                (Caricaturista)
│   │   │   └── eIOE-8@2x.png                (Petfotos)
│   │   ├── galeria/
│   │   │   ├── IMG_5140-scaled.jpg … IMG_5551-scaled.jpg   (11 archivos)
│   │   │   └── WhatsApp-Image-2024-04-29-at-10.08.29-17.jpeg
│   │   ├── marcas/
│   │   │   ├── Logo-Friskies@2x.png
│   │   │   ├── Logo-dog-Chow.png
│   │   │   ├── Image-2@2x-150x150.png       (Natural DOTS)
│   │   │   ├── AF_LOGO_KELCAT-CROMIA-002@2x.png
│   │   │   ├── Image-3.png                  (New DOTS)
│   │   │   ├── AF_LOGO_KELDOG_CROMIA-002.png
│   │   │   ├── Logo-Purina-One-Caes.png
│   │   │   ├── Logo-Purina-One-Gatos.png
│   │   │   ├── Image-5@2x.png               (BRF Pet)
│   │   │   ├── WHISKAS-LOGO.png
│   │   │   └── Pedigree-Rosette-2021-Blue-Wordmark-RGB.png
│   │   ├── padrao/
│   │   │   ├── Pattern.png                  (franja separadora)
│   │   │   ├── Pattern@2x.png
│   │   │   ├── Pattern2.png
│   │   │   ├── Gato.png                     (patas colgando)
│   │   │   └── Bg.jpg                       (fondo general)
│   │   ├── rodape/
│   │   │   └── Logo-Grande.png              (logo Condor blanco)
│   │   └── icones/
│   │       └── twitter.svg
│   │
│   └── docs/
│       └── 2025_Regulamento_Caocurso.pdf
│
└── favicon.svg
```

**Comando de conversión de fuentes (`fonttools`):**

```bash
pip install fonttools brotli
cd /home/diego/armando/Migraciones/petCondor/assets/fonts
for f in Paulo-Goode-Torus-*.ttf; do
  pyftsubset "$f" --flavor=woff2 --output-file="${f%.ttf}.woff2" \
    --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2122" \
    --layout-features='*'
done
```

> **No usar placeholders de Unsplash ni "Partner 1/2/3".** Los 105 assets reales existen.

---

## 4. Paleta — CSS custom properties

Única paleta permitida. Cualquier color fuera de esta lista es un error.

```css
:root {
  /* ── Azules — color de autoridad de la marca ───────────────── */
  --c-blue:        #00419A;  /* PRINCIPAL: títulos, cards de evento, texto sobre naranja */
  --c-blue-mid:    #0061B2;  /* footer, botones secundarios, acentos */

  /* ── Naranjas — el fondo de toda la página ─────────────────── */
  --c-orange:      #F09624;  /* fondo base de la página y de las secciones */
  --c-orange-lite: #FFBB3E;  /* paneles redondeados (requisitos, atrações, galeria) */
  --c-orange-deep: #FDB020;  /* acentos, bordes */

  /* ── Neutros ───────────────────────────────────────────────── */
  --c-white:       #FFFFFF;
  --c-gray:        #A8A8A8;
  --c-gray-dark:   #3E3E3E;

  /* ── Alerta / errores de formulario ────────────────────────── */
  --c-red:         #E20614;
}
```

**Mapa de uso por bloque:**

| Bloque | Fondo | Texto |
|--------|-------|-------|
| Nav | transparente (sobre `--c-orange`) | `--c-white` |
| Hero | `--c-orange` | imagen |
| Adote | `--c-orange` | `--c-blue` |
| Eventos (sección) | `--c-orange` | bicolor `--c-blue` / `--c-white` |
| Eventos (card) | `--c-blue` | `--c-white` |
| Requisitos (panel) | `--c-orange-lite` | `--c-blue` |
| Protetoras (card) | `--c-white` | `--c-blue` |
| Cãocurso | `--c-orange` | imagen |
| 30 Agosto | `--c-orange` | `--c-blue` + `--c-white` |
| Atrações (panel) | `--c-orange-lite` | `--c-blue` |
| Atrações (card) | `--c-white` | `--c-blue` |
| Galeria (panel) | `--c-orange-lite` | `--c-blue` |
| Patrocínio / Apoio (barra) | `--c-white` | `--c-blue` |
| Footer | `--c-blue-mid` | `--c-white` |

> Los verdes, rosas y morados que se ven en la página aparecen **solo** dentro de los
> tiles de la franja separadora, que es una **imagen** (`Pattern.png`). No son tokens
> del sistema y no deben declararse como custom properties.

---

## 5. Tipografía — @font-face Torus

**Única familia de la marca: `Torus`** (Paulo Goode), geométrica redondeada,
**self-hosted en `/assets/fonts/`**, 6 pesos.

```css
/* ──────────────────────────────────────────────────────────────
   Torus — Paulo Goode · self-hosted · 6 pesos
   ────────────────────────────────────────────────────────────── */
@font-face {
  font-family: 'Torus';
  src: url('/assets/fonts/torus-thin.woff2') format('woff2');
  font-weight: 100;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/assets/fonts/torus-light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/assets/fonts/torus-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/assets/fonts/torus-semibold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/assets/fonts/torus-bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Torus';
  src: url('/assets/fonts/torus-heavy.woff2') format('woff2');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-display: 'Torus', system-ui, -apple-system, sans-serif;  /* TODO el sitio */
}

body { font-family: var(--font-display); }
```

**Precarga en `Layout.astro`** (solo los dos pesos críticos del above-the-fold):

```html
<link rel="preload" href="/assets/fonts/torus-bold.woff2"    as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/torus-regular.woff2" as="font" type="font/woff2" crossorigin>
```

> ❌ **PROHIBIDO** Montserrat, Inter, Roboto o cualquier Google Font para el display.
> Montserrat / Roboto / Roboto Slab aparecen en el CSS original porque son *defaults de
> Elementor*, no de la marca. No hay `<link>` a `fonts.googleapis.com` en este proyecto.

**Escala tipográfica observada (desktop @1920):**

| Elemento | Tamaño | Peso | Color |
|----------|--------|------|-------|
| Título de sección (`Em quatro datas…`) | 40–44px | 700 | bicolor azul + blanco |
| Fecha de evento (`2 AGOSTO`) | 28px | 700 | blanco |
| Detalle de evento | 16px | 400 | blanco |
| `30 AGOSTO` | 32px | 700 | azul |
| Título de card (`Camarim`) | 16px | 700 | azul |
| Descripción de card | 13px | 400 | azul |
| Bullets de requisitos | 14px | 400 | azul |
| Copyright | 13px | 400 | blanco |

---

## 6. Meta tags SEO (pt-BR)

El original trae literalmente `<title>Pet</title>` y **ninguna** meta description.
Esta es la propuesta corregida para el rebuild — toda en **pt-BR**:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://pet.condor.com.br/">

<title>Mês Pet Condor 2025 | Adote um AuMigo, Cãocurso e muito mais</title>

<meta name="description"
      content="No Mês do Pet, tem preço baixo pra cachorro — e pra gatos também! Feiras de adoção Adote um AuMigo em quatro lojas Condor, Cãocurso, camarim, caricaturista e petfotos. Confira as datas.">
<meta name="keywords"
      content="adoção de animais, Mês Pet, Condor, Cãocurso, Adote um AuMigo, feira de adoção Curitiba, pet shop, cachorro, gato, Paraná">
<meta name="author" content="Condor Super Center">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#F09624">
<meta http-equiv="content-language" content="pt-BR">

<!-- Open Graph -->
<meta property="og:type"         content="website">
<meta property="og:locale"       content="pt_BR">
<meta property="og:site_name"    content="Mês Pet Condor">
<meta property="og:url"          content="https://pet.condor.com.br/">
<meta property="og:title"        content="Mês Pet Condor 2025 | Adote um AuMigo, Cãocurso e muito mais">
<meta property="og:description"  content="Em quatro datas, quatro chances de encontrar o amor mais leal. Confira as feiras de adoção e o Cãocurso do Mês Pet Condor.">
<meta property="og:image"        content="https://pet.condor.com.br/assets/images/og-mes-pet-condor.jpg">
<meta property="og:image:width"  content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt"    content="Mês Pet Condor 2025">

<!-- Twitter / X -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:site"        content="@RedeCondor">
<meta name="twitter:title"       content="Mês Pet Condor 2025 | Adote um AuMigo, Cãocurso e muito mais">
<meta name="twitter:description" content="Em quatro datas, quatro chances de encontrar o amor mais leal.">
<meta name="twitter:image"       content="https://pet.condor.com.br/assets/images/og-mes-pet-condor.jpg">

<link rel="icon" href="/favicon.svg" type="image/svg+xml">
```

**Atributo de idioma del documento:**

```html
<html lang="pt-BR">
```

**JSON-LD sugerido (los 4 eventos de adopción):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Feiras de adoção Adote um AuMigo — Mês Pet Condor 2025",
  "itemListElement": [
    { "@type": "Event", "name": "Adote um AuMigo — Condor Araucária BR",
      "startDate": "2025-08-02T11:00-03:00", "endDate": "2025-08-02T15:00-03:00",
      "location": { "@type": "Place", "name": "Condor Araucária BR" } },
    { "@type": "Event", "name": "Adote um AuMigo — Condor Nilo Peçanha",
      "startDate": "2025-08-09T11:00-03:00", "endDate": "2025-08-09T15:00-03:00",
      "location": { "@type": "Place", "name": "Condor Nilo Peçanha" } },
    { "@type": "Event", "name": "Adote um AuMigo — Condor Água Verde",
      "startDate": "2025-08-16T11:00-03:00", "endDate": "2025-08-16T15:00-03:00",
      "location": { "@type": "Place", "name": "Condor Água Verde" } },
    { "@type": "Event", "name": "Adote um AuMigo — Condor Campo Comprido",
      "startDate": "2025-08-23T11:00-03:00", "endDate": "2025-08-23T15:00-03:00",
      "location": { "@type": "Place", "name": "Condor Campo Comprido" } }
  ]
}
</script>
```

---

## 7. Contrato del endpoint `POST /api/inscricao`

> ⚠️ **El formulario es de INSCRIPCIÓN AL CÃOCURSO, no de adopción.**
> Su propósito es **registrar UNA mascota con su foto para que pueda recibir votos**.
> No pide dirección, ni patio, ni "¿tienes mascotas?", ni documento de identidad.

> ⚠️ **`/api/feedback` NO sirve para este proyecto.** Existe en el proyecto central
> (`Migraciones/petCondor/site/src/pages/api/feedback.ts`), exige `pageId` + `content`
> y devuelve **400** con el payload de inscripción. Escribe markdown de documentación
> interna. **No reutilizarlo.**

### 7.1 Requisito de configuración de Astro

Las rutas API **no se ejecutan** en modo estático. `astro.config.mjs` debe llevar:

```js
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' })
});
```

```bash
npm install @astrojs/node
```

### 7.2 Petición

| Campo | Valor |
|-------|-------|
| **URL** | `/api/inscricao` |
| **Método** | `POST` |
| **Content-Type** | `multipart/form-data` |

> **Por qué `multipart/form-data` y no JSON:** `petFoto` es un **archivo** —el núcleo
> del formulario— y un archivo no cabe en un body JSON. En el cliente se envía un
> `FormData` **sin** fijar `Content-Type` a mano (el navegador pone el `boundary`).

**Campos del formulario (8 + 1 opcional):**

| # | Campo (`name`) | Tipo | Obligatorio | Notas |
|---|----------------|------|-------------|-------|
| 1 | `tutorNome` | text | ✅ | nombre completo del tutor, mín. 3 caracteres |
| 2 | `tutorEmail` | email | ✅ | confirma la inscripción y envía el enlace de votación |
| 3 | `tutorTelefone` | tel | ✅ | contacto, formato BR (10–15 dígitos) |
| 4 | `petNome` | text | ✅ | nombre de la mascota |
| 5 | `petEspecie` | radio | ✅ | `Cão` \| `Gato` |
| 6 | `petIdade` | select/text | ➖ | edad aproximada, opcional |
| 7 | `petFoto` | **file** | ✅ | **el núcleo**. 1 imagen JPG/PNG/WebP, máx. 5 MB, mín. 600×600 px |
| 8 | `aceiteRegulamento` | checkbox | ✅ | acepta el regulamento **y autoriza el uso de imagen** |
| — | `querNovidades` | checkbox | ❌ | opt-in de novedades, opcional |

> ⚠️ **Campos que NO existen en este formulario** (eran del formulario de adopción
> imaginado por la documentación previa): `endereco`, `temQuintal`, `temPets`,
> `descricaoPets`, `documento` (RG/CPF/comprovante), `eventoId`.

**Ejemplo de envío (cliente):**

```ts
const fd = new FormData(formEl);            // incluye el File de `petFoto`

const res = await fetch('/api/inscricao', {
  method: 'POST',
  body: fd                                   // sin Content-Type manual
});
const data = await res.json();
```

### 7.2.1 Consideraciones propias de un concurso con votación

- **Moderación:** la ficha nace en estado `pendente`; no recibe votos hasta ser aprobada.
- **Cesión de imagen:** `aceiteRegulamento` debe cubrir explícitamente el uso de la foto
  en la web y redes de Condor. Es el requisito legal del concurso.
- **Una inscripción por mascota:** deduplicar por `tutorEmail` + `petNome` → `409`.
- **Antifraude de votos:** fuera del MVP; la votación necesitará límite por IP/sesión.

### 7.3 Respuesta — éxito (`200`)

Devuelve el `id` de la ficha creada y su **URL de votación**.

```json
{
  "success": true,
  "message": "Inscrição recebida! Seu pet já está na passarela.",
  "id": "pet_3f7a2b8d",
  "status": "pendente",
  "pet": {
    "nome": "Bidu",
    "especie": "Cão"
  },
  "votacaoUrl": "https://pet.condor.com.br/caocurso/pet_3f7a2b8d",
  "nextSteps": "Assim que a foto for aprovada, você receberá o link de votação por e-mail."
}
```

### 7.4 Respuesta — error de validación (`400`)

```json
{
  "success": false,
  "message": "Verifique os campos destacados.",
  "error": "validation_error",
  "fields": {
    "tutorEmail": "E-mail inválido.",
    "petFoto": "Envie uma foto de até 5 MB (JPG, PNG ou WebP).",
    "aceiteRegulamento": "É necessário aceitar o regulamento e o uso de imagem."
  }
}
```

### 7.5 Respuesta — archivo rechazado (`413`)

```json
{
  "success": false,
  "message": "Arquivo muito grande.",
  "error": "payload_too_large",
  "fields": { "petFoto": "A foto deve ter no máximo 5 MB." }
}
```

### 7.5.1 Respuesta — mascota duplicada (`409`)

```json
{
  "success": false,
  "message": "Este pet já foi inscrito com este e-mail.",
  "error": "duplicate_entry",
  "fields": { "petNome": "Já existe uma inscrição com este nome para este e-mail." }
}
```

### 7.6 Respuesta — error de servidor (`500`)

```json
{
  "success": false,
  "message": "Não foi possível enviar sua inscrição. Tente novamente.",
  "error": "internal_error"
}
```

### 7.7 Esqueleto del handler

```ts
// src/pages/api/inscricao.ts
import type { APIRoute } from 'astro';

export const prerender = false;             // obligatorio con output:'server'

const MAX_FILE = 5 * 1024 * 1024;           // 5 MB
const MIME_OK  = ['image/jpeg', 'image/png', 'image/webp'];

export const POST: APIRoute = async ({ request }) => {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('multipart/form-data')) {
    return json(415, { success: false, error: 'unsupported_media_type',
                       message: 'Envie o formulário como multipart/form-data.' });
  }

  const form = await request.formData();
  const fields: Record<string, string> = {};

  const tutorNome = String(form.get('tutorNome') ?? '').trim();
  if (tutorNome.length < 3) fields.tutorNome = 'Informe seu nome completo.';

  const tutorEmail = String(form.get('tutorEmail') ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutorEmail)) {
    fields.tutorEmail = 'E-mail inválido.';
  }

  const tutorTelefone = String(form.get('tutorTelefone') ?? '').replace(/\D/g, '');
  if (tutorTelefone.length < 10 || tutorTelefone.length > 15) {
    fields.tutorTelefone = 'Informe um telefone válido com DDD.';
  }

  const petNome = String(form.get('petNome') ?? '').trim();
  if (!petNome) fields.petNome = 'Informe o nome do seu pet.';

  const petEspecie = String(form.get('petEspecie') ?? '');
  if (!['Cão', 'Gato'].includes(petEspecie)) {
    fields.petEspecie = 'Escolha entre Cão e Gato.';
  }

  const foto = form.get('petFoto');
  if (!(foto instanceof File) || foto.size === 0) {
    fields.petFoto = 'Envie uma foto do seu pet.';
  } else if (foto.size > MAX_FILE) {
    return json(413, { success: false, error: 'payload_too_large',
                       message: 'Arquivo muito grande.',
                       fields: { petFoto: 'A foto deve ter no máximo 5 MB.' } });
  } else if (!MIME_OK.includes(foto.type)) {
    fields.petFoto = 'Formatos aceitos: JPG, PNG ou WebP.';
  }

  if (form.get('aceiteRegulamento') !== 'on') {
    fields.aceiteRegulamento =
      'É necessário aceitar o regulamento e o uso de imagem.';
  }

  if (Object.keys(fields).length) {
    return json(400, { success: false, error: 'validation_error',
                       message: 'Verifique os campos destacados.', fields });
  }

  // TODO: deduplicar por tutorEmail + petNome → 409
  // TODO: persistir la ficha en estado 'pendente' + guardar la foto en storage
  const id = `pet_${crypto.randomUUID().slice(0, 8)}`;
  return json(200, {
    success: true,
    message: 'Inscrição recebida! Seu pet já está na passarela.',
    id,
    status: 'pendente',
    pet: { nome: petNome, especie: petEspecie },
    votacaoUrl: `https://pet.condor.com.br/caocurso/${id}`,
    nextSteps:
      'Assim que a foto for aprovada, você receberá o link de votação por e-mail.'
  });
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
```

> Todos los mensajes visibles al usuario van en **pt-BR**.
> Ver `FORM_ESPECIFICACION.md` para el diseño del modal y la validación en cliente.

---

## 8. `SITE_CONFIG`

```ts
// src/config/site.ts
export const SITE_CONFIG = {
  siteName:    'Mês Pet Condor',
  siteUrl:     'https://pet.condor.com.br',
  locale:      'pt-BR',
  ano:         2025,
  edicaoGaleria: 2024,
  description: 'No Mês do Pet, tem preço baixo pra cachorro — e pra gatos também!',

  logos: {
    mesPet:   '/assets/images/hero/Selo.png',
    adote:    '/assets/images/adote/Selo-Adote-um-Aumigo.png',
    caocurso: '/assets/images/caocurso/Selo@2x-1024x791.png',
    condor:   '/assets/images/rodape/Logo-Grande.png'
  },

  regulamento: '/assets/docs/2025_Regulamento_Caocurso.pdf',

  social: {
    facebook:  'https://www.facebook.com/RedeCondor/',
    instagram: 'https://www.instagram.com/redecondor/',
    x:         'https://twitter.com/RedeCondor',
    youtube:   'https://www.youtube.com/user/redecondor',
    linkedin:  'https://br.linkedin.com/company/redecondor',
    tiktok:    'https://www.tiktok.com/@redecondor'
  },

  api: {
    inscricao: '/api/inscricao'    // POST · multipart/form-data · Cãocurso
  },

  caocursoEstado: 'encerrado'      // 'aberto' | 'encerrado'
} as const;
```

---

## 9. Erratas corregidas respecto a la versión previa de este documento

| Antes decía (incorrecto) | Real |
|--------------------------|------|
| `NO MÊS DO PET, TEM PREÇO BAIXO PARA QUEM AMA!` | `NO MÊS DO PET, TEM PREÇO BAIXO PRA CACHORRO.` + `e pra gatos também!` |
| `Donec malesuada libero vel nulla…` (lorem ipsum) | no existe |
| `ADOTE UM AMIGO PELUDO` / `Dá uma chance para quente…` | `Dê uma chance para aquele que nunca te abandona.` |
| `CHO CURSO` | `Cãocurso` |
| `Seu pet é o astreio da nossa pasarela.` | `Seu pet é a estrela da nossa passarela.` |
| `Confiro como fol a edición anterior` | `Confira como foi a edição anterior` + `2024` |
| Eventos: Clínica Amigos Ñ / Canile Amistad / Ciudad Amistad, `11h às 13h`, fechas 9·9·16·23, año 2024 | Condor Araucária BR / Nilo Peçanha / Água Verde / Campo Comprido, `11h às 15h`, fechas **2·9·16·23**, año **2025** |
| Requisitos = 3 cards con iconos y colores por borde | **panel único** con lista de **6 bullets** |
| Atrações = Juego Interactivo / Premios y Sorteos / Talleres Gratuitos | **Camarim** / **Caricaturista** / **Petfotos** |
| `Canóvida Arca Verde` · `Parque de Ibirapuera` · `das LCh à 18h` | `Condor Água Verde` · `das 14h às 18h` |
| Footer `© 2024 Pet Condor` + Privacy/Terms/Contact | `©Condor 2025. Todos os direitos reservados.` (sin links legales) |
| Social: FB · IG · WhatsApp · Twitter (URLs `petcondor` inventadas) | FB · IG · **X** · **YouTube** · **LinkedIn** · **TikTok** con las URLs reales de `RedeCondor` |
| Galería `foto-1.jpg … foto-12.jpg` | 12 archivos reales (`IMG_5142-scaled.jpg`, `WhatsApp-Image-2024-04-29-…`, …) |
| `partners` = "Partner 1/2/3" | **Patrocínio** (8 marcas) + **Apoio** (3 marcas), logos reales |
| Placeholders de Unsplash | **prohibidos** — los 105 assets reales ya existen |
| Endpoint `/api/feedback`, `application/json` | **`POST /api/inscricao`**, `multipart/form-data`, `output:'server'` + `@astrojs/node` |
| Formulario = **adopción** (`endereco`, `temQuintal`, `temPets`, `descricaoPets`, `documento`) | Formulario = **inscripción al Cãocurso**: 8 campos, con `petFoto` como núcleo |
| Paleta `#F5A623 #003D82 #00BCD4 #E91E63 #4CAF50 #F44336 #9C27B0` | `#00419A #0061B2 #F09624 #FFBB3E #FDB020 #FFFFFF #A8A8A8 #3E3E3E #E20614` |
| Google Fonts: Montserrat + Inter | **Torus** self-hosted (6 pesos `.woff2`) |
| Descripción de mascotas condicionada a `patio` | el campo **no existe**: no es un formulario de adopción |
| SEO en español, `petcondor.com` | SEO en **pt-BR**, `pet.condor.com.br` |
| — | faltaba el bloque **Nav** |
| — | faltaba el bloque **Protetoras** |
| — | faltaba el bloque **Patrocínio / Apoio** |

---

## ✅ Checklist de contenido

- [ ] Todos los textos visibles están en **pt-BR** y son literales del original
- [ ] Nav con los 5 items y sus anclas reales (`#`, `#adote`, `#caocurso`, `#galeria`, PDF)
- [ ] 4 eventos con las fechas **2 · 9 · 16 · 23** de agosto de **2025**, `11h às 15h`
- [ ] Requisitos renderizados como **lista de 6 bullets en un panel único**
- [ ] Bloque **Protetoras** presente, con los 3 Instagram reales
- [ ] Bloque **Patrocínio / Apoio** presente, en **una sola barra blanca**
- [ ] Galería con las **12 fotos reales**, en el orden del original
- [ ] Footer con `©Condor 2025.` y los **6** iconos sociales de Rede Condor
- [ ] Cero placeholders de Unsplash, cero "Partner N"
- [ ] Solo la paleta de 9 colores autorizada
- [ ] Solo **Torus** self-hosted; ningún `<link>` a Google Fonts
- [ ] Formulario de **inscripción al Cãocurso** (8 campos, `petFoto` obligatoria) — no de adopción
- [ ] Formulario apuntando a `POST /api/inscricao` con `multipart/form-data`
- [ ] `astro.config.mjs` con `output: 'server'` + `@astrojs/node`

---

**Nota:** este documento es la fuente de datos del proyecto. `GROUND_TRUTH.md` está por
encima de él. Si algo cambia, actualizar aquí primero y luego sincronizar con
`src/data/content.ts`.

**Última verificación:** 2026-07-29 · contra HTML + CSS + assets originales.
