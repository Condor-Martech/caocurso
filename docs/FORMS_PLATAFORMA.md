# Plataforma de Formularios por Campaña — Diseño

> **Estado:** diseño propuesto. No implementado.
> **Fecha:** 2026-07-29
> **Contexto previo obligatorio:** `docs/FORMULARIOS_ARQUITECTURA.md` (por qué sacar el
> formulario de la LP y por qué el upload no puede pasar por una función serverless).

**El requisito, en las palabras del equipo:** un backoffice que gestione los formularios de
los eventos y campañas, desacoplado de las LPs. Hay un núcleo estándar (CPF, nome, e-mail,
telefone) y cada campaña añade campos propios y **lógicas distintas**.

---

## 1. La línea que decide si esto sobrevive

Todo sistema de formularios configurables muere del mismo modo: **el schema empieza
describiendo campos y termina siendo un lenguaje de programación mal diseñado en JSON.**
Condicionales anidados, fórmulas, referencias cruzadas, y al final nadie puede depurar por
qué una inscripción fue rechazada.

La palabra «lógicas» del requisito es precisamente la que abre esa puerta. Así que lo
primero es partirla en cuatro, porque **no todas van al mismo sitio**:

| Tipo de lógica | Ejemplo real del Cãocurso | Dónde vive |
|---|---|---|
| **1. Validación de campo** | CPF con dígito verificador; foto ≥600 px; teléfono BR | **Schema** — declarativo |
| **2. Condición entre campos** | Si `especie = gato`, el catálogo de raça cambia | **Schema** — condiciones simples, un nivel |
| **3. Regla de negocio** | Una mascota por CPF; cupo máximo; ventana de fechas | **Código** — hook versionado |
| **4. Efecto secundario** | Crear perfil público, generar slug, mandar a Emarsys | **Código** — hook versionado |

> **La regla:** *el schema describe el formulario; el código describe la campaña.*
> El schema contesta **«qué ve el usuario y qué valor es válido»**.
> El código contesta **«qué significa esto para el negocio»**.

Si alguien pide meter el tipo 3 en el schema —y lo van a pedir, porque suena a que evita un
deploy— la respuesta es no. Un cupo máximo tiene condiciones de carrera; una unicidad por
CPF necesita una constraint; una ventana de fechas necesita zona horaria. Nada de eso es
declarativo por mucho que se disfrace.

**Cómo se conectan sin acoplarse:** el schema *nombra* el hook, el repositorio lo
*implementa*.

```json
{
  "slug": "caocurso-2026",
  "hooks": {
    "beforeSubmit": "caocurso/unicidadePorCpf",
    "afterSubmit":  "caocurso/criarPerfilPublico"
  }
}
```

Marketing edita labels, orden y campos sin deploy. Ingeniería añade lógica con deploy. La
frontera es explícita y auditable, y un hook inexistente falla al publicar la versión, no
en producción.

---

## 2. Las tres capas

```
┌───────────────────────────────────────────────────────────────┐
│  CATÁLOGO DE CAMPOS        (código, compartido, versionado)   │
│  cpf · nome · email · telefone · nascimento · foto · texto…   │
│  Cada uno trae: control UI · validación cliente · validación  │
│  servidor · clasificación LGPD · retención · formato export   │
└───────────────────────────────────────────────────────────────┘
                              ▲ se elige desde
┌───────────────────────────────────────────────────────────────┐
│  SCHEMA DE CAMPAÑA         (dato, editable en backoffice)     │
│  qué campos, en qué orden, con qué labels pt-BR, requeridos,  │
│  condiciones simples, textos de consentimiento, hooks         │
└───────────────────────────────────────────────────────────────┘
                              ▲ invoca
┌───────────────────────────────────────────────────────────────┐
│  HOOKS DE CAMPAÑA          (código, en el repo, por campaña)  │
│  reglas de negocio y efectos secundarios                      │
└───────────────────────────────────────────────────────────────┘
```

### El catálogo es el activo real

Esto es lo que hace que «siempre tenemos formularios» por fin pague. Un campo del catálogo
no es un `<input>`: es un **paquete completo**.

