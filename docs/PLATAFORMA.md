# Plataforma de inscripciones — Cãocurso y lo que venga después

> **Qué es esto:** el único documento vivo sobre lo que pasa *después* de que alguien
> pulsa «Inscreva-se». Consolida tres documentos de 2026-07-29 —arquitectura de
> plataforma, arquitectura de formularios y plataforma de formularios por campaña—
> que sumaban 1.619 líneas y llevaban decisiones ya tomadas descritas como abiertas.
> **Actualizado:** 2026-08-04.
>
> Los originales siguen en la historia de git (hasta `1796aa1`) si hace falta el
> detalle de una investigación concreta. Lo que no está aquí es porque dejó de
> aplicar, no porque se haya olvidado.

**Convención:** ✅ verificado · ⚠️ supuesto, hay que confirmarlo · ❓ bloqueante sin respuesta

---

## 1. Estado

**Lo que ya está decidido:**

| Decisión | Valor | Consecuencia |
|---|---|---|
| Base de datos | **Supabase** (Postgres) | `sa-east-1` São Paulo: la data no sale de Brasil |
| Storage de fotos | **MinIO** | S3-compatible, en la misma infra |
| Despliegue | **VPS con Docker** | ver §2: cambia el análisis entero |
| Stack del formulario | **React**, core en TS plano | isla en Astro, nativo en Next |
| Autoría del schema | **Ingeniería** en esta campaña | marketing edita más adelante |

**Lo que sigue abierto y bloquea:**

| # | Pregunta | Bloquea | Estado |
|---|---|---|---|
| D1 | ¿Existe login/API de socios de Clube Condor? | El modelo de voto entero | ❓ TI Condor. Evidencia externa: `clubecondor.com` sólo tiene cadastro por app, sin OAuth público → empuja al escenario B |
| D2 | ¿El feed público vive en `pet.condor.com.br`? | DNS, CDN, plazos | ❓ marca + TI. **Es el ítem con más plazo administrativo de todo el proyecto** |
| D4 | ¿Cuántas mascotas por tutor? | Unicidad en el modelo | ❓ regulamento |
| D5 | ¿El voto es abierto o identificado? | Anti-fraude, conversión | ❓ negocio |
| D8 | ¿Jurado humano o gana el más votado? | Si el ranking es vinculante | ❓ regulamento |
| P2 | ¿El backoffice va en `*.condor.com.br`? | Cookies same-site | ❓ **La de mayor apalancamiento y es gratis** |
| P6 | ¿La plataforma sirve a las LPs aún en WordPress? | Si el dato se unifica ya o al final | ❓ |

**Resueltas desde entonces, que no hay que volver a discutir:**

- ~~D3 residencia de datos~~ → Supabase `sa-east-1`, Brasil.
- ~~D6 ¿la raza entra al formulario?~~ → **sí, ya está**. El formulario actual tiene
  `petRaca`, y también `tutorCpf`, `tutorNascimento`, `petSexo` y `petDescricao`, que
  los documentos anteriores daban por ausentes. ✅ verificado en
  `src/components/FormularioInscricao.astro`.
- ~~InsForge vs Supabase~~ → Supabase. El motivo decisivo fue residencia de datos y
  madurez operativa frente a una fecha de cierre inamovible, no features.
- ~~P1 vanilla o React~~ → React, con el core en TS plano (§4.3).
- ~~El límite de 5 MB de foto inconsistente entre cliente y servidor~~ → hoy son
  **2 MB en los dos sitios**. ✅
- ~~Opt-in de marketing premarcado~~ → no existe campo de marketing. Ver §7, punto 2:
  eso resuelve el bug y **crea otro**.

---

## 2. Lo que cambió al salir de Vercel

Los tres documentos originales giraban en buena parte alrededor de un límite que ya
no existe. Conviene decirlo explícito, porque si no alguien va a reconstruir defensas
contra un problema que no tenemos.

**El análisis viejo:** una Vercel Function corta el body de la petición en **4,5 MB**,
sin escapatoria —no hay request streaming, la cuota es de la plataforma y la función
ni se invoca—. La foto media de un móvil brasileño (3–9 MB en 12 MP, ~21 MB en 50 MP)
no cabe. De ahí salía la conclusión de que **los bytes de la foto no podían atravesar
la función**, y con ella todo el pipeline de subida directa con URL firmada.

**En un VPS con Docker eso desaparece.** No hay límite de plataforma; el techo lo
pone el reverse proxy y es configurable. La foto puede pasar por el servidor.

