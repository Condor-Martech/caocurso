# Resumen Ejecutivo: Rebuild LP Pet Condor

> ⚠️ **Fuente de verdad = `GROUND_TRUTH.md`.** Si algo de este documento contradice
> `GROUND_TRUTH.md`, gana GROUND_TRUTH. Léelo ANTES que cualquier otra cosa.

## 📋 Estado Actual

**Objetivo:** Recrear la landing page de **pet.condor.com.br** (campaña *Mês Pet* de la rede
Condor) exactamente como aparece en `petCondor.png`, usando **Astro + Tailwind CSS + React**.

**Stack Tecnológico:**
- Astro 7.x con **`output: 'server'`** + **`@astrojs/node`** (adapter standalone)
- React 19 (islas interactivas: modal de **inscrição no Cãocurso**)
- Tailwind CSS v4
- TypeScript (strict mode)
- Node.js ≥22.12.0

> Sin `output: 'server'` + `@astrojs/node` las rutas `/api/*` **no se ejecutan**. Es
> requisito, no opcional: el formulario necesita un endpoint real.

**Idioma del sitio:** **portugués de Brasil (pt-BR), 100%.** Todos los textos visibles se
copian literales del original. Esta documentación está en español; el sitio, no.

**Tipografía:** **Torus** (Paulo Goode), **self-hosted** desde `assets/fonts/`, 6 pesos
(Thin, Light, Regular, SemiBold, Bold, Heavy) convertidos a `.woff2`. **Sin Google Fonts.**

**Paleta (única y cerrada):**

| Token | HEX | Uso |
|-------|-----|-----|
| `--c-blue` | `#00419A` | títulos, cards de evento, texto sobre naranja |
| `--c-blue-mid` | `#0061B2` | footer, botones secundarios |
| `--c-orange` | `#F09624` | fondo base de toda la página |
| `--c-orange-lite` | `#FFBB3E` | paneles redondeados (requisitos, atrações, galeria) |
| `--c-orange-deep` | `#FDB020` | acentos, bordes |
| `--c-white` | `#FFFFFF` | cards, barra de patrocinio |
| `--c-gray` | `#A8A8A8` | texto deshabilitado |
| `--c-gray-dark` | `#3E3E3E` | texto de formulario |
| `--c-red` | `#E20614` | errores de validación |

**Scope:** Fidelidad visual 100% al original. NO cambios de diseño, solo implementación
técnica. **Excepción:** el modal de **inscripción al concurso Cãocurso** es un **añadido
nuevo** — el sitio original no tiene formulario activo, así que no se compara contra el
original (sí debe respetar el design system).

> ⚠️ **El formulario NO es de adopción.** Su propósito es *registrar UNA mascota con su
> foto para que pueda recibir votos en el Cãocurso*. No pide dirección, ni patio, ni
> "¿tienes mascotas?", ni documento de identidad.

---

## 📚 Documentación Generada (11 documentos)

### 0. **GROUND_TRUTH.md** 🔒 LEER PRIMERO — fuente de verdad
- ✅ Paleta real verificada por muestreo de píxeles
- ✅ Tipografía real (Torus, 6 pesos, self-hosted)
- ✅ Los **11 bloques** de la página en orden exacto
- ✅ Inventario de los 105 assets reales disponibles
- ✅ Endpoint correcto (`POST /api/inscricao`, multipart)
- ✅ Tabla de errata: qué decía la documentación previa vs. la realidad

### 1. **RESUMEN_EJECUTIVO.md** ⭐ (este documento)
- ✅ Fases, cronograma, checklists y definición de "listo"

### 2. **DESIGN_SYSTEM.md**
- ✅ Paleta de 9 tokens (naranjas, azules, neutros, alerta)
- ✅ Escala tipográfica Torus (tamaños, pesos, usos)
- ✅ Componentes base (Button, Card, panel redondeado, franja)
- ✅ Franja separadora = imagen `Pattern.png` con tiles de patas/huesos
- ✅ Espaciado y breakpoints
- ✅ Elementos de marca (Selo, lockup Condor, iconografía line-art)
- ✅ Directrices de contraste y accesibilidad