| Campo | Qué trae de fábrica |
|---|---|
| `cpf` | Máscara, validación de dígito verificador, normalización a 11 dígitos, dedupe, clasificación PII alta, clave de cruce con Clube Condor |
| `email` | Validación, normalización a minúsculas, opt-in de marketing **separado** del consentimiento de participación |
| `telefone` | Máscara BR, validación de DDD, 10–11 dígitos, tolerancia a formatos pegados |
| `nascimento` | Selector de fecha y **cálculo de +18** — que bajo LGPD art. 14 no es un detalle |
| `foto` | Presigned upload directo al storage, límites, strip de EXIF en servidor, cola de moderación |

Marketing **elige** del catálogo; no reinventa un «CPF» por campaña. Ahí está el ahorro
real, no en las 250 líneas del modal.

Y el corolario incómodo: **añadir un campo nuevo al catálogo es trabajo de ingeniería**, no
de configuración. Un campo que no está en el catálogo se puede usar como texto/número/select
genérico, pero sin tratamiento especial. Eso es correcto: si cualquiera puede inventar un
tipo de campo con semántica propia, volvemos al lenguaje mal diseñado.

---

## 3. Modelo de datos

Sigue la nomenclatura `cao_` de `docs/ARQUITECTURA_PLATAFORMA.md`.

### La decisión estructural: núcleo tipado + JSONB

Cuatro formas de guardar envíos heterogéneos, y sólo una aguanta:

| Enfoque | Veredicto |
|---|---|
| EAV (entidad-atributo-valor) | ❌ Flexible y catastrófico de consultar y exportar |
| Una tabla por campaña | ❌ Obliga a hacer DDL en runtime desde el backoffice. No |
| **Núcleo tipado + JSONB** | ⭐ **Recomendado** |
| Store documental aparte | ❌ Pierde integridad relacional y complica el export |

**Por qué el núcleo va en columnas tipadas y no dentro del JSONB:** CPF, e-mail y teléfono
aparecen en el 100 % de las campañas y son justo sobre los que se deduplica, se indexa, se
cruza con Clube Condor y se exporta. Enterrarlos en JSONB los vuelve lentos y frágiles
precisamente en lo que más se usa.

```sql
CREATE TABLE cao_campanha (
  id         serial PRIMARY KEY,
  slug       text NOT NULL UNIQUE,        -- 'caocurso-2026'
  nome       text NOT NULL,
  abre_em    timestamptz,
  fecha_em   timestamptz,
  ativo      boolean NOT NULL DEFAULT true
);

CREATE TABLE cao_form_versao (
  id             serial PRIMARY KEY,
  campanha_id    int NOT NULL REFERENCES cao_campanha(id),
  versao         int NOT NULL,
  schema         jsonb NOT NULL,
  publicado_em   timestamptz,             -- NULL = borrador editable
  publicado_por  uuid REFERENCES cao_admin(id),
  UNIQUE (campanha_id, versao)
);

CREATE TABLE cao_submissao (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id     int  NOT NULL REFERENCES cao_campanha(id),
  form_versao_id  int  NOT NULL REFERENCES cao_form_versao(id),

  -- núcleo tipado: presente en todas las campañas
  cpf             text,                   -- sólo dígitos
  nome            text,
  email           citext,
  telefone        text,
  nascimento      date,

  -- lo específico de esta campaña
  dados           jsonb NOT NULL DEFAULT '{}',
  arquivos        jsonb NOT NULL DEFAULT '[]',  -- [{campo,key,mime,bytes,status}]
  consentimentos  jsonb NOT NULL,               -- [{tipo,versao,texto_sha256,em}]

  status          text NOT NULL DEFAULT 'pendente',
  criado_em       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON cao_submissao USING gin (dados jsonb_path_ops);
CREATE INDEX ON cao_submissao (campanha_id, cpf);
CREATE INDEX ON cao_submissao (campanha_id, status, criado_em DESC);
```

### Cómo se indexa un campo de campaña sin desnormalizar

El «Top Like por raça» necesita que `raça` —que vive en JSONB— sea indexable:

```sql
ALTER TABLE cao_submissao
  ADD COLUMN raca text GENERATED ALWAYS AS (dados->>'raca') STORED;
CREATE INDEX ON cao_submissao (campanha_id, raca);
```

Columna generada: se mantiene sola, no se puede desincronizar, y da índice B-tree normal.
Se añade sólo para los campos que de verdad se consultan en agregado, no para todos.

### Unicidad por campaña, que es tipo 3 y por eso no está en el schema