**Lo que sigue siendo cierto de todos modos, y por qué:**

1. **Subir directo a MinIO sigue siendo mejor**, pero ahora es una optimización, no
   una obligación. No ocupa un worker del servidor durante toda la subida de un móvil
   en 4G. Si hay prisa, se puede empezar con el POST atravesando el servidor y migrar
   después sin cambiar el modelo de datos.
2. **El strip de EXIF sigue siendo obligatorio.** Es LGPD, no arquitectura. → §7
3. **Las derivadas siguen siendo obligatorias.** Es costo de banda, no plataforma. → §6
4. **La validación de contenido sigue siendo del servidor.** Comprobar magic bytes y
   dimensiones reales, y re-encodear.

**Y el bloqueante del `fs` deja de serlo.** El endpoint actual escribe en `uploads/`
con `fs`; en Vercel eso era un 500 garantizado. Con un volumen montado funciona:
escribible, persistente, una sola instancia. **No impide desplegar.** Sigue siendo el
camino equivocado a medio plazo —la ficha va a Postgres— pero deja de ser urgente.

---

## 3. Las tres superficies

El error de encuadre original era llamar «backoffice» a dos cosas con requisitos
opuestos, y olvidar una tercera que es la más pesada.

```
┌──────────────────────────┐
│  LP  pet.condor.com.br   │  Astro · captación · ya construida
└───────────┬──────────────┘
            │ POST inscrição
            ▼
┌──────────────────────────────────────────────────┐
│              NÚCLEO DE DATOS                     │
│   Supabase (Postgres + Auth)  ·  MinIO (fotos)   │
└──────┬──────────────────────────┬────────────────┘
       │ lectura pública          │ lectura+escritura privada
       ▼                          ▼
┌──────────────────┐      ┌──────────────────────┐
│  FEED PÚBLICO    │      │     BACKOFFICE       │
│  /mascota/:slug  │      │  jueces · moderación │
│  votación        │      │  rankings · export   │
│  ALTO TRÁFICO    │      │  BAJO TRÁFICO        │
└──────────────────┘      └──────────────────────┘
```

**Dos apps, una base.** Aísla el panel por red y por dominio sin duplicar la lógica de
datos. Un monolito con `/admin` comparte superficie con lo público: un fallo de auth
expone el panel.

**El feed debería vivir bajo `pet.condor.com.br`** (D2). El mecanismo de crecimiento
del concurso es compartir por WhatsApp, y el preview muestra el dominio: `condor.com.br`
es un activo de confianza que no conviene tirar justo en el momento de máxima
viralidad. **El backoffice, en un dominio completamente separado.** La clave es separar
el *panel* del *dato*: el panel se aísla, el dato lo comparten las tres superficies.

---

## 4. El formulario

### 4.1 La línea que decide si esto sobrevive

Todo sistema de formularios configurables muere igual: **el schema empieza describiendo
campos y termina siendo un lenguaje de programación mal diseñado en JSON.** La palabra
«lógicas» del requisito es la que abre esa puerta, así que hay que partirla en cuatro:

| Tipo | Ejemplo del Cãocurso | Dónde vive |
|---|---|---|
| 1. Validación de campo | CPF con dígito verificador; teléfono BR | **Schema** — declarativo |
| 2. Condición entre campos | Si `especie = gato`, cambia el catálogo de raça | **Schema** — un solo nivel |
| 3. Regla de negocio | Una mascota por CPF; cupo; ventana de fechas | **Código** — hook versionado |
| 4. Efecto secundario | Crear perfil público, generar slug, Emarsys | **Código** — hook versionado |

> **El schema describe el formulario; el código describe la campaña.**

Meter el tipo 3 en el schema suena a que evita un deploy, y es donde se rompe: un cupo
máximo tiene condiciones de carrera, una unicidad necesita una constraint, una ventana
de fechas necesita zona horaria. Nada de eso es declarativo por mucho que se disfrace.

El schema *nombra* el hook y el repositorio lo *implementa*. Marketing edita labels y
orden sin deploy; ingeniería añade lógica con deploy. Un hook inexistente falla al
publicar la versión, no en producción.

### 4.2 El catálogo de campos es el activo real

Un campo del catálogo no es un `<input>`: es un paquete completo.

