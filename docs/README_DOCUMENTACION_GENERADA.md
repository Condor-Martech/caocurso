# 📚 Documentación Generada - Pet Condor LP Rebuild (Opción 3)

## ¿Qué se creó?

**11 documentos** con especificaciones detalladas para recrear la LP de **pet.condor.com.br**
(campaña *Mês Pet*) exactamente como está en `petCondor.png`.

> 🔒 **`GROUND_TRUTH.md` es el documento #1.** Se extrajo del HTML, el CSS y el screenshot
> originales. Si cualquier otro documento lo contradice, **gana GROUND_TRUTH**.

---

## 🎯 Archivo para Leer PRIMERO

### **GROUND_TRUTH.md** 🔒
> Fuente de verdad única: paleta real, tipografía Torus, los 11 bloques de la página,
> los 105 assets reales, el endpoint correcto y la tabla de errata de la doc previa.

**Tiempo:** 15 min | **Esencial:** SÍ, obligatorio antes de todo lo demás

### Después: **RESUMEN_EJECUTIVO.md** ⭐
> Visión de 30,000 pies: fases, cronograma, checklists, definición de "listo"

**Tiempo:** 10 min | **Esencial:** SÍ

---

## 📋 Documentos Generados

```
┌─────────────────────────────────────────────────────────────────┐
│ DOCUMENTACIÓN GENERADA - Pet Condor LP Rebuild                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. GROUND_TRUTH.md 🔒 LEER PRIMERO — FUENTE DE VERDAD          │
│     └─ Paleta real, Torus, 11 bloques, 105 assets, endpoint,   │
│        tabla de errata. Gana ante cualquier contradicción.      │
│        Tiempo: 15 min | Crítico: SÍ (obligatorio)               │
│                                                                 │
│  2. RESUMEN_EJECUTIVO.md ⭐ PLAN                                │
│     └─ Fases, cronograma, checklists, definición "listo"       │
│        Tiempo: 10 min | Crítico: SÍ                             │
│                                                                 │
│  3. DESIGN_SYSTEM.md ✨                                         │
│     └─ 9 tokens de color, Torus self-hosted, componentes base   │
│        Tiempo: 15 min | Crítico: SÍ                             │
│                                                                 │
│  4. WIREFRAMES_DETALLADAS.md 🎨                                 │
│     └─ Estructura exacta de los 11 bloques, dimensiones         │
│        Tiempo: 20 min | Crítico: SÍ                             │
│                                                                 │
│  5. FORM_ESPECIFICACION.md 📝                                   │
│     └─ Modal de inscripción al Cãocurso (8 campos + foto)       │
│        Tiempo: 20 min | Crítico: SÍ                             │
│                                                                 │
│  6. CONTENIDO_DATOS.md 📄                                       │
│     └─ Arrays JSON, textos pt-BR literales, assets, endpoint    │
│        Tiempo: 15 min | Crítico: SÍ                             │
│                                                                 │
│  7. ANIMACIONES_TRANSICIONES.md 🎬                              │
│     └─ Keyframes, duraciones, easing, micro-interacciones      │
│        Tiempo: 15 min | Crítico: NO (puede venir después)      │
│                                                                 │
│  8. REBUILD_LP_PROMPT.md 🎯                                     │
│     └─ Prompt elaborado (redundante, referencia adicional)     │
│        Tiempo: 25 min | Crítico: NO (referencia)                │
│                                                                 │
│  9. INDICE_DOCUMENTACION.md 🗺️                                  │
│     └─ Mapeo de documentos, búsqueda rápida, matriz de uso     │
│        Tiempo: 5 min | Crítico: NO (guía de navegación)        │
│                                                                 │
│ 10. CLAUDE.md 📖                                                │
│     └─ Guía del proyecto: stack, comandos, reglas duras        │
│        Tiempo: 5 min | Crítico: SÍ (reglas de trabajo)          │
│                                                                 │
│ 11. README_DOCUMENTACION_GENERADA.md 📌 (ESTE ARCHIVO)         │
│     └─ Resumen ultra-conciso de todo lo anterior               │
│        Tiempo: 2 min | Crítico: SÍ (orientación)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧱 Lo que hay que construir (Nav + 11 bloques)

```
Nav (no numerado)
1 Hero · 2 Adote um AuMigo · 3 Eventos · 4 Requisitos · 5 Protetoras ·
6 Cãocurso · 7 30 Agosto · 8 Atrações · 9 Galeria · 10 Patrocínio/Apoio · 11 Footer
```

**Nunca omitir Nav, Protetoras ni Patrocínio/Apoio.**

---

## ⚙️ Los 6 datos que no se negocian

| Tema | Valor correcto |
|------|----------------|
| Idioma del sitio | **pt-BR**, literal como el original (la doc está en español) |
| Paleta | `#00419A` `#0061B2` `#F09624` `#FFBB3E` `#FDB020` `#FFFFFF` `#A8A8A8` `#3E3E3E` `#E20614` |
| Tipografía | **Torus** self-hosted, 6 pesos. Sin Google Fonts |
| Formulario | Inscripción al **Cãocurso** (no adopción): **8 campos**, con `petFoto` obligatoria → `POST /api/inscricao` en **multipart/form-data** |
| Stack | Astro 7 + React 19 + Tailwind v4 + TypeScript + **@astrojs/node**, `output: 'server'` |
| Assets | Los **105 archivos reales**. Prohibido Unsplash o "Partner 1/2/3" |

