/**
 * Cãocurso 2026 — a planilha do júri e do CRM.
 *
 * O servidor da LP manda a lista inteira para cá depois de cada inscrição, e
 * este script reescreve a aba. A planilha RECEBE; não precisa alcançar nada.
 *
 * ── Como instalar ───────────────────────────────────────────────────────────
 *
 *  1. Crie a planilha e compartilhe POR CONTA NOMINAL com o júri e o CRM.
 *     Nunca «qualquer pessoa com o link»: é o vetor de vazamento número um, e
 *     a planilha leva nome, e-mail e telefone de gente real.
 *  2. Extensões → Apps Script. Cole este arquivo por cima do que houver lá.
 *  3. Salvar (💾).
 *  4. Implantar → Nova implantação → engrenagem → **App da Web**.
 *       · Executar como: **Eu**
 *       · Quem tem acesso: **Qualquer pessoa**   ← sem isto o servidor recebe
 *         a tela de login em vez de gravar. Não é a planilha que fica pública:
 *         é só esta função, e ela exige o token.
 *  5. Copie a URL que termina em `/exec` e mande para quem cuida do servidor.
 *  6. Volte à planilha, recarregue (F5) e use o menu «Cãocurso» →
 *     «Configurar token…» com o mesmo valor de PLANILHA_WEBHOOK_TOKEN.
 *
 * ⚠️ Cada vez que mudar este arquivo é preciso **Implantar → Gerenciar
 *    implantações → editar → Nova versão**. Salvar não basta: a URL `/exec`
 *    continua servindo a versão implantada, e é o erro que faz perder meia
 *    hora achando que a mudança não pegou.
 *
 * ── Por que reescrever a aba inteira ────────────────────────────────────────
 *
 * Não é por desempenho. Quando alguém exerce o direito de exclusão (LGPD art.
 * 18), a linha some da consulta — mas com um sync que só acrescenta, essa
 * pessoa **fica na planilha para sempre**, e acabou-se de descumprir justamente
 * o que se acreditava ter cumprido. Reescrevendo tudo, ela some sozinha no
 * envio seguinte. De brinde, as correções se propagam e é idempotente: se o
 * mesmo envio chegar duas vezes, o resultado é o mesmo.
 */

var CONFIG = {
  ABA: 'Inscrições',

  // Curitiba. O servidor manda as datas em UTC (é o que o Postgres guarda), e
  // sem isto a planilha as mostraria três horas adiantadas.
  FUSO: 'America/Sao_Paulo',
  FORMATO_DATA: 'dd/MM/yyyy HH:mm',

  // Só para o «Atualizar agora» do menu, que é o conserto manual. Trocar pelo
  // domínio de produção quando ele existir. Vazio = o item do menu avisa e não
  // faz nada. O caminho normal —o servidor empurrando— não usa isto.
  URL_EXPORTACAO: '',
};

/* ─────────────────────────────────────────────────── o que recebe ──────── */