### 3. **WIREFRAMES_DETALLADAS.md**
- ✅ Estructura visual por bloque (**11 bloques**, no 9)
- ✅ Dimensiones exactas y posicionamiento
- ✅ Especificaciones de tipografía por elemento
- ✅ Layouts responsivos (desktop/tablet/mobile)
- ✅ Márgenes y espaciado detallado
- ✅ Notas de implementación

### 4. **FORM_ESPECIFICACION.md**
- ✅ Estructura del modal de **inscripción al Cãocurso** (componente nuevo)
- ✅ **8 campos** con validación completa (tutor + pet + **foto** + aceite)
- ✅ Estados: empty, valid, invalid, loading, success
- ✅ Mensajes de error específicos, en pt-BR
- ✅ Preview y validación de la foto (tipo, peso, dimensiones mínimas)
- ✅ Botones primario/secundario
- ✅ Keyboard navigation + ARIA labels
- ✅ Submit a `POST /api/inscricao` (multipart/form-data)

### 5. **CONTENIDO_DATOS.md**
- ✅ Textos literales pt-BR de todas las secciones
- ✅ Arrays JSON: eventos, requisitos, protetoras, atrações, patrocinadores, apoio
- ✅ Galería de fotos (12 imágenes reales, edición 2024, grid 4×3)
- ✅ Redes sociales del footer (6 iconos)
- ✅ Rutas de assets reales (sin placeholders)
- ✅ Tokens CSS y configuración global

### 6. **ANIMACIONES_TRANSICIONES.md**
- ✅ Transiciones por elemento (200-300ms)
- ✅ Keyframes (modal, fade, shake, spin, float)
- ✅ Estados de formulario animados (incluido el preview de `petFoto`)
- ✅ Micro-interacciones (loading, éxito)
- ✅ Scroll animations y parallax
- ✅ Performance (hardware acceleration)
- ✅ Accesibilidad (prefers-reduced-motion)

### 7. **REBUILD_LP_PROMPT.md**
- ✅ Prompt elaborado con instrucciones detalladas
- ✅ Análisis de cada bloque
- ✅ Estructura de componentes recomendada
- ✅ Checklist de 5 fases de implementación

### 8. **INDICE_DOCUMENTACION.md**
- ✅ Mapeo de los 11 documentos, matriz de uso por fase, búsqueda rápida

### 9. **README_DOCUMENTACION_GENERADA.md**
- ✅ Orientación ultra-concisa y rutas de lectura

### 10. **CLAUDE.md**
- ✅ Guía del proyecto para Claude Code (stack, comandos, reglas duras)

---

## 🧱 Nav + los 11 bloques de la página

```
Nav (no numerado)
1 Hero · 2 Adote um AuMigo · 3 Eventos · 4 Requisitos · 5 Protetoras ·
6 Cãocurso · 7 30 Agosto · 8 Atrações · 9 Galeria · 10 Patrocínio/Apoio · 11 Footer
```

> **Nunca omitir Nav, Protetoras ni Patrocínio/Apoio** — faltaban por completo en la
> documentación previa.

---

## 🎯 Fases de Implementación

### **FASE 1: Configuración y Componentes Base (1.5-2 horas)**

#### 1.1 Configuración global
- [ ] `astro.config.mjs`: `output: 'server'` + `adapter: node({ mode: 'standalone' })`
- [ ] Convertir los 6 TTF de Torus a `.woff2` → `public/fonts/`
- [ ] `@font-face` × 6 pesos + `--font-display: 'Torus', system-ui, sans-serif`
- [ ] `global.css` con los 9 tokens de color exactos (HEX de GROUND_TRUTH)
- [ ] `animations.css` con keyframes
- [ ] `Layout.astro` con `lang="pt-BR"`, metas, favicon
- [ ] Copiar los 105 assets reales a `public/assets/images/`

#### 1.2 Componentes base (Astro)
- [ ] `FaixaPattern.astro` — franja separadora (`Pattern.png`, `repeat-x`, ~65px)
- [ ] `SectionTitle.astro` — títulos bicolor azul/blanco reutilizables
- [ ] `Button.astro` — botón primario/secundario/píldora
- [ ] `Card.astro` — card blanca o azul redondeada
- [ ] `Panel.astro` — panel redondeado `--c-orange-lite`

