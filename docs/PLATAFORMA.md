# Persistencia de las inscripciones — Cãocurso 2026

> **Alcance:** lo que pasa después de que alguien pulsa «Inscreva-se». Nada más.
> **Actualizado:** 2026-08-04.

**El flujo, en una frase:** el tutor se inscribe con su mascota, la ficha se guarda en
Supabase, y un worker mantiene un Google Sheet actualizado para que el equipo de
marketing —que no es técnico— pueda consultarla.

**Supabase es el banco de datos. El Sheet es una ventana de sólo lectura.** Si hay que
corregir un dato, se corrige en el origen.

```
LP (Astro)
   │ POST /api/inscricao   (multipart: la foto es un archivo)
   ▼
Supabase ◀───────────────── fuente de verdad
   ├─ cao_inscricao         una fila por participante
   ├─ foto → storage        (proveedor sin decidir, ver §4)
   └─ cao_evento_integracao outbox
                │
                ▼ worker
          Google Sheet ◀──── ventana para marketing, sólo lectura
```

**No hay votación, ni feed público, ni ranking.** El jurado elige en persona el día del
evento. Eso elimina la moderación, los estados de aprobación, el anti-fraude y el
backoffice: no hacen falta.

---

## 1. Decisiones

**Tomadas:**

| | Valor | Nota |
|---|---|---|
| Base de datos | **Supabase** (Postgres) | `sa-east-1` São Paulo: la data no sale de Brasil |
| Espejo para marketing | **Google Sheet**, sólo lectura | Una pestaña, reescrita en cada sync |
| Despliegue | **VPS con Docker** | El adapter sigue siendo el de Vercel; migración aplazada a propósito |
| Selección de ganadores | **Jurado presencial** | Sin software de por medio |

**Pendientes, sin bloquear nada:**

| | Pregunta | Por qué no bloquea |
|---|---|---|
| **Storage de la foto** | ¿MinIO o Supabase Storage? | Aislado tras un módulo, ver §4 |
| **CPF en el Sheet** | ¿Marketing lo necesita ahí? | Por defecto **no**: se queda en Supabase |

---

## 2. Modelo de datos

Una tabla y el outbox. Los campos son los once del formulario actual, ✅ verificados en
`src/components/FormularioInscricao.astro`.

```sql
CREATE TABLE cao_inscricao (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- tutor
  tutor_nome        text NOT NULL CHECK (length(tutor_nome) >= 3),
  tutor_nascimento  date,
  tutor_cpf         text,                    -- sólo dígitos, ya validado en el endpoint
  tutor_email       citext NOT NULL,
  tutor_telefone    text NOT NULL,

  -- pet
  pet_nome          text NOT NULL,
  pet_raca          text,                    -- texto libre, como en el formulario
  pet_sexo          text,
  pet_descricao     text,
  foto_key          text NOT NULL,           -- key en el storage, NUNCA la URL

  -- consentimiento
  consentimentos    jsonb NOT NULL,          -- [{tipo, versao, texto_sha256, em}]

  criado_em         timestamptz NOT NULL DEFAULT now(),
  excluido_em       timestamptz              -- borrado lógico: LGPD art. 18
);

-- Una inscripción por CPF. Índice parcial, no un chequeo en código:
-- dos envíos simultáneos se pisan y el segundo tiene que fallar en la base.
CREATE UNIQUE INDEX cao_inscricao_cpf_unica
  ON cao_inscricao (tutor_cpf) WHERE excluido_em IS NULL;

CREATE TABLE cao_evento_integracao (
  id         bigserial PRIMARY KEY,
  tipo       text NOT NULL,
  payload    jsonb NOT NULL,
  status     text NOT NULL DEFAULT 'pendente'
             CHECK (status IN ('pendente','enviado','falhou')),
  tentativas smallint NOT NULL DEFAULT 0,
  erro       text,
  criado_em  timestamptz NOT NULL DEFAULT now(),
  enviado_em timestamptz
);
CREATE INDEX ON cao_evento_integracao (criado_em) WHERE status = 'pendente';
```

