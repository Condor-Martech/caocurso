/**
 * Borra inscripciones SIN dejar fotos huérfanas, y recoge las que ya quedaron.
 *
 * Una inscripción vive en dos sitios: la ficha en la tabla `cao_inscricao` y la
 * foto en el bucket `fotos-caocurso`. La ficha guarda la KEY de la foto, y es lo
 * único que sabe dónde está.
 *
 * Por eso borrar la fila desde el Table Editor del panel deja la foto ahí, sin
 * nada que apunte a ella: nadie la puede abrir —`/foto/<id>` busca la ficha, y
 * sin ficha da 404— pero sigue ocupando sitio, y es el dato personal de alguien
 * guardado sin nada que explique por qué. Con una da igual; la costumbre no.
 *
 * Este script hace las dos cosas en el orden correcto: primero la foto, después
 * la fila. Al revés se vuelve a caer en el mismo problema si algo falla en medio.
 *
 * ── Uso ─────────────────────────────────────────────────────────────────────
 *
 *   node scripts/limpar-inscricoes.mjs --orfas          qué fotos sobran
 *   node scripts/limpar-inscricoes.mjs --orfas --apagar
 *
 *   node scripts/limpar-inscricoes.mjs --id <uuid>      una inscripción
 *   node scripts/limpar-inscricoes.mjs --id <uuid> --apagar
 *
 *   node scripts/limpar-inscricoes.mjs --tudo --apagar  TODAS. Sólo para pruebas.
 *
 * **Sin `--apagar` no borra nada**: enseña lo que haría y sale. Es a propósito —
 * un script que borra por defecto es un script que un día borra lo que no era.
 *
 * ⚠️ Esto es BORRADO DE VERDAD, y no es lo que pide la LGPD. Cuando alguien
 * ejerce su derecho de supresión hay que poder demostrar CUÁNDO se atendió, y
 * para eso está la columna `excluido_em`: la ficha desaparece de la planilla en
 * el envío siguiente y la plaza vuelve al concurso, pero queda constancia. Este
 * script es para datos de prueba y para recoger huérfanas.
 */
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

/* El .env se lee a mano: este script corre fuera de Astro, así que no existe
   `astro:env`. Sólo nos interesan tres variables y ninguna lleva comillas. */
async function lerEnv() {
  const texto = await readFile('.env', 'utf8').catch(() => {
    throw new Error('No encuentro el .env. Ejecuta esto desde la raíz del proyecto.');
  });
  const env = {};
  for (const linha of texto.split('\n')) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(linha.trim());
    if (m) env[m[1]] = m[2];
  }
  for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
    if (!env[k]) throw new Error(`Falta ${k} en el .env.`);
  }
  return env;
}

const args = process.argv.slice(2);
const tem = (f) => args.includes(f);
const valor = (f) => args[args.indexOf(f) + 1];

const APAGAR = tem('--apagar');
const PASTA = '2026'; // la única carpeta del bucket; ver lib/storage.ts

function ajuda() {
  console.log(`
  node scripts/limpar-inscricoes.mjs --sincronizar      reescribe la hoja, sin borrar nada
  node scripts/limpar-inscricoes.mjs --orfas            fotos sin ficha
  node scripts/limpar-inscricoes.mjs --id <uuid>        una inscripción
  node scripts/limpar-inscricoes.mjs --tudo             todas (pruebas)

  Añade --apagar para que borre de verdad. Sin eso sólo enseña qué haría.
  --sincronizar no borra nunca, así que no necesita --apagar.
`);
}

const env = await lerEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const BUCKET = env.SUPABASE_BUCKET_FOTOS || 'fotos-caocurso';

/* ─────────────────────────────────────────────────────────── la planilla ── */

/**
 * Las columnas, EN EL MISMO ORDEN que `src/lib/planilha.ts`.
 *
 * Están duplicadas y no se puede evitar: aquel módulo importa `astro:env`, que
 * fuera de Astro no existe. Si se cambian allí, hay que cambiarlas aquí — es la
 * única costura frágil de este script.
 */
