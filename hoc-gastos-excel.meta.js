// ==UserScript==
// @name         HOC Gastos para Excel (Feegow)
// @namespace    https://github.com/Nicker2
// @version      1.1.0
// @description  Na linha do tempo do prontuário do Feegow, coloca o botão "📋 Copiar para Excel" em cada registro de GASTO (tabela MATERIAL | QTDE | MEDICAMENTO | QTDE). Copia só os itens com quantidade (Item e Qtde, materiais primeiro e depois medicamentos), separados por TAB e também como tabela HTML, para colar direto no Excel. Não copia dados do paciente e não grava nada no Feegow. Já vem com o Core da Feegow Enhanced Suite (item "Gastos para Excel" na engrenagem); com o Core instalado, este avulso não é necessário.
// @author       Nicolas Bonza Cavalari Borges
// @match        https://*.feegow.com/*
// @match        https://feegow.com/*
// @match        https://*.feegow.com.br/*
// @match        https://feegow.com.br/*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://app.feegow.com/&size=16
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-gastos-excel.user.js
// @updateURL    https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-gastos-excel.meta.js
// ==/UserScript==