```sql
-- una inscripción por CPF en esta campaña
CREATE UNIQUE INDEX cao_submissao_cpf_unica
  ON cao_submissao (campanha_id, cpf)
  WHERE status <> 'rejeitado';
```

Un índice parcial. En un schema JSON esto sería `"unique": true` y una condición de carrera
esperando a que dos personas envíen a la vez.

---

## 4. Versionado: la parte que nadie recuerda hasta que duele

**Un envío tiene que seguir siendo interpretable dentro de dos años.** Si el schema cambia y
los envíos apuntan al «formulario actual», los datos históricos quedan huérfanos: campos que
ya no existen, labels que cambiaron de significado, consentimientos que no se sabe qué
decían.

Reglas duras:

1. **Publicar congela.** Una `cao_form_versao` con `publicado_em` no nulo es **inmutable**.
   Editar crea la versión siguiente.
2. **Cada envío guarda su `form_versao_id`.** Siempre. Sin excepción.
3. **Los consentimientos guardan el hash del texto aceptado**, no un booleano. La carga de
   la prueba es del controlador: hay que poder mostrar el texto exacto.
4. **Nunca se borra una versión.** Ni las de campañas terminadas.
5. **Cambiar el tipo de un campo ya publicado está prohibido.** Se crea un campo nuevo. Si
   `idade` era texto y pasa a número, los envíos viejos dejan de parsear.

---

## 5. Qué necesita el backoffice

| Pantalla | Notas |
|---|---|
| Campañas | Alta, fechas de apertura y cierre, estado |
| **Constructor de formulario** | Elegir del catálogo + campos genéricos, orden, labels pt-BR, requeridos, condiciones simples |
| Previsualización | Renderiza con el **mismo componente** que la LP. Si no, se ve distinto y nadie confía |
| Publicar | Congela la versión. Valida que los hooks nombrados existan en el código desplegado |
| Envíos | Lista filtrable, columnas derivadas del schema de esa campaña |
| Moderación | Cola de archivos: aprobar/rechazar con motivo, auditado |
| Exportar | Asíncrono, `;` + UTF-8 con BOM, teléfonos como texto (ver `ARQUITECTURA_PLATAFORMA.md` §8) |
| Webhooks / outbox | Estado de entrega a Emarsys y PostHog, reintentos |

> **La previsualización con el componente real no es un lujo.** Es lo único que evita que
> marketing publique un formulario que en el móvil se ve roto. Es el mismo paquete npm que
> consume la LP, importado por el backoffice.

---

## 6. Antipatrones — la lista de «no» explícitos

1. **DDL en runtime.** El backoffice nunca ejecuta `ALTER TABLE`. Los campos de campaña van
   a JSONB; las columnas generadas las añade una migración revisada.
2. **Condicionales profundos en el schema.** Un nivel de condición (`mostrar si campo X =
   Y`) es aceptable. Dos niveles ya es un lenguaje. Cortar ahí.
3. **Fórmulas en JSON.** Si aparece la necesidad de calcular, es un hook.
4. **Borrar versiones de schema.** Nunca.
5. **Cambiar el tipo de un campo publicado.** Nunca. Campo nuevo.
6. **Un solo checkbox de consentimiento.** Participación, uso de imagen y marketing son
   finalidades distintas bajo LGPD. Tres registros separados, ninguno premarcado.
7. **Confiar en la validación de cliente.** El schema genera **las dos**; la del servidor es
   la que manda. Hoy la regla de 600 px del Cãocurso vive sólo en un `img.onload` y se
   esquiva enviando rápido.
8. **Que el catálogo crezca por presión de calendario.** Un tipo de campo con semántica
   propia es código revisado, no una fila en una tabla.

---

## 7. Cómo llegar ahí sin perder la campaña

> ⚠️ **El riesgo de calendario es el riesgo real.** El Cãocurso tiene fecha dura. La forma
> clásica de fallar es construir la plataforma antes de que la campaña esté en el aire.

| Etapa | Qué | Cuándo |
|---|---|---|
| **0** | Los tres bugs de producción de `FORMULARIOS_ARQUITECTURA.md` §4 | Esta semana |
| **1** | Repuntar el POST al backoffice + pipeline de upload con URL firmada. LP a estática | Antes de la campaña |
| **2** | Extraer el chasis a paquete npm. **Sin schema todavía**: el Cãocurso sigue con sus campos en código | Antes de la campaña |
| **3** | **La segunda campaña** estrena el schema JSON servido por el backoffice | Después |
| **4** | Constructor visual en el backoffice | Sólo si marketing lo pide de verdad |

