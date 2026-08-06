import { createHash, createHmac } from 'node:crypto';

/**
 * CLIENTE S3 MÍNIMO, FIRMADO A MANO (AWS SigV4).
 *
 * Cuatro operaciones —subir, firmar una URL de lectura, borrar y listar— contra
 * el MinIO de `s3.cndr.me`. Nada más, porque nada más se usa.
 *
 * ── Por qué no un SDK ───────────────────────────────────────────────────────
 *
 * Se miraron los dos candidatos antes de escribir esto:
 *
 *   minio 8.0.7          2,1 MB · 13 dependencias (lodash, xml2js, query-string,
 *                        stream-json, through2…)
 *   @aws-sdk/client-s3   3,3 MB · 11 paquetes con ámbito que arrastran decenas
 *
 * Este proyecto tiene NUEVE dependencias en total. Meter trece más —y lodash—
 * para cuatro llamadas HTTP es cambiar 150 líneas legibles por un árbol de
 * dependencias que nadie va a auditar y que hay que ir actualizando durante
 * años por vulnerabilidades de código que no usamos.
 *
 * ── Y por qué es defendible firmar a mano ───────────────────────────────────
 *
 * Firmar a mano es una fuente clásica de errores sutiles, así que esto no se
 * escribió «a ver si sale»: se validó contra el servidor real, operación por
 * operación, ANTES de integrarlo. Subir, firmar y abrir, comprobar que sin firma
 * sigue dando 403, listar y borrar.
 *
 * Lo que hace que el riesgo sea acotado es el tamaño del problema: son cuatro
 * verbos, un solo servicio, una sola región y ningún caso raro de los que
 * complican SigV4 —ni multipart, ni chunked, ni STS, ni virtual-host style—.
 *
 * ── Dos cosas que costaron encontrar ────────────────────────────────────────
 *
 * **La región es `us-east`, no `us-east-1`.** MinIO la compara literal y
 * devuelve `AuthorizationHeaderMalformed` si no coincide. Es un valor de
 * configuración, no una constante, pero conviene saber que ese error significa
 * eso y no una credencial mala.
 *
 * **`s3.cndr.me` está detrás de Cloudflare, que filtra por User-Agent.** Un
 * cliente con UA de script recibe `error code: 1010` —«banned based on your
 * browser's signature»— antes de llegar a MinIO. El `fetch` de Node pasa; si
 * algún día una herramienta de mantenimiento falla con 1010, es esto y no la
 * clave.
 */

const ALGORITMO = 'AWS4-HMAC-SHA256';

/**
 * Quanto se espera pelo MinIO antes de desistir.
 *
 * Sem isto o `fetch` do Node espera o padrão da plataforma —minutos— e quem se
 * inscreveu fica olhando «Enviando…» sem saber se pode fechar. Vinte segundos
 * é folgado para uma foto de ~250 KB e curto o bastante para que a mensagem de
 * erro chegue enquanto a pessoa ainda está na página.
 *
 * O mesmo número que `lib/planilha.ts` usa para o Apps Script, e pelo mesmo
 * motivo.
 */
const TEMPO_LIMITE_MS = 20_000;

const sha256 = (dados) => createHash('sha256').update(dados).digest('hex');
const hmac = (chave, dados) => createHmac('sha256', chave).update(dados).digest();

/**
 * A chave de assinatura do dia.
 *
 * A AWS deriva uma chave por dia, região e serviço em vez de assinar com o
 * segredo direto: assim uma assinatura vazada não serve nem para amanhã nem
 * para outro serviço.
 */
function chaveDeAssinatura(segredo, dia, regiao, servico) {
  let chave = Buffer.from(`AWS4${segredo}`);
  for (const parte of [dia, regiao, servico, 'aws4_request']) {
    chave = hmac(chave, parte);
  }
  return chave;
}

/** `20260806T171530Z` e `20260806`, que é o que a assinatura pede. */
function marcasDeTempo(agora = new Date()) {
  const amz = agora.toISOString().replace(/[-:]|\.\d{3}/g, '');
  return { amz, dia: amz.slice(0, 8) };
}

/**
 * Cada segmento do caminho vai percent-encoded, mas as barras NÃO.
 *
 * `encodeURIComponent` deixa `!'()*` sem escapar e a AWS os quer escapados;
 * daí o retoque. Com keys de UUID isto nunca chega a importar, mas o dia em
 * que alguém mude o formato da key, importa — e o sintoma seria uma assinatura
 * inválida sem explicação.
 */
function codificarCaminho(caminho) {
  return caminho
    .split('/')
    .map((seg) =>
      encodeURIComponent(seg).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    )
    .join('/');
}

/**
 * Um cliente amarrado a um endpoint, uma região e um par de credenciais.
 *
 * `endpoint` vem sem barra final e com esquema: `https://s3.cndr.me`.
 */
