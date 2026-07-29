# Especificación Detallada: Modal de Inscripción al Cãocurso

> ## ⚠️ LEE ESTO PRIMERO — Este formulario NO existe en el sitio original
>
> `pet.condor.com.br` **no tiene ningún formulario activo**. El HTML original
> (WordPress + Elementor + JetFormBuilder) no contiene este modal ni ningún botón que lo
> abra: la inscripción al Cãocurso figura como **`Encerrado`**. Este componente es un
> **añadido nuevo e intencional de este rebuild**.
>
> **Consecuencia práctica:** no lo compares pixel a pixel contra `petCondor.png` ni contra
> el HTML scrapeado — **no hay referencia con la que comparar**. Lo único que sí es
> obligatorio es que respete el **design system real** (paleta Condor, tipografía Torus,
> radios redondeados, pt-BR).
>
> Todo lo demás de la página (Nav, Hero, Adote um AuMigo, Eventos, Requisitos, Protetoras,
> Cãocurso, 30 Agosto, Atrações, Galeria, Patrocínio/Apoio, Footer) **sí** se replica
> pixel-perfect. Este modal, no.

> ## 🎯 QUÉ ES ESTE FORMULARIO (corrección de fondo)
>
> **Es el formulario de INSCRIPCIÓN AL CONCURSO Cãocurso. NO es un formulario de adopción.**
>
> Propósito exacto: **registrar UNA mascota, con su foto, para que compita y reciba votos
> en el Cãocurso.**
>
> Flujo: el tutor abre el modal desde un CTA de la sección **Cãocurso** → rellena sus datos
> y los de su mascota → sube **una foto** → acepta el regulamento y la cesión de imagen →
> se crea una **ficha de mascota votable**.
>
> **La versión anterior de este documento describía un formulario de adopción** con
> `Endereço`, `Tem quintal?`, `Tem animais em casa?` y `Documento (RG ou CNH)`. Los cuatro
> campos **se eliminan**: no pertenecen a este componente ni a esta campaña.

---

## 0. Datos duros del componente

| Dato | Valor |
|------|-------|
| **Número de campos** | **8 campos.** Ni 7 ni 9. Ver desglose abajo. |
| Endpoint | **`POST /api/inscricao`** |
| Content-Type | **`multipart/form-data`** (NO JSON) |
| Requisito Astro | **`output: 'server'` + `@astrojs/node`** |
| Idioma de la UI | **Portugués de Brasil (pt-BR), 100%** |
| Tipografía | **`Torus`** (self-hosted) |
| Botones | **`Enviar`** / **`Cancelar`** |
| Campo núcleo | **`petFoto`** — sin foto no hay concurso |

### Los 8 campos (lista canónica, cierra la discusión 7 vs 8)

| # | Campo (`name`) | Tipo | Obligatorio |
|---|----------------|------|-------------|
| 1 | `tutorNome` | text | Sí |
| 2 | `tutorEmail` | email | Sí |
| 3 | `tutorTelefone` | tel | Sí |
| 4 | `petNome` | text | Sí |
| 5 | `petEspecie` | radio (`Cão` / `Gato`) | Sí |
| 6 | `petIdade` | select | No (opcional) |
| 7 | `petFoto` | **file (imagen)** | Sí — **el núcleo del formulario** |
| 8 | `aceiteRegulamento` | checkbox | Sí (regulamento + uso de imagen) |

> 📌 El checkbox opcional *«Quero receber novidades»* (`querNovidades`) **NO es un noveno
> campo**: es un opt-in accesorio que viaja junto al campo 8. Ésta era la causa del
> desacuerdo 7 vs 8 entre documentos.

### Campos ELIMINADOS respecto a la versión anterior

| Campo eliminado | Motivo |
|-----------------|--------|
| `endereco` | Era del formulario de adopción imaginado. El concurso no pide dirección. |
| `temQuintal` | Ídem. Irrelevante para un concurso de fotos. |
| `temPets` + `descricaoPets` | Ídem. El tutor inscribe **una** mascota concreta. |
| `documento` (RG/CNH) | Ídem. Pedir identidad para un concurso de fotos es desproporcionado. |

### Nota sobre la paleta (cambio respecto a la versión anterior de este doc)

La versión anterior usaba `#003D82`, `#F44336` y `#4CAF50`. **Ninguno de los tres es un
color de la marca Condor.** Correcciones aplicadas en todo el documento:

| Antes (inventado) | Ahora (token real) | Uso |
|-------------------|--------------------|-----|
| `#003D82` | **`#00419A`** (`--c-blue`) | Títulos, labels, foco, botón primario |
| `#F44336` | **`#E20614`** (`--c-red`) | Errores, asterisco de obligatorio |
| `#4CAF50` (verde) | **`#00419A`** (`--c-blue`) | Estado válido: borde azul + check azul |
| `#666` | `#3E3E3E` (`--c-gray-dark`) | Texto secundario |
| `#999` / `#E0E0E0` | `#A8A8A8` (`--c-gray`) | Bordes neutros |
| `#F5F5F5` | `rgba(0,65,154,.05)` | Fondos sutiles (azul al 5 %) |

