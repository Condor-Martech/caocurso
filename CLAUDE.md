# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this isolated Pet Condor LP project.

## Proyecto: Pet Condor LP Rebuild

**Objetivo:** Recrear exactamente la landing page de **pet.condor.com.br** (campaña *Mês
Pet* de la rede Condor) usando Astro + Tailwind CSS + React.

**Stack:** Astro 7.x (`output: 'server'` + `@astrojs/vercel`) | React 19 | Tailwind CSS v4 | TypeScript | Node.js ≥22.12.0

**Idioma del sitio:** **portugués de Brasil (pt-BR), 100%.** La documentación está en
español; los textos visibles del sitio, no.

**Estado:** LP implementada y verificada. Documentación corregida contra `docs/GROUND_TRUTH.md`.

**Carpeta del Proyecto Central (Referencia):** `/home/diego/armando/Migraciones/petCondor/site`

---

## 🔒 Regla de Precedencia

**`docs/GROUND_TRUTH.md` es la fuente de verdad única.** Se extrajo del HTML scrapeado, del CSS
original (`post-683.css`) y del screenshot `docs/petCondor.png`. Si cualquier otro documento
—incluido éste— lo contradice, **gana GROUND_TRUTH**.

---

## 📚 Documentación Disponible en Esta Carpeta (11 documentos)

**Comienza con:** `docs/GROUND_TRUTH.md` (15 min) 🔒 — **LEER PRIMERO, fuente de verdad**

### Documentos Críticos (Leer antes de codear)
1. **GROUND_TRUTH.md** 🔒 — Paleta real, Torus, 11 bloques, 105 assets, endpoint (15 min)
2. **RESUMEN_EJECUTIVO.md** — Fases, cronograma, checklists (10 min)
3. **DESIGN_SYSTEM.md** — Colores, tipografía, componentes base (15 min)
4. **WIREFRAMES_DETALLADAS.md** — Estructura exacta de los 11 bloques (20 min)
5. **FORM_ESPECIFICACION.md** — Modal de inscripción al Cãocurso, 8 campos (20 min)
6. **CONTENIDO_DATOS.md** — Arrays JSON, textos pt-BR, endpoint (15 min)

### Documentos Complementarios
7. **ANIMACIONES_TRANSICIONES.md** — Keyframes y movimiento (Fase 4)
8. **REBUILD_LP_PROMPT.md** — Prompt elaborado (referencia)
9. **INDICE_DOCUMENTACION.md** — Mapeo y búsqueda rápida
10. **README_DOCUMENTACION_GENERADA.md** — Orientación de 2 minutos
11. **CLAUDE.md** — Este archivo

---

## ⛔ Reglas Duras

### Paleta permitida (única y cerrada)

```css
:root {
  --c-blue:        #00419A;  /* títulos, cards de evento, texto sobre naranja */
  --c-blue-mid:    #0061B2;  /* footer, botones secundarios */
  --c-orange:      #F09624;  /* fondo base de toda la página */
  --c-orange-lite: #FFBB3E;  /* paneles redondeados */
  --c-orange-deep: #FDB020;  /* acentos, bordes */
  --c-white:       #FFFFFF;
  --c-gray:        #A8A8A8;
  --c-gray-dark:   #3E3E3E;
  --c-red:         #E20614;  /* errores de validación */
}
```

Cualquier otro HEX está prohibido. Los verdes/rosas/morados solo existen dentro de la
imagen `Pattern.png` (la franja separadora), no son tokens del sistema.

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
- **`/api/feedback` NO sirve aquí:** pertenece a la documentación interna del proyecto
  central, exige `pageId` + `content` y devuelve **400** con el payload de inscripción.

### Nav + los 11 bloques de la página

```
Nav (no numerado)
1 Hero · 2 Adote um AuMigo · 3 Eventos · 4 Requisitos · 5 Protetoras ·
6 Cãocurso · 7 30 Agosto · 8 Atrações · 9 Galeria · 10 Patrocínio/Apoio · 11 Footer
```

**Nunca omitir Nav, Protetoras ni Patrocínio/Apoio.**
`Requisitos` es **un panel único con 6 bullets en dos columnas**, no tres cards.

### Assets

Usar los **105 archivos reales** de
`/home/diego/armando/Migraciones/petCondor/site/public/assets/images/`.
**Prohibido** proponer placeholders de Unsplash o "Partner 1/2/3".

### El formulario es un añadido nuevo, y NO es de adopción

El sitio original **no tiene formulario activo** (el del Cãocurso figura como *Encerrado*).
El modal es una pieza nueva e intencional de este rebuild y su propósito es **registrar
UNA mascota con su foto para que pueda recibir votos en el concurso Cãocurso**.

- **8 campos:** `tutorNome`, `tutorEmail`, `tutorTelefone`, `petNome`, `petEspecie`
  (Cão/Gato), `petIdade` (opcional), **`petFoto` (obligatoria, es el núcleo)**,
  `aceiteRegulamento` (regulamento + autorización de uso de imagen).