---

## 📖 Cómo Navegar

### **Ruta Rápida (~1 hora)**
1. Este archivo (2 min)
2. **GROUND_TRUTH.md (15 min)** ← obligatorio
3. RESUMEN_EJECUTIVO.md (10 min)
4. DESIGN_SYSTEM.md (15 min)
5. WIREFRAMES_DETALLADAS.md (20 min)
6. **→ Listo para empezar Fase 1**

### **Ruta Completa (~2 horas)**
1-5 del anterior
6. FORM_ESPECIFICACION.md (20 min)
7. CONTENIDO_DATOS.md (15 min)
8. Revisar REBUILD_LP_PROMPT.md (10 min, solo secciones clave)
9. **→ Listo para empezar proyecto con referencia total**

### **Ruta de Consulta (Durante desarrollo)**
- Duda sobre un dato del original → **GROUND_TRUTH.md** (siempre gana)
- Necesitas referencia → INDICE_DOCUMENTACION.md (matriz de búsqueda)
- No sabes dónde buscar → Ctrl+F en documentos individuales

---

## 🎯 Qué Contiene Cada Documento

| Doc | Líneas | Secciones | Tablas | Ejemplos | Para |
|-----|--------|-----------|--------|----------|------|
| **GROUND_TRUTH** 🔒 | 330 | 8 | 7 | Wireframe ASCII | Verdad |
| **RESUMEN_EJECUTIVO** | 500 | 16 | 4 | Checklists | Plan |
| **DESIGN_SYSTEM** | 350 | 12 | 8 | Código CSS | Diseño |
| **WIREFRAMES** | 500 | 20 | 2 | ASCII art | Estructura |
| **FORM_ESPECIFICACION** | 600 | 25 | 5 | HTML/JS | Formulario |
| **CONTENIDO_DATOS** | 400 | 12 | 4 | JSON | Datos |
| **ANIMACIONES** | 350 | 20 | 3 | CSS | Movimiento |
| **REBUILD_LP_PROMPT** | 450 | 18 | 8 | Spec | Referencia |
| **INDICE_DOCUMENTACION** | 250 | 12 | 4 | Tablas | Navegación |
| **CLAUDE** | 200 | 12 | 2 | Comandos | Reglas |

---

## 🚀 Tres Caminos Posibles

### **Opción A: "Quiero empezar YA"**
```
GROUND_TRUTH.md (15 min) ← innegociable
        ↓
RESUMEN_EJECUTIVO.md (10 min)
        ↓
    Fase 1: Config
        ↓
 DESIGN_SYSTEM.md (consulta)
        ↓
   Implementar
```
**Ventaja:** Rápido, aprendes haciendo
**Desventaja:** Puedes tener dudas durante el proceso

---

### **Opción B: "Quiero tener todo claro primero" ✅ (RECOMENDADO)**
```
GROUND_TRUTH.md (15 min)
        ↓
RESUMEN_EJECUTIVO.md (10 min)
        ↓
DESIGN_SYSTEM.md (15 min)
        ↓
WIREFRAMES_DETALLADAS.md (20 min)
        ↓
FORM_ESPECIFICACION.md (20 min)
        ↓
CONTENIDO_DATOS.md (15 min)
        ↓
    Fase 1: Config
        ↓
   Implementar
```
**Ventaja:** Sabes todo antes de empezar, implementación más rápida
**Desventaja:** ~2 horas de lectura antes de codear

---