**Por qué el schema no entra hasta la etapa 3:** una abstracción escrita con un solo caso de
uso delante casi siempre es la abstracción equivocada. El segundo formulario real es el que
enseña dónde estaba la junta. Construir el constructor visual antes de tener dos formularios
funcionando es cómo se llega a la fecha del concurso con una plataforma a medias y sin
campaña.

Contra esto juega un dato que ya está verificado y que conviene tener presente: Condor lleva
**cinco años** usando builders schema-driven (ACF Frontend Form en 2021, JetFormBuilder en
2025) y las dos campañas auditadas comparten 8 de sus ~10 campos. El solapamiento no es una
hipótesis. Eso justifica el destino; no justifica saltarse el orden.

### 7.1 Schema-*shaped* desde el día uno; schema-*served* después

**Decidido:** el Cãocurso lo codifica ingeniería. Marketing edita formularios más adelante,
no en esta campaña.

Ese «más adelante» es peligroso de dos maneras opuestas. Si se construye la plataforma
completa ahora, se paga la abstracción hoy y la señal que la corrige no llega hasta dentro
de un año. Si se codea el Cãocurso a mano sin más, la plataforma después es una reescritura.

La salida es separar dos cosas que suelen ir juntas y no tienen por qué:

| | Qué es | Cuándo |
|---|---|---|
| **Schema-shaped** | El formulario es una **estructura de datos** que un renderer genérico pinta. La estructura vive en el repo, tipada, como una constante | **Ahora** — coste extra ≈ 0 |
| **Schema-served** | Esa estructura vive en la base, se sirve por API y se edita desde una UI | **Después** |

```ts
// packages/forms/campanhas/caocurso-2026.ts   ← hoy: una constante en el repo
export const caocurso2026: FormSchema = {
  slug: 'caocurso-2026',
  versao: 1,
  campos: [
    { tipo: 'nome',      nome: 'tutorNome',  label: 'Nome do tutor', obrigatorio: true },
    { tipo: 'cpf',       nome: 'tutorCpf',   label: 'CPF',           obrigatorio: true },
    { tipo: 'foto',      nome: 'petFoto',    label: 'Foto do pet',   obrigatorio: true },
    // …
  ],
  hooks: { beforeSubmit: 'caocurso/unicidadePorCpf' },
}
```

Mañana esa constante se mueve a `cao_form_versao.schema`. **El renderer no cambia, el
endpoint no cambia, los datos ya guardados no se migran.** Pasar de shaped a served es
mover un objeto de un sitio a otro y añadir una UI encima; no es rehacer nada.

**Lo que sí hay que acertar hoy porque después cuesta caro:**

1. **La forma de almacenamiento definitiva** (§3): núcleo tipado + `dados` JSONB +
   `form_versao_id` en cada envío, **aunque la versión 1 esté hardcodeada**. Si el Cãocurso
   guarda sus campos como columnas planas, la plataforma después obliga a migrar datos
   personales ya recogidos. Con la forma final desde el principio, no hay migración nunca.
2. **P1, el stack del core.** Es la decisión que no se puede deshacer barata y hoy es gratis.
3. **Los textos como dato, no como código.** Labels, placeholders, mensajes de error y
   textos de consentimiento van dentro del schema desde el primer día. Es literalmente lo
   primero que marketing va a querer tocar, y si está incrustado en JSX hay que sacarlo
   luego a mano, campo por campo.
4. **El catálogo de campos** (§2). Hace falta igual para esta campaña.

**Lo que NO hay que construir ahora:** el constructor visual, el endpoint que sirve el
schema, la UI de versionado y el motor de condiciones. Nada de eso hace falta mientras el
schema sea una constante, y todo eso es lo caro.

---

## 8. Lo que hay que decidir