| Campo | Qué trae de fábrica |
|---|---|
| `cpf` | Máscara, dígito verificador, normalización a 11 dígitos, dedupe, PII alta, clave de cruce con Clube Condor |
| `email` | Validación, minúsculas, opt-in de marketing **separado** del consentimiento de participación |
| `telefone` | Máscara BR, validación de DDD, 10–11 dígitos, tolerancia a formatos pegados |
| `nascimento` | Fecha y **cálculo de +18** — que bajo LGPD art. 14 no es un detalle |
| `foto` | Upload firmado, límites, strip de EXIF **en servidor**, cola de moderación |

Marketing **elige** del catálogo; no reinventa un CPF por campaña. Ahí está el ahorro,
no en las líneas del formulario.

Corolario incómodo: **añadir un tipo de campo al catálogo es trabajo de ingeniería.**
Lo que no esté en el catálogo se usa como texto/número/select genérico, sin tratamiento
especial. Si cualquiera puede inventar un tipo con semántica propia, volvemos al
lenguaje mal diseñado.

**Precedente que sostiene el catálogo, no es hipótesis:** ✅ Condor lleva cinco años con
builders schema-driven —ACF Frontend Form en 2021, JetFormBuilder en 2025— y las dos
campañas auditadas comparten 8 de sus ~10 campos.

### 4.3 Schema-*shaped* ahora, schema-*served* después

| | Qué es | Cuándo |
|---|---|---|
| **Schema-shaped** | El formulario es una estructura de datos que un renderer genérico pinta. Vive en el repo, tipada, como constante | **Ahora** — coste extra ≈ 0 |
| **Schema-served** | Esa estructura vive en la base, se sirve por API y se edita desde una UI | **Después** |

Mañana la constante se mueve a `cao_form_versao.schema`: el renderer no cambia, el
endpoint no cambia, los datos guardados no se migran.

**Lo que hay que acertar hoy porque después cuesta caro:**

1. **La forma de almacenamiento definitiva** (§5): núcleo tipado + `dados` JSONB +
   `form_versao_id` en cada envío, **aunque la versión 1 esté hardcodeada**. Si el
   Cãocurso guarda sus campos como columnas planas, después hay que migrar datos
   personales ya recogidos.
2. **Los textos como dato, no como código.** Labels, placeholders, errores y textos de
   consentimiento dentro del schema desde el primer día. Es lo primero que marketing va
   a querer tocar, y sacarlo de JSX después es campo por campo.
3. **El corte en dos paquetes.**

```
@condor/forms-core     ← TypeScript plano, CERO dependencias de UI
  · tipos del schema · validación isomorfa · normalizadores (CPF, telefone)
  · cliente de upload firmado · taxonomía de eventos

@condor/forms-react    ← los componentes
  · renderer del schema · controles del catálogo · uploader con preview
```

Lo que justifica el corte no es la portabilidad: es que **la validación del servidor
vive en el core**, y el servidor no puede importar componentes React. Es la única forma
de que cliente y servidor no se desincronicen. La portabilidad viene de regalo — si
hay que servir a una LP que sigue en WordPress (P6), se escribe un renderer vanilla
sobre el mismo core y se reescribe sólo la capa de pintar.

> **Regla dura:** si algo del core necesita importar de React, está en el paquete
> equivocado.

**No construir ahora:** el constructor visual, el endpoint que sirve el schema, la UI
de versionado y el motor de condiciones. Nada de eso hace falta mientras el schema sea
una constante, y todo eso es lo caro.

---

## 5. Modelo de datos

Nomenclatura `cao_`. Postgres.

### 5.1 La decisión estructural: núcleo tipado + JSONB

CPF, e-mail y teléfono aparecen en el 100 % de las campañas y son justo sobre los que
se deduplica, se indexa, se cruza y se exporta. Enterrarlos en JSONB los vuelve lentos
y frágiles precisamente en lo que más se usa. Lo específico de cada campaña, en JSONB.

Descartados: EAV (catastrófico de consultar y exportar), una tabla por campaña (obliga
a DDL en runtime), store documental aparte (pierde integridad relacional).