### **Opción C: "Necesito referencia mientras código"**
```
GROUND_TRUTH.md (leído una vez, consultado siempre)
        ↓
 INDICE_DOCUMENTACION.md
        ↓
Documentos individuales (por necesidad)
        ↓
   Implementar
```
**Ventaja:** Referencia rápida, no relees todo
**Desventaja:** Podrías perderte sin visión general

---

## 📊 Orden Recomendado de Lectura

```
1️⃣ Este archivo (2 min) ← ESTÁS AQUÍ
         ↓
2️⃣ GROUND_TRUTH.md (15 min) ← 🔒 FUENTE DE VERDAD, OBLIGATORIO
         ↓
3️⃣ RESUMEN_EJECUTIVO.md (10 min) ← CRÍTICO
         ↓
4️⃣ DESIGN_SYSTEM.md (15 min) ← CRÍTICO
         ↓
5️⃣ WIREFRAMES_DETALLADAS.md (20 min) ← CRÍTICO
         ↓
6️⃣ FORM_ESPECIFICACION.md (20 min) ← CRÍTICO
         ↓
7️⃣ CONTENIDO_DATOS.md (15 min) ← MUY ÚTIL
         ↓
8️⃣ CLAUDE.md (5 min) ← reglas duras del proyecto
         ↓
[Opcionalmente: ANIMACIONES_TRANSICIONES.md] (15 min)
         ↓
[Opcionalmente: REBUILD_LP_PROMPT.md] (25 min, revisión)
         ↓
9️⃣ Marca INDICE_DOCUMENTACION.md como bookmark ← REFERENCIA RÁPIDA
         ↓
🚀 LISTA PARA EMPEZAR (~2 horas de lectura total)
```

---

## ⚡ Acciones Inmediatas

### HOY (Ahora)
- [ ] Leer este archivo (2 min)
- [ ] Leer GROUND_TRUTH.md COMPLETO (15 min)
- [ ] Leer RESUMEN_EJECUTIVO.md (10 min)
- [ ] Decidir: ¿cuándo empiezas a codear?

### Si codeas en 1 hora
- [ ] Lee DESIGN_SYSTEM.md + WIREFRAMES_DETALLADAS.md (35 min)
- [ ] Empieza Fase 1 con esos como referencia

### Si codeas mañana
- [ ] Lee todos los documentos críticos hoy (~95 min)
- [ ] Descansa un poco
- [ ] Fresco mañana para codear

---

## 🎓 TL;DR (Muy Largo; No Leí)

**¿Qué se hizo?**
- 11 documentos ultra-detallados para el rebuild de la LP, encabezados por
  GROUND_TRUTH.md (fuente de verdad extraída del HTML/CSS/screenshot originales)

**¿Cuánto tiempo necesito para leer?**
- Mínimo: 60 min (GROUND_TRUTH + RESUMEN + DESIGN_SYSTEM + WIREFRAMES)
- Recomendado: ~2 horas (todo)

**¿Puedo empezar sin leer?**
- No del todo:
  - GROUND_TRUTH = obligatorio (15 min), o repetirás los errores de la doc previa
  - RESUMEN_EJECUTIVO = imprescindible (10 min)
  - DESIGN_SYSTEM = crítico (15 min)
  - Otros = referencia mientras codeas

**¿Dónde está el formulario?**
- FORM_ESPECIFICACION.md — inscripción al Cãocurso: 8 campos, validación, estados, submit

**¿Cuántos bloques tiene la página?**
- Nav + 11 bloques: Hero, Adote um AuMigo, Eventos, Requisitos, Protetoras, Cãocurso,
  30 Agosto, Atrações, Galeria, Patrocínio/Apoio, Footer

**¿Cuándo termino?**
- 8-12 horas de código (5 fases)
- + ~2 horas de lectura = **10-14 horas total**

**¿Por dónde empiezo a codear?**
- Fase 1: config (`output: 'server'` + @astrojs/node), fuentes Torus, tokens,
  componentes base y el endpoint `/api/inscricao`
- 1.5-2 horas
- Instrucciones en RESUMEN_EJECUTIVO.md

---

## 📱 Versión Móvil

Todos los documentos son markdown y funcionan en:
- ✅ GitHub (ver en web)
- ✅ VS Code (preview)
- ✅ Mobile browsers
- ✅ Markdown apps (Obsidian, etc.)

**Búsqueda:** Ctrl+F en cada documento (recomendado)

---

## 🔗 Tabla de Referencia Rápida

