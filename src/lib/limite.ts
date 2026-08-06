/**
 * LÍMITE DE INTENTOS POR IP.
 *
 * Sin esto, nada impide que alguien queme las 50 plazas con un bucle de `curl`.
 * No hay CAPTCHA ni cuenta de usuario: el formulario es abierto por diseño, así
 * que la única barrera posible es contar.
 *
 * ── Por qué en memoria y no en el banco ─────────────────────────────────────
 *
 * Contar en Postgres sería una escritura más por intento —incluidos los que se
 * van a rechazar—, y un atacante con un bucle acabaría escribiendo en la base
 * más rápido que las personas de verdad. Aquí no sale del proceso.
 *
 * El precio es que **se reinicia con el contenedor**. Da igual: el objetivo no
 * es ser infranqueable, es que un script tonto no llene el concurso en un
 * minuto. Quien reinicie el servidor para saltárselo tiene problemas peores.
 *
 * Y funciona porque hay **una sola instancia**. Si algún día hay dos detrás de
 * un balanceador, cada una contará por su cuenta y el límite real se duplica —
 * momento en el que esto tiene que mudarse a Redis o a la propia base.
 *
 * ── Los números ─────────────────────────────────────────────────────────────
 *
 * Once campos, una foto y una máscara de CPF: una persona normal envía una o
 * dos veces, y tres o cuatro si se equivoca. Ocho intentos en diez minutos deja
 * sitio de sobra para eso y corta un bucle en el segundo asalto.
 *
 * ⚠️ Se cuentan TODOS los intentos, no sólo los que acaban en inscripción. Si
 * sólo se contaran los buenos, probar contraseñas —o CPFs— saldría gratis.
 */

/** Cuántos intentos se permiten dentro de la ventana. */
const MAXIMO = 8;

/** Tamaño de la ventana. */
const JANELA_MS = 10 * 60 * 1000;

/**
 * Cada cuánto se barre lo viejo.
 *
 * Sin esto el mapa crece con cada IP que pase por aquí y no se vacía nunca: en
 * un proceso de larga vida —que es justo lo que es este contenedor— eso es una
 * fuga de memoria lenta pero segura.
 */
const LIMPEZA_MS = 5 * 60 * 1000;

const tentativas = new Map<string, number[]>();
let ultimaLimpeza = Date.now();

/**
 * La IP de quien llama.
 *
 * Detrás del nginx la conexión viene de `127.0.0.1`, así que la dirección real
 * está en `X-Forwarded-For` — el primer valor de la lista, que es el cliente;
 * los siguientes son los proxies por los que pasó.
 *
 * ⚠️ Esa cabecera la puede escribir cualquiera. Aquí sirve porque **el nginx la
 * reescribe** (`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`),
 * de modo que lo que llega es lo que él vio. Si un día el contenedor quedara
 * expuesto directamente a internet, esto dejaría de valer y habría que pasar a
 * la dirección del socket.
 */
export function ipDoPedido(request: Request): string {
  const encaminhado = request.headers.get('x-forwarded-for');
  if (encaminhado) {
    const primeiro = encaminhado.split(',')[0]?.trim();
    if (primeiro) return primeiro;
  }
  return request.headers.get('x-real-ip')?.trim() || 'desconhecido';
}

export interface Veredicto {
  permitido: boolean;
  /** Segundos que faltan para volver a poder intentar. Sólo si `permitido` es false. */
  esperaSegundos: number;
}

/**
 * Registra un intento y dice si se permite.
 *
 * Se llama **una vez por petición** y con eso ya cuenta: llamarla dos veces
 * gastaría dos intentos de los ocho.
 */
export function registrarTentativa(ip: string, agora = Date.now()): Veredicto {
  if (agora - ultimaLimpeza > LIMPEZA_MS) {
    for (const [chave, marcas] of tentativas) {
      const vivas = marcas.filter((m) => agora - m < JANELA_MS);
      if (vivas.length) tentativas.set(chave, vivas);
      else tentativas.delete(chave);
    }
    ultimaLimpeza = agora;
  }

  const marcas = (tentativas.get(ip) ?? []).filter((m) => agora - m < JANELA_MS);

  if (marcas.length >= MAXIMO) {
    /* La espera se mide desde el intento MÁS ANTIGUO que sigue contando: es el
       primero que va a caer de la ventana y dejar sitio. */
    const maisAntiga = marcas[0]!;
    const espera = Math.ceil((JANELA_MS - (agora - maisAntiga)) / 1000);
    tentativas.set(ip, marcas);
    return { permitido: false, esperaSegundos: Math.max(1, espera) };
  }

  marcas.push(agora);
  tentativas.set(ip, marcas);
  return { permitido: true, esperaSegundos: 0 };
}

/** Sólo para las pruebas: deja el contador como recién arrancado. */
export function zerarLimite(): void {
  tentativas.clear();
  ultimaLimpeza = Date.now();
}
