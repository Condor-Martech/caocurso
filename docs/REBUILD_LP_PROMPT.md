# Prompt de Rebuild — LP Mês Pet Condor

> ⚠️ **Este documento fue reescrito por completo el 2026-07-29.**
>
> La versión anterior describía una página que no existe: eventos inventados
> (`Clínica Amigos Ñ`, `11h às 13h`), colores adivinados (`#F5A623`, `#003D82`),
> Montserrat + Inter como tipografía, `Parque de Ibirapuera`, `CHO CURSO`, y un
> formulario de adopción. Nada de eso es real. Si tienes una copia antigua abierta,
> ciérrala.
>
> **La fuente de verdad es [`GROUND_TRUTH.md`](./GROUND_TRUTH.md).** Este prompt sólo
> la resume para poder arrancar rápido.

---

## 1. Qué se está construyendo

Réplica fiel de **pet.condor.com.br** (campaña *Mês Pet* de la rede Condor, Paraná,
Brasil) con **Astro 7 + React 19 + Tailwind v4 + TypeScript**, más un añadido nuevo:
un **modal de inscripción al Cãocurso**.

| | |
|---|---|
| Idioma del contenido | **pt-BR**, literal. Sin español en la página. |
| Marca | Condor · campaña **Mês Pet** |
| Sub-campañas | **Adote um AuMigo** · **Cãocurso** · **Galeria** |
| Año | 2025 (la galería muestra la edición 2024) |
| Objetivo | Fidelidad visual al original + formulario funcional |

**Regla de oro:** replicar, no mejorar. Las mejoras son una fase posterior.

---

## 2. Lo que hay que saber antes de escribir una línea

### Paleta (la única permitida)

```css
--c-blue:        #00419A;   /* títulos, cards de evento, texto sobre naranja */
--c-blue-mid:    #0061B2;   /* footer, botones secundarios */
--c-orange:      #F09624;   /* fondo base de toda la página */
--c-orange-lite: #FFBB3E;   /* paneles redondeados */
--c-orange-deep: #FDB020;   /* acentos */
--c-white:       #FFFFFF;
--c-gray:        #A8A8A8;
--c-gray-dark:   #3E3E3E;
--c-red:         #E20614;   /* sólo errores */
```

⛔ **Prohibidos:** `#F5A623`, `#003D82`, `#00BCD4`, `#E91E63`, `#4CAF50`, `#F44336`,
`#9C27B0`. No existen en la marca.

### Tipografía

**Torus** (Paulo Goode), self-hosted en 6 pesos desde
`public/fonts/torus-{100,300,400,600,700,900}.woff2`.
⛔ Nada de Google Fonts, Montserrat ni Inter.

### La página es naranja

Casi todo el fondo es `--c-orange`. El blanco aparece **sólo** en cards (protetoras,
atrações) y en la barra de patrocinadores. No hay alternancia naranja/blanco por sección.

### La franja separadora no son barras planas

Es una tira a sangre completa de **tiles cuadrados (~65px) con iconos de patas y huesos**,
implementada con `Pattern.png` en `repeat-x`. En la franja previa a Eventos, las patas del
gato cuelgan por encima.

---

## 3. Estructura (11 bloques, en este orden)

```
 1. Nav           Home · Adote um Aumigo(#adote) · Cãocurso(#caocurso) ·
                  Galeria(#galeria) · Regulamento(PDF).  Derecha, sobre el naranja.
 2. Hero          Selo.png + Titulo-1024x477.png (el titular es IMAGEN) | Pet-2.png
 ── franja ──
 3. AdoteAumigo   Dog.png | Selo-Adote-um-Aumigo.png + "Dê uma chance para aquele
                  que nunca te abandona."
 ── franja (con patas de gato) ──
 4. Eventos       Título bicolor + reglas blancas + grid 2×2 de cards azules
 5. Requisitos    UN panel naranja claro con lista de 6 bullets en 2 columnas
 6. Protetoras    3 cards blancas: logo + nombre + Instagram
 ── franja ──
 7. Caocurso      Selo@2x + Txt@2x-1.png (tagline es IMAGEN) | Pet-2.png
 ── franja ──
 8. Evento30Ago   Detalles a la izquierda + botón píldora blanco a la derecha
 9. Atracoes      Panel con título + 3 cards blancas
10. Galeria       Panel con título + grid 4×3, fotos en retrato (~4:5)
11. Patrocinadores  Una barra blanca con "Patrocínio:" + "Apoio:" y sus logos
    Footer        Fondo #0061B2 · logo · ©Condor 2025 · 6 redes
```