**El verde desaparece.** Condor no tiene verde en su sistema: el estado «válido» se
comunica con **borde azul `#00419A` + check `✓` azul**, no con semáforo verde/rojo. El
rojo `#E20614` se conserva sólo para error, que sí es un token de marca.

---

## Estructura General del Modal

```
┌─────────────────────────────────────────────────────────┐
│  [X] Fechar (top-right)                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  INSCREVA SEU PET NO CÃOCURSO                           │
│                                                         │
│  Seu pet é a estrela da nossa passarela.                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [8 campos do formulário]                               │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │      [ENVIAR]       │  │     [CANCELAR]      │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Dimensiones

- **Desktop:** Width 600px, max-height 80vh, scrollable
- **Tablet:** Width 90% viewport, max-height 90vh
- **Mobile:** Width 95% viewport, max-height 95vh, casi pantalla completa

### Posicionamiento

- **Backdrop:** Fijo, `rgba(0,0,0,0.7)`, blur 4px
- **Modal:** Centrado (position fixed, top 50%, left 50%, translate -50% -50%)
- **Overflow:** Auto si contenido > viewport
- **Z-index:** 1000

### Estilos Base

```css
:root {
  --c-blue:        #00419A;
  --c-blue-mid:    #0061B2;
  --c-orange:      #F09624;
  --c-orange-lite: #FFBB3E;
  --c-orange-deep: #FDB020;
  --c-white:       #FFFFFF;
  --c-gray:        #A8A8A8;
  --c-gray-dark:   #3E3E3E;
  --c-red:         #E20614;
  --font-display:  'Torus', system-ui, sans-serif;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  font-family: var(--font-display);   /* Torus en TODO el modal */
  background: var(--c-white);
  border-radius: 16px;                /* mismo radio que las cards del sitio */
  padding: 40px;
  width: 600px;
  max-width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .3);
  animation: slideIn 300ms ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-50px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

> ⚠️ **Tipografía:** el modal usa **únicamente `Torus`**, self-hosteada desde
> `assets/fonts/` (6 pesos: Thin, Light, Regular, SemiBold, Bold, Heavy, convertidos a
> `.woff2`). **Prohibido** Montserrat, Inter, Roboto o cualquier Google Font. Los pesos
> que usa el formulario son Regular (400), SemiBold (600) y Bold (700).

---

## Secciones del Formulario

### 1. Header Modal

```
┌─────────────────────────────────────────────┐
│  INSCREVA SEU PET NO CÃOCURSO     [X]       │ ← Fechar
│                                             │
│  Seu pet é a estrela da nossa passarela.    │
│  Envie uma foto e concorra aos votos.       │
│                                             │
├─────────────────────────────────────────────┤
```

**Título Principal** — texto literal: `INSCREVA SEU PET NO CÃOCURSO`
- Font-family: `Torus`
- Font-size: 28px
- Font-weight: 700 (Bold)
- Color: **`#00419A`** (`--c-blue`)
- Transform: uppercase
- Margin-bottom: 12px

**Subtítulo** — texto literal: `Seu pet é a estrela da nossa passarela. Envie uma foto e concorra aos votos.`
- La primera frase es **texto real del sitio** (imagen `Txt@2x-1.png` de la sección Cãocurso);
  la segunda es añadido del modal.
- Font-size: 16px
- Font-weight: 400 (Regular)
- Color: **`#3E3E3E`** (`--c-gray-dark`)
- Margin-bottom: 24px

**Botón Cerrar (X):**
- Position: absolute top-right
- Width: 32px, Height: 32px
- Background: transparent · Border: none · Cursor: pointer
- Icon: ✕ (16px)
- Color: `#3E3E3E`
- Hover: Background `rgba(0,65,154,.05)`, color `#00419A`
- `aria-label="Fechar formulário"`

---

### 2. Campos del Formulario

#### Field 1 · Nome do tutor

```
┌─────────────────────────────────┐
│ Nome completo do tutor *        │ ← Label
├─────────────────────────────────┤
│ [_______________________________] │ ← Input
│                                 │
│ ⚠ Informe seu nome completo.    │ ← Error (si aplica)
└─────────────────────────────────┘
```

- **Label:** `Nome completo do tutor *`
  - Font-size: 14px · Font-weight: 600 (SemiBold)
  - Color: **`#00419A`**
  - Margin-bottom: 8px
  - Asterisco en **`#E20614`** si es obligatorio

- **Input:**
  - `name="tutorNome"` · Width 100% · Padding 12px 16px
  - Border: `1px solid #A8A8A8`
  - Border-radius: 8px · Font-size 16px · `font-family: inherit` (Torus)
  - Transition: 200ms ease
  - Placeholder: `Ex.: Maria Silva`
  - Focus: `border-color: #00419A`, `box-shadow: 0 0 0 3px rgba(0,65,154,.1)`

