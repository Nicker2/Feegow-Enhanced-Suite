// ==UserScript==
// @name         Propostas HOC Derma — Imprimir HOC Derma (Feegow)
// @namespace    https://github.com/Nicker2
// @version      1.4.3
// @description  Gera a proposta de tratamento da HOC Derma (imprimir ou salvar em PDF) a partir da proposta do prontuário no Feegow: botão "Imprimir HOC Derma", editor com prévia A4, descrição de cada procedimento dermatológico, investimento com os valores do Feegow (editáveis) e timbrado HOC Derma. Ao clicar, salva a proposta no Feegow (botão SALVAR) e abre a impressão. Na janela, "＋ Feegow" inclui um procedimento novo na proposta real, e quantidade, valores, descontos e acréscimos dos itens e o desconto total vão para o Feegow (com SALVAR); descrições e textos valem só para a impressão.
// @author       Nicolas Bonza Cavalari Borges
// @match        https://*.feegow.com/*
// @match        https://feegow.com/*
// @match        https://*.feegow.com.br/*
// @match        https://feegow.com.br/*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://app.feegow.com/&size=16
// @run-at       document-idle
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @downloadURL  https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-derma-propostas.user.js
// @updateURL    https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-derma-propostas.meta.js
// ==/UserScript==