```sql
CREATE TABLE cao_campanha (
  id      serial PRIMARY KEY,
  slug    text NOT NULL UNIQUE,          -- 'caocurso-2026'
  nome    text NOT NULL,
  abre_em timestamptz,
  fecha_em timestamptz,
  ativo   boolean NOT NULL DEFAULT true
);

CREATE TABLE cao_form_versao (
  id            serial PRIMARY KEY,
  campanha_id   int NOT NULL REFERENCES cao_campanha(id),
  versao        int NOT NULL,
  schema        jsonb NOT NULL,
  publicado_em  timestamptz,             -- NULL = borrador editable
  publicado_por uuid REFERENCES cao_admin(id),
  UNIQUE (campanha_id, versao)
);

CREATE TABLE cao_submissao (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id    int  NOT NULL REFERENCES cao_campanha(id),
  form_versao_id int  NOT NULL REFERENCES cao_form_versao(id),

  -- núcleo tipado: presente en todas las campañas
  cpf            text,                   -- sólo dígitos
  nome           text,
  email          citext,
  telefone       text,
  nascimento     date,

  -- lo específico de esta campaña
  dados          jsonb NOT NULL DEFAULT '{}',
  arquivos       jsonb NOT NULL DEFAULT '[]',  -- [{campo,key,mime,bytes,status}]
  consentimentos jsonb NOT NULL,               -- [{tipo,versao,texto_sha256,em}]

  status         text NOT NULL DEFAULT 'pendente',
  criado_em      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON cao_submissao USING gin (dados jsonb_path_ops);
CREATE INDEX ON cao_submissao (campanha_id, cpf);
CREATE INDEX ON cao_submissao (campanha_id, status, criado_em DESC);

-- Una inscripción por CPF en esta campaña. Índice parcial, no "unique": true
-- en un schema JSON con una condición de carrera esperando.
CREATE UNIQUE INDEX cao_submissao_cpf_unica
  ON cao_submissao (campanha_id, cpf) WHERE status <> 'rejeitado';
```

**Indexar un campo de campaña sin desnormalizar** — el «Top Like por raça» necesita que
`raca`, que vive en JSONB, sea indexable:

```sql
ALTER TABLE cao_submissao
  ADD COLUMN raca text GENERATED ALWAYS AS (dados->>'raca') STORED;
CREATE INDEX ON cao_submissao (campanha_id, raca);
```

Columna generada: se mantiene sola, no se desincroniza, da índice B-tree normal. Sólo
para los campos que de verdad se consultan en agregado.

### 5.2 Entidades del concurso

```sql
CREATE TABLE cao_raca (
  id      smallserial PRIMARY KEY,
  especie text NOT NULL CHECK (especie IN ('cao','gato')),
  nome    text NOT NULL,
  ordem   smallint NOT NULL DEFAULT 100,
  UNIQUE (especie, nome)
);
```

> ⚠️ **Obligatorio incluir «SRD — Sem Raça Definida», con `ordem = 1`.** En Brasil la
> mayoría de los pets adoptados son SRD, y el concurso nace de una campaña de adopción.
> Un catálogo sólo de pedigree premia justo a quien la campaña *no* quiere premiar.

```sql
CREATE TYPE cao_status AS ENUM
  ('rascunho','pendente','aprovado','rejeitado','desclassificado');

CREATE TABLE cao_pet (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submissao_id        uuid NOT NULL REFERENCES cao_submissao(id) ON DELETE CASCADE,
  slug                text NOT NULL UNIQUE,   -- 'rex-a1b2c3' → /mascota/rex-a1b2c3
  nome                text NOT NULL,
  especie             text NOT NULL CHECK (especie IN ('cao','gato')),
  raca_id             smallint REFERENCES cao_raca(id),
  foto_key            text NOT NULL,          -- key en MinIO, NO url
  foto_thumb_key      text,
  status              cao_status NOT NULL DEFAULT 'pendente',
  motivo_rejeicao     text,
  moderado_por        uuid REFERENCES cao_admin(id),
  moderado_em         timestamptz,
  votos_cache         integer NOT NULL DEFAULT 0,  -- suma de PESO, no count
  visualizacoes_cache integer NOT NULL DEFAULT 0,
  criado_em           timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'rejeitado' OR motivo_rejeicao IS NOT NULL)
);

CREATE INDEX cao_pet_feed_idx ON cao_pet (votos_cache DESC, criado_em DESC)
  WHERE status = 'aprovado';
CREATE INDEX cao_pet_raca_idx ON cao_pet (raca_id, votos_cache DESC)
  WHERE status = 'aprovado';
```

> **`slug` y no UUID en la URL:** `/mascota/rex-a1b2c3` se comparte y se lee;
> `/mascota/9f8e7d6c-…` no. El sufijo aleatorio evita enumerar el concurso entero.
>
> **`foto_key` y no `foto_url`:** con la URL en la base, cambiar de storage obliga a
> reescribir la tabla. Con la key, la URL se construye al leer. Es la diferencia entre
> migrar en una tarde o en un sprint — y con MinIO por delante, importa.