> **`foto_key` y no `foto_url`.** Con la URL en la base, cambiar de storage obliga a
> reescribir la tabla. Con la key, la URL se construye al leer y cambiar de proveedor es
> cambiar una variable de entorno. Es lo que permite postergar la decisión de §4.
>
> **`excluido_em` y no `DELETE`.** Cuando alguien ejerce su derecho de supresión hay que
> poder demostrar *cuándo* se atendió. Un `DELETE` no deja rastro de haber cumplido.
>
> **`consentimentos` es un array, no un booleano.** Ver §5.

`pet_raca` es texto libre porque el formulario lo es. Consecuencia: en el Sheet
convivirán «SRD», «srd» y «vira-lata» como valores distintos. Con el jurado eligiendo en
persona da igual; si algún día hace falta agrupar por raza, hay que pasar el campo a
selector — no normalizar a posteriori lo ya recogido.

---

## 3. El envío al Sheet

### Nunca dentro del request del usuario

Si la escritura al Sheet ocurre mientras el tutor espera, cualquier hipo de la API de
Google —cuota, latencia, un 503— se convierte en un error de inscripción: alguien
rellenó once campos y subió una foto, y ve «no se pudo completar» porque Google iba
lento.

```
POST /api/inscricao
  ├─ BEGIN
  ├─ INSERT cao_inscricao
  ├─ INSERT cao_evento_integracao (pendente)   ← misma transacción
  └─ COMMIT                                    → 201, la persona ya está inscrita
Worker
  └─ lee pendentes → reescribe el Sheet → marca enviado / reintenta con backoff
```

La inscripción se confirma con el commit local. El Sheet se pone al día un segundo
después, o un minuto después si Google está caído. El usuario nunca se entera.

### Reescribir la pestaña entera, no añadir filas

Parece más caro y es lo correcto, por un motivo que no es de rendimiento:

**El derecho de supresión.** Cuando alguien pide que borres sus datos, marcas
`excluido_em` en Supabase. Con un sync que sólo añade, esa persona **sigue en el Sheet
para siempre** — y acabas de incumplir justo lo que creías haber cumplido. Con
reescritura completa, desaparece sola en el siguiente sync.

De regalo: las correcciones se propagan sin hacer nada, es idempotente, y no deja
estados a medias si falla a mitad. Con miles de filas es trivial.

### Acceso

- Compartido **por cuenta nominal** dentro del workspace de Condor. **Nunca «cualquiera
  con el enlace»**: es el vector de fuga número uno y Google no registra quién descargó.
- Columnas: nombre, email, teléfono, nombre del pet, raza, sexo, descripción, fecha.
  **El CPF no**, salvo que marketing lo pida para algo concreto — es el dato que
  convierte una filtración molesta en una filtración grave, y para contactar ganadores
  no aporta nada.

---

## 4. La foto — decisión aplazada, sin coste

MinIO o Supabase Storage está sin decidir. Se puede posponer **si y sólo si** se
respetan dos reglas desde la primera línea:

1. **La base guarda la key, nunca la URL** (§2).
2. **La subida vive en un solo módulo:** una función que recibe el archivo y devuelve la
   key. El endpoint, el worker y el Sheet hablan con esa función y no saben qué hay
   detrás. Cuando se decida, se cambia ahí y en ningún otro sitio.

**Lo que hay que hacer sea cual sea el proveedor:**

- **Re-encodear en el servidor.** Resuelve tres cosas de una pasada: quita el EXIF (§5),
  valida que el archivo sea de verdad una imagen —comprobando los primeros bytes, no la
  extensión— y normaliza el peso.
- **Bucket privado.** La foto no tiene por qué ser accesible desde internet: sólo la ve
  quien mira el registro.

**Y para que el enlace del Sheet no envejezca:** el Sheet no debe guardar una URL
firmada —caducan, y un Sheet lleno de enlaces muertos no sirve— sino una dirección
estable propia (`/foto/<id>`) que compruebe quién es al hacer clic y sólo entonces
redirija a una URL firmada. El permiso se evalúa en el clic, no cuando se escribió la
celda. De paso queda registro de quién vio qué foto.

Esa columna entra en el Sheet cuando se cierre la decisión de storage.

---

## 5. LGPD — lo que está mal hoy