| Necesito                    | Documento            | Sección              |
|-----------------------------|----------------------|----------------------|
| ¿Qué dice el original?      | GROUND_TRUTH         | Estructura real      |
| Color azul exacto           | GROUND_TRUTH         | Paleta real          |
| Fuente y pesos              | GROUND_TRUTH         | Tipografía real      |
| Qué asset usar              | GROUND_TRUTH         | Inventario de assets |
| Endpoint del formulario     | GROUND_TRUTH         | Endpoint (corrección)|
| Tamaño botón                | WIREFRAMES           | Especificaciones     |
| Validación email            | FORM_ESPECIFICACION  | Reglas validación    |
| Array de eventos            | CONTENIDO_DATOS      | Eventos Array        |
| Animación hover             | ANIMACIONES          | Transiciones         |
| Archivo a crear             | RESUMEN_EJECUTIVO    | Estructura archivos  |
| Verificación final          | RESUMEN_EJECUTIVO    | QA Checklist         |
| Instrucciones Fase X        | RESUMEN_EJECUTIVO    | Fases implementación |
| Duda general                | REBUILD_LP_PROMPT    | Referencia           |
| ¿Dónde busco algo?          | INDICE_DOCUMENTACION | Búsqueda rápida      |

---

## ✅ Checklist Pre-Coding

Antes de abrir VS Code:

- [ ] Leído **GROUND_TRUTH.md** (paleta, Torus, 11 bloques, assets, endpoint)
- [ ] Leído RESUMEN_EJECUTIVO.md
- [ ] Leído DESIGN_SYSTEM.md (los 9 tokens guardados)
- [ ] Leído WIREFRAMES_DETALLADAS.md
- [ ] Entendido Fase 1 (config + componentes base + endpoint)
- [ ] Abierto INDICE_DOCUMENTACION.md como referencia
- [ ] Preparado entorno (npm install, @astrojs/node, Torus → woff2)
- [ ] `petCondor.png` visible en otra ventana (ignorando la barra de admin de WP)

**Tiempo total:** ~2 horas antes de codear

---

## 🎯 Siguiente Paso

👉 **ABRE:** `GROUND_TRUTH.md`

**Lee:** Todo (15 minutos). No lo saltes: corrige ~20 errores de la documentación previa.

**Luego:** `RESUMEN_EJECUTIVO.md` y decide cuándo empiezas Fase 1

---

## 📞 Preguntas Frecuentes

**P: ¿Hay código listo para copiar-pegar?**
R: No, son especificaciones. El código lo escribes tú en Astro/React.

**P: ¿Puedo cambiar el diseño?**
R: No. El objetivo es replicar exactamente. La única pieza nueva y deliberada es el
modal de inscripción al Cãocurso.

**P: ¿En qué idioma van los textos del sitio?**
R: Portugués de Brasil, literal como el original. La documentación está en español; el
sitio, no.

**P: ¿El formulario es de adopción?**
R: NO. Es la **inscripción al concurso Cãocurso**: registra UNA mascota con su foto para
que reciba votos. No pide dirección, patio, "¿tienes mascotas?" ni documento de identidad.

**P: ¿El formulario debe ser funcional?**
R: SÍ. Debe validar sus 8 campos y enviar a `POST /api/inscricao` en
`multipart/form-data` (`petFoto` es un archivo y no cabe en un body JSON). Requiere
`output: 'server'` + `@astrojs/node`.

**P: ¿Y `/api/feedback`?**
R: No sirve aquí. Es el endpoint de documentación del proyecto central: exige
`pageId` + `content` y devuelve 400 con el payload de inscripción.

**P: ¿Necesito todas las imágenes reales?**
R: Sí. Ya existen 105 assets reales. Nada de placeholders de Unsplash.

**P: ¿El formulario se compara con el original?**
R: No. El sitio original no tiene formulario; es un añadido de este rebuild. Se valida
contra FORM_ESPECIFICACION.md y el design system.

**P: ¿Cuánto tiempo estimado?**
R: 8-12 horas de código + ~2 horas de lectura = **10-14 horas total**.

---

## 🏁 Estado

```
✅ Ground truth: VERIFICADO (HTML + CSS + screenshot)
✅ Documentación: COMPLETA (11 documentos)
✅ Especificaciones: DETALLADAS
✅ Ejemplos: INCLUIDOS
✅ Checklists: LISTOS
✅ Roadmap: CLARO

🚀 LISTO PARA IMPLEMENTACIÓN
```

---

**Última actualización:** 2026-07-29
**Versión:** 2.0 (corregida contra GROUND_TRUTH)
**Total documentos:** 11
**Total páginas:** ~110
**Total especificaciones:** 200+

**Estado:** ✅ LISTO - Comenzar con GROUND_TRUTH.md