```sql
CREATE TABLE cao_voto (
  id         bigserial PRIMARY KEY,
  pet_id     uuid NOT NULL REFERENCES cao_pet(id) ON DELETE CASCADE,
  votante_id text,           -- id Clube Condor si D1 = sí
  device_id  uuid,           -- cookie first-party, 1 año
  ip_hash    bytea NOT NULL, -- señal de fraude, NUNCA llave
  peso       smallint NOT NULL DEFAULT 1 CHECK (peso IN (1,2)),
  origem     text,           -- utm / canal de share
  anulado_em timestamptz,
  anulado_motivo text,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

-- ESCENARIO A (existe Clube Condor): un voto por socio y mascota
CREATE UNIQUE INDEX cao_voto_socio_idx
  ON cao_voto (pet_id, votante_id) WHERE votante_id IS NOT NULL;
-- ESCENARIO B (anónimo): un voto por dispositivo y mascota
CREATE UNIQUE INDEX cao_voto_device_idx
  ON cao_voto (pet_id, device_id) WHERE votante_id IS NULL;
-- Detección de fraude: votos por IP en ventana temporal
CREATE INDEX cao_voto_fraude_idx ON cao_voto (ip_hash, criado_em DESC);
```

`votos_cache` se mantiene con trigger y **suma peso, no filas**: con Clube Condor
valiendo 2, un `COUNT(*)` daría un ranking incorrecto.

**Backoffice y trazabilidad:** `cao_admin` (con `papel IN ('admin','jurado','leitura')`
y MFA para admin), `cao_auditoria` (acción, entidad, `dados_antes`/`dados_depois`,
`ip_hash`), `cao_regulamento` (versionado, con `sha256` del PDF), `cao_link_curto`
(base62 de 7 chars, acortador propio bajo el dominio de campaña) y
`cao_evento_integracao` (outbox).

> **`sha256` del regulamento no es paranoia.** Si alguien impugna alegando que el
> reglamento cambió después de su inscripción, el hash prueba que no. Cuesta una línea.
>
> **`cao_auditoria` cubre también `exportar`.** Quién descargó la lista de participantes
> y cuándo es exactamente lo que va a preguntar el DPO si hay una fuga.

### 5.3 Versionado — la parte que nadie recuerda hasta que duele

**Un envío tiene que seguir siendo interpretable dentro de dos años.**

1. **Publicar congela.** Una `cao_form_versao` con `publicado_em` no nulo es inmutable.
   Editar crea la versión siguiente.
2. **Cada envío guarda su `form_versao_id`.** Siempre.
3. **Los consentimientos guardan el hash del texto aceptado**, no un booleano. La carga
   de la prueba es del controlador: hay que poder mostrar el texto exacto.
4. **Nunca se borra una versión.** Ni de campañas terminadas.
5. **Cambiar el tipo de un campo publicado está prohibido.** Se crea uno nuevo.

---

## 6. Fotos, storage y el costo real

Suposición de trabajo ⚠️ — sustituir por datos reales:

```
Inscritos                       10.000 mascotas
Foto original (móvil moderno)   ~3 MB          → ~30 GB almacenados
Visitantes del feed             50.000 × ~25 fotos por sesión
Peso servido SIN thumbs         3,7 TB
Peso servido CON thumbs 40 KB     50 GB
```

> **Esto pesa más que la elección de base de datos.** La base mueve unos pocos GB; las
> imágenes mueven terabytes. Cualquier discusión de costo que no empiece por aquí está
> optimizando lo que no pesa.

**Reglas:**

1. **Derivadas al subir**, no al vuelo: `thumb` 400px (feed), `card` 800px (perfil),
   `og` 1200×630 (preview de RRSS). El original se guarda aparte y no se sirve nunca.
2. **CDN delante.** Las fotos son inmutables una vez aprobadas → cache eterno.
3. **Bucket privado + URLs firmadas para lo no aprobado.** Una foto en `pendente` no
   puede ser accesible: si se filtra una rechazada por contenido inapropiado bajo el
   dominio de Condor, es un incidente de marca.
4. **Validar de verdad, no por extensión.** Magic bytes, dimensiones reales, re-encodear
   siempre (destruye payloads embebidos).