/**
 * Recebe a planilha inteira do servidor da LP.
 *
 * Responde sempre JSON, inclusive no erro: quem chama olha o corpo para saber
 * se deu certo. O Apps Script não deixa escolher o código HTTP — um erro sai
 * como 200 —, por isso o `ok` no corpo é o que vale, e é o que o servidor
 * verifica.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responder({ ok: false, erro: 'sem corpo' });
    }

    var dados = JSON.parse(e.postData.contents);

    var esperado = PropertiesService.getScriptProperties().getProperty('TOKEN');
    if (!esperado) return responder({ ok: false, erro: 'token não configurado na planilha' });
    if (dados.token !== esperado) return responder({ ok: false, erro: 'token inválido' });

    if (!dados.colunas || !Array.isArray(dados.linhas)) {
      return responder({ ok: false, erro: 'formato inesperado' });
    }

    /* Duas inscrições ao mesmo tempo = dois doPost reescrevendo a mesma aba.
       Sem trava, uma limpa enquanto a outra escreve e sobra meia planilha. */
    var trava = LockService.getScriptLock();
    if (!trava.tryLock(30000)) {
      return responder({ ok: false, erro: 'ocupado' });
    }

    var onde;
    try {
      onde = escrever(dados);
    } finally {
      trava.releaseLock();
    }

    /* `onde` devolve o nome e a URL da planilha, e o nome da aba. Não é
       decoração: quando alguém disser «mandei uma inscrição e não vejo nada»,
       isto responde numa tacada se o problema é a aba, outra planilha ou de
       verdade o envio. Sem isto só se sabe que algo foi escrito em algum
       lugar. */
    return responder({ ok: true, total: dados.linhas.length, onde: onde });
  } catch (erro) {
    Logger.log('doPost: ' + erro);
    return responder({ ok: false, erro: String(erro) });
  }
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/* ────────────────────────────────────────────────────────────── menu ──── */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Cãocurso')
    .addItem('Configurar token…', 'configurarToken')
    .addSeparator()
    .addItem('Reconstruir a aba (só com o site publicado)', 'atualizar')
    .addToUi();
}

/**
 * O token vai nas propriedades do script, não escrito aqui.
 *
 * Não é grande proteção —quem edita a planilha consegue lê-lo— mas evita o pior
 * caso: que o segredo viaje numa cópia da planilha ou num print. Por isso não é
 * a service_role do Supabase: se este vazar, o que se pode fazer é reescrever
 * esta aba; a outra exporia o banco inteiro.
 */
