import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { estadoInscricao, cpfObrigatorio } from '../../lib/inscricao';
import { formulario } from '../../data/site';
import {
  supabase,
  PG_DUPLICADO,
  PG_VAGAS_ESGOTADAS,
  PG_AINDA_NAO_ABRIU,
  PG_PERIODO_ENCERRADO,
} from '../../lib/supabase';
import { processarFoto, FotoInvalida } from '../../lib/foto';
import { guardarFoto, removerFoto } from '../../lib/storage';
import { sincronizarPlanilha } from '../../lib/planilha';
import { ipDoPedido, registrarTentativa } from '../../lib/limite';

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
 *     petFoto             JPG / PNG / WebP, máximo 25 MB (el navegador la reduce
 *                         antes de subir; el servidor la reprocesa igual)
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
 * Persistencia: la ficha va a la tabla `cao_inscricao` de Supabase y la foto al
 * bucket privado, siempre a través de `lib/storage.ts` — que es la única pieza
 * que sabe dónde viven las fotos. La tabla guarda la KEY, nunca la URL.
 *
 * Antes esto escribía en disco (uploads/ + inscricoes.jsonl). Servía para
 * probar, pero no como destino: sin consultas, sin copia de seguridad, sin
 * forma de que el jurado y el CRM accedan sin entrar al servidor, y con la
 * deduplicación dependiendo de releer un fichero entero en cada envío.
 */

/* Techo contra abusos, NO una restricción de almacenamiento.
 *
 * Eran 2 MB, y eso rechazaba a casi todo el mundo: prácticamente ningún móvil
 * actual produce una foto de menos de 2 MB (un iPhone da 3-6 MB, un Samsung de
 * 200MP hasta 40). El límite venía de cuando la foto se guardaba tal cual en
 * disco; ahora `processarFoto` la recodifica a WebP de ~250 KB, así que da
 * igual con qué tamaño entre.
 *
 * Sigue habiendo un tope porque el cuerpo de la petición se buferiza en
 * memoria antes de procesarse.
 *
 * ⚠️ Al desplegar detrás de Nginx hay que subir `client_max_body_size` (por
 * defecto son 1 MB): si no, el usuario recibe un 413 del proxy y este código
 * no llega a ejecutarse nunca. */
const MAX_FOTO_BYTES = 25 * 1024 * 1024;
const MAX_DESCRICAO = 1000;

/* Prueba de consentimiento (LGPD).
 *
 * Se guarda un array de `{tipo, versao, texto_sha256, em}` y no un booleano,
 * porque hay que poder demostrar QUÉ TEXTO EXACTO aceptó cada persona. El hash
 * se calcula sobre el texto real que se le mostró: si mañana cambia la
 * redacción, las fichas viejas siguen apuntando a la que estaba vigente.
 *
 * ⚠️ Pendiente: este único texto agrupa tres finalidades distintas —participar,
 * ceder la imagen del pet y ceder los datos para divulgación—. Bajo LGPD
 * requieren consentimientos separados. Hay que resolverlo ANTES de abrir el
 * formulario al público: con inscripciones ya recogidas no se puede arreglar.
 * Y si los contactos van a alimentar el CRM, esa es una cuarta finalidad que
 * el texto actual tampoco menciona. */
const CONSENTIMENTO_VERSAO = '2026-1';
const CONSENTIMENTO_TEXTO = formulario.aceite;
const CONSENTIMENTO_SHA256 = createHash('sha256')
  .update(CONSENTIMENTO_TEXTO, 'utf8')
  .digest('hex');

/* Filtro rápido y de cortesía. El `type` lo declara el cliente y se falsea
   renombrando el fichero, así que la comprobación que de verdad vale es la de
   los primeros bytes, dentro de `processarFoto`. Esta sólo sirve para dar un
   mensaje claro y temprano en el caso honesto.

   Nota sobre el iPhone: que HEIC NO esté en esta lista ni en el `accept` del
   input es deliberado. Safari convierte la foto a JPEG al seleccionarla cuando
   el `accept` no admite HEIC; si lo admitiéramos, llegaría HEIC crudo y habría
   que saber decodificarlo. */