export function criarClienteS3({ endpoint, regiao, accessKey, secretKey }) {
  if (!endpoint || !accessKey || !secretKey) {
    throw new Error('Cliente S3 sem endpoint ou sem credenciais.');
  }

  const base = endpoint.replace(/\/+$/, '');
  const host = new URL(base).host;
  const servico = 's3';

  /**
   * Assina na cabeçalho `Authorization`. É o que se usa para PUT, DELETE e GET
   * de listagem — pedidos que este servidor faz por sua conta.
   */
  async function pedir(metodo, caminho, { query = {}, corpo, contentType } = {}) {
    const { amz, dia } = marcasDeTempo();
    const carga = corpo ?? Buffer.alloc(0);
    const hashCarga = sha256(carga);

    const cabecalhos = {
      host,
      'x-amz-content-sha256': hashCarga,
      'x-amz-date': amz,
    };
    if (contentType) cabecalhos['content-type'] = contentType;

    const nomes = Object.keys(cabecalhos).sort();
    const canonicasCabecalhos = nomes.map((n) => `${n}:${cabecalhos[n]}\n`).join('');
    const assinadas = nomes.join(';');

    /* A query canônica vai ORDENADA e no seu próprio campo, nunca dentro do
       caminho. Metê-la no caminho é o erro que devolve 403 sem dizer por quê. */
    const q = new URLSearchParams(query);
    q.sort();
    const queryCanonica = q.toString();

    const canonico = [
      metodo,
      `/${codificarCaminho(caminho)}`,
      queryCanonica,
      canonicasCabecalhos,
      assinadas,
      hashCarga,
    ].join('\n');

    const escopo = `${dia}/${regiao}/${servico}/aws4_request`;
    const aAssinar = [ALGORITMO, amz, escopo, sha256(canonico)].join('\n');
    const assinatura = createHmac('sha256', chaveDeAssinatura(secretKey, dia, regiao, servico))
      .update(aAssinar)
      .digest('hex');

    /* `host` sai dos cabeçalhos que se enviam: o `fetch` o põe sozinho e
       duplicá-lo é erro. Continua dentro dos assinados, que é onde conta. */
    const enviar = { ...cabecalhos };
    delete enviar.host;
    enviar.Authorization =
      `${ALGORITMO} Credential=${accessKey}/${escopo}, ` +
      `SignedHeaders=${assinadas}, Signature=${assinatura}`;

    const url = `${base}/${codificarCaminho(caminho)}${queryCanonica ? `?${queryCanonica}` : ''}`;
    return fetch(url, {
      method: metodo,
      headers: enviar,
      body: carga.length ? carga : undefined,
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
  }

  return {
    /** Sobe um objeto. Devolve `true` se o servidor aceitou. */
    async subir(caminho, bytes, contentType) {
      const r = await pedir('PUT', caminho, { corpo: bytes, contentType });
      if (!r.ok) {
        const detalhe = (await r.text()).slice(0, 200);
        throw new Error(`PUT ${r.status}: ${detalhe}`);
      }
      return true;
    },

    /**
     * URL de leitura assinada na query, válida por `segundos`.
     *
     * Não faz nenhuma requisição: é aritmética. Por isso não sabe se o objeto
     * existe — quem a abrir receberá 404 se não estiver lá, e é o comportamento
     * correto para `/foto/<id>`.
     *
     * `UNSIGNED-PAYLOAD` porque num GET não há corpo que assinar, e é o que a
     * especificação manda pôr no lugar do hash.
     */
    urlAssinada(caminho, segundos = 300) {
      const { amz, dia } = marcasDeTempo();
      const escopo = `${dia}/${regiao}/${servico}/aws4_request`;

      const q = new URLSearchParams({
        'X-Amz-Algorithm': ALGORITMO,
        'X-Amz-Credential': `${accessKey}/${escopo}`,
        'X-Amz-Date': amz,
        'X-Amz-Expires': String(segundos),
        'X-Amz-SignedHeaders': 'host',
      });
      q.sort();

      const canonico = [
        'GET',
        `/${codificarCaminho(caminho)}`,
        q.toString(),
        `host:${host}\n`,
        'host',
        'UNSIGNED-PAYLOAD',
      ].join('\n');

      const aAssinar = [ALGORITMO, amz, escopo, sha256(canonico)].join('\n');
      const assinatura = createHmac('sha256', chaveDeAssinatura(secretKey, dia, regiao, servico))
        .update(aAssinar)
        .digest('hex');

      return `${base}/${codificarCaminho(caminho)}?${q.toString()}&X-Amz-Signature=${assinatura}`;
    },

    /** Apaga um objeto. Um 404 conta como apagado: o objetivo é que não esteja. */
    async apagar(caminho) {
      const r = await pedir('DELETE', caminho);
      if (!r.ok && r.status !== 404) {
        const detalhe = (await r.text()).slice(0, 200);
        throw new Error(`DELETE ${r.status}: ${detalhe}`);
      }
      return true;
    },

    /**
     * Lista as keys de um bucket com um prefixo. Segue a paginação sozinha.
     *
     * O XML se lê com um regex e não com um parser porque a resposta de
     * `ListObjectsV2` é plana e conhecida — trazer um parser de XML para extrair
     * `<Key>` seria a mesma troca que se recusou ao não usar um SDK.
     */
    async listar(bucket, prefixo = '', limite = 1000) {
      const keys = [];
      let token;

      do {
        const query = { 'list-type': '2', 'max-keys': String(Math.min(limite, 1000)) };
        if (prefixo) query.prefix = prefixo;
        if (token) query['continuation-token'] = token;

        const r = await pedir('GET', bucket, { query });
        if (!r.ok) {
          const detalhe = (await r.text()).slice(0, 200);
          throw new Error(`LIST ${r.status}: ${detalhe}`);
        }
        const xml = await r.text();

        for (const m of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) {
          keys.push(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
        }

        const truncado = /<IsTruncated>true<\/IsTruncated>/.test(xml);
        const prox = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
        token = truncado && prox ? prox[1] : undefined;
      } while (token && keys.length < limite);

      return keys;
    },
  };
}
