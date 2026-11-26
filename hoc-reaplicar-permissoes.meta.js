// ==UserScript==
// @name         HOC Reaplicar Permissões (Feegow)
// @namespace    https://github.com/Nicker2
// @version      1.8.0
// @description  No cadastro de funcionário e de profissional do Feegow (aba Permissões): botão "Reaplicar regra atual" (reaplica a regra predefinida que a pessoa já tem, clicando no próprio "Aplicar" da regra) e, à esquerda dele, ferramentas para os MODELOS de permissão (regras predefinidas): Backup das regras (arquivo JSON datado no seu PC, só leitura), Comparar com backup, Restaurar uma regra (prévia, padrão só repor o que falta, releitura e conferência) e Restaurar todas (travado até haver backup revisado e 10 restaurações individuais conferidas). Nas listas de funcionários e profissionais, mostra ao lado de cada cadastro ATIVO os botões "🔐 Permissões" (abre a aba Permissões em nova aba) e "♻️ Reaplicar" (abre e reaplica a regra marcada, uma vez só) e o botão "♻️ Reaplicar em todos (N)" à direita do filtro de status (reaplica a regra marcada em todos os cadastros ativos da tela (funcionários ou profissionais), um por vez, com confirmação, progresso, Parar e relatório). Nas duas listas, mostra TODOS os cadastros de uma vez, sem páginas ("Mostrando todos: N cadastros"; funciona com filtro, busca e letra). Também abre a aba pelo link (&Aba=Permissoes, desligado por padrão) e copia o link das permissões. Não mexe nas permissões do funcionário. Regras de desconto ficam de fora. Já vem com o Core da Feegow Enhanced Suite; com o Core instalado, este avulso não é necessário.
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
