import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { estadoInscricao } from '../../lib/inscricao';

export const prerender = false;

/**
 * POST /api/inscricao — inscripción de un pet en el Cãocurso 2026.
 *
 * Recibe multipart/form-data (NO JSON): el campo `petFoto` es un archivo y un
 * archivo no cabe en un body JSON.
 *
 * Campos que envía `src/components/FormularioInscricao.astro` (los del mockup
 * `docs/Desktop - CãoCurso.png`, más el aceite que pidió el cliente):
 *
 *   Obligatorios
 *     tutorNome           texto, mínimo 3 caracteres
 *     tutorEmail          formato de e-mail
 *     tutorTelefone       10 a 13 dígitos (fijo con DDD … móvil con +55)
 *     petNome             texto
 *     petFoto             JPG / PNG / WebP, máximo 2 MB
 *     aceiteRegulamento   checkbox: llega como 'on' (también se aceptan 'true' y '1')
 *
 *   Opcionales
 *     tutorNascimento     dd/mm/aaaa (o aaaa-mm-dd): fecha real y mayor de 18 años
 *     tutorCpf            11 dígitos con dígitos verificadores válidos
 *     petRaca · petSexo · petDescricao · petEspecie
 *
 * Hasta la campaña 2025 se exigía `petEspecie` ∈ {Cão, Gato} y un
 * `aceiteRegulamento === 'true'`. El formulario 2026 no manda lo primero y un
 * checkbox HTML nunca manda lo segundo, así que TODO envío moría con un 400
 * «Selecione a espécie do pet.». Ese es el bug que corrige este archivo:
 * `petEspecie` pasa a opcional y el aceite acepta el valor real del navegador.
 *
 * La ficha nace en estado `pendente`: no debe recibir votos hasta ser moderada.
 *
 * ⚠️ Persistencia: escribe en disco (uploads/ + inscricoes.jsonl). Esto funciona
 * en local, pero **NO en Vercel**, que es el adapter de este proyecto: el
 * sistema de archivos de una función es de sólo lectura salvo /tmp, y /tmp es
 * efímero y por instancia. Desplegado, el `fs.mkdir` falla y el endpoint
 * responde 500 — y la deduplicación por tutor+pet tampoco puede funcionar,
 * porque cada instancia vería su propio fichero. Antes de abrir el formulario
 * al público hay que mover la foto a un blob store y la ficha a una base de
 * datos (ver los documentos de arquitectura de la plataforma de formularios).
 *
 * ⚠️ LGPD: la ficha guarda datos personales (nombre, e-mail, teléfono y, si se
 * rellena, CPF). El JSONL de desarrollo está en claro y no debe salir de la
 * máquina local; el almacenamiento definitivo tiene que cifrar el CPF y tener
 * una política de retención.
 */

/* Mismo límite que promete el texto de ayuda del formulario («no máximo, 2mb»).
   Antes eran 5 MB aquí y 2 MB en la interfaz: el usuario podía subir una foto de
   4 MB, ver el formulario aceptarla y recibir un error del servidor. */
const MAX_FOTO_BYTES = 2 * 1024 * 1024;
const MAX_DESCRICAO = 1000;

const TIPOS_ACEITOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const EXTENSOES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/* Un <input type="checkbox"> marcado manda 'on'. 'true' y '1' se aceptan para
   que la API siga sirviendo a clientes que no sean este formulario (curl, un
   futuro cliente JSON-ish, tests). */
const VALORES_ACEITE = ['on', 'true', '1', 'sim'];

const IDADE_MINIMA = 18;
const IDADE_MAXIMA = 120;

const DIR_DADOS = path.resolve(process.cwd(), 'uploads');
const DIR_FOTOS = path.join(DIR_DADOS, 'fotos');
const ARQUIVO_INSCRICOES = path.join(DIR_DADOS, 'inscricoes.jsonl');

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** `campo` viaja en la respuesta para que el formulario marque ese input. */
function erro(message: string, status = 400, campo?: string) {
  return json({ success: false, message, campo }, status);
}

const texto = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const digitos = (v: string) => v.replace(/\D/g, '');