- **Error Message:** `Informe seu nome completo (mín. 3 caracteres).`
  - Font-size 12px · Font-weight 500 · Color **`#E20614`**
  - Margin-top 6px · Display none hasta que hay error · Icono ⚠ pequeño

---

#### Field 2 · E-mail do tutor

```
┌─────────────────────────────────┐
│ E-mail *                        │
├─────────────────────────────────┤
│ [_______________________________] │
│                                 │
│ ⚠ E-mail inválido.              │ ← Error
└─────────────────────────────────┘
```

- **Type:** `email` · `name="tutorEmail"`
- **Placeholder:** `seu.email@exemplo.com.br`
- **Validación:** regex básico (`algo@algo.dominio`)
- **Helper text:** `Enviaremos a confirmação e o link de votação para este e-mail.`
- **Errores:** `E-mail inválido.` / `Campo obrigatório.`

---

#### Field 3 · Telefone / WhatsApp

```
┌─────────────────────────────────┐
│ Telefone / WhatsApp *           │
├─────────────────────────────────┤
│ [_______________________________] │
│                                 │
│ Ex.: (41) 99999-9999            │ ← Helper text
└─────────────────────────────────┘
```

- **Type:** `tel` · `name="tutorTelefone"`
- **Placeholder:** `(41) 99999-9999`
- **Formato:** 10–15 dígitos; se aceptan `()`, espacios, `-` y `+`
- **Helper text:** `Ex.: (41) 99999-9999` (14px, `#A8A8A8`)
- **Error:** `Telefone inválido.`

> Formato brasileño (DDD + número). Nada de `+56 …`: la campaña es de Paraná, Brasil.

---

#### Field 4 · Nome do pet

```
┌─────────────────────────────────┐
│ Nome do pet *                   │
├─────────────────────────────────┤
│ [_______________________________] │
│                                 │
│ ⚠ Informe o nome do seu pet.    │
└─────────────────────────────────┘
```

- **Type:** `text` · `name="petNome"`
- **Placeholder:** `Ex.: Bidu`
- **Max-length:** 40 caracteres
- **Error:** `Informe o nome do seu pet.`

---

#### Field 5 · Espécie

```
┌─────────────────────────────────┐
│ Seu pet é: *                    │
├─────────────────────────────────┤
│                                 │
│  ◉ Cão      ◯ Gato              │ ← Radio buttons
│                                 │
└─────────────────────────────────┘
```

- **Type:** radio group · `name="petEspecie"` · valores `cao` / `gato`
- **Label:** `Seu pet é: *`
- **Options (texto visible):** `Cão` · `Gato`
- **Default:** ninguno (selección obligatoria)
- **Styling:**
  - Radio: 18px de diámetro, custom (sin default del navegador)
  - Checked: **`#00419A`**
  - Texto de la opción: 14px Regular, clicable
  - Gap entre opciones: 24px
  - Hover: cursor pointer, background `rgba(0,65,154,.05)`
- **Error:** `Selecione uma opção.`

> El concurso admite gatos: la campaña es *«e pra gatos também!»*. No etiquetar el campo
> como «raça do cachorro» ni asumir sólo perros pese al nombre «Cãocurso».

---

#### Field 6 · Idade do pet (opcional)

```
┌─────────────────────────────────┐
│ Idade do pet (opcional)         │
├─────────────────────────────────┤
│ [ Selecione…              ▼ ]   │ ← Select
└─────────────────────────────────┘
```

- **Type:** `select` · `name="petIdade"`
- **Label:** `Idade do pet (opcional)`
- **Opciones (pt-BR):**
  - `Selecione…` (valor vacío, por defecto)
  - `Filhote (até 1 ano)`
  - `Adulto (1 a 7 anos)`
  - `Idoso (mais de 7 anos)`
- **Obligatorio:** no. Sin mensaje de error.
- **Styling:** mismo borde/radio que los inputs de texto.

---

#### Field 7 · Foto do pet (upload) — **campo núcleo**

```
┌─────────────────────────────────┐
│ Foto do pet *                   │
├─────────────────────────────────┤
│                                 │
│  [📷 Selecionar foto]           │ ← Botón custom
│  Formatos: JPG, PNG ou WebP     │ ← Helper text
│  Tamanho máximo: 5 MB           │ ← Helper text
│  Mínimo 600×600 px              │ ← Helper text
│                                 │
│  ┌───────┐                      │
│  │ [img] │ bidu.jpg · 1,2 MB [X]│ ← Preview si hay archivo
│  └───────┘                      │
│                                 │
└─────────────────────────────────┘
```

- **Type:** `file` · `name="petFoto"` · **una sola imagen** (sin `multiple`)
- **Label:** `Foto do pet *`
- **Accept:** `.jpg,.jpeg,.png,.webp`
- **Max size:** 5 MB · **Mínimo:** 600×600 px (validar con `Image` en cliente)
- **Display:** input nativo oculto + botón custom que lo dispara + **preview en miniatura**
- **Botón:**
  - Texto: `Selecionar foto` · Icono 📷
  - Background `rgba(0,65,154,.05)` · Border `1px dashed #A8A8A8`
  - Padding 16px 20px · Border-radius 8px · Cursor pointer
  - Hover: background `rgba(0,65,154,.1)`, border-color `#00419A`
