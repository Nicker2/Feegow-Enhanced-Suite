// ==UserScript==
// @name         HOC Reaplicar Permissões (Feegow)
// @namespace    https://github.com/Nicker2
// @version      1.1.0
// @description  No cadastro de funcionário do Feegow (aba Permissões): botão "Reaplicar regra atual" (reaplica a regra predefinida que a pessoa já tem, clicando no próprio "Aplicar" da regra) e, à esquerda dele, ferramentas para os MODELOS de permissão (regras predefinidas): Backup das regras (arquivo JSON datado no seu PC, só leitura), Comparar com backup, Restaurar uma regra (prévia, padrão só repor o que falta, releitura e conferência) e Restaurar todas (travado até haver backup revisado e 10 restaurações individuais conferidas). Não mexe nas permissões do funcionário. Regras de desconto ficam de fora. Já vem com o Core da Feegow Enhanced Suite; com o Core instalado, este avulso não é necessário.
// @author       Nicolas Bonza Cavalari Borges
// @match        https://*.feegow.com/*
// @match        https://feegow.com/*
// @match        https://*.feegow.com.br/*
// @match        https://feegow.com.br/*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://app.feegow.com/&size=16
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-reaplicar-permissoes.user.js
// @updateURL    https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-reaplicar-permissoes.meta.js
// ==/UserScript==
