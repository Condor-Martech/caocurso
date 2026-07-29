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

---

## 8. Lo que hay que decidir

| # | Pregunta | Por qué importa |
|---|---|---|
| P1 | ¿El core del componente es vanilla o React? | `pet.condor.com.br` corría WordPress + Elementor. Si alguna LP futura no es Astro, React cierra la puerta. **Decidir por escrito antes de la primera línea** |
| P2 | ¿El backoffice va en `*.condor.com.br`? | Si sí, es same-site: cookies normales, sin CHIPS, sin romperse en Safari. Es la decisión de mayor apalancamiento y es gratis |
| P3 | ¿Marketing va a editar formularios de verdad? | Si la respuesta honesta es «no, lo hace ingeniería», las etapas 3 y 4 sobran y se ahorran semanas |
| P4 | ¿CPF entra al formulario del Cãocurso? | Es la clave de cruce entre campañas y el ancla anti-fraude. El original lo pedía |
| P5 | ¿Hotfix instantáneo o pinning por versión? | No se pueden tener los dos. Ver `FORMULARIOS_ARQUITECTURA.md` §5 |

**P3 es la que más dinero mueve.** Si marketing no va a tocar el constructor, lo que quieren
no es una plataforma de formularios: es un **paquete compartido con buenos defaults**, que
cuesta 3–5 días en vez de un producto.
