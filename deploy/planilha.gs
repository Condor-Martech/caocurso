/**
 * Cãocurso 2026 — sincronização da planilha do júri e do CRM.
 *
 * ── Como instalar ───────────────────────────────────────────────────────────
 *
 *  1. Crie a planilha e compartilhe POR CONTA NOMINAL com o júri e o CRM.
 *     Nunca «qualquer pessoa com o link»: é o vetor de vazamento número um, e
 *     a planilha leva nome, e-mail e telefone de gente real.
 *  2. Extensões → Apps Script. Cole este arquivo por cima do que houver lá.
 *  3. Ajuste `URL` logo abaixo para o domínio de produção.
 *  4. Salve e recarregue a planilha. Vai aparecer o menu «Cãocurso».
 *  5. Menu → «Configurar token…» e cole o valor de EXPORTACAO_TOKEN.
 *  6. Menu → «Ativar atualização automática».
 *
 * ── Por que reescrever a aba inteira ────────────────────────────────────────
 *
 * Não é por desempenho. Quando alguém exerce o direito de exclusão (LGPD art.
 * 18), a linha some da consulta — mas com um sync que só acrescenta, essa
 * pessoa **fica na planilha para sempre**, e acabou-se de descumprir justamente
 * o que se acreditava ter cumprido. Reescrevendo tudo, ela some sozinha no
 * ciclo seguinte. De brinde, as correções se propagam e é idempotente.
 */

var CONFIG = {
  // ⚠️ Trocar pelo domínio de produção. Contra localhost não funciona: quem
  // chama é um servidor da Google, de fora.
  URL: 'https://pet.condor.com.br/api/exportar',
  ABA: 'Inscrições',
  MINUTOS: 15,
};

/* ─────────────────────────────────────────────────────────────── menu ──── */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Cãocurso')
    .addItem('Atualizar agora', 'atualizar')
    .addSeparator()
    .addItem('Configurar token…', 'configurarToken')
    .addItem('Ativar atualização automática', 'instalarGatilho')
    .addItem('Desativar atualização automática', 'removerGatilho')
    .addToUi();
}

/**
 * O token vai nas propriedades do script, não escrito aqui.
 *
 * Não é grande proteção —quem edita a planilha consegue lê-lo— mas evita o pior
 * caso: que o segredo viaje numa cópia da planilha ou num print. Por isso o
 * token do endpoint NÃO é a service_role do Supabase: se este vazar, expõe esta
 * lista; a outra exporia o banco inteiro.
 */
function configurarToken() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Token de exportação', 'Cole o valor de EXPORTACAO_TOKEN:', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;

  var token = r.getResponseText().trim();
  if (!token) {
    ui.alert('Token vazio. Nada foi salvo.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('TOKEN', token);
  ui.alert('Token salvo. Use «Atualizar agora» para testar.');
}

/* ────────────────────────────────────────────────────────── gatilhos ──── */

function instalarGatilho() {
  removerGatilho();
  ScriptApp.newTrigger('atualizar').timeBased().everyMinutes(CONFIG.MINUTOS).create();
  SpreadsheetApp.getUi().alert('Atualização automática ativada: a cada ' + CONFIG.MINUTOS + ' minutos.');
}

function removerGatilho() {
  ScriptApp.getProjectTriggers().forEach(function (g) {
    if (g.getHandlerFunction() === 'atualizar') ScriptApp.deleteTrigger(g);
  });
}

/* ────────────────────────────────────────────────────── sincronização ──── */

function atualizar() {
  var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token) {
    avisar('Sem token. Menu «Cãocurso» → «Configurar token…».');
    return;
  }

  var resposta;
  try {
    resposta = UrlFetchApp.fetch(CONFIG.URL, {
      method: 'get',
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true,
      followRedirects: true,
    });
  } catch (e) {
    // Rede fora. NÃO tocar na aba: os dados de antes valem mais que nada.
    avisar('Falha de conexão: ' + e);
    return;
  }

  var codigo = resposta.getResponseCode();
  if (codigo !== 200) {
    // 404 costuma ser token errado (o endpoint devolve 404, não 401, de
    // propósito). 503 é o Supabase indisponível: vai voltar sozinho.
    avisar('O servidor respondeu ' + codigo + '. A planilha ficou como estava.');
    return;
  }

  var dados;
  try {
    dados = JSON.parse(resposta.getContentText());
  } catch (e) {
    avisar('Resposta ilegível. A planilha ficou como estava.');
    return;
  }

  if (!dados || !dados.colunas || !Array.isArray(dados.linhas)) {
    avisar('Resposta com formato inesperado. A planilha ficou como estava.');
    return;
  }

  escrever(dados);
}

/**
 * Escreve a aba do zero.
 *
 * A ordem importa: só se limpa DEPOIS de ter os dados bons em mãos. Limpar
 * primeiro e falhar depois deixaria a planilha vazia — e quem a abrisse nesse
 * momento acharia que não há inscrições.
 */
function escrever(dados) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(CONFIG.ABA) || planilha.insertSheet(CONFIG.ABA);

  var colunas = dados.colunas;
  var linhas = dados.linhas;

  aba.clear();

  aba.getRange(1, 1, 1, colunas.length).setValues([colunas]).setFontWeight('bold');

  if (linhas.length) {
    aba.getRange(2, 1, linhas.length, colunas.length).setValues(linhas);
  }

  aba.setFrozenRows(1);
  aba.autoResizeColumns(1, colunas.length);

  // A descrição do pet pode ser longa; sem teto ela estica a coluna e deixa a
  // planilha impossível de ler na horizontal.
  var iDescricao = colunas.indexOf('Descrição');
  if (iDescricao >= 0) aba.setColumnWidth(iDescricao + 1, 320);

  var carimbo = new Date(dados.atualizadoEm);
  aba
    .getRange(1, colunas.length + 2)
    .setValue('Atualizado: ' + Utilities.formatDate(carimbo, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'))
    .setFontColor('#888888');
}

/**
 * Avisa sem travar o gatilho.
 *
 * `getUi()` só existe quando alguém abriu a planilha. Nas execuções por
 * temporizador não há interface, e chamá-la lançaria exceção — por isso o
 * try/catch e o registro no log, que é onde se vê o histórico
 * (Apps Script → Execuções).
 */
function avisar(mensagem) {
  Logger.log(mensagem);
  try {
    SpreadsheetApp.getUi().alert(mensagem);
  } catch (e) {
    // Execução automática: não há interface. O log basta.
  }
}