function configurarToken() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt(
    'Token da planilha',
    'Cole o valor de PLANILHA_WEBHOOK_TOKEN:',
    ui.ButtonSet.OK_CANCEL
  );
  if (r.getSelectedButton() !== ui.Button.OK) return;

  var token = r.getResponseText().trim();
  if (!token) {
    ui.alert('Token vazio. Nada foi salvo.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('TOKEN', token);
  ui.alert('Token salvo. A partir de agora as inscrições chegam sozinhas.');
}

/* ───────────────────────────────────────────── conserto: puxar à mão ──── */

/**
 * Reconstrói a aba consultando o servidor.
 *
 * É o conserto para quando a planilha ficar para trás: a Google fora do ar num
 * envio, alguém que apagou a aba sem querer, uma exclusão LGPD sem inscrições
 * novas depois. Exige que o domínio esteja no ar — por isso não serve para os
 * primeiros testes, e o caminho normal continua sendo o servidor empurrando.
 */
function atualizar() {
  if (!CONFIG.URL_EXPORTACAO) {
    avisar(
      'Este item não é necessário: as inscrições chegam sozinhas assim que alguém se ' +
      'inscreve.\n\nSó serve para RECONSTRUIR a aba se ela ficar para trás, e para isso ' +
      'precisa do site publicado — falta preencher URL_EXPORTACAO no script.'
    );
    return;
  }

  var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token) {
    avisar('Sem token. Menu «Cãocurso» → «Configurar token…».');
    return;
  }

  var resposta;
  try {
    resposta = UrlFetchApp.fetch(CONFIG.URL_EXPORTACAO, {
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
  avisar(dados.linhas.length + ' inscrições na planilha.');
}

/* ──────────────────────────────────────────────────────── a escrita ──── */

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

  /* O Sheets desenha uma data no fuso DA PLANILHA, não no do script. Se a
     planilha estiver em UTC, uma inscrição das 22h do dia 21 aparece como dia
     22 — e na última noite do prazo isso decide quem entra. Fixa-se aqui para
     não depender de como a planilha foi criada. */
  if (planilha.getSpreadsheetTimeZone() !== CONFIG.FUSO) {
    planilha.setSpreadsheetTimeZone(CONFIG.FUSO);
  }

  var colunas = dados.colunas;
  var linhas = dados.linhas;

  aba.clear();

  aba.getRange(1, 1, 1, colunas.length).setValues([colunas]).setFontWeight('bold');

  /* A data chega como texto ISO em UTC: «2026-08-06T16:02:45.22797+00:00».
     Escrita assim vira TEXTO na célula — ilegível, no fuso errado, e sem poder
     ordenar nem filtrar por intervalo, que é o primeiro que o júri vai querer
     fazer. Convertida a Date de verdade, o Sheets a trata como data e a mostra
     no fuso da planilha, que se fixou acima.

     Se a conversão falhar, fica o texto original: uma célula feia é melhor que
     uma célula vazia onde havia um dado. */
  var iData = colunas.indexOf('Data da inscrição');
  if (iData >= 0) {
    for (var i = 0; i < linhas.length; i++) {
      var bruto = linhas[i][iData];
      if (!bruto) continue;
      var d = new Date(bruto);
      if (!isNaN(d.getTime())) linhas[i][iData] = d;
    }
  }

  if (linhas.length) {
    /* Estas columnas son TEXTO aunque parezcan números, y hay que decírselo al
       Sheets ANTES de escribirlas o se las come:

         CPF          «048.123.456-78» sobrevive por los puntos, pero si algún
                      día llegara en crudo, once dígitos son un número y el cero
                      de delante desaparece sin avisar. Y ese CPF es justo el que
                      alguien va a cruzar a mano con la base del Clube.
         Telefone     «41999998888» se guarda en crudo: como número pierde
                      cualquier cero inicial y a partir de cierto largo el Sheets
                      lo enseña en notación científica.
         Nascimento   va como «12/05/1984» y se deja en texto a propósito: como
                      fecha real, la conversión desde UTC la mueve un día.

       Se hace por NOMBRE de columna, no por posición: así añadir o mover
       columnas en `COLUNAS` no rompe esto en silencio. */
    var TEXTO = ['CPF', 'Telefone', 'Nascimento'];
    for (var t = 0; t < TEXTO.length; t++) {
      var iTexto = colunas.indexOf(TEXTO[t]);
      if (iTexto >= 0) {
        aba.getRange(2, iTexto + 1, linhas.length, 1).setNumberFormat('@');
      }
    }

    aba.getRange(2, 1, linhas.length, colunas.length).setValues(linhas);
    if (iData >= 0) {
      aba.getRange(2, iData + 1, linhas.length, 1).setNumberFormat(CONFIG.FORMATO_DATA);
    }
  }

  aba.setFrozenRows(1);
  aba.autoResizeColumns(1, colunas.length);

  // A descrição do pet pode ser longa; sem teto ela estica a coluna e deixa a
  // planilha impossível de ler na horizontal.
  var iDescricao = colunas.indexOf('Descrição');
  if (iDescricao >= 0) aba.setColumnWidth(iDescricao + 1, 320);

  var carimbo = dados.atualizadoEm ? new Date(dados.atualizadoEm) : new Date();
  aba
    .getRange(1, colunas.length + 2)
    .setValue('Atualizado: ' + Utilities.formatDate(carimbo, CONFIG.FUSO, CONFIG.FORMATO_DATA))
    .setFontColor('#888888');

  return {
    planilha: planilha.getName(),
    url: planilha.getUrl(),
    aba: aba.getName(),
    linhas: linhas.length,
  };
}

/**
 * Avisa sem travar quando não há ninguém olhando.
 *
 * `getUi()` só existe quando alguém abriu a planilha. Num `doPost` não há
 * interface, e chamá-la lançaria exceção — por isso o try/catch e o registro no
 * log, que é onde se vê o histórico (Apps Script → Execuções).
 */
function avisar(mensagem) {
  Logger.log(mensagem);
  try {
    SpreadsheetApp.getUi().alert(mensagem);
  } catch (e) {
    // Sem interface. O log basta.
  }
}