### Los 4 eventos (datos exactos)

| Fecha | Local | Horario |
|-------|-------|---------|
| 2 AGOSTO | Condor Araucária BR | 11h às 15h |
| 9 AGOSTO | Condor Nilo Peçanha | 11h às 15h |
| 16 AGOSTO | Condor Água Verde | 11h às 15h |
| 23 AGOSTO | Condor Campo Comprido | 11h às 15h |

### Los 6 requisitos (literales)

```
– Ter, no mínimo, 21 anos;
– Portar RG, CPF e comprovante de residência;
– Responder a uma entrevista sobre os motivos da adoção;
– Assinar e concordar com o termo de adoção;
– Ter condições financeiras para manter o animalzinho;
– Ter local seguro e adequado.
```

### Las 3 atrações (literales)

| Título | Subtítulo |
|--------|-----------|
| Camarim | Seu PetStar merece esse trato! |
| Caricaturista | Não perca essa fofura. |
| Petfotos | Que tal uma foto impressa com seu pet? |

---

## 4. El formulario

**No es de adopción.** Es el **modal de inscripción al Cãocurso**: registra **una
mascota con su foto** para que pueda **recibir votos**.

- 8 campos: `tutorNome`, `tutorEmail`, `tutorTelefone`, `petNome`, `petEspecie`
  (Cão/Gato), `petIdade` (opcional), **`petFoto` (obligatoria — es el núcleo)**,
  `aceiteRegulamento` (incluye cesión de imagen). Extra opcional: `querNovidades`.
- Endpoint: **`POST /api/inscricao`**, **`multipart/form-data`** — obligatorio, porque
  una foto no cabe en un body JSON.
- La ficha nace con `status: 'pendente'`: no recibe votos hasta ser moderada.
- Requiere `output: 'server'` + `@astrojs/node` en `astro.config.mjs`.

⛔ **No usar `/api/feedback`**: pertenece a la documentación interna del proyecto
central, exige `pageId` + `content` y devuelve 400 con cualquier otro payload.

Detalle completo en [`FORM_ESPECIFICACION.md`](./FORM_ESPECIFICACION.md).

---

## 5. Assets

Los **105 assets reales ya están en el proyecto**, en `public/assets/`:

```
public/assets/images/           marca, mascotas, protetoras, atrações, Pattern
public/assets/galeria/          las 12 fotos de la edición 2024
public/assets/patrocinadores/   8 de patrocínio + 3 de apoio
public/assets/docs/             2025_Regulamento_Caocurso.pdf
public/fonts/                   Torus en 6 pesos (woff2)
```

⛔ Nada de placeholders de Unsplash ni "Partner 1 / 2 / 3".

---

## 6. Orden de trabajo

1. Leer [`GROUND_TRUTH.md`](./GROUND_TRUTH.md) — obligatorio, 10 min.
2. Tokens y fuente → [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).
3. Bloque por bloque → [`WIREFRAMES_DETALLADAS.md`](./WIREFRAMES_DETALLADAS.md).
4. Datos y textos → [`CONTENIDO_DATOS.md`](./CONTENIDO_DATOS.md).
5. Modal → [`FORM_ESPECIFICACION.md`](./FORM_ESPECIFICACION.md).
6. Movimiento → [`ANIMACIONES_TRANSICIONES.md`](./ANIMACIONES_TRANSICIONES.md).
7. Fases y checklists → [`RESUMEN_EJECUTIVO.md`](./RESUMEN_EJECUTIVO.md).

---

## 7. Antes de dar algo por terminado

- [ ] `npm run build` y `npx astro check` sin errores
- [ ] `grep -riE '#(F5A623|003D82|00BCD4|E91E63|4CAF50|F44336|9C27B0)' src/` → vacío
- [ ] `grep -riE 'montserrat|unsplash|api/feedback' src/` → vacío
- [ ] `grep -r '11h às 13h\|Ibirapuera\|CHO CURSO' src/` → vacío
- [ ] Los 11 bloques presentes, en orden, incluidos Nav, Protetoras y Patrocinadores
- [ ] Requisitos renderiza un panel con lista, no tres cards
- [ ] El modal envía `multipart/form-data` a `/api/inscricao` y la foto llega al servidor
- [ ] Responsive en 375 / 768 / 1440
- [ ] Comparación visual contra `petCondor.png` (ignorando la barra de admin de WordPress)

---

**Última actualización:** 2026-07-29 · alineado con `GROUND_TRUTH.md`