| # | Pregunta | Por qué importa |
|---|---|---|
| ~~P1~~ | ~~¿El core del componente es vanilla o React?~~ | ✅ **Resuelto:** el stack del equipo es React + Next + Astro. React para el renderer, core en TS plano. Ver §9 |
| P2 | ¿El backoffice va en `*.condor.com.br`? | Si sí, es same-site: cookies normales, sin CHIPS, sin romperse en Safari. Es la decisión de mayor apalancamiento y es gratis |
| ~~P3~~ | ~~¿Marketing va a editar formularios de verdad?~~ | ✅ **Resuelto:** sí es el objetivo, pero no en el Cãocurso — esta campaña la codifica ingeniería. Ver §7.1 |
| P4 | ¿CPF entra al formulario del Cãocurso? | Es la clave de cruce entre campañas y el ancla anti-fraude. El original lo pedía |
| P5 | ¿Hotfix instantáneo o pinning por versión? | No se pueden tener los dos. Ver `FORMULARIOS_ARQUITECTURA.md` §5 |

Con P1 y P3 resueltos, lo que queda por decidir es **P2** (dominio del backoffice), **P4**
(CPF en el formulario) y **P5** (hotfix vs pinning).

---

## 9. Stack: React sí, pero con la costura en el sitio correcto

**Dato nuevo:** el stack del equipo es **React + Next + Astro**, y ya hay **productos en
producción con formularios en sus LPs** que se quieren migrar a esta plataforma.

Eso resuelve P1 y obliga a revisar el calendario de §7.

### 9.1 La decisión de stack

React. Los tres entornos del equipo lo consumen: Astro como isla, Next de forma nativa, y el
propio backoffice es Next. Escribir un core vanilla para una portabilidad que quizá no llegue
es pagar hoy por un problema hipotético.

Pero la costura importa. **No es «todo React», es un corte en dos paquetes:**

```
@condor/forms-core     ← TypeScript plano, CERO dependencias de UI
  · tipos del schema          · validación isomorfa (misma en cliente y servidor)
  · normalizadores (CPF, telefone, e-mail)  · cliente de upload firmado
  · taxonomía de eventos      · serialización de la submissão

@condor/forms-react    ← los componentes
  · renderer del schema       · controles del catálogo
  · modal, focus trap, uploader con preview
```

Lo que justifica el corte no es la portabilidad, es que **la validación del servidor vive en
el core**. El backoffice valida el envío con exactamente el mismo código que lo validó en el
navegador — que es la única forma de que no se desincronicen. Y el servidor no puede importar
componentes React para hacerlo.

El beneficio de portabilidad viene de regalo: si algún día cae un hotsite en WordPress —y
`pet.condor.com.br` corría WordPress + Elementor, así que no es hipotético— sólo hay que
escribir un renderer vanilla sobre el mismo core. Se reescribe la capa de pintar, no las
reglas.

**Regla dura:** si algo del core necesita importar de React, está en el paquete equivocado.

### 9.2 Los formularios que ya están en producción cambian el calendario

En §7 recomendé no construir el schema hasta la segunda campaña, con el argumento de que una
abstracción diseñada con un solo caso delante suele ser la equivocada.

**Ese argumento se debilita mucho si ya hay formularios en producción.** La segunda, tercera
y cuarta evidencia ya existen: son formularios reales, escritos para necesidades reales, y
están en el aire. No hay que esperarlos, hay que leerlos.

Corrección del orden propuesto:

| Antes | Ahora |
|---|---|
| Codear el Cãocurso, esperar a la campaña 2 para derivar el schema | **Inventariar primero los formularios existentes**, derivar el catálogo de su unión, y estrenar el Cãocurso ya encima de él |

Lo que hay que sacar de ese inventario, por formulario:

1. Campos, tipos, obligatoriedad, y **etiquetas exactas en pt-BR**
2. Reglas de validación — y clasificarlas en los cuatro tipos de §1
3. Reglas de negocio y efectos secundarios (los futuros hooks)
4. Textos de consentimiento y su versión
5. Manejo de archivos: ¿hay upload? ¿con qué límites? ¿pasa por una función serverless?
6. Dónde aterrizan hoy los envíos

Los campos que aparecen en **todos** son el catálogo. Los que aparecen en **uno** son campos
de campaña. Es un ejercicio de un día o dos y sustituye la especulación por un censo.

> Precedente que apunta al mismo sitio: las dos campañas de Condor auditadas comparten 8 de
> sus ~10 campos. Si el inventario interno confirma ese solapamiento, el catálogo de §2 deja
> de ser una propuesta y pasa a ser una constatación.

**Lo que no cambia:** el constructor visual sigue siendo etapa 4, y sigue sin construirse
hasta que marketing lo pida de verdad. Tener más casos de entrada justifica definir bien el
catálogo y el schema; no justifica adelantar la UI de autoría.