const TIPOS_ACEITOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/* Un <input type="checkbox"> marcado manda 'on'. 'true' y '1' se aceptan para
   que la API siga sirviendo a clientes que no sean este formulario (curl, un
   futuro cliente JSON-ish, tests). */
const VALORES_ACEITE = ['on', 'true', '1', 'sim'];

const IDADE_MINIMA = 18;
const IDADE_MAXIMA = 120;

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

export const POST: APIRoute = async ({ request, url }) => {
  /* Lo PRIMERO de todo, antes incluso de mirar el plazo: si alguien está
     insistiendo, no se le lee el cuerpo ni se consulta la campaña. Cada
     petición que llega aquí cuesta una lectura a Supabase y, si trae foto,
     buferizar hasta 25 MB en memoria. Un bucle de `curl` sin esto tumba el
     servidor antes de llenar el concurso. Ver src/lib/limite.ts. */
  const veredicto = registrarTentativa(ipDoPedido(request));
  if (!veredicto.permitido) {
    const minutos = Math.ceil(veredicto.esperaSegundos / 60);
    return json(
      {
        success: false,
        message: `Muitas tentativas. Tente de novo em ${minutos} minuto${minutos > 1 ? 's' : ''}.`,
      },
      429
    );
  }

  /* El período de inscripción se comprueba AQUÍ, y no sólo al pintar el botón.
     Un botón que no aparece es cosmética: la ruta sigue existiendo y acepta un
     POST de `curl` el día después del cierre. Sin esta comprobación
     «Finalizado» no significa nada.

     Va lo primero, antes incluso de leer el cuerpo: si el plazo está cerrado no
     hay motivo para bufferizar la foto entera. */
  const estado = await estadoInscricao();
  if (estado === 'em-breve') {
    return erro('As inscrições ainda não estão abertas.', 403);
  }
  if (estado === 'finalizada') {
    return erro('O período de inscrição está encerrado.', 403);
  }
  /* Rechazo temprano por cupo lleno. No es la comprobación que cuenta —esa la
     hace `criar_inscricao()` bajo bloqueo, y es la única sin carrera— pero
     evita subir la foto para nada cuando ya se sabe que no hay sitio. */
  if (estado === 'esgotada') {
    return erro('As vagas para o Cãocurso já estão esgotadas.', 409);
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

  /* La regla de verdad sobre el CPF, no el `required` del HTML — ese se quita
     desde las herramientas de desarrollo en dos clics. Sale de
     `cao_campanha.cpf_obrigatorio`, la misma fuente que lee el formulario, así
     que encender o apagar el interruptor mueve las dos mitades a la vez. */
  if (!tutorCpf && (await cpfObrigatorio())) {
    return erro('Informe o seu CPF.', 400, 'tutorCpf');
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
    return erro('A foto deve ter no máximo 25 MB.', 400, 'petFoto');
  }

  /* ---------------------------------------------------------- persistência */

  /* Primero la foto, después la ficha. El orden importa:
   *
   * Al revés —fila insertada, subida fallida— quedaría una inscripción
   * apuntando a una imagen inexistente: un dato corrupto que sólo se descubre
   * cuando alguien intenta verla, ya en pleno concurso. En este orden, lo peor
   * que puede quedar es un fichero huérfano, que el `catch` borra y que en el
   * caso más tonto cuesta 250 KB. */
  let fotoKey: string | null = null;

  try {
    const processada = await processarFoto(new Uint8Array(await foto.arrayBuffer()));
    fotoKey = await guardarFoto(processada.bytes, processada.contentType);

    /* Se reparsea la fecha en vez de arrastrarla desde la validación: ya se
       comprobó arriba que es real y que el tutor es mayor de edad, así que
       aquí sólo hace falta el formato que espera Postgres (aaaa-mm-dd). */
    const nascimento = tutorNascimento ? parseData(tutorNascimento) : null;

    /* Se llama a la función y no a `.insert()` directamente porque el cupo no
       se puede comprobar desde aquí sin abrir una carrera: con una plaza libre,
       dos envíos simultáneos leerían 49 los dos e insertarían los dos.
       `criar_inscricao` toma un bloqueo, cuenta e inserta en la misma
       transacción, y además vuelve a validar la ventana — es el único camino
       por el que una inscripción puede entrar. Ver la migración 0002. */
    const { data, error } = await supabase.rpc('criar_inscricao', {
      dados: {
        tutor_nome: tutorNome,
        tutor_nascimento: nascimento ? nascimento.toISOString().slice(0, 10) : null,
        tutor_cpf: tutorCpf ? digitos(tutorCpf) : null,
        tutor_email: tutorEmail,
        tutor_telefone: telefone,

        pet_nome: petNome,
        pet_raca: petRaca || null,
        pet_sexo: petSexo || null,
        pet_especie: petEspecie || null,
        pet_descricao: petDescricao || null,

        /* La KEY, nunca la URL: ver `lib/storage.ts`. */
        foto_key: fotoKey,

        consentimentos: [
          {
            tipo: 'regulamento_e_imagem',
            versao: CONSENTIMENTO_VERSAO,
            texto_sha256: CONSENTIMENTO_SHA256,
            em: new Date().toISOString(),
          },
        ],
      },
    });

    if (error) {
      await removerFoto(fotoKey);

      /* Cupo lleno. Puede llegar aquí aunque el estado leído arriba dijera
         'aberta': entre aquella lectura —cacheada unos segundos— y este
         momento pudo entrar el último. Ésta es la respuesta que vale. */
      if (error.code === PG_VAGAS_ESGOTADAS) {
        return erro('As vagas para o Cãocurso já estão esgotadas.', 409);
      }

      /* La ventana, revalidada por el banco. Sólo se llega aquí si el reloj o
         las fechas cambiaron a mitad de envío. */
      if (error.code === PG_AINDA_NAO_ABRIU) {
        return erro('As inscrições ainda não estão abertas.', 403);
      }
      if (error.code === PG_PERIODO_ENCERRADO) {
        return erro('O período de inscrição está encerrado.', 403);
      }

      /* El duplicado lo decide el índice único, no una lectura previa: dos
         envíos simultáneos leerían los dos antes de que el otro escriba. */
      if (error.code === PG_DUPLICADO) {
        return error.message.includes('cpf')
          ? erro('Este CPF já foi usado em outra inscrição.', 409, 'tutorCpf')
          : erro('Este pet já foi inscrito com esse e-mail.', 409, 'petNome');
      }

      throw error;
    }

    /* La función devuelve el uuid directamente, no una fila. */
    const id = data as unknown as string;

    /* La planilla del jurado, en marcha. Deliberadamente SIN await: la ficha
       ya está guardada, y si Google tarda o falla eso no puede convertirse en
       un error para quien acaba de rellenar once campos. Se corrige sola en el
       envío siguiente. Ver src/lib/planilha.ts. */
    sincronizarPlanilha(url.origin);

    return json(
      {
        success: true,
        id,
        message: `Inscrição enviada! ${petNome} vai concorrer no Cãocurso.`,
      },
      201
    );
  } catch (e) {
    /* La foto ya subió pero la ficha no llegó a existir: no dejarla ahí. */
    if (fotoKey) await removerFoto(fotoKey);

    /* Imagen ilegible o disfrazada: es culpa del envío, no del servidor, y el
       usuario puede arreglarlo eligiendo otra foto. */
    if (e instanceof FotoInvalida) {
      return erro(e.message, 400, 'petFoto');
    }

    console.error('Erro ao salvar inscrição:', e);
    return erro('Não foi possível concluir a inscrição. Tente novamente.', 500);
  }
};

/** Cualquier método que no sea POST. */
export const ALL: APIRoute = () =>
  json({ success: false, message: 'Método não permitido.' }, 405);
