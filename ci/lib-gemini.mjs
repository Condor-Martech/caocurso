/**
 * Cliente Gemini compartilhado pelos agentes de CI.
 *
 * Usado por `agente-revisor.mjs` e `agente-qa.mjs`. Fica em um só lugar de
 * propósito: as duas cópias divergiriam, e a política de retentativa é
 * exatamente o tipo de detalhe que se corrige em um arquivo e se esquece no
 * outro.
 *
 * Trata três coisas que a chamada crua não trata:
 *
 *   1. Erros transitórios (503 "high demand", 500, 502, 504) — retenta com
 *      espera crescente. Um pico de demanda de segundos não deve derrubar a
 *      camada de LLM da execução inteira, que foi o que aconteceu no PR #4.
 *   2. 429 — retenta **uma** vez com espera longa. Se for cota esgotada não
 *      adianta insistir; se for limite por minuto, uma pausa resolve.
 *   3. thinkingLevel — só existe a partir do Gemini 3. Se o modelo configurado
 *      não aceitar, repete sem o parâmetro em vez de perder a chamada.
 */

const API = "https://generativelanguage.googleapis.com/v1beta";

const TRANSITORIOS = new Set([500, 502, 503, 504]);
const ESPERAS_MS = [2000, 6000, 15000];

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function postar({ modelo, apiKey, prompt, generationConfig }) {
  const r = await fetch(`${API}/models/${modelo}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
  });
  if (!r.ok) {
    const corpo = (await r.text()).slice(0, 400);
    const e = new Error(`Gemini HTTP ${r.status}: ${corpo}`);
    e.status = r.status;
    e.corpo = corpo;
    throw e;
  }
  const j = await r.json();
  const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!txt) throw new Error(`resposta sem conteúdo: ${JSON.stringify(j).slice(0, 300)}`);
  return JSON.parse(txt);
}

/**
 * @param {object}   o
 * @param {string}   o.prompt
 * @param {object}   o.esquema        JSON Schema da resposta (structured output)
 * @param {string}   o.apiKey
 * @param {string}   [o.modelo]
 * @param {string}   [o.nivelRaciocinio]  MINIMAL | LOW | MEDIUM | HIGH
 * @param {function} [o.aviso]        callback para mensagens de diagnóstico
 */
export async function consultarGemini({
  prompt, esquema, apiKey,
  modelo = process.env.GEMINI_MODEL || "gemini-3.6-flash",
  nivelRaciocinio = process.env.GEMINI_THINKING_LEVEL || "HIGH",
  aviso = (m) => console.error(`[aviso] ${m}`),
}) {
  let comRaciocinio = true;
  let tentou429 = false;
  const config = () => ({
    temperature: 0.1,
    responseMimeType: "application/json",
    responseSchema: esquema,
    ...(comRaciocinio ? { thinkingConfig: { thinkingLevel: nivelRaciocinio } } : {}),
  });

  for (let i = 0; ; i++) {
    try {
      return await postar({ modelo, apiKey, prompt, generationConfig: config() });
    } catch (e) {
      if (e.status === 400 && /thinking/i.test(e.corpo || "") && comRaciocinio) {
        aviso(`modelo ${modelo} não aceita thinkingLevel; repetindo sem raciocínio estendido`);
        comRaciocinio = false;
        continue;                       // não consome tentativa
      }
      if (e.status === 429 && !tentou429) {
        tentou429 = true;
        aviso("429 recebido; aguardando 20s antes de uma única nova tentativa");
        await dormir(20000);
        continue;
      }
      if (TRANSITORIOS.has(e.status) && i < ESPERAS_MS.length) {
        aviso(`HTTP ${e.status} transitório; nova tentativa em ${ESPERAS_MS[i] / 1000}s`);
        await dormir(ESPERAS_MS[i]);
        continue;
      }
      throw e;
    }
  }
}