- **Si hay archivo:** miniatura (72×72, `object-fit: cover`, radio 8px) + nombre + badge de
  tamaño + botón `X` para quitarlo (`aria-label="Remover foto"`, color `#E20614`)
- **Errores:**
  - `Envie uma foto do seu pet.` (vacío — es obligatorio)
  - `Formato não aceito. Envie JPG, PNG ou WebP.`
  - `Arquivo muito grande. O limite é 5 MB.`
  - `Foto pequena demais. O mínimo é 600×600 px.`

> ⚠️ **Este campo es la razón por la que el envío NO puede ser JSON.** Ver sección
> «Submit del Formulario». Y es **obligatorio**: sin foto no hay ficha que votar.

---

#### Field 8 · Regulamento e uso de imagem

```
┌─────────────────────────────────┐
│                                 │
│  ☐ Li e aceito o Regulamento    │ ← Checkbox obrigatório
│    do Cãocurso e autorizo o     │
│    uso da imagem do meu pet *   │
│                                 │
│  ☑ Quero receber novidades      │ ← Checkbox opcional
│    sobre o Mês Pet              │
│                                 │
└─────────────────────────────────┘
```

- **Checkbox 1 (OBLIGATORIO)** · `name="aceiteRegulamento"`
  - Label: `Li e aceito o [Regulamento do Cãocurso](/assets/2025_Regulamento_Caocurso.pdf) e autorizo o uso da imagem do meu pet no site e nas redes do Condor. *`
  - El link apunta al PDF real `2025_Regulamento_Caocurso.pdf` (el mismo del botón
    `Confira o regulamento` de la sección **30 AGOSTO**)
  - Links en **`#00419A`** con `text-decoration: underline`
  - Font-size 14px · Default: desmarcado
  - Checked: caja **`#00419A`** con check blanco
  - Error: `É preciso aceitar o regulamento para continuar.`

- **Checkbox 2 (OPCIONAL)** · `name="querNovidades"`
  - Label: `Quero receber novidades sobre o Mês Pet.`
  - Font-size 14px · Default: marcado (opt-in positivo)

> ⚖️ **La cesión de imagen no es opcional ni separable.** Es el requisito legal del
> concurso: sin ella no se puede publicar la foto para votación. Va en el **mismo**
> checkbox que el regulamento, con el texto explícito arriba.

---

### 3. Botones de Acción

```
┌─────────────────────────────────┬─────────────────────────────────┐
│            [ENVIAR]             │           [CANCELAR]            │
└─────────────────────────────────┴─────────────────────────────────┘
```

#### Botón Primario · `Enviar`

- **Texto:** `Enviar` (loading: `Enviando…`)
- **Background:** **`#00419A`** (`--c-blue`)
- **Color:** `#FFFFFF`
- **Font:** Torus · 16px · 700
- **Padding:** 14px 32px · **Border-radius:** 8px
- **Width:** 100% (o `flex: 1`)
- **Transition:** 200ms ease
- **Hover:**
  - Background: **`#0061B2`** (`--c-blue-mid`, el azul de marca para hover — no un
    `#002d5f` inventado)
  - Box-shadow: `0 8px 16px rgba(0,65,154,.3)`
  - Transform: `translateY(-2px)`
- **Active:** `scale(.98)`
- **Disabled:** opacity 50 %, `cursor: not-allowed`, `pointer-events: none`
- **Loading:** texto `Enviando…` + spinner, `disabled: true`

#### Botón Secundario · `Cancelar`

- **Texto:** `Cancelar`
- **Background:** `#FFFFFF`
- **Border:** `1px solid #A8A8A8`
- **Color:** **`#00419A`**
- **Font:** Torus · 16px · 700
- **Padding:** 14px 32px · **Border-radius:** 8px
- **Width:** igual que el primario
- **Hover:** background `rgba(0,65,154,.05)`, border-color `#00419A`
- **Active:** `scale(.98)`

#### Layout Botones

- **Container:** flex, gap 16px, width 100 %
- **Desktop:** los 2 botones lado a lado (`Enviar` primero, a la izquierda)
- **Mobile:** stack vertical, width 100 % cada uno

---

## Validación y Mensajes

### Estados de Validación

#### Válido
```
┌─────────────────────────────────┐
│ Nome completo do tutor *        │
├─────────────────────────────────┤
│ [Maria Silva             ]    ✓ │ ← Check AZUL (no verde)
│                                 │
└─────────────────────────────────┘
```
- Border: `1px solid #00419A`
- Check `✓` a la derecha, color `#00419A`

> El estado «válido» **no usa verde**. `#4CAF50` no existe en la marca Condor: el azul
> `#00419A` ya es el color de autoridad del sistema y comunica «correcto» sin introducir
> un color ajeno. El contraste con el estado de error (`#E20614`) sigue siendo claro
> porque cambian **color + icono** a la vez.