Dos puntos son código actual, ✅ verificados.

| # | Punto | Estado | Acción |
|---|---|---|---|
| 1 | **Consentimiento agrupado** | ⛔ Un solo checkbox mezcla tres finalidades | Separar, ver abajo |
| 2 | **EXIF con GPS** | ⛔ `inscricao.ts` escribe los bytes crudos del navegador | Re-encodear en servidor (§4) |
| 3 | Base legal | consentimiento | Documentarla en el regulamento |
| 4 | Retención | sin definir | Plazo post-campaña + purga, **también del Sheet** |
| 5 | Derecho de supresión | sin implementar | `excluido_em` + el sync por reescritura (§3) |
| 6 | Menores | sin contemplar | ⚠️ Un concurso de mascotas atrae adolescentes. Art. 14 tiene régimen reforzado. **Lo simple es exigir +18 en el regulamento** |
| 7 | Transferencia internacional | ⚠️ el Sheet está en Google | Supabase es Brasil, pero el espejo no. Cláusulas + acceso nominal |

**Sobre el punto 1.** El checkbox único dice hoy:

> *«Li e aceito o regulamento do Cãocurso 2026 e autorizo a Rede Condor a usar a imagem
> do meu pet e os dados enviados na divulgação da campanha.»*

Agrupa **participar**, **ceder la imagen del pet** y **ceder los datos para divulgación**.
Bajo LGPD son finalidades distintas y no se pueden juntar en un solo consentimiento.
Hacen falta registros separados y ninguno premarcado — por eso `consentimentos` es un
array de `{tipo, versao, texto_sha256, em}` y no un booleano: hay que poder demostrar
qué texto exacto aceptó cada persona.

**Sobre el punto 2.** Las fotos de móvil llevan coordenadas GPS por defecto. Una foto de
mascota se hace en casa, así que el archivo contiene la dirección del tutor. Hoy
`src/pages/api/inscricao.ts` escribe `Buffer.from(await foto.arrayBuffer())` tal cual:
sin re-encodear, sin tocar nada. El pipeline de la galería sí lo limpia —sharp descarta
metadatos salvo que le pidas lo contrario— pero el del formulario no existe.

---

## 6. Orden de trabajo

| | Qué | Depende de |
|---|---|---|
| 1 | Esquema en Supabase: `cao_inscricao` + outbox | — |
| 2 | Repuntar `POST /api/inscricao` de `fs` a Supabase, con la subida aislada en su módulo | — |
| 3 | Separar los consentimientos (§5.1) | — |
| 4 | Worker: outbox → reescritura del Sheet | 1 |
| 5 | Re-encodear la foto en servidor + bucket privado | decisión de storage |
| 6 | `/foto/<id>` con permiso al hacer clic, y su columna en el Sheet | 5 |

Los cuatro primeros no dependen de la decisión de storage.

---

## Lo que se descartó, para que nadie lo vuelva a proponer

Este documento tenía 646 líneas y venía de otros tres que sumaban 1.619. Casi todo
describía un proyecto más grande que el que hay. Se eliminó, y el motivo importa:

- **Votación, feed público, ranking, anti-fraude, CGNAT, OTP, Turnstile, acortador de
  links, `votos_cache`, slugs compartibles** — no hay votación.
- **Moderación, estados de aprobación, cola con SLA, papeles de jurado, auditoría** — el
  jurado elige en persona.
- **Miniaturas, CDN, el cálculo de 3,7 TB de banda** — sin feed nadie ve 25 fotos por
  sesión.
- **Catálogo de razas con SRD** — era para el premio «Top por raça»; `pet_raca` es texto
  libre.
- **Plataforma de formularios por campaña, catálogo de campos, schema versionado,
  `@condor/forms-core`** — sigue siendo buena idea para la salida de WordPress, pero es
  otro proyecto y no es este.
- **La evaluación InsForge vs Supabase** — decidido.
- **Todo el análisis del límite de 4,5 MB de las funciones de Vercel** — en un VPS con
  Docker ese límite no existe. Lo que seguía siendo obligatorio por otros motivos
  (EXIF, validación de contenido) está en §4.

Está todo en la historia de git hasta `98d1b95`.