5. **Strip de EXIF obligatorio, en servidor.** El del cliente funciona y de paso
   convierte 6–20 MB en 300–800 KB, pero es código que el usuario controla y se salta
   con un PUT directo a la URL firmada. **El defendible ante la ANPD es el del servidor.**

**Moderación:** `status = 'pendente'` ya existe en el endpoint actual. ⚠️ **Con 10.000
inscripciones la moderación manual es un problema de personas, no de software.** Si un
tutor se inscribe y su mascota no aparece en 24-48 h, escribe al SAC. Hay que dimensionar
quién lo hace; un pre-filtro automático reduce el volumen pero no elimina la revisión.

---

## 7. LGPD — lo que está mal hoy

No es una sección de relleno. Los dos primeros puntos son código actual.

| # | Punto | Estado hoy | Acción |
|---|---|---|---|
| 1 | **GPS en las fotos** | ⛔ No hay strip de EXIF en ningún sitio. Publicaríamos la ubicación de la casa del participante | Strip en servidor → §6 |
| 2 | **Consentimiento agrupado** | ⛔ Un solo checkbox mezcla tres finalidades | Separar → abajo |
| 3 | IP en claro | ✅ El endpoint no la guarda; el anti-fraude la necesitará | Hash con sal rotativa, nunca cruda |
| 4 | Base legal | consentimiento | Documentarla en el regulamento |
| 5 | Retención | no definida | Plazo post-campaña + purga automática |
| 6 | Derechos del titular | no implementado | Vía de contacto + procedimiento de borrado |
| 7 | **Menores** | no contemplado | ⚠️ Un concurso de mascotas atrae adolescentes. Bajo LGPD art. 14 el régimen es reforzado. **Lo simple es exigir +18 en el regulamento** |
| 8 | Transferencia internacional | ✅ resuelto | Supabase `sa-east-1`, la data no sale de Brasil |

**Sobre el punto 2**, que es concreto y actual. El checkbox único dice:

> *«Li e aceito o regulamento do Cãocurso 2026 e autorizo a Rede Condor a usar a imagem
> do meu pet e os dados enviados na divulgação da campanha.»*

Eso agrupa **participar**, **ceder la imagen del pet** y **ceder los datos para
divulgación**. Bajo LGPD son finalidades distintas y no se pueden agrupar en un solo
consentimiento. Hacen falta registros separados y ninguno premarcado. Y si algún día
Emarsys recibe inscritos, hace falta un cuarto: aceptar el regulamento es consentir
*participar*, no consentir *recibir comunicaciones comerciales*.

Por eso `cao_submissao.consentimentos` es un array de `{tipo, versao, texto_sha256, em}`
y no un booleano.

---

## 8. Votación y anti-fraude

### «Un like por IP» no se puede implementar

En Brasil el móvil sale por **CGNAT**: una IP pública puede tapar decenas de miles de
abonados de la misma operadora. Consecuencia directa: el primer usuario de Vivo que vote
«gasta» la IP y el resto recibe *ya votaste*. Lo mismo en oficinas, escuelas y wifi de
shoppings. Y en la dirección contraria tampoco protege: cambiar de IP es poner el móvil
en modo avión y volver.

**La IP es una buena señal de fraude y una pésima llave de unicidad.** Se usa como
`ip_hash` indexado por tiempo, con alerta cuando una IP supera N votos/hora — para
*investigar*, no para *bloquear*. En IPv6 el problema es el inverso: un atacante controla
un /64 entero. Normalizar a /64 y /56.

### Los dos escenarios (D1)

**Escenario A — existe login de Clube Condor.** Preferido. El fraude cae a crear cuentas
falsas de socio, que ya tiene fricción propia, y el peso ×2 sale gratis. **El argumento
de negocio vale más que el técnico:** cada voto se vuelve un touchpoint identificado del
programa de fidelidad, y el concurso deja de ser sólo captación para ser activación de
base.

**Escenario B — no existe.** Tres niveles: cookie + rate limit (fraude alto, se gamea el
día 1), **OTP por email antes del primer voto** ⭐, o sólo votan tutores inscritos (mata
el alcance). **B2 es la recomendación:** convierte el voto en identificado sin depender
de Clube Condor, y el email capturado alimenta la base — que es el objetivo real.

### Defensas complementarias

- **Ventana de gracia:** el ranking se congela N horas antes del cierre para auditar. Ya
  ha pasado en concursos brasileños que la última hora concentra la votación anómala.