#### 1.3 Componente React
- [ ] `FormularioModal.jsx` — modal de inscripción al Cãocurso (**8 campos**)
- [ ] Validación básica de campos
- [ ] Estados: empty, valid, invalid, loading, success
- [ ] Submit a `POST /api/inscricao` con `FormData` (multipart)

#### 1.4 Endpoint
- [ ] Crear `src/pages/api/inscricao.ts` (`export const POST`)
- [ ] Leer `await request.formData()` (incluye el archivo de `petFoto`)
- [ ] Responder con el `id` de la ficha creada + su URL de votación / error con status

#### 1.5 Verificar
- [ ] [ ] Torus carga en los 6 pesos (sin FOUT hacia Arial)
- [ ] [ ] Tokens de color aplicados, sin colores fuera de la paleta
- [ ] [ ] `npm run build` genera servidor Node, no static
- [ ] [ ] `POST /api/inscricao` responde 200 con multipart de prueba
- [ ] [ ] Modal abre/cierra correctamente

---

### **FASE 2: Bloques Visuales (3-4 horas)**

#### 2.1 Nav
- [ ] Crear `Nav.astro`
- [ ] Sobre el naranja, **sin barra propia**, alineada a la derecha
- [ ] Items: `Home` · `Adote um Aumigo` (#adote) · `Cãocurso` (#caocurso) ·
      `Galeria` (#galeria) · `Regulamento` (PDF externo)
- [ ] Item activo con subrayado blanco
- [ ] Mobile: menú hamburguesa

#### 2.2 Hero
- [ ] Crear `Hero.astro`
- [ ] Fondo `--c-orange` + patrón line-art
- [ ] IZQ: `Selo.png` (logo MÊS PET + lockup Condor) + `Titulo-1024x477.png`
      ("NO MÊS DO PET, TEM PREÇO BAIXO PRA CACHORRO." + script "e pra gatos também!")
- [ ] DER: `Pet-2.png` (chihuahua con gafas y chaqueta) + círculos flotantes
      (pata, hueso, perro, comedero)
- [ ] Responsive: stack en mobile

#### 2.3 Adote um AuMigo
- [ ] Crear `AdoteAumigo.astro` — ancla `#adote`
- [ ] IZQ: `Dog.png` (perro blanco y negro recortado)
- [ ] DER: `Selo-Adote-um-Aumigo.png` + H2
      "Dê uma chance para aquele que nunca te abandona."
- [ ] **Sin CTA de formulario aquí** — el modal es de inscripción al Cãocurso, no de
      adopción; su CTA vive en los bloques 6 (Cãocurso) y 7 (30 Agosto)
- [ ] Fondo `--c-orange`, layout 2 columnas

#### 2.4 Eventos
- [ ] Crear `EventosGrid.astro`
- [ ] H2 bicolor centrado: "Em quatro datas," (azul) + "quatro chances de encontrar o
      amor mais leal." (blanco)
- [ ] Regla horizontal blanca fina arriba y abajo del grid
- [ ] Grid 2×2 de cards `--c-blue`, radio ~12px, con regla blanca bajo la fecha:
      `2 AGOSTO / Condor Araucária BR / 11h às 15h`,
      `9 AGOSTO / Condor Nilo Peçanha / 11h às 15h`,
      `16 AGOSTO / Condor Água Verde / 11h às 15h`,
      `23 AGOSTO / Condor Campo Comprido / 11h às 15h`
- [ ] Datos desde array; 1 columna en mobile

#### 2.5 Requisitos
- [ ] Crear `Requisitos.astro`
- [ ] **UN SOLO panel redondeado `--c-orange-lite`** — NO son 3 cards con iconos
- [ ] H2 azul centrado: "Requisitos para adoção:"
- [ ] **Lista de 6 bullets en dos columnas**, texto azul (`--c-blue`)
- [ ] Mobile: una sola columna

#### 2.6 Protetoras
- [ ] Crear `Protetoras.astro`
- [ ] 3 cards blancas redondeadas centradas: logo + nombre + icono Instagram
      · Instituto Seres & Vidas → `instagram.com/seres_vidas/`
      · Instituto SOS 4 Patas PR → `instagram.com/sos4patas.pr/`
      · Marcia Santos Protetora de Animais → `instagram.com/marciasantos.protetora/`
- [ ] Assets: `InstitutoSeres-e-vidas.png`, `sos-4-patas.png`, `Marcia-Protetora-300x161.jpg`

#### 2.7 Cãocurso
- [ ] Crear `Caocurso.astro` — ancla `#caocurso`
- [ ] IZQ: `Selo@2x-1024x791.png` (logo CÃOCURSO) + `Txt@2x-1.png`
      ("Seu pet é a estrela da nossa passarela." — es una **imagen**, no texto)
- [ ] DER: `Pet-2.png` + círculos de iconos
- [ ] CTA "Inscreva seu pet" → abre el modal de inscripción al Cãocurso
- [ ] Fondo `--c-orange`, layout 2 columnas

#### 2.8 30 Agosto
- [ ] Crear `Evento30Agosto.astro`
- [ ] IZQ: H2 "30 AGOSTO" azul + regla blanca debajo
      "Local: Condor Água Verde" (azul bold)
      "das " (azul bold) + "14h às 18h" (blanco bold)
      "Período de inscrição: 09/08 a 24/08/2025." (azul bold)
      botón pequeño azul "Confira o regulamento" → `2025_Regulamento_Caocurso.pdf`
- [ ] DER: botón píldora blanco grande "Encerrado" (texto `--c-blue`)
- [ ] Regla horizontal blanca al cerrar

#### 2.9 Atrações
- [ ] Crear `Atracciones.astro`
- [ ] Panel `--c-orange-lite` con H2 azul: "Confira as outras atrações disponíveis:"
- [ ] 3 cards blancas (icono line-art azul ~48px + título + descripción):
      · Camarim — "Seu PetStar merece esse trato!" (`Capa-1.png`)
      · Caricaturista — "Não perca essa fofura." (`Capa-1@2x.png`)
      · Petfotos — "Que tal uma foto impressa com seu pet?" (`eIOE-8@2x.png`)

#### 2.10 Galeria
- [ ] Crear `Galeria.astro` — ancla `#galeria`
- [ ] Panel grande redondeado `--c-orange-lite`
- [ ] H2 azul "Confira como foi a edição anterior" + regla blanca + H2 azul "2024"
- [ ] Grid 4 col × 3 filas = **12 fotos reales** (`IMG_5140-scaled.jpg`…), retrato ~4:5
- [ ] Tablet 3 col, mobile 2 col; hover zoom; lazy load

#### 2.11 Patrocínio / Apoio
- [ ] Crear `Patrocinadores.astro`
- [ ] **UNA barra blanca redondeada a lo ancho, en una sola fila**
- [ ] "Patrocínio:" (azul, cursiva) + Friskies · Dog Chow · Natural DOTS · Kelcat ·
      New DOTS · Keldog · Purina ONE Cães · Purina ONE Gatos
- [ ] "Apoio:" (azul, cursiva) + BRF Pet · Whiskas · Pedigree
- [ ] Logos reales (`Logo-dog-Chow.png`, `AF_LOGO_KELCAT-…`, `WHISKAS-LOGO.png`, …)

#### 2.12 Footer
- [ ] Crear/actualizar `Footer.astro`, fondo `--c-blue-mid` (`#0061B2`)
- [ ] IZQ: `Logo-Grande.png` (logo Condor blanco)
- [ ] CENTRO: "©Condor 2025. Todos os direitos reservados."
- [ ] DER: 6 iconos sociales circulares blancos —
      Facebook, Instagram, X, YouTube, LinkedIn, TikTok

#### 2.13 Franja separadora
- [ ] Integrar `FaixaPattern.astro` en sus 4 posiciones (tras Hero, tras Adote,
      tras Protetoras, tras Cãocurso)
- [ ] `background: url(Pattern.png) repeat-x`, altura ~65px desktop
- [ ] En la franja previa a Eventos: **las patas del gato (`Gato.png`) cuelgan por encima**

#### 2.14 Verificar Fase 2
- [ ] [ ] Nav + los **11 bloques** renderean, en el orden exacto de GROUND_TRUTH
- [ ] [ ] Nav, Protetoras y Patrocínio/Apoio **presentes** (no se omiten)
- [ ] [ ] Textos literales en pt-BR (sin lorem ipsum, sin español)
- [ ] [ ] Fondo casi todo naranja; blanco solo en cards y barra de patrocinio
- [ ] [ ] Colores exactos vs. la paleta de 9 tokens
- [ ] [ ] Assets reales, cero placeholders
- [ ] [ ] Layout responsivo en 3 breakpoints
- [ ] [ ] Anclas `#adote`, `#caocurso`, `#galeria` funcionan desde el Nav

---

### **FASE 3: Formulario de inscripción al Cãocurso y Endpoint (1.5-2 horas)**

> El modal **no existe en el original**. Es un añadido intencional de este rebuild y su
> propósito es **registrar UNA mascota con su foto para que reciba votos en el Cãocurso**.
> **No es un formulario de adopción.** Se juzga por design system y usabilidad, no por
> parecido con el original.

#### 3.1 FormularioModal.jsx (completar)
- [ ] **8 campos**: `tutorNome`, `tutorEmail`, `tutorTelefone`, `petNome`,
      `petEspecie` (radio Cão/Gato), `petIdade` (opcional), **`petFoto` (file — el
      núcleo)**, `aceiteRegulamento` (checkbox)
- [ ] Extra opcional: `querNovidades` (opt-in de novedades)
- [ ] **Prohibido** reintroducir: dirección, patio, "¿tienes mascotas?", descripción de
      mascotas, documento de identidad (eran del formulario de adopción imaginado)
- [ ] Labels y mensajes en pt-BR
- [ ] Validación en blur + en submit
- [ ] Preview de la foto seleccionada antes de enviar
- [ ] Estados: empty, valid, invalid, loading, success
- [ ] Botones ENVIAR / CANCELAR + botón de cierre (X)

#### 3.2 Integración del modal
- [ ] CTA de "Cãocurso" (bloque 6) y del bloque "30 Agosto" → abren el modal
- [ ] **No** enganchar el modal a las cards de eventos de adopción (bloque 3): esos
      eventos no se inscriben online
- [ ] Click fuera → cierra · ESC → cierra
- [ ] `body { overflow: hidden }` mientras está abierto
- [ ] Focus trap dentro del modal

#### 3.3 Validación
- [ ] `tutorNome` / `petNome`: mín. 3 caracteres
- [ ] `tutorEmail`: formato válido (recibe la confirmación y el enlace de votación)
- [ ] `tutorTelefone`: formato BR, 10-11 dígitos
- [ ] `petEspecie`: obligatorio (Cão / Gato)
- [ ] `petFoto`: **obligatorio** — 1 imagen JPG/PNG/WebP, máx **5 MB**, mín **600×600 px**
- [ ] `aceiteRegulamento`: obligatorio (regulamento **+ autorización de uso de imagen**)
- [ ] Errores en `--c-red` (`#E20614`)

#### 3.4 Submit
- [ ] `POST /api/inscricao` con `FormData` → **`multipart/form-data`** (obligatorio: un
      archivo no cabe en un body JSON)
- [ ] **NO** usar `/api/feedback`: es el endpoint de docs del proyecto central, exige
      `pageId` + `content` y devuelve **400** con este payload
- [ ] Loading state: botón "Enviando..."
- [ ] Success: devolver y mostrar el `id` de la ficha + su URL de votación
- [ ] Error: mostrar error y permitir reintentar

#### 3.5 Reglas propias de un concurso con votación (documentar aunque no se implemente)
- [ ] **Moderación:** la ficha nace en estado `pendente`; no recibe votos hasta aprobarse
- [ ] **Cesión de imagen:** el aceite cubre explícitamente el uso de la foto en web y
      redes de Condor (requisito legal)
- [ ] **Una inscripción por mascota:** deduplicar por `tutorEmail` + `petNome`
- [ ] **Antifraude de votos:** fuera del MVP, pero anotar límite por IP/sesión

#### 3.6 Verificar Fase 3
- [ ] [ ] Modal abre/cierra correctamente
- [ ] [ ] Validación funciona en blur y en submit
- [ ] [ ] El archivo de `petFoto` llega al servidor
- [ ] [ ] `POST /api/inscricao` responde 200 en dev y en build de producción
- [ ] [ ] Éxito/error manejados
- [ ] [ ] Keyboard navigation (TAB, ESC) y focus trap
- [ ] [ ] Mobile: modal responsive

---

### **FASE 4: Animaciones y Pulido (1-2 horas)**

#### 4.1 Transiciones
- [ ] Hover botón: 200ms color + sombra + translateY
- [ ] Hover card: 250ms elevación
- [ ] Hover foto de galería: 250ms zoom + brightness
- [ ] Focus input: borde azul + shadow
- [ ] Error input: shake

#### 4.2 Animaciones del modal
- [ ] Entrada: slide-up 300ms + fade
- [ ] Salida: slide-down 250ms + fade
- [ ] Backdrop fade-in/out
- [ ] Preview de `petFoto`: fade-in al seleccionar el archivo

#### 4.3 Animaciones de scroll (opcional)
- [ ] Fade-in de cards con Intersection Observer
- [ ] Flotación suave de los círculos del hero
- [ ] Parallax muy ligero en el hero

#### 4.4 Micro-interacciones
- [ ] Spinner en el botón "Enviando"
- [ ] Checkmark en envío exitoso
- [ ] Input válido: borde ok + ✓
- [ ] Input error: borde `--c-red` + ⚠️

#### 4.5 Accesibilidad
- [ ] Respetar `prefers-reduced-motion`
- [ ] ARIA labels en el formulario y en los iconos sociales
- [ ] Alt text en pt-BR en todas las imágenes
- [ ] Keyboard navigation funcional
- [ ] Contraste WCAG AA (ojo con blanco sobre `--c-orange`)

#### 4.6 Performance
- [ ] Imágenes optimizadas (WebP + srcset; `@2x` para retina)
- [ ] Lazy load en la galería
- [ ] `font-display: swap` en los 6 `@font-face` de Torus
- [ ] CSS crítico inline, eliminar CSS no usado
- [ ] Lighthouse ≥90

#### 4.7 Verificar Fase 4
- [ ] [ ] Transiciones suaves, sin jank
- [ ] [ ] Animaciones del modal correctas
- [ ] [ ] `prefers-reduced-motion` respetado
- [ ] [ ] ARIA labels presentes
- [ ] [ ] Carga < 3s
- [ ] [ ] Testing en Chrome, Firefox, Safari

---

### **FASE 5: Contenido Final y Testing (1-2 horas)**

#### 5.1 Contenido real
- [ ] 12 fotos reales de la galería (edición 2024)
- [ ] Logos reales de patrocinadores y apoio
- [ ] Logos reales de las 3 protetoras
- [ ] Textos finales literales en pt-BR
- [ ] Links reales (Instagram de protetoras, 6 redes de Condor, PDF de regulamento)
- [ ] Destino de las inscripciones configurado (almacenamiento de la foto + ficha)

#### 5.2 Testing comprehensivo
- [ ] [ ] Desktop (1920×1080)
- [ ] [ ] Tablet (768×1024)
- [ ] [ ] Mobile (375×667)
- [ ] [ ] Chrome, Firefox, Safari
- [ ] [ ] Formulario: todos los casos (valid, invalid, upload de foto, success, error)
- [ ] [ ] Modal: abre/cierra, ESC, focus trap
- [ ] [ ] Animaciones suaves
- [ ] [ ] Accesibilidad: keyboard nav, screen reader
- [ ] [ ] Performance: Lighthouse, CLS, INP

#### 5.3 QA Checklist — comparación vs. original
- [ ] [ ] Comparar contra `petCondor.png` (**ignorar la barra de admin de WordPress**)
- [ ] [ ] Nav + los 11 bloques, en orden, sin omitir Nav / Protetoras / Patrocínio
- [ ] [ ] Colores exactos (comparar HEX contra los 9 tokens)
- [ ] [ ] Tipografía Torus en los 6 pesos, sin fallback visible
- [ ] [ ] Textos literales pt-BR (fechas 2·9·16·23, "11h às 15h", "©Condor 2025")
- [ ] [ ] Requisitos = un panel con 6 bullets en 2 columnas (no cards)
- [ ] [ ] Franja separadora = tiles de patas/huesos, con las patas del gato colgando
- [ ] [ ] Sin broken links
- [ ] [ ] Sin errores en consola
- [ ] [ ] Meta tags SEO en pt-BR

> ⚠️ **El formulario NO se compara con el original.** El sitio de pet.condor.com.br no
> tiene formulario activo (el del Cãocurso figura como *Encerrado*): el modal de
> inscripción es un **añadido nuevo** de este rebuild. Se valida contra
> `FORM_ESPECIFICACION.md` y el design system, nunca contra `petCondor.png`.

#### 5.4 Deploy Ready
- [ ] [ ] Build sin warnings
- [ ] [ ] Server output correcto (`@astrojs/node`, standalone)
- [ ] [ ] Sin rutas hardcodeadas (usar `/assets/images/*`)
- [ ] [ ] Variables de entorno configuradas
- [ ] [ ] `/api/inscricao` funciona en producción
- [ ] [ ] Documentación actualizada

---

## 📊 Cronograma Estimado

| Fase | Tarea | Tiempo |
|------|-------|--------|
| 1 | Config + base + endpoint | 1.5-2h |
| 2 | Nav + 11 bloques visuales | 3-4h |
| 3 | Formulario + submit | 1.5-2h |
| 4 | Animaciones y pulido | 1-2h |
| 5 | Contenido final + testing | 1-2h |
| **TOTAL CÓDIGO** | | **8-12h** |
| Lectura de documentación | GROUND_TRUTH + críticos | ~2h |
| **TOTAL** | | **10-14h** |

---

## 🔧 Stack de Comandos

```bash
# Desarrollo
npm run dev
# http://localhost:4321

# Verificar tipos
npm run astro check

# Build producción (server output)
npm run build

# Preview build
npm run preview

# Probar el endpoint de inscripción
curl -F "tutorNome=Teste" -F "tutorEmail=a@b.com" -F "tutorTelefone=41999999999" \
     -F "petNome=Rex" -F "petEspecie=Cão" -F "aceiteRegulamento=on" \
     -F "petFoto=@pet.jpg" \
  http://localhost:4321/api/inscricao
```

---

## 📁 Estructura de Archivos a Crear

```
astro.config.mjs         (output: 'server' + @astrojs/node)

src/
├── pages/
│   ├── index.astro            (MAIN — Nav + los 11 bloques en orden)
│   └── api/
│       └── inscricao.ts       (NUEVO — POST multipart/form-data)
├── components/
│   ├── Nav.astro              (NUEVO — faltaba)
│   ├── Hero.astro             (NUEVO)
│   ├── AdoteAumigo.astro      (NUEVO — antes "Adopcion.astro")
│   ├── EventosGrid.astro      (NUEVO)
│   ├── Requisitos.astro       (NUEVO — panel + lista, NO cards)
│   ├── Protetoras.astro       (NUEVO — faltaba)
│   ├── Caocurso.astro         (NUEVO — antes "Curso.astro")
│   ├── Evento30Agosto.astro   (NUEVO)
│   ├── Atracciones.astro      (NUEVO — Camarim/Caricaturista/Petfotos)
│   ├── Galeria.astro          (NUEVO)
│   ├── Patrocinadores.astro   (NUEVO — faltaba: Patrocínio + Apoio)
│   ├── Footer.astro           (NUEVO/UPDATE)
│   ├── FaixaPattern.astro     (NUEVO — antes "ColorBars.astro"; es una imagen)
│   ├── SectionTitle.astro     (NUEVO)
│   ├── Button.astro           (NUEVO)
│   ├── Card.astro             (NUEVO)
│   ├── Panel.astro            (NUEVO)
│   └── FormularioModal.jsx    (NUEVO — React, inscripción Cãocurso, 8 campos)
├── data/
│   ├── eventos.ts             (4 fechas)
│   ├── requisitos.ts          (6 bullets)
│   ├── protetoras.ts          (3 entidades)
│   ├── atracoes.ts            (3 cards)
│   ├── patrocinadores.ts      (8 patrocínio + 3 apoio)
│   ├── galeria.ts             (12 fotos)
│   └── redes.ts               (6 redes sociales)
├── styles/
│   ├── global.css             (tokens + @font-face Torus ×6)
│   └── animations.css         (keyframes)
└── layouts/
    └── Layout.astro           (lang="pt-BR")

public/
├── fonts/                     (Torus .woff2 × 6 — self-hosted)
└── assets/
    ├── images/                (los 105 assets reales)
    └── docs/
        └── 2025_Regulamento_Caocurso.pdf
```

---

## ✅ Definición de "Listo"

La LP está lista cuando:

✅ **Visual**
- Nav + los 11 bloques presentes y en orden
- Colores solo de los 9 tokens permitidos
- Torus self-hosted en los 6 pesos
- Franja separadora con tiles de patas/huesos + patas del gato colgando
- Assets reales, cero placeholders

✅ **Contenido**
- 100% pt-BR, literal como el original
- Fechas 2 · 9 · 16 · 23 de agosto, `11h às 15h`
- "©Condor 2025. Todos os direitos reservados."

✅ **Funcional**
- Modal abre/cierra sin errores
- Formulario de inscripción de **8 campos** valida correctamente
- Envía a `POST /api/inscricao` en multipart, incluida la foto de la mascota
- Éxito/error manejados
- Keyboard navigation (TAB, ESC)

✅ **Responsive**
- Mobile (375px): 1 columna, tocable
- Tablet (768px): 2-3 columnas
- Desktop (1024px+): diseño completo

✅ **Performance**
- Lighthouse ≥85
- Load time <3s
- Sin jank en animaciones

✅ **Accesible**
- Contraste WCAG AA
- ARIA labels presentes
- Alt text en pt-BR
- Keyboard accessible
- Respeta `prefers-reduced-motion`

---

## 📖 Documentos de Referencia

| Doc | Propósito | Leer antes de... |
|-----|-----------|------------------|
| **GROUND_TRUTH.md** 🔒 | **Fuente de verdad — LEER PRIMERO** | **Todo** |
| DESIGN_SYSTEM.md | Sistema de diseño completo | Empezar Fase 1 |
| WIREFRAMES_DETALLADAS.md | Estructura visual exacta (11 bloques) | Empezar Fase 2 |
| FORM_ESPECIFICACION.md | Inscripción Cãocurso, 8 campos | Empezar Fase 3 |
| CONTENIDO_DATOS.md | Arrays JSON y textos pt-BR | Fase 2 |
| ANIMACIONES_TRANSICIONES.md | Keyframes y transiciones | Fase 4 |
| REBUILD_LP_PROMPT.md | Prompt con instrucciones | Referencia general |
| INDICE_DOCUMENTACION.md | Mapa de los 11 documentos | Cuando busques algo |
| README_DOCUMENTACION_GENERADA.md | Orientación de 2 minutos | Al empezar |
| CLAUDE.md | Guía Astro del proyecto | Cualquier momento |

---

## 🎓 Notas Importantes

1. **GROUND_TRUTH manda.** Si cualquier documento (incluido éste) lo contradice, gana
   GROUND_TRUTH.md.

2. **No cambiar diseño.** La tarea es replicar, no mejorar. La única pieza nueva y
   deliberada es el modal de inscripción al Cãocurso.

3. **Contenido en pt-BR, literal.** Nada de lorem ipsum, nada de español, nada de textos
   inventados. Los textos exactos están en CONTENIDO_DATOS.md y GROUND_TRUTH.md.

4. **Assets reales.** Existen 105 archivos en
   `/home/diego/armando/Migraciones/petCondor/site/public/assets/images/`. Prohibido
   usar Unsplash o "Partner 1/2/3".

5. **El endpoint es `/api/inscricao`.** `/api/feedback` pertenece a la documentación
   interna del proyecto central y devuelve 400 con este payload.

6. **Mobile-first mindset.** Aunque se replica el desktop, mobile debe ser usable desde
   el inicio.

7. **Testing constante.** No esperar a Fase 5: verificar cada bloque contra
   `petCondor.png` mientras se construye.

---

## 🚀 Próximos Pasos

1. **Leer** GROUND_TRUTH.md completo (obligatorio, 15 min)
2. **Leer** DESIGN_SYSTEM.md (colores + Torus)
3. **Leer** WIREFRAMES_DETALLADAS.md (los 11 bloques)
4. **Leer** FORM_ESPECIFICACION.md (inscripción Cãocurso: 8 campos y validación)
5. **Ejecutar** Fase 1: config + componentes base + endpoint
6. **Revisar** visual vs. `petCondor.png` cada 30 min
7. **Testear** responsive en 3 breakpoints en cada fase
8. **Iterar** hasta match visual completo

---

**¿Listo para Fase 1? Lee GROUND_TRUTH.md primero.** 🚀