- **Prohibido** pedir dirección, patio, "¿tienes mascotas?", descripción de mascotas o
  documento de identidad: eran del formulario de adopción imaginado por la doc previa.
- **No se compara con `docs/petCondor.png`**; se valida contra `docs/FORM_ESPECIFICACION.md` y el
  design system.

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
| 2 | Los 11 bloques + Nav + Footer, con datos y assets reales | ✅ hecho |
| 3 | Modal de inscripción (8 campos) + `POST /api/inscricao` multipart | ✅ hecho |
| 4 | Transiciones, scroll reveal con fallback sin JS, `prefers-reduced-motion` | ✅ hecho |
| 5 | Contenido final real; QA visual y responsive fino | ⏳ pendiente de repaso |

**Verificado:** build limpio · `astro check` 0 errores · 38/38 imágenes cargan ·
10/10 casos del endpoint · modal probado de extremo a extremo en Chromium.

**Pendiente conocido:** el CTA que abre el modal es el botón «Encerrado» de la sección
30 Agosto (se mantuvo el texto original por fidelidad). Si el formulario debe estar
abierto de verdad, hay que cambiar ese texto — es decisión de contenido.

Ver `docs/RESUMEN_EJECUTIVO.md` para el detalle de cada fase.

---

## 🎯 Archivo de Imagen Referencia

**Ubicación:** `docs/petCondor.png` (en esta carpeta, 1920×7478)
**Propósito:** Comparación pixel-perfect durante desarrollo
**Uso:** Tener visible en otra ventana/monitor
**Ojo:** incluye la barra de admin de WordPress arriba — **ignorarla**

---

## 🔄 Relación con Central

Esta carpeta es **aislada y autosuficiente**:
- Documentación completa aquí
- Proyecto separado
- Puede divergir de central cuando se mejore

**Central** (`/home/diego/armando/Migraciones/petCondor/site`) es:
- Hub de decisiones
- Fuente de los 105 assets reales y de las fuentes Torus
- Punto de sincronización si es necesario

**Fuentes originales para verificar dudas:**
- `/home/diego/armando/Migraciones/petCondor/content/html/index.html`
- `/home/diego/armando/Migraciones/petCondor/assets/css/post-683.css`
- `/home/diego/armando/Migraciones/petCondor/assets/fonts/` (Torus TTF ×6)

---

## 📁 Estructura Esperada (Después de Setup)

```
/home/diego/armando/Sites/petcondor/
├── .claude/
│   └── memory/  (para futuras conversaciones)
├── astro.config.mjs           (output: 'server' + @astrojs/vercel)
├── vercel.json                (framework astro, región gru1 São Paulo)
├── src/
│   ├── pages/
│   │   ├── index.astro        (MAIN — Nav + los 11 bloques en orden)
│   │   └── api/
│   │       └── inscricao.ts   (POST multipart/form-data)
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── AdoteAumigo.astro
│   │   ├── EventosGrid.astro
│   │   ├── Requisitos.astro       (panel + lista, NO cards)
│   │   ├── Protetoras.astro
│   │   ├── Caocurso.astro
│   │   ├── Evento30Agosto.astro
│   │   ├── Atracciones.astro
│   │   ├── Galeria.astro
│   │   ├── Patrocinadores.astro
│   │   ├── Footer.astro
│   │   ├── FaixaPattern.astro     (franja separadora = Pattern.png)
│   │   ├── SectionTitle.astro
│   │   ├── Button.astro
│   │   ├── Card.astro
│   │   ├── Panel.astro
│   │   └── FormularioModal.jsx    (React, 8 campos)
│   ├── data/
│   │   ├── eventos.ts · requisitos.ts · protetoras.ts
│   │   ├── atracoes.ts · patrocinadores.ts
│   │   └── galeria.ts · redes.ts
│   ├── layouts/
│   │   └── Layout.astro           (lang="pt-BR")
│   └── styles/
│       ├── global.css             (tokens + @font-face Torus ×6)
│       └── animations.css
├── public/
│   ├── fonts/                     (Torus .woff2 ×6, self-hosted)
│   └── assets/
│       ├── images/                (los 105 assets reales)
│       └── docs/2025_Regulamento_Caocurso.pdf
│
└── 📚 DOCUMENTACIÓN (11 archivos)
    ├── GROUND_TRUTH.md 🔒 (LEER PRIMERO)
    ├── CLAUDE.md (este archivo)
    ├── README_DOCUMENTACION_GENERADA.md
    ├── RESUMEN_EJECUTIVO.md
    ├── DESIGN_SYSTEM.md
    ├── WIREFRAMES_DETALLADAS.md
    ├── FORM_ESPECIFICACION.md
    ├── CONTENIDO_DATOS.md
    ├── ANIMACIONES_TRANSICIONES.md
    ├── REBUILD_LP_PROMPT.md
    └── INDICE_DOCUMENTACION.md
```