- **Los votos no se borran, se anulan** (`anulado_em` + motivo) y se descuenta del cache.
- **`origem` en el voto** permite ver si una mascota subió por shares orgánicos o por un
  único enlace martilleado.
- **Turnstile antes que reCAPTCHA v3:** el tramo gratuito de reCAPTCHA bajó a 10.000
  assessments/mes y exige proyecto GCP con billing. Turnstile da challenges ilimitados y
  añadir `condor.com.br` como hostname cubre todos sus subdominios. ⚠️ Pero no es gratis
  en LGPD: carga desde `challenges.cloudflare.com`, procesa IP y fingerprint, y Cloudflare
  se declara controlador de parte de esa señal.
- **Descartar proof-of-work.** El coste recae en el dispositivo del usuario: grava a la
  madre con un Android de entrada subiendo la foto desde datos móviles, y casi no grava
  al atacante con una VM.

> ⚠️ **Cerrar con jurídico:** si el premio se decide por votación pública, el regulamento
> debe reservar explícitamente el derecho a anular votos fraudulentos y descalificar
> participantes. Sin esa cláusula, anular votos es jurídicamente frágil.

---

## 9. Integraciones: outbox, nunca en línea

```
POST /inscricao
  ├─ BEGIN
  ├─ INSERT cao_submissao, cao_pet
  ├─ INSERT cao_evento_integracao (pendente)   ← misma transacción
  └─ COMMIT                                    → 201 al usuario
Worker (cron)
  └─ lee pendentes → envía → marca enviado/falhou → backoff
```

Si Emarsys tarda 8 segundos o está caído, el usuario que se inscribe desde el móvil en la
puerta del súper no puede quedarse esperando. La inscripción se confirma con el commit
local; la sincronización es asíncrona y reintentable.

| | Emarsys | PostHog |
|---|---|---|
| Contiene PII | **Sí** — email, teléfono, nombre | **No debe** — sólo IDs anónimos |
| Dónde se llama | **Sólo servidor** | Cliente + servidor |
| Gating | **Sólo con opt-in de marketing explícito** | Consentimiento de cookies |

Eventos `cao_<sustantivo>_<verbo en pasado>`. **`cao_pet_aprovado` es el más valioso de
todos:** es cuando al tutor le llega «tu mascota ya está en la votación, compartila» y se
convierte en distribuidor. Ese mail es el motor de crecimiento del concurso; merece
diseñarse, no salir como un aviso genérico.

> ⚠️ **Dos fuentes de verdad para «Top Visualizaciones».** Si PostHog cuenta las vistas y
> el backoffice también, los números van a discrepar — y el juez se entera en la final.
> **Regla: lo que premia se cuenta en base propia; lo que analiza vive en PostHog.**

⚠️ Hoy la LP **no emite un solo evento**: nadie sabe cuántos abren el formulario y
abandonan. Instrumentar `form_open`, `field_error`, `form_submit`, `form_success` una vez
en el core vale más que ahorrar líneas de React.

---

## 10. Antipatrones — la lista de «no» explícitos

1. **DDL en runtime.** El backoffice nunca ejecuta `ALTER TABLE`. Los campos de campaña
   van a JSONB; las columnas generadas las añade una migración revisada.
2. **Condicionales profundos en el schema.** Un nivel es aceptable. Dos ya es un lenguaje.
3. **Fórmulas en JSON.** Si hay que calcular, es un hook.
4. **Borrar versiones de schema, o cambiar el tipo de un campo publicado.** Nunca.
5. **Un solo checkbox de consentimiento.** → §7
6. **Confiar en la validación de cliente.** El schema genera las dos; la del servidor manda.
7. **Que el catálogo crezca por presión de calendario.** Un tipo de campo con semántica
   propia es código revisado, no una fila en una tabla.
8. **Tratar CORS como control de acceso.** `multipart/form-data` es CORS-safelisted: no
   hay preflight, el cuerpo se envía siempre, y CORS sólo decide si el JS puede *leer* la
   respuesta. `curl` lo ignora. Hoy lo único que protege el endpoint es
   `security.checkOrigin` de Astro — seguridad por accidente de framework.
9. **Rate limit duro por IP.** → §8, CGNAT.
10. **El schema en `node_modules` sin `@source`.** Tailwind v4 ignora `node_modules` por
    defecto: el formulario sale a medio estilar, **sin error de build ni warning**. Una
    línea, pero se olvida en cada campaña nueva.