#### Inválido (error)
```
┌─────────────────────────────────┐
│ E-mail *                      ⚠ │
├─────────────────────────────────┤
│ [email-invalido              ]  │
│                                 │
│ ⚠ E-mail inválido.              │ ← Mensaje en rojo
└─────────────────────────────────┘
```
- Border: `1px solid #E20614`
- Icono ⚠ en `#E20614`
- Mensaje: color `#E20614`, 12px

#### Vacío / sin tocar
```
┌─────────────────────────────────┐
│ Telefone / WhatsApp *           │
├─────────────────────────────────┤
│ [                            ]  │ ← Borde neutro
│                                 │
└─────────────────────────────────┘
```
- Border: `1px solid #A8A8A8`
- Sin mensaje, sin icono

### Reglas de Validación

| # | Campo (`name`) | Regla | Mensaje de error (pt-BR) |
|---|----------------|-------|--------------------------|
| 1 | `tutorNome` | Min 3, max 100 caracteres | `Informe seu nome completo (mín. 3 caracteres).` |
| 2 | `tutorEmail` | Formato de e-mail válido | `E-mail inválido.` |
| 3 | `tutorTelefone` | 10–15 dígitos | `Telefone inválido.` |
| 4 | `petNome` | Min 2, max 40 caracteres | `Informe o nome do seu pet.` |
| 5 | `petEspecie` | Seleccionado (`cao`/`gato`) | `Selecione uma opção.` |
| 6 | `petIdade` | **Opcional.** Si viene, uno de los 3 valores | — |
| 7 | `petFoto` | **Obligatorio.** JPG/PNG/WebP, ≤ 5 MB, ≥ 600×600 px | `Envie uma foto do seu pet.` / `Formato não aceito. Envie JPG, PNG ou WebP.` / `Arquivo muito grande. O limite é 5 MB.` / `Foto pequena demais. O mínimo é 600×600 px.` |
| 8 | `aceiteRegulamento` | Marcado | `É preciso aceitar o regulamento para continuar.` |

> 🐛 **Regla eliminada.** La versión anterior tenía una fila `6b` («si `patio === 'Sí'`,
> exigir descripción de las mascotas»), heredada del formulario de adopción. Ese campo ya
> no existe: **no hay campos condicionales en este formulario.**

### Validación en Tiempo Real vs Submit

- **Blur (el campo pierde el foco):** valida **sólo ese campo** y muestra su error si
  aplica. No valida el resto del formulario.
- **Change en radios/checkbox/select:** valida inmediatamente (no hay «blur» natural útil).
- **Change en el file input:** valida tipo, tamaño y dimensiones **antes** de mostrar el
  preview; si falla, no se guarda el archivo en el estado.
- **Submit:** valida **todos** los campos, muestra **todos** los errores a la vez, hace
  `focus()` en el primer campo con error y **no envía** nada si hay al menos uno.
- **Mientras se corrige:** el error de un campo se limpia al primer `input` válido — no
  se espera al siguiente blur para quitar el rojo.

---

## Comportamiento de Interacción

### Apertura del Modal

**Trigger (todos son botones nuevos, no existen en el original):**
- Botón `Inscreva seu pet` en la sección **Cãocurso** (`#caocurso`)
- Botón `Inscreva seu pet` en la sección **30 AGOSTO**, junto a los datos reales del
  evento del concurso:
  - `Local: Condor Água Verde`
  - `das 14h às 18h`
  - `Período de inscrição: 09/08 a 24/08/2025.`
  - `Confira o regulamento` → `2025_Regulamento_Caocurso.pdf`

> ⚠️ En el sitio original, esa zona muestra la píldora blanca **`Encerrado`**. Si se
> replica el estado real de la campaña, el CTA va **deshabilitado** con ese mismo texto;
> el modal sólo se abre en la variante «inscripción abierta» de este rebuild.

> ⚠️ **El modal NO cuelga de la sección de Eventos.** Ese grid 2×2 es de **adopción**, no
> del concurso, y sus cards no llevan CTA de inscripción. Sus datos reales, para que nadie
> los mezcle con este formulario:
>
> | Fecha | Loja | Horario |
> |-------|------|---------|
> | `2 AGOSTO` | Condor Araucária BR | `11h às 15h` |
> | `9 AGOSTO` | Condor Nilo Peçanha | `11h às 15h` |
> | `16 AGOSTO` | Condor Água Verde | `11h às 15h` |
> | `23 AGOSTO` | Condor Campo Comprido | `11h às 15h` |
>
> Y la sección **Requisitos** que le sigue es **un único panel `--c-orange-lite` con una
> lista de 6 bullets en dos columnas**, **no 3 cards con iconos**.

Los botones de trigger usan el estilo píldora del sitio: fondo `#FFFFFF`, texto
`#00419A`, Torus Bold — el mismo lenguaje del botón `Encerrado` de la sección 30 Agosto.

**Acción:**
1. `body { overflow: hidden }` (bloquear scroll de fondo)
2. Fade-in del overlay 200ms
3. Slide-up del modal 300ms ease-out
4. Foco automático en el primer campo (`tutorNome`)
5. Focus trap activo dentro del modal

