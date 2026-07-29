import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const prerender = false;

/**
 * POST /api/inscricao — inscripción de una mascota en el Cãocurso.
 *
 * Recibe multipart/form-data (NO JSON): el campo `petFoto` es un archivo y un
 * archivo no cabe en un body JSON.
 *
 * La ficha nace en estado `pendente`: no debe recibir votos hasta ser moderada.
 * Ver docs/GROUND_TRUTH.md §6.
 *
 * ⚠️ Persistencia: escribe en disco (uploads/ + inscricoes.jsonl). Esto funciona
 * en local, pero **NO en Vercel**: el sistema de archivos de una función es de
 * sólo lectura salvo /tmp, y /tmp es efímero y por instancia. Desplegado, el
 * `fs.mkdir` falla y el endpoint responde 500. Antes de abrir el formulario al
 * público hay que mover la foto a un blob store y la ficha a una base de datos.
 */

const MAX_FOTO_BYTES = 5 * 1024 * 1024;
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSOES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const DIR_DADOS = path.resolve(process.cwd(), 'uploads');
const DIR_FOTOS = path.join(DIR_DADOS, 'fotos');
const ARQUIVO_INSCRICOES = path.join(DIR_DADOS, 'inscricoes.jsonl');

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function erro(message: string, status = 400, campo?: string) {
  return json({ success: false, message, campo }, status);
}

const texto = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

export const POST: APIRoute = async ({ request }) => {
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
  const tutorEmail = texto(fd, 'tutorEmail');
  const tutorTelefone = texto(fd, 'tutorTelefone');
  const petNome = texto(fd, 'petNome');
  const petEspecie = texto(fd, 'petEspecie');
  const petIdade = texto(fd, 'petIdade');
  const aceiteRegulamento = texto(fd, 'aceiteRegulamento') === 'true';
  const querNovidades = texto(fd, 'querNovidades') === 'true';

  if (tutorNome.length < 3) return erro('Informe seu nome completo.', 400, 'tutorNome');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(tutorEmail))
    return erro('E-mail inválido.', 400, 'tutorEmail');

  const digitos = tutorTelefone.replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 13)
    return erro('Telefone inválido.', 400, 'tutorTelefone');

  if (!petNome) return erro('Informe o nome do seu pet.', 400, 'petNome');
  if (!['Cão', 'Gato'].includes(petEspecie))
    return erro('Selecione a espécie do pet.', 400, 'petEspecie');
  if (!aceiteRegulamento)
    return erro('É necessário aceitar o regulamento.', 400, 'aceiteRegulamento');

  const foto = fd.get('petFoto');
  if (!(foto instanceof File) || foto.size === 0)
    return erro('A foto do pet é obrigatória.', 400, 'petFoto');
  if (!TIPOS_ACEITOS.includes(foto.type))
    return erro('Formato inválido. Use JPG, PNG ou WebP.', 400, 'petFoto');
  if (foto.size > MAX_FOTO_BYTES)
    return erro('A foto deve ter no máximo 5 MB.', 400, 'petFoto');

  /* ---------------------------------------------------------- persistência */

  try {
    await fs.mkdir(DIR_FOTOS, { recursive: true });

    // Deduplica por tutor + pet: reinscribir la misma mascota no crea otra ficha.
    const chave = `${tutorEmail.toLowerCase()}|${petNome.toLowerCase()}`;
    const existentes = await fs
      .readFile(ARQUIVO_INSCRICOES, 'utf-8')
      .catch(() => '');
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
      tutorEmail,
      tutorTelefone,
      petNome,
      petEspecie,
      petIdade: petIdade || null,
      fotoArquivo: nomeArquivo,
      querNovidades,
      aceiteRegulamento,
      criadoEm: new Date().toISOString(),
    };

    await fs.appendFile(ARQUIVO_INSCRICOES, `${JSON.stringify(ficha)}\n`, 'utf-8');

    return json(
      {
        success: true,
        id,
        message: `${petNome} foi inscrito no Cãocurso. Assim que a foto for aprovada, o perfil entra na votação.`,
        urlVotacao: `/votacao/${id}`,
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