---

## ✅ Antes de Empezar

- [ ] Leer `docs/GROUND_TRUTH.md` COMPLETO (15 min) 🔒
- [ ] Leer `docs/README_DOCUMENTACION_GENERADA.md` (2 min)
- [ ] Leer `docs/RESUMEN_EJECUTIVO.md` (10 min)
- [ ] Leer `docs/DESIGN_SYSTEM.md` (15 min)
- [ ] Leer `docs/WIREFRAMES_DETALLADAS.md` (20 min)
- [ ] Tener `docs/petCondor.png` visible para comparación
- [ ] Setup inicial del proyecto Astro con adapter node
- [ ] Convertir los 6 TTF de Torus a `.woff2`

---

## 🎨 Recursos Disponibles

| Recurso | Ubicación | Propósito |
|---------|-----------|-----------|
| **Fuente de verdad** | `docs/GROUND_TRUTH.md` | **Manda sobre todo** |
| Imagen referencia | `docs/petCondor.png` | Comparación visual |
| Especificaciones | `docs/DESIGN_SYSTEM.md` | Colores, tipografía |
| Wireframes | `docs/WIREFRAMES_DETALLADAS.md` | Estructura (11 bloques) |
| Formulario | `docs/FORM_ESPECIFICACION.md` | 8 campos, validación |
| Datos | `docs/CONTENIDO_DATOS.md` | Arrays JSON pt-BR |
| Animaciones | `docs/ANIMACIONES_TRANSICIONES.md` | Transiciones |
| Checklists | `docs/RESUMEN_EJECUTIVO.md` | Verificación |
| Búsqueda rápida | `docs/INDICE_DOCUMENTACION.md` | Índice |
| Assets reales | `…/petCondor/site/public/assets/images/` | 105 archivos |
| Fuentes Torus | `…/petCondor/assets/fonts/` | 6 TTF |

---

## 💡 Notas Importantes

1. **GROUND_TRUTH manda.** Ante cualquier contradicción, gana `docs/GROUND_TRUTH.md`.
2. **No cambiar diseño.** Replicar exactamente, no mejorar.
3. **Contenido en pt-BR, literal.** Nada de lorem ipsum, nada de español en el sitio.
4. **Formulario crítico.** Inscripción al Cãocurso: 8 campos validados, a
   `POST /api/inscricao` (multipart). Es un añadido nuevo: no se compara con el original.
5. **Assets reales.** Los 105 archivos ya existen. Prohibido usar placeholders.
6. **Testing constante.** Verificar visual vs. original cada 30 minutos.
7. **Mobile-first.** Aunque se replica desktop, asegurar mobile desde inicio.

---

## 🔗 Comandos Útiles

```bash
# Desarrollo
npm run dev           # Start server (localhost:4321)

# Verificación
npm run astro check   # TypeScript check

# Build
npm run build         # Production build (server output, Node adapter)
npm run preview       # Preview built output

# Probar el endpoint de inscripción
curl -F "tutorNome=Teste" -F "tutorEmail=a@b.com" -F "tutorTelefone=41999999999" \
     -F "petNome=Rex" -F "petEspecie=Cão" -F "aceiteRegulamento=on" \
     -F "petFoto=@pet.jpg" \
  http://localhost:4321/api/inscricao

# Limpieza
rm -rf .astro dist    # Clean cache/build
npm install           # Reinstall deps
```

---

## 📞 Cuando Necesites Ayuda

1. **¿Qué decía el original?** → `docs/GROUND_TRUTH.md` 🔒
2. **¿Especificación visual?** → `docs/DESIGN_SYSTEM.md`
3. **¿Dimensiones/layout?** → `docs/WIREFRAMES_DETALLADAS.md`
4. **¿Campos del formulario?** → `docs/FORM_ESPECIFICACION.md`
5. **¿Datos/arrays?** → `docs/CONTENIDO_DATOS.md`
6. **¿Animaciones?** → `docs/ANIMACIONES_TRANSICIONES.md`
7. **¿Dónde buscar?** → `docs/INDICE_DOCUMENTACION.md`
8. **¿Visión general?** → `docs/RESUMEN_EJECUTIVO.md`

---

## 🎯 Próximo Paso

👉 **Lee:** `docs/GROUND_TRUTH.md` (15 min) 🔒

👉 **Luego:** `docs/RESUMEN_EJECUTIVO.md` (10 min)

👉 **Luego:** `npm run dev` — la LP ya está construida. Queda el repaso de QA (Fase 5).

---

**Estado:** ✅ LP implementada, build limpio y documentación consistente. Proyecto aislado.

**Tiempo estimado:** 8-12 h de código + ~2 h de lectura = **10-14 h total**

**Versión:** 2.0 (corregida contra GROUND_TRUTH)

**Última actualización:** 2026-07-29