---

### Cierre del Modal

**Trigger:**
- Click en la `X` (arriba a la derecha)
- Click en el botón `Cancelar`
- Click fuera del modal (en el backdrop)
- Tecla `ESC`

**Acción:**
1. Slide-down del modal 250ms ease-in
2. Fade-out del overlay 200ms
3. `body { overflow: auto }` (restaurar)
4. Devolver el foco al botón que abrió el modal
5. Limpiar el formulario y revocar el `objectURL` del preview de la foto

**Confirmación:** si hay datos escritos, opcionalmente preguntar
`Descartar as informações preenchidas?` antes de cerrar.

---

### Submit del Formulario

**Validación:**
1. Validar los 8 campos
2. Si hay errores: mostrarlos todos y hacer foco en el primero
3. Si es válido: continuar

**Envío:**
1. Botón `Enviar` → `Enviando…` + spinner
2. `disabled: true`
3. **`POST /api/inscricao`** con **`multipart/form-data`**

#### Por qué `multipart/form-data` y no JSON

El **campo 7 (`petFoto`)** es un **archivo binario** (JPG/PNG/WebP de hasta 5 MB). Un body
JSON sólo transporta texto: metería la imagen en base64, lo que **infla el payload ~33 %**,
obliga a codificar/decodificar a mano en cliente y servidor, y rompe el streaming del
upload. `multipart/form-data` es el único formato que envía **campos de texto y ficheros
binarios en la misma petición** de forma nativa, y es lo que `FormData` produce por
defecto en el navegador.

> ❌ **No usar `/api/feedback`.** Ese endpoint existe en el proyecto central
> (`Migraciones/petCondor/site/src/pages/api/feedback.ts`), pero es el endpoint de
> feedback de la documentación interna: exige `{ pageId, content }` y **devuelve 400** con
> el payload de inscripción. No sirve aquí, ni con parches. Hay que crear
> `src/pages/api/inscricao.ts` desde cero.

#### Requisito de configuración de Astro (obligatorio)

Astro por defecto compila a estático y **las rutas API no se ejecutan**. Para que
`/api/inscricao` responda hay que habilitar SSR:

```bash
npx astro add node
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',                    // ← obligatorio
  adapter: node({ mode: 'standalone' }) // ← obligatorio
});
```

```ts
// src/pages/api/inscricao.ts
export const prerender = false;        // ← por si el proyecto usa modo híbrido

export const POST = async ({ request }) => {
  const form = await request.formData();
  const petFoto = form.get('petFoto'); // File | null — obligatorio
  // …validar en servidor, guardar la imagen y crear la ficha en estado `pendente`
};
```

Sin `output: 'server'` + `@astrojs/node`, el `POST` devuelve **404** en producción aunque
funcione en `astro dev`.

#### FormData exacto que se envía

```js
const fd = new FormData();
fd.append('tutorNome',         'Maria Silva');
fd.append('tutorEmail',        'maria.silva@exemplo.com.br');
fd.append('tutorTelefone',     '(41) 99999-9999');
fd.append('petNome',           'Bidu');
fd.append('petEspecie',        'cao');             // 'cao' | 'gato'
fd.append('petIdade',          'adulto');          // opcional, omitir si vacío
fd.append('petFoto',           fileInput.files[0]);// OBLIGATORIO
fd.append('aceiteRegulamento', 'true');            // string, no boolean
fd.append('querNovidades',     'true');            // string, no boolean

await fetch('/api/inscricao', { method: 'POST', body: fd });
```

| Clave | Tipo en el wire | Obligatorio | Notas |
|-------|-----------------|-------------|-------|
| `tutorNome` | string | Sí | 3–100 caracteres |
| `tutorEmail` | string | Sí | recibe la confirmación y el link de votación |
| `tutorTelefone` | string | Sí | tal como lo escribió el usuario |
| `petNome` | string | Sí | 2–40 caracteres |
| `petEspecie` | `'cao'` \| `'gato'` | Sí | — |
| `petIdade` | `'filhote'` \| `'adulto'` \| `'idoso'` | No | omitir la clave si no se eligió |
| `petFoto` | `File` | **Sí** | JPG/PNG/WebP, ≤ 5 MB, ≥ 600×600 px |
| `aceiteRegulamento` | `'true'` | Sí | debe llegar `'true'` |
| `querNovidades` | `'true'` \| `'false'` | Sí (la clave) | — |

> ⚠️ `FormData` **no tiene booleanos**: todo viaja como string o como `File`. El servidor
> debe comparar contra `'true'`, no contra `true`. Y **no** hay que fijar
> `Content-Type` a mano: el navegador añade el `boundary` automáticamente; si lo escribes
> tú, el parseo en el servidor falla.

#### Respuesta de éxito (HTTP 200)

```json
{
  "success": true,
  "message": "Obrigado! Recebemos a inscrição do seu pet.",
  "id": "caocurso_20250802_0147",
  "status": "pendente",
  "urlVotacao": "/caocurso/pet/caocurso_20250802_0147"
}
```