---

## 11. Riesgos, por daño esperado

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Fraude masivo de votos con reglas de cookie | Alta | Muy alto — concurso desacreditado en prensa | Escenario A o B2 (§8) |
| R2 | **DNS/CDN de `pet.condor.com.br` no llega a tiempo** | Media | Alto — sin dominio de campaña se mata el share | **Iniciar el trámite con TI de Condor ya** |
| R3 | Moderación humana desbordada | Alta | Alto — inscritos invisibles, avalancha al SAC | Dimensionar equipo + pre-filtro |
| R4 | Costo de banda por no generar miniaturas | Media | Alto | Derivadas al subir + CDN (§6) |
| R5 | Foto inapropiada publicada bajo marca Condor | Media | Muy alto | Bucket privado hasta aprobar |
| R6 | **Fotos con GPS publicadas** | **Alta si no se arregla** | Muy alto | Strip de EXIF en servidor |
| R7 | Impugnación del resultado sin trazabilidad | Baja | Alto | `cao_auditoria` + votos anulables |
| R8 | Fuga de datos vía exportación | Baja | Muy alto | Papel `jurado` sin export + links con caducidad |
| R9 | Ranking discrepante PostHog vs base propia | Media | Medio | Una sola fuente de verdad (§9) |

**R2 es el que más plazo administrativo tiene y el que menos depende de nosotros.** Todo
lo demás se acelera programando; ése no.

---

## 12. Orden de trabajo

| Etapa | Qué | Nota |
|---|---|---|
| **0** | Separar los consentimientos del checkbox único (§7) | Es un cambio pequeño y hoy es una exposición |
| **1** | Supabase: esquema de §5 + repositorio propio en la app | La forma final desde el principio: después no hay migración de datos personales |
| **2** | MinIO: bucket privado, upload, derivadas, strip de EXIF en servidor | §6 |
| **3** | El formulario a isla React sobre `@condor/forms-core`, schema-shaped | §4.3. El schema del Cãocurso, una constante en el repo |
| **4** | Backoffice: moderación, rankings, export, outbox | |
| **5** | Feed público y votación | Depende de D1/D2/D5 |
| **6** | Schema-served y constructor visual | Sólo cuando marketing lo pida de verdad |

**El riesgo de calendario es el riesgo real.** El Cãocurso tiene fecha dura y la forma
clásica de fallar es construir la plataforma antes de que la campaña esté en el aire.

### Exportación — tres cosas que siempre fallan

1. **Asíncrona.** 10.000 filas con joins no salen en un request HTTP sin timeout.
2. **Auditada y con caducidad.** Es una lista de datos personales de miles de personas.
3. **Excel brasileño destroza CSV.** Separador `;`, UTF-8 **con BOM**, teléfonos como
   texto — si no, Excel se come el cero inicial. Parece un detalle y es la primera queja
   que llega de marketing.

---

## Anexo — el contexto que enmarca todo esto

Esta plataforma no es una utilidad interna: **es el reemplazo del plugin de formularios
de WordPress.** El trabajo del equipo es migrar un ecosistema WordPress completo a
Next/React y Astro, y `pet.condor.com.br` —que corría WordPress + Elementor +
JetFormBuilder, `data-form-id="379"`— es un espécimen de ese corpus.

Eso tiene dos consecuencias prácticas:

**El inventario de formularios es barato.** Las definiciones de WordPress están en la
base de datos y son legibles por máquina: JetFormBuilder en el CPT `jet-form-builder`,
ACF en `postmeta`, Contact Form 7 en `postmeta._form`, Gravity Forms en tabla propia. Un
script que las vuelque todas a JSON convierte el censo en un rato de trabajo, y con esa
unión delante el catálogo de §4.2 se define con datos y no con opinión.

**Y la coexistencia obliga a decidir P6.** Durante la migración van a convivir, quizá
años, LPs en Astro y LPs en WordPress. Si las viejas siguen escribiendo en WordPress
mientras las nuevas escriben en el backoffice, hay dos fuentes de inscripciones, dos
exportaciones y dos políticas de retención — exactamente lo que la migración pretende
terminar. El argumento a favor de servir a WordPress es **el dato, no el código**. Y si
se decide servirlas, el embed es un artefacto de transición con fecha de caducidad, no
la arquitectura: sobre `@condor/forms-core` se escribe un renderer vanilla y se carga
con un shortcode.
