/**
 * AS COLUNAS DA PLANILHA — a fonte única.
 *
 * ── Por que este arquivo existe ─────────────────────────────────────────────
 *
 * Porque a alternativa já falhou. As colunas viviam em dois lugares:
 * `src/lib/planilha.ts` —que o servidor usa— e uma cópia à mão dentro de
 * `scripts/limpar-inscricoes.mjs`. Estava anotado como «a única costura frágil
 * deste script», e uma costura anotada continua sendo uma costura: quando o CPF
 * entrou na lista, uma das duas cópias ficou para trás.
 *
 * É `.mjs` e não `.ts` pelo mesmo motivo que `s3.mjs`: `planilha.ts` importa
 * `astro:env`, que fora do Astro não existe, então o script de manutenção não
 * pode importá-lo. Aqui não há nada de Astro — só as colunas e como se monta
 * uma linha — e por isso os dois lados podem importar o MESMO arquivo.
 *
 * ── O CPF vai, e vai de propósito ───────────────────────────────────────────
 *
 * Houve uma versão sem ele, com um raciocínio que parecia bom: é o dado que
 * transforma um vazamento chato num vazamento grave. Estava errado para esta
 * campanha. O briefing pede «CPF cadastrado no Clube Condor», o cliente o
 * tornou obrigatório em 2026-08-06, e **o cruzamento com a base de sócios é
 * manual, feito por uma pessoa em cima desta planilha**. Sem a coluna,
 * exigia-se de 50 pessoas um dado que ninguém conseguia usar.
 *
 * ⚠️ A contrapartida não é técnica: a planilha deixou de ser uma lista de nomes
 * de pets e passou a ser um cadastro com CPF. Compartilhamento por conta
 * nomeada, e só a quem precisa. Ver `docs/PLATAFORMA.md` §3.
 */

/**
 * Nomes das colunas, na ordem em que a planilha as escreve.
 *
 * ⚠️ Mudar esta lista reescreve a aba inteira no envio seguinte — cabeçalho e
 * linhas. Não há migração a fazer, mas fórmulas que alguém tenha posto ao lado
 * apontando para colunas fixas passam a apontar para outra coisa.
 */
export const COLUNAS = [
  'Nome do tutor',
  'Nascimento',
  'CPF',
  'E-mail',
  'Telefone',
  'Nome do pet',
  'Raça',
  'Sexo',
  'Descrição',
  'Data da inscrição',
  'Foto',
];

/** O `select()` do PostgREST que alimenta `montarLinhas`. */
export const SELECT_FICHAS =
  'id, tutor_nome, tutor_nascimento, tutor_cpf, tutor_email, tutor_telefone, ' +
  'pet_nome, pet_raca, pet_sexo, pet_descricao, criado_em';

/**
 * `04812345678` → `048.123.456-78`.
 *
 * ⚠️ **A máscara não é enfeite: é o que impede o Sheets de comer o zero da
 * frente.** Onze dígitos seguidos são um número para uma planilha, e um número
 * não guarda zeros à esquerda: `04812345678` viraria `4812345678`, e o CPF que
 * alguém vai cruzar à mão com a base do Clube ficaria errado sem avisar nunca.
 * Com pontos e traço é texto, sem discussão. O Apps Script ainda força a coluna
 * a formato de texto, que é a segunda rede.
 */
export function formatarCpf(cpf) {
  if (!cpf || cpf.length !== 11) return cpf ?? '';
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

/**
 * `41988887777` → `(41) 98888-7777`.
 *
 * O banco guarda só dígitos —de 10 a 13, o que valida o endpoint— e na planilha
 * isso chegava como um bloco que ninguém consegue ler nem copiar para discar.
 *
 * Os quatro casos que existem, e nenhum se inventa:
 *
 *   13  55 + DDD + 9 dígitos   →  +55 (41) 98888-7777
 *   12  55 + DDD + 8 dígitos   →  +55 (41) 3333-4444
 *   11  DDD + 9 dígitos        →  (41) 98888-7777      celular
 *   10  DDD + 8 dígitos        →  (41) 3333-4444       fixo
 *
 * O `55` se mantém quando veio, em vez de recortá-lo: quem o escreveu tinha um
 * motivo, e a planilha alimenta o CRM. **Qualquer outro tamanho volta como
 * está** — uma célula feia é melhor do que um telefone mutilado por uma regra
 * que não previa esse caso.
 *
 * ⚠️ **Com 11 dígitos, um `55` na frente NÃO se recorta**, e isso é deliberado:
 * `55` também é o DDD de Santa Maria (RS). Recortá-lo transformaria
 * `(55) 41998-4504` num número de nove dígitos que não existe. Só a partir de
 * 12 dígitos há espaço para código de país E DDD, e aí sim se separa.
 */
export function formatarTelefone(tel) {
  if (!tel) return '';

  const pais = (tel.length === 12 || tel.length === 13) && tel.startsWith('55');
  const local = pais ? tel.slice(2) : tel;
  if (local.length !== 10 && local.length !== 11) return tel;

  const ddd = local.slice(0, 2);
  const corpo = local.slice(2);
  const meio = corpo.length === 9 ? corpo.slice(0, 5) : corpo.slice(0, 4);
  const fim = corpo.length === 9 ? corpo.slice(5) : corpo.slice(4);

  return `${pais ? '+55 ' : ''}(${ddd}) ${meio}-${fim}`;
}

/**
 * `1984-05-12` → `12/05/1984`.
 *
 * Vai como TEXTO, e não convertida a data de verdade como a data de inscrição.
 * O motivo é um erro de um dia: `new Date('1984-05-12')` é meia-noite em UTC, e
 * em Brasília isso ainda é o dia 11 — a planilha mostraria uma data de
 * nascimento trocada. Como texto no formato brasileiro não há fuso que a mova.
 */
export function formatarNascimento(data) {
  if (!data) return '';
  const [ano, mes, dia] = data.slice(0, 10).split('-');
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

/**
 * As fichas do banco, na ordem de `COLUNAS`.
 *
 * `base` é o endereço público do site: o link da foto é `/foto/<id>` e não uma
 * URL do storage, porque aquela expira em minutos e esta não expira nunca.
 */
export function montarLinhas(registros, base) {
  return (registros ?? []).map((r) => [
    r.tutor_nome,
    formatarNascimento(r.tutor_nascimento),
    formatarCpf(r.tutor_cpf),
    r.tutor_email,
    formatarTelefone(r.tutor_telefone),
    r.pet_nome,
    r.pet_raca ?? '',
    r.pet_sexo ?? '',
    r.pet_descricao ?? '',
    r.criado_em,
    `${base}/foto/${r.id}`,
  ]);
}