const COLUNAS = [
  'Nome do tutor',
  'E-mail',
  'Telefone',
  'Nome do pet',
  'Raça',
  'Sexo',
  'Descrição',
  'Data da inscrição',
  'Foto',
];

/**
 * Reescribe la planilla con lo que quede.
 *
 * Sin esto, borrar dejaba la hoja mostrando fichas que ya no existen hasta que
 * alguien se inscribiera. Para datos de prueba es confuso; para una supresión
 * de LGPD sería peor — la persona seguiría en una hoja compartida con el jurado
 * y con el CRM, que es justo lo que se creía haber resuelto.
 *
 * Si faltan las variables del webhook no hace nada y lo dice: el borrado ya
 * ocurrió, y fallar aquí no debe parecer que falló todo.
 */
async function sincronizarPlanilha() {
  if (!env.PLANILHA_WEBHOOK_URL || !env.PLANILHA_WEBHOOK_TOKEN) {
    console.log('\n  ⚠️  Sin PLANILHA_WEBHOOK_* en el .env: la hoja se queda como está.');
    return;
  }

  const { data, error } = await sb
    .from('cao_inscricao')
    .select('id, tutor_nome, tutor_email, tutor_telefone, pet_nome, pet_raca, pet_sexo, pet_descricao, criado_em')
    .is('excluido_em', null)
    .order('criado_em', { ascending: true });
  if (error) {
    console.log(`\n  ⚠️  No pude leer las fichas para la hoja: ${error.message}`);
    return;
  }

  /* El enlace de la foto necesita una base. En el servidor sale del origen de
     la petición; aquí no hay petición, así que se usa SITE_URL y, si está
     vacía, el mismo localhost que el servidor produce hoy. */
  const base = (env.SITE_URL || 'http://localhost:4321').replace(/\/+$/, '');

  const linhas = (data ?? []).map((r) => [
    r.tutor_nome, r.tutor_email, r.tutor_telefone, r.pet_nome,
    r.pet_raca ?? '', r.pet_sexo ?? '', r.pet_descricao ?? '',
    r.criado_em, `${base}/foto/${r.id}`,
  ]);

  try {
    const resposta = await fetch(env.PLANILHA_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: env.PLANILHA_WEBHOOK_TOKEN,
        atualizadoEm: new Date().toISOString(),
        total: linhas.length,
        colunas: COLUNAS,
        linhas,
      }),
      signal: AbortSignal.timeout(30000),
    });
    const corpo = (await resposta.text()).slice(0, 200);
    console.log(
      corpo.includes('"ok":true')
        ? `\n  Hoja reescrita: ${linhas.length} fila(s).`
        : `\n  ⚠️  La hoja respondió algo raro: ${corpo}`
    );
  } catch (e) {
    console.log(`\n  ⚠️  No pude avisar a la hoja: ${e.message}`);
  }
}

/** Borra la foto primero y la fila después. Si la foto falla, la fila se queda:
    una ficha sin foto es un problema visible; una foto sin ficha, invisible. */
async function apagarInscricao({ id, foto_key, tutor_nome, pet_nome }) {
  console.log(`  ${tutor_nome} / ${pet_nome}`);
  console.log(`    foto: ${foto_key}`);
  if (!APAGAR) return;

  const { error: eFoto } = await sb.storage.from(BUCKET).remove([foto_key]);
  if (eFoto) {
    console.log(`    ⚠️  la foto no se pudo borrar (${eFoto.message}). Dejo la ficha.`);
    return;
  }
  const { error: eFicha } = await sb.from('cao_inscricao').delete().eq('id', id);
  if (eFicha) {
    console.log(`    ⚠️  la ficha no se pudo borrar: ${eFicha.message}`);
    return;
  }
  console.log('    borrado');
}

