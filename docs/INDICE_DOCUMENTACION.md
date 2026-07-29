# Índice de Documentación - Pet Condor LP Rebuild

## 📑 Mapeo Rápido

**¿Por dónde empezar?** → Lee primero [GROUND_TRUTH.md](#ground_truth) 🔒, luego
[RESUMEN_EJECUTIVO.md](#resumen_ejecutivo)

**¿Qué necesitas ahora?** → Usa la tabla de abajo para navegar

**Regla de precedencia:** `GROUND_TRUTH.md` > todo lo demás. Si un documento lo
contradice, el documento está mal.

---

## 📚 Documentos Generados (11 en total)

### 0. **GROUND_TRUTH.md** 🔒 LEER PRIMERO — FUENTE DE VERDAD
**Propósito:** Verdad verificada del sitio original, extraída del HTML scrapeado, el CSS
(`post-683.css`) y el screenshot `petCondor.png`
**Contiene:**
- Identidad del proyecto (Condor · Mês Pet · pt-BR · 2025)
- Paleta real de 9 tokens, con muestreo de píxeles cruzado
- Tipografía real: **Torus**, 6 pesos, self-hosted (no Google Fonts)
- **Estructura real: Nav + los 11 bloques** en orden exacto
- La franja separadora (imagen `Pattern.png`, tiles de patas/huesos)
- Inventario de los **105 assets reales** disponibles
- El formulario: **inscripción al Cãocurso**, no de adopción
- Endpoint correcto: **`POST /api/inscricao`**, multipart/form-data
- Tabla de errata: qué decía la doc previa vs. la realidad

**Leer cuando:** ANTES que cualquier otra cosa, y cada vez que dudes de un dato

**Tiempo de lectura:** 15 min

---

### 1. **RESUMEN_EJECUTIVO.md** ⭐ EL PLAN
**Propósito:** Visión de 30,000 pies de la tarea completa
**Contiene:**
- Estado actual y stack tecnológico (Astro 7 + React 19 + Tailwind v4 + TS +
  `@astrojs/node`, `output: 'server'`)
- Nav + los 11 bloques a construir
- 5 fases de implementación con checklist
- Cronograma estimado (**8-12 h de código + ~2 h de lectura = 10-14 h**)
- Estructura de archivos y componentes a crear
- Definición de "listo"
- Documentos de referencia

**Leer cuando:** Después de GROUND_TRUTH, para entender scope + plan

**Tiempo de lectura:** 10 min

---

### 2. **DESIGN_SYSTEM.md** ✨ GUÍA DE DISEÑO
**Propósito:** Traducción operativa del design system a tokens y componentes
**Contiene:**
- Paleta de 9 colores (HEX exactos de GROUND_TRUTH)
- Tipografía **Torus self-hosted** (6 pesos, `@font-face`, escalas)
- Componentes base (Button, Card, Panel, franja separadora)
- Espaciado y breakpoints
- Elementos de marca (Selo, lockup Condor, iconografía line-art)
- Directrices de contraste y accesibilidad
- Checklist de implementación

**Leer cuando:** Antes de Fase 1 (configuración)

**Leer de nuevo cuando:** Necesites verificar colores, espaciado, tipografía exacta

**Tiempo de lectura:** 15 min

---

### 3. **WIREFRAMES_DETALLADAS.md** 🎨 ESTRUCTURA VISUAL
**Propósito:** Plano arquitectónico detallado de cada bloque
**Contiene:**
- Jerarquía visual de toda la LP
- **Nav + los 11 bloques** con wireframes ASCII (incluye Nav, Protetoras, Patrocínio/Apoio)
- Dimensiones exactas por elemento
- Posicionamiento y layout
- Responsive behavior (desktop/tablet/mobile)
- Márgenes, padding, gaps
- Notas de implementación por bloque

**Leer cuando:** Durante Fase 2 (construcción de bloques)

**Leer de nuevo cuando:** Necesites referencia de dimensiones o layout

**Tiempo de lectura:** 20 min

---

### 4. **FORM_ESPECIFICACION.md** 📝 FORMULARIO MODAL
**Propósito:** Especificación exhaustiva del formulario de **inscripción al concurso
Cãocurso** (registrar UNA mascota con su foto para que reciba votos). **No es adopción.**
**Contiene:**
- Estructura general del modal (dimensiones, posición)
- **8 campos** detallados (`tutorNome`, `tutorEmail`, `tutorTelefone`, `petNome`,
  `petEspecie`, `petIdade`, **`petFoto`**, `aceiteRegulamento`)
- Estados de validación (empty, valid, invalid, loading, success)
- Reglas de validación por campo (foto: JPG/PNG/WebP, máx 5 MB, mín 600×600)
- Mensajes de error específicos, en pt-BR
- Preview de la foto y aceptación de cesión de imagen
- Botones de acción
- Keyboard navigation + ARIA
- Submit a **`POST /api/inscricao`** con `multipart/form-data`

**Leer cuando:** Durante Fase 3 (formulario interactivo)

**Nota:** El modal es un **añadido nuevo** — el sitio original no tiene formulario activo,
así que no se compara con `petCondor.png`

**Tiempo de lectura:** 20 min

---

### 5. **CONTENIDO_DATOS.md** 📄 DATOS Y CONTENIDO
**Propósito:** Fuente de los datos dinámicos, todos en pt-BR
**Contiene:**
- Textos literales de todos los bloques
- Arrays JSON (eventos, requisitos, protetoras, atrações, patrocinadores, apoio, fotos)
- Rutas de los assets reales (105 archivos, sin placeholders)
- Redes sociales del footer (Facebook, Instagram, X, YouTube, LinkedIn, TikTok)
- Tokens CSS y configuración global
- Meta tags SEO en pt-BR
- Contrato de payload del endpoint `/api/inscricao`

**Leer cuando:** Durante Fase 2 (necesitas datos) + Fase 5 (contenido final)

**Usar como:** Template para crear archivos de datos/config

**Tiempo de lectura:** 15 min

---

### 6. **ANIMACIONES_TRANSICIONES.md** 🎬 MOVIMIENTO
**Propósito:** Especificación de todas las animaciones y transiciones
**Contiene:**
- Principios de animación (duraciones, easing)
- Transiciones por elemento (botones, cards, fotos)
- Keyframes (modal, fade, shake, spin, float)
- Micro-interacciones (loading, éxito)
- Scroll animations + parallax
- Reveal del preview de `petFoto`
- Performance tips (hardware acceleration)
- Accesibilidad (prefers-reduced-motion)
- Testing checklist
- Archivo CSS centralizado

**Leer cuando:** Durante Fase 4 (pulido y animaciones)

**Tiempo de lectura:** 15 min

---

### 7. **REBUILD_LP_PROMPT.md** 🎯 PROMPT ELABORADO
**Propósito:** Instrucciones ultra-detalladas (redundante pero útil como referencia)
**Contiene:**
- Análisis de cada bloque con especificaciones
- Estructura de componentes recomendada
- Componentes base reutilizables
- Interactividad del formulario
- Responsive design rules
- Checklist de 5 fases
- Detalles visuales críticos

**Leer cuando:** Necesites claridad adicional sobre algo específico

**Tiempo de lectura:** 25 min (completo)

---

### 8. **INDICE_DOCUMENTACION.md** 🗺️ (ESTE ARCHIVO)
**Propósito:** Mapa de los 11 documentos, matriz de uso y búsqueda rápida

**Tiempo de lectura:** 5 min

---

### 9. **README_DOCUMENTACION_GENERADA.md** 📌 ORIENTACIÓN
**Propósito:** Resumen ultra-conciso: qué hay, en qué orden leerlo, TL;DR y FAQ

**Tiempo de lectura:** 2 min

---

### 10. **CLAUDE.md** 📖 GUÍA DEL PROYECTO
**Propósito:** Guía de trabajo para Claude Code en esta carpeta
**Contiene:**
- Stack y estado del proyecto
- Reglas duras (paleta, Torus, pt-BR, endpoint, 11 bloques, assets reales)
- Setup y comandos rápidos
- Estructura de archivos esperada
- Fases y tiempos
- Dónde buscar cada cosa

**Leer cuando:** Al empezar y cuando necesites recordar reglas o comandos

**Tiempo de lectura:** 5 min

---

## 🗺️ Matriz de Uso por Fase

| Fase | Documento | Sección | Acción |
|------|-----------|---------|--------|
| **Preparación** | **GROUND_TRUTH** 🔒 | Todo | **Leer primero, completo** |
| **Preparación** | RESUMEN_EJECUTIVO | Todo | Leer completamente |
| **Preparación** | CLAUDE.md | Reglas duras | Interiorizar |
| **Preparación** | DESIGN_SYSTEM | Checklist | Verificar todo |
| **Fase 1** | GROUND_TRUTH | Paleta / Tipografía | Copy-paste HEX y `@font-face` |
| **Fase 1** | DESIGN_SYSTEM | Componentes Base | Crear componentes |
| **Fase 1** | GROUND_TRUTH | Endpoint | Configurar `output: 'server'` + adapter |
| **Fase 2** | WIREFRAMES_DETALLADAS | Bloques 1-11 | Leer 1 por 1 |
| **Fase 2** | GROUND_TRUTH | Estructura real | Verificar orden y bloques |
| **Fase 2** | CONTENIDO_DATOS | Arrays JSON | Copy datos pt-BR |
| **Fase 2** | GROUND_TRUTH | Inventario de assets | Elegir archivo real |
| **Fase 3** | FORM_ESPECIFICACION | Todos | Implementar los 8 campos |
| **Fase 3** | FORM_ESPECIFICACION | Validación | Crear reglas |
| **Fase 3** | CONTENIDO_DATOS | API endpoint | Conectar `POST /api/inscricao` |
| **Fase 4** | ANIMACIONES_TRANSICIONES | Todo | Agregar transiciones |
| **Fase 5** | CONTENIDO_DATOS | Fotos/Textos | Contenido real definitivo |
| **Fase 5** | GROUND_TRUTH | Errata | Verificar que no reapareció ningún error |
| **Fase 5** | RESUMEN_EJECUTIVO | QA Checklist | Testear todo |

---

## 🔍 Búsqueda Rápida

**Necesito... → Leer documento X, sección Y**

| Necesidad | Documento | Sección |
|-----------|-----------|---------|
| Códigos HEX exactos | **GROUND_TRUTH** | Paleta real |
| Fuente, pesos y archivos | **GROUND_TRUTH** | Tipografía real |
| Orden de los bloques | **GROUND_TRUTH** | Estructura real de la página |
| Qué imagen usar | **GROUND_TRUTH** | Inventario de assets |
| Endpoint y content-type | **GROUND_TRUTH** | Endpoint del formulario |
| Texto literal en pt-BR | GROUND_TRUTH / CONTENIDO_DATOS | Estructura real / Textos |
| Tokens CSS listos | DESIGN_SYSTEM | Paleta de Colores |
| Layout hero | WIREFRAMES_DETALLADAS | Bloque 1: HERO |
| Dimensiones de botón | FORM_ESPECIFICACION | Botón Primario |
| Validación email | FORM_ESPECIFICACION | Reglas de Validación |
| Estructura modal | FORM_ESPECIFICACION | Estructura General del Modal |
| Datos de eventos | CONTENIDO_DATOS | Eventos Array |
| Animación hover | ANIMACIONES_TRANSICIONES | Transiciones por Elemento |
| Responsive breakpoints | WIREFRAMES_DETALLADAS | Especificaciones de Márgenes |
| Archivos a crear | RESUMEN_EJECUTIVO | Estructura de Archivos |
| Checklist final | RESUMEN_EJECUTIVO | QA Checklist |
| Reglas del proyecto | CLAUDE.md | Notas Importantes |

---

## 📊 Estadísticas de Documentación

| Métrica | Valor |
|---------|-------|
| **Documentos** | 11 |
| **Páginas totales** | ~110 |
| **Palabras totales** | ~17,000 |
| **Secciones** | 55+ |
| **Ejemplos de código** | 30+ |
| **Checklists** | 9 |
| **Wireframes ASCII** | 16+ |
| **Tablas** | 25+ |

---

## 🎓 Cómo Usar Esta Documentación

### Escenario A: "Empiezo de cero"
1. Lee **GROUND_TRUTH.md** (todo) 🔒
2. Lee RESUMEN_EJECUTIVO.md (todo)
3. Lee DESIGN_SYSTEM.md (todo)
4. Lee WIREFRAMES_DETALLADAS.md (todo)
5. Abre archivos paralelos a cada bloque para implementar

**Tiempo:** ~1 hora de lectura + inicio de Fase 1

### Escenario B: "Ya empecé, necesito referencia"
1. Busca en la tabla "Búsqueda Rápida" de arriba
2. Ve directamente al documento + sección
3. Copia especificaciones exactas

**Tiempo:** 2-5 min por consulta

### Escenario C: "Tengo una pregunta específica"
1. Usa Ctrl+F para buscar palabra clave — empieza por GROUND_TRUTH
2. Verifica en el resto de documentos
3. Consulta REBUILD_LP_PROMPT.md como referencia adicional

**Tiempo:** 5-10 min por respuesta

---

## 🚨 Red Flags: Cuándo Releer

- "No sé si el color es exacto" → **GROUND_TRUTH.md**, Paleta real
- "¿Qué fuente era?" → **GROUND_TRUTH.md**, Tipografía real (Torus, self-hosted)
- "¿Falta alguna sección?" → **GROUND_TRUTH.md**, Estructura real (¿pusiste Nav,
  Protetoras y Patrocínio/Apoio?)
- "¿A dónde envío el formulario?" → **GROUND_TRUTH.md**, Endpoint (`/api/inscricao`)
- "¿Cuánto padding tiene este componente?" → WIREFRAMES_DETALLADAS.md, Especificaciones
- "¿Cómo valido este campo?" → FORM_ESPECIFICACION.md, Reglas de Validación
- "¿Cuánto debe durar esta transición?" → ANIMACIONES_TRANSICIONES.md, Duraciones
- "¿Esto está listo?" → RESUMEN_EJECUTIVO.md, Definición de "Listo"

---

## 📱 Documentación en Mobile

Todos los documentos están optimizados para lectura en:
- Navegadores (desktop)
- Mobile browsers (80+ caracteres)
- Markdown viewers (GitHub, VS Code)

**Tip:** Usar Ctrl+F (Cmd+F en Mac) para buscar en documentos largos

---

## 🔗 Enlaces Internos

Documentos enlazados entre sí:
- **GROUND_TRUTH** → referenciado por todos (precede a cualquier otro)
- RESUMEN_EJECUTIVO → referencias a todos los demás
- WIREFRAMES_DETALLADAS → referencias a DESIGN_SYSTEM y GROUND_TRUTH
- FORM_ESPECIFICACION → referencias a CONTENIDO_DATOS
- ANIMACIONES_TRANSICIONES → referencias a DESIGN_SYSTEM

**Nota:** Los enlaces son menciones de nombre de archivo, use Ctrl+F para saltar

---

## ✅ Verificación de Completitud

Todos los documentos incluyen:
- ✅ Descripción clara de propósito
- ✅ Tabla de contenidos o estructura visible
- ✅ Ejemplos específicos (código, wireframes)
- ✅ Checklists accionables
- ✅ Referencias cruzadas a otros documentos
- ✅ Notas de implementación
- ✅ Tiempo de lectura estimado
- ✅ Consistencia con GROUND_TRUTH (paleta, Torus, 11 bloques, 8 campos,
  `/api/inscricao`, pt-BR, 10-14 h)

---

## 🎯 Próximo Paso

👉 **[Leer GROUND_TRUTH.md completo](./GROUND_TRUTH.md)** 🔒

👉 Luego **[RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md)**

Luego comenzar **Fase 1: Configuración y Componentes Base**

---

**Última actualización:** 2026-07-29
**Versión:** 2.0 (corregida contra GROUND_TRUTH)
**Status:** Listo para implementación