1. Reemplazar el cuerpo del modal por el mensaje de éxito:
   `Obrigado! Recebemos a inscrição do seu pet. Assim que a foto for aprovada, você recebe por e-mail o link para compartilhar e receber votos.`
2. Único botón: `Fechar`
3. Opcional: autocerrar a los 5 s

#### Respuesta de error (HTTP 400 / 409 / 413 / 415 / 500)

```json
{
  "success": false,
  "message": "Não foi possível enviar. Tente novamente.",
  "errors": {
    "tutorEmail": "E-mail inválido.",
    "petFoto": "Arquivo muito grande. O limite é 5 MB."
  }
}
```

1. Mostrar el banner de error: `Não foi possível enviar agora. Tente novamente.`
2. Si viene el objeto `errors`, pintar cada mensaje bajo su campo correspondiente
3. Botón `Enviar`: restaurar estado normal (quitar `Enviando…` y `disabled`)
4. El usuario puede reintentar sin perder lo escrito (la foto se conserva en el estado)

| Código | Cuándo | Mensaje al usuario |
|--------|--------|--------------------|
| `400` | Validación de servidor fallida | `Confira os campos destacados.` |
| `409` | Mascota ya inscrita (mismo e-mail + mismo `petNome`) | `Este pet já foi inscrito com este e-mail.` |
| `413` | Archivo > 5 MB | `Arquivo muito grande. O limite é 5 MB.` |
| `415` | Tipo de archivo no aceptado | `Formato não aceito. Envie JPG, PNG ou WebP.` |
| `500` | Error del servidor | `Não foi possível enviar agora. Tente novamente.` |

---

## Consideraciones propias de un concurso con votación

La votación en sí queda **fuera del MVP**, pero el formulario ya condiciona su diseño:

- **Moderación:** la ficha nace en estado **`pendente`** y no recibe votos hasta ser
  aprobada. Evita que una foto inadecuada aparezca publicada al instante.
- **Cesión de imagen:** el checkbox `aceiteRegulamento` debe cubrir **explícitamente** el
  uso de la foto de la mascota en el sitio y en las redes de Condor. Es el requisito legal
  del concurso, no un detalle de copy.
- **Una inscripción por mascota:** deduplicar por `tutorEmail` + `petNome` y devolver
  **409** si ya existe.
- **Antifraude de votos:** fuera del MVP, pero dejar anotado que la votación necesitará
  limitación por IP/sesión.
- **Ventana de inscripción:** `09/08 a 24/08/2025`. Fuera de ese rango el CTA se muestra
  como `Encerrado` y el endpoint rechaza el envío.

---

## Temas y Variantes

### Variante única (light)

El sitio Condor tiene **un solo tema**: naranja `#F09624` de fondo con azul `#00419A` de
autoridad. El modal es blanco sobre el backdrop oscuro y **no tiene modo oscuro**.

- Background: `#FFFFFF`
- Texto: `#00419A` (labels, títulos) / `#3E3E3E` (secundario)
- Inputs: blanco con borde `#A8A8A8`
- Focus: `#00419A`
- Válido: `#00419A` · Error: `#E20614`

> La versión anterior de este documento definía un «Dark Mode» con foco **turquesa**.
> Se elimina: el turquesa `#00BCD4` no existe en la marca y el sitio no tiene modo
> oscuro. Si alguna vez se añade, deberá construirse con los mismos 9 tokens de la paleta.

---

## Accesibilidad

### ARIA

```html
<div role="dialog"
     aria-modal="true"
     aria-labelledby="modal-titulo"
     aria-describedby="modal-descricao">

  <h2 id="modal-titulo">Inscreva seu pet no Cãocurso</h2>
  <p id="modal-descricao">Seu pet é a estrela da nossa passarela. Envie uma foto e concorra aos votos.</p>

  <button type="button" aria-label="Fechar formulário">✕</button>

  <label for="tutorNome">
    Nome completo do tutor <span aria-hidden="true">*</span>
  </label>
  <input id="tutorNome" name="tutorNome" type="text"
         required aria-required="true"
         aria-invalid="false"
         aria-describedby="tutorNome-erro" />

  <p id="tutorNome-erro" role="alert" aria-live="polite">
    Informe seu nome completo (mín. 3 caracteres).
  </p>

  <!-- Grupo de radio -->
  <fieldset>
    <legend>Seu pet é: <span aria-hidden="true">*</span></legend>
    <input type="radio" name="petEspecie" id="especie-cao" value="cao" />
    <label for="especie-cao">Cão</label>
    <input type="radio" name="petEspecie" id="especie-gato" value="gato" />
    <label for="especie-gato">Gato</label>
  </fieldset>

  <!-- Foto: input nativo oculto pero accesible -->
  <label for="petFoto">Foto do pet <span aria-hidden="true">*</span></label>
  <input id="petFoto" name="petFoto" type="file"
         accept=".jpg,.jpeg,.png,.webp"
         required aria-required="true"
         aria-describedby="petFoto-ajuda petFoto-erro" />
  <p id="petFoto-ajuda">JPG, PNG ou WebP. Máximo 5 MB. Mínimo 600×600 px.</p>

  <button type="submit" aria-disabled="false">Enviar</button>
  <button type="button">Cancelar</button>
</div>
```