/** CPF: 11 dígitos y los dos dígitos verificadores del algoritmo de la Receita. */
function cpfValido(cpf: string): boolean {
  if (cpf.length !== 11) return false;
  // 000.000.000-00, 111.111.111-11… pasan la cuenta pero no son CPF reales.
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(cpf[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    const dv = resto === 10 || resto === 11 ? 0 : resto;
    if (dv !== Number(cpf[tamanho])) return false;
  }
  return true;
}

/**
 * Acepta dd/mm/aaaa (lo que escribe el usuario) y aaaa-mm-dd (por si algún día
 * el campo pasa a <input type="date">). Devuelve null si no es una fecha real:
 * `new Date` acepta 31/02 y lo convierte en 03/03 sin avisar, así que hay que
 * comprobar que los componentes sobreviven al viaje de ida y vuelta.
 */
function parseData(valor: string): Date | null {
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);

  let ano: number;
  let mes: number;
  let dia: number;

  if (br) {
    dia = Number(br[1]);
    mes = Number(br[2]);
    ano = Number(br[3]);
  } else if (iso) {
    ano = Number(iso[1]);
    mes = Number(iso[2]);
    dia = Number(iso[3]);
  } else {
    return null;
  }

  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return null;
  }
  return data;
}

/** Años cumplidos a día de hoy. */
function idadeEmAnos(nascimento: Date, hoje = new Date()): number {
  let idade = hoje.getUTCFullYear() - nascimento.getUTCFullYear();
  const mes = hoje.getUTCMonth() - nascimento.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoje.getUTCDate() < nascimento.getUTCDate())) {
    idade--;
  }
  return idade;
}