/* Reescribe la hoja con lo que hay, sin tocar nada más.
 *
 * Hace falta después de un despliegue: los enlaces de la foto se construyen con
 * SITE_URL, así que los que quedaron escritos antes apuntan a donde ya no toca.
 * La hoja se rehace sola en la siguiente inscripción, pero si no llega ninguna
 * se queda con enlaces muertos hasta que alguien lo note. */
if (tem('--sincronizar')) {
  const base = env.SITE_URL || 'http://localhost:4321';
  console.log(`\n  Enlaces de foto apuntando a: ${base}`);
  if (!env.SITE_URL) {
    console.log('  ⚠️  SITE_URL vacía. En producción tiene que valer https://pet.condor.com.br');
  }
  await sincronizarPlanilha();
  console.log('');
  process.exit(0);
}

if (tem('--orfas')) {
  const { data: objetos, error: eLista } = await sb.storage
    .from(BUCKET)
    .list(PASTA, { limit: 1000 });
  if (eLista) throw new Error(`No puedo listar el bucket: ${eLista.message}`);

  /* Se comparan TODAS las fichas, incluidas las que tienen `excluido_em`: una
     supresión lógica conserva la foto a propósito, así que su key no sobra. */
  const { data: fichas, error: eFichas } = await sb.from('cao_inscricao').select('foto_key');
  if (eFichas) throw new Error(`No puedo leer las fichas: ${eFichas.message}`);

  const usadas = new Set(fichas.map((f) => f.foto_key));
  const orfas = objetos.map((o) => `${PASTA}/${o.name}`).filter((k) => !usadas.has(k));

  console.log(`\n${objetos.length} fotos en el bucket · ${usadas.size} con ficha · ${orfas.length} sin ficha\n`);
  if (!orfas.length) {
    console.log('  No hay huérfanas.\n');
    process.exit(0);
  }
  for (const k of orfas) console.log(`  ${k}`);

  if (!APAGAR) {
    console.log('\n  Añade --apagar para borrarlas.\n');
    process.exit(0);
  }
  const { error } = await sb.storage.from(BUCKET).remove(orfas);
  console.log(error ? `\n  ⚠️  ${error.message}\n` : `\n  ${orfas.length} borradas.\n`);
  process.exit(error ? 1 : 0);
}

if (tem('--id')) {
  const id = valor('--id');
  if (!id) {
    ajuda();
    process.exit(1);
  }
  const { data, error } = await sb
    .from('cao_inscricao')
    .select('id, foto_key, tutor_nome, pet_nome')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    console.log(`\n  No hay ninguna ficha con id ${id}.\n`);
    process.exit(1);
  }
  console.log(APAGAR ? '\nBorrando:' : '\nSe borraría:');
  await apagarInscricao(data);
  if (APAGAR) await sincronizarPlanilha();
  console.log(APAGAR ? '' : '\n  Añade --apagar para borrar de verdad.\n');
  process.exit(0);
}

if (tem('--tudo')) {
  const { data, error } = await sb
    .from('cao_inscricao')
    .select('id, foto_key, tutor_nome, pet_nome')
    .order('criado_em');
  if (error) throw new Error(error.message);
  if (!data.length) {
    /* Sin fichas pero con `--apagar`, igual se sincroniza: es exactamente el
       caso en que la hoja quedó mostrando filas que ya no existen —alguien
       borró por otra vía— y salir aquí la dejaría así. */
    console.log('\n  No hay ninguna ficha.');
    if (APAGAR) await sincronizarPlanilha();
    console.log('');
    process.exit(0);
  }
  console.log(APAGAR ? `\nBorrando ${data.length}:` : `\nSe borrarían ${data.length}:`);
  for (const ficha of data) await apagarInscricao(ficha);
  if (APAGAR) await sincronizarPlanilha();
  console.log(APAGAR ? '' : '\n  Añade --apagar para borrar de verdad.\n');
  process.exit(0);
}

ajuda();