- `lang="pt-BR"` en el documento: los lectores de pantalla deben leer en portugués.
- El asterisco va `aria-hidden="true"`; la obligatoriedad la comunica `aria-required`.
- El preview de la foto necesita `alt` descriptivo: `Prévia da foto de {petNome}`.
- Cambiar `aria-invalid` a `"true"` en el campo con error.

### Keyboard Navigation

- `TAB`: mover entre campos en orden lógico (1 → 8 → Enviar → Cancelar → X)
- `SHIFT + TAB`: mover hacia atrás
- **Focus trap:** el `TAB` no puede salir del modal mientras está abierto
- `ESC`: cerrar el modal (equivalente a `Cancelar`)
- `ENTER` en un input de texto: submit (si el formulario es válido)
- `SPACE` / flechas: seleccionar radios, checkbox y opciones del select
- `SPACE` / `ENTER` sobre el botón custom de foto: abre el selector de archivos
- Al cerrar: devolver el foco al botón que abrió el modal

### Contraste de Color

| Combinación | Ratio | WCAG |
|-------------|-------|------|
| `#00419A` sobre `#FFFFFF` | ~10.9:1 | AAA ✔ |
| `#FFFFFF` sobre `#00419A` | ~10.9:1 | AAA ✔ |
| `#E20614` sobre `#FFFFFF` | ~5.4:1 | AA ✔ |
| `#3E3E3E` sobre `#FFFFFF` | ~10.4:1 | AAA ✔ |
| `#A8A8A8` sobre `#FFFFFF` | ~2.3:1 | ✖ sólo bordes/decoración, **nunca texto** |

- Texto principal: mínimo WCAG AA (4.5:1)
- Links: subrayado obligatorio además del color
- El estado de error no se comunica **sólo** con color: siempre lleva icono ⚠ + texto

---

## Resumen: Checklist Desarrollo

**Configuración (bloqueante — hacer primero)**
- [ ] `npx astro add node` y confirmar `output: 'server'` + `adapter: node()` en `astro.config.mjs`
- [ ] Crear `src/pages/api/inscricao.ts` con `export const prerender = false`
- [ ] Confirmar que `Torus` está self-hosteada (`.woff2`, 6 pesos) y aplicada al modal

**Componente**
- [ ] Crear `FormularioModal.jsx` (React, isla Astro con `client:load`)
- [ ] Estado del formulario (los **8 campos**, uno por entrada de estado)
- [ ] Renderizar todos los textos en **pt-BR** (cero español en la UI)
- [ ] **Cero campos de adopción:** ni `endereco`, ni `temQuintal`, ni `temPets`, ni `documento`
- [ ] File input custom **obligatorio** con preview, validación de tipo, tamaño (≤ 5 MB) y
      dimensiones (≥ 600×600 px)
- [ ] Link al PDF real `2025_Regulamento_Caocurso.pdf` en el checkbox de aceptación

**Estilos**
- [ ] Sólo tokens de la paleta: `#00419A`, `#0061B2`, `#F09624`, `#FFBB3E`, `#FDB020`, `#FFFFFF`, `#A8A8A8`, `#3E3E3E`, `#E20614`
- [ ] Cero verde, cero turquesa, cero `#003D82`, cero `#F44336`
- [ ] Estados: vacío, foco, válido (borde azul + ✓ azul), inválido (rojo), disabled, loading

**Interacción**
- [ ] Backdrop + click fuera = cerrar
- [ ] Botón `X` funcional con `aria-label="Fechar formulário"`
- [ ] Botones `Enviar` / `Cancelar`
- [ ] Triggers en **Cãocurso** y **30 AGOSTO** (nunca en las cards de Eventos de adopción)
- [ ] Validación en `blur` (campo a campo) y en `submit` (todo)
- [ ] Focus en el primer campo con error tras un submit fallido

**Envío**
- [ ] `POST /api/inscricao` con `FormData` (**sin** fijar `Content-Type` a mano)
- [ ] Revalidación en servidor de los 8 campos
- [ ] Ficha creada en estado `pendente` (moderación previa a la votación)
- [ ] Deduplicación `tutorEmail` + `petNome` → 409
- [ ] Pantalla de éxito con botón `Fechar`
- [ ] Manejo de 400 / 409 / 413 / 415 / 500 con mensajes en pt-BR

**Accesibilidad y QA**
- [ ] `role="dialog"` + `aria-modal` + focus trap + `ESC`
- [ ] Navegación completa por teclado (TAB / SHIFT+TAB / ENTER / SPACE)
- [ ] Contraste verificado
- [ ] Testing en mobile / tablet / desktop
- [ ] Animaciones (fade, slide, preview de la foto, spinner)
- [ ] Revisión final: ningún texto de UI en español dentro del modal
