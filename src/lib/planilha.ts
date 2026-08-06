import {
  PLANILHA_WEBHOOK_URL,
  PLANILHA_WEBHOOK_TOKEN,
  SITE_URL,
} from 'astro:env/server';
import { supabase } from './supabase';

/**
 * A PLANILHA DO JÚRI E DO CRM.
 *
 * Depois de cada inscrição salva, o servidor manda a lista **inteira** para um
 * Web App do Google Apps Script, que reescreve a aba.
 *
 * ── Por que empurrar e não a planilha puxar ─────────────────────────────────
 *
 * Puxar exigiria que a planilha alcançasse este servidor, e quem executa o
 * script é uma máquina da Google, de fora. Enquanto o domínio não estiver no
 * ar não há nada que ela possa chamar — nem para testar. Empurrando, o único
 * que precisa ser público é a URL do Web App, e essa a Google já publica.
 *
 * O caminho de puxar continua existindo em `GET /api/exportar`: é o conserto
 * manual quando a planilha ficar para trás.
 *
 * ── Por que a lista inteira e não só a linha nova ───────────────────────────
 *
 * São 50 fichas: o envio pesa uns poucos KB, e em troca o processo fica
 * **idempotente**. Um append perde a linha se um envio falhar, duplica se for
 * reenviado e — o que importa de verdade — deixa na planilha para sempre quem
 * exercer o direito de exclusão (LGPD art. 18). Reescrevendo tudo, o próximo
 * envio corrige as três coisas sozinho.
 *
 * ── O CPF não vai ───────────────────────────────────────────────────────────
 *
 * Para premiar e para contatar não acrescenta nada, e é o dado que transforma
 * um vazamento chato num vazamento grave. Fica no Supabase.
 */

/** Nomes das colunas, na ordem em que a planilha as escreve. */
export const COLUNAS = [
  'Nome do tutor',
  'E-mail',
  'Telefone',
  'Nome do pet',
  'Raça',
  'Sexo',
  'Descrição',
  'Data da inscrição',
  'Foto',
] as const;

export interface Planilha {
  atualizadoEm: string;
  total: number;
  colunas: readonly string[];
  linhas: string[][];
}

/**
 * Monta a planilha a partir do banco.
 *
 * `origem` é o endereço público deste site, usado para montar o link da foto.
 * Vem de `SITE_URL` quando está definido e, senão, da origem da requisição que
 * disparou isto — que em desenvolvimento é `http://localhost:4321`, e serve.
 */
export async function montarPlanilha(origem: string): Promise<Planilha> {
  /* `excluido_em is null` não é detalhe: é a metade da exclusão LGPD. A outra
     metade é reescrever a aba inteira em vez de acrescentar linhas. */
  const { data, error } = await supabase
    .from('cao_inscricao')
    .select(
      'id, tutor_nome, tutor_email, tutor_telefone, pet_nome, pet_raca, pet_sexo, pet_descricao, criado_em'
    )
    .is('excluido_em', null)
    .order('criado_em', { ascending: true });

  if (error) throw new Error(error.message);

  const base = (SITE_URL || origem).replace(/\/+$/, '');

  const linhas = (data ?? []).map((r) => [
    r.tutor_nome,
    r.tutor_email,
    r.tutor_telefone,
    r.pet_nome,
    r.pet_raca ?? '',
    r.pet_sexo ?? '',
    r.pet_descricao ?? '',
    r.criado_em,
    `${base}/foto/${r.id}`,
  ]);

  return {
    atualizadoEm: new Date().toISOString(),
    total: linhas.length,
    colunas: COLUNAS,
    linhas,
  };
}

/** Quanto se espera pela Google antes de desistir deste envio. */
const TEMPO_LIMITE_MS = 20_000;

/**
 * Manda a planilha ao Web App. Devolve o que aconteceu, sem lançar.
 *
 * O Apps Script responde com um 302 para `script.googleusercontent.com`; o
 * `fetch` o segue sozinho. Um 200 com HTML no corpo em vez de JSON costuma
 * significar que o deployment está como «apenas eu» em vez de «qualquer
 * pessoa»: a Google devolve a tela de login.
 */
async function enviar(planilha: Planilha): Promise<void> {
  const resposta = await fetch(PLANILHA_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: PLANILHA_WEBHOOK_TOKEN, ...planilha }),
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
  });

  const corpo = (await resposta.text()).slice(0, 300);

  if (!resposta.ok) {
    throw new Error(`${resposta.status} — ${corpo}`);
  }
  if (!corpo.includes('"ok":true')) {
    throw new Error(`resposta inesperada — ${corpo}`);
  }
}

/**
 * Sincroniza a planilha **sem fazer o usuário esperar**.
 *
 * Não devolve promessa de propósito. A inscrição já está salva no Supabase
 * quando isto é chamado: se a Google estiver fora do ar, o que não pode
 * acontecer é o formulário responder erro a alguém cuja ficha ficou gravada.
 * A planilha se acerta no envio seguinte, ou à mão por `GET /api/exportar`.
 *
 * Sem as duas variáveis configuradas não faz nada — que é o estado correto
 * enquanto a planilha não existir.
 */
export function sincronizarPlanilha(origem: string): void {
  if (!PLANILHA_WEBHOOK_URL || !PLANILHA_WEBHOOK_TOKEN) return;

  void montarPlanilha(origem)
    .then(enviar)
    .catch((e: unknown) => {
      console.error('planilha:', e instanceof Error ? e.message : e);
    });
}