export const POST: APIRoute = async ({ request }) => {
  /* El período de inscripción se comprueba AQUÍ, y no sólo al pintar el botón.
     Un botón que no aparece es cosmética: la ruta sigue existiendo y acepta un
     POST de `curl` el día después del cierre. Sin esta comprobación
     «Finalizado» no significa nada.

     Va lo primero, antes incluso de leer el cuerpo: si el plazo está cerrado no
     hay motivo para bufferizar una foto de 2 MB. */
  const estado = estadoInscricao();
  if (estado === 'em-breve') {
    return erro('As inscrições ainda não estão abertas.', 403);
  }
  if (estado === 'finalizada') {
    return erro('O período de inscrição está encerrado.', 403);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return erro('Envie o formulário como multipart/form-data.', 415);
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return erro('Não foi possível ler o formulário.', 400);
  }

  /* ------------------------------------------------------------ validação */

  const tutorNome = texto(fd, 'tutorNome');
  const tutorNascimento = texto(fd, 'tutorNascimento');
  const tutorCpf = texto(fd, 'tutorCpf');
  const tutorEmail = texto(fd, 'tutorEmail');
  const tutorTelefone = texto(fd, 'tutorTelefone');

  const petNome = texto(fd, 'petNome');
  const petRaca = texto(fd, 'petRaca');
  const petSexo = texto(fd, 'petSexo');
  const petDescricao = texto(fd, 'petDescricao');
  const petEspecie = texto(fd, 'petEspecie'); // opcional: ya no lo manda o formulário

  const aceiteRegulamento = VALORES_ACEITE.includes(
    texto(fd, 'aceiteRegulamento').toLowerCase()
  );

  /* --- tutor --- */

  if (tutorNome.length < 3) {
    return erro('Informe seu nome completo.', 400, 'tutorNome');
  }

  if (tutorNascimento) {
    const nascimento = parseData(tutorNascimento);
    if (!nascimento) {
      return erro('Data de nascimento inválida. Use dd/mm/aaaa.', 400, 'tutorNascimento');
    }
    const idade = idadeEmAnos(nascimento);
    if (idade < 0 || idade > IDADE_MAXIMA) {
      return erro('Data de nascimento inválida. Use dd/mm/aaaa.', 400, 'tutorNascimento');
    }
    // El Cãocurso implica cesión de imagen del pet: el tutor tiene que ser mayor.
    if (idade < IDADE_MINIMA) {
      return erro(
        `É necessário ter ${IDADE_MINIMA} anos ou mais para inscrever um pet.`,
        400,
        'tutorNascimento'
      );
    }
  }

  if (tutorCpf) {
    const cpf = digitos(tutorCpf);
    if (cpf.length !== 11) {
      return erro('CPF inválido. Informe os 11 dígitos.', 400, 'tutorCpf');
    }
    if (!cpfValido(cpf)) {
      return erro('CPF inválido. Confira os números digitados.', 400, 'tutorCpf');
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(tutorEmail)) {
    return erro('E-mail inválido.', 400, 'tutorEmail');
  }

  const telefone = digitos(tutorTelefone);
  if (telefone.length < 10 || telefone.length > 13) {
    return erro('Telefone inválido. Informe o DDD e o número.', 400, 'tutorTelefone');
  }

  /* --- pet --- */

  if (!petNome) {
    return erro('Informe o nome do seu pet.', 400, 'petNome');
  }
  if (petDescricao.length > MAX_DESCRICAO) {
    return erro(
      `A descrição do pet deve ter no máximo ${MAX_DESCRICAO} caracteres.`,
      400,
      'petDescricao'
    );
  }

  /* --- aceite (LGPD: regulamento + uso de imagem) --- */

  if (!aceiteRegulamento) {
    return erro(
      'É necessário aceitar o regulamento e o uso da imagem do pet.',
      400,
      'aceiteRegulamento'
    );
  }

  /* --- foto: é o núcleo da inscrição --- */

  const foto = fd.get('petFoto');
  if (!(foto instanceof File) || foto.size === 0) {
    return erro('A foto do pet é obrigatória.', 400, 'petFoto');
  }
  if (!TIPOS_ACEITOS.includes(foto.type)) {
    return erro('Formato inválido. Use JPG, PNG ou WebP.', 400, 'petFoto');
  }
  if (foto.size > MAX_FOTO_BYTES) {
    return erro('A foto deve ter no máximo 2 MB.', 400, 'petFoto');
  }

  /* ---------------------------------------------------------- persistência */

  try {
    await fs.mkdir(DIR_FOTOS, { recursive: true });

    // Deduplica por tutor + pet: reinscribir la misma mascota no crea otra ficha.
    const chave = `${tutorEmail.toLowerCase()}|${petNome.toLowerCase()}`;
    const existentes = await fs.readFile(ARQUIVO_INSCRICOES, 'utf-8').catch(() => '');
    if (
      existentes
        .split('\n')
        .filter(Boolean)
        .some((linha) => {
          try {
            return JSON.parse(linha).chave === chave;
          } catch {
            return false;
          }
        })
    ) {
      return erro('Este pet já foi inscrito com esse e-mail.', 409, 'petNome');
    }

    const id = `pet_${randomUUID().slice(0, 8)}`;
    const nomeArquivo = `${id}${EXTENSOES[foto.type] ?? '.jpg'}`;
    await fs.writeFile(
      path.join(DIR_FOTOS, nomeArquivo),
      Buffer.from(await foto.arrayBuffer())
    );

    const ficha = {
      id,
      chave,
      status: 'pendente', // não recebe votos até ser moderada
      votos: 0,

      tutorNome,
      tutorNascimento: tutorNascimento || null,
      tutorCpf: tutorCpf ? digitos(tutorCpf) : null,
      tutorEmail,
      tutorTelefone: telefone,

      petNome,
      petRaca: petRaca || null,
      petSexo: petSexo || null,
      petDescricao: petDescricao || null,
      petEspecie: petEspecie || null,

      fotoArquivo: nomeArquivo,

      aceiteRegulamento,
      aceiteEm: new Date().toISOString(), // prova de consentimento (LGPD)
      criadoEm: new Date().toISOString(),
    };

    await fs.appendFile(ARQUIVO_INSCRICOES, `${JSON.stringify(ficha)}\n`, 'utf-8');

    return json(
      {
        success: true,
        id,
        message: `Inscrição enviada! ${petNome} vai concorrer no Cãocurso. Assim que a foto for aprovada, avisamos por e-mail.`,
      },
      201
    );
  } catch (e) {
    console.error('Erro ao salvar inscrição:', e);
    return erro('Não foi possível concluir a inscrição. Tente novamente.', 500);
  }
};

/** Cualquier método que no sea POST. */
export const ALL: APIRoute = () =>
  json({ success: false, message: 'Método não permitido.' }, 405);