---

## 10. El contexto real: esto es una pieza de la salida de WordPress

**Dato nuevo y estructurante:** el trabajo del equipo es migrar **un ecosistema WordPress
completo**, progresivamente, a Next/React y Astro. **Las LPs son Astro.**

Entonces esta plataforma no es una utilidad interna: es **el reemplazo del plugin de
formularios de WordPress**. Y `pet.condor.com.br` —WordPress + Elementor + JetFormBuilder,
`data-form-id="379"`— no es una anécdota histórica: es un espécimen del corpus que se está
migrando.

### 10.1 El inventario de §9.2 se vuelve mucho más barato

Las definiciones de formulario de WordPress **están en la base de datos y son legibles por
máquina**. No hay que transcribirlas mirando páginas: se extraen.

| Plugin | Dónde vive la definición |
|---|---|
| JetFormBuilder | CPT `jet-form-builder` + `post_content` con los bloques |
| ACF Frontend Form | Field groups de ACF en `postmeta` |
| Contact Form 7 | `postmeta` `_form` (su mini-DSL) |
| Gravity Forms | Tabla propia `gf_form` / `gf_form_meta` (JSON) |

Un script que recorra el WordPress y vuelque **todos** los formularios a JSON convierte el
censo en un rato de trabajo. Con esa unión delante, el catálogo de §2 se define con datos, no
con opinión. Y de paso queda el registro de qué campañas tenían qué, que hoy no existe en
ninguna parte.

> Ya hay una pista fuerte del resultado: las dos campañas de Condor auditadas comparten
> 8 de sus ~10 campos, con cinco años y dos plugins distintos de por medio.

### 10.2 La coexistencia obliga a reabrir el embed

Durante la migración van a convivir, quizá años, **LPs ya en Astro y LPs todavía en
WordPress**. Y eso reabre una opción que el análisis anterior había descartado.

`docs/FORMULARIOS_ARQUITECTURA.md` dejó el iframe como *«plan B documentado sólo para LPs que
la agencia no controle»*. Con este contexto, esa población existe y **no es de terceros: es
el propio legacy**. La pregunta se vuelve concreta:

> **¿La plataforma tiene que dar servicio a las LPs que siguen en WordPress, o cada LP se
> queda con su formulario de plugin hasta que le toque migrar?**

| | Sirve a WordPress | No sirve a WordPress |
|---|---|---|
| Coste | + renderer vanilla o embed | 0 |
| Datos durante la transición | **Unificados desde el día uno** | Partidos en dos sistemas hasta el final |
| LGPD | Un solo sitio con consentimientos y retención | Dos regímenes conviviendo |
| Riesgo | Mantener dos renderers | Migrar formularios dos veces |

El argumento fuerte a favor de servir a WordPress es **el dato, no el código**: si los
formularios viejos siguen escribiendo en WordPress mientras los nuevos escriben en el
backoffice, durante toda la transición hay dos fuentes de inscripciones, dos exportaciones y
dos políticas de retención. Eso es exactamente lo que la migración pretende terminar.

Y si se decide servirlos, el embed cambia de naturaleza: **es un artefacto de transición con
fecha de caducidad**, no la arquitectura. Eso altera su análisis de coste —se construye
sabiendo que muere— y elimina de golpe sus peores problemas, porque **son sitios propios**:
el dominio se controla, la CSP se controla, las Torus se sirven desde el mismo origen y no
hay paywall de proveedor.

El corte en dos paquetes de §9.1 es justo lo que lo hace barato: sobre `@condor/forms-core`
se escribe un renderer vanilla y se carga en WordPress con un shortcode. Se reescribe la capa
de pintar; las reglas, la validación y el upload firmado son los mismos.

### 10.3 Lo que hay que decidir con esto encima

| # | Pregunta | Por qué importa |
|---|---|---|
| P6 | ¿La plataforma sirve a las LPs aún en WordPress? | Decide si hace falta renderer vanilla / embed, y si el dato se unifica ya o al final |
| P7 | ¿Los envíos históricos de WordPress se migran? | Si sí, el modelo de §3 tiene que aceptar submissões sin `form_versao_id` real — o fabricar una versión sintética por formulario legado |
| P8 | ¿Cuántos formularios hay ahí dentro? | Con 3 el catálogo se hace a ojo; con 30 el script de extracción se paga solo el primer día |
