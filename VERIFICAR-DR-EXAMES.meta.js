// ==UserScript==
// @name         Suite Feegow Enhanced
// @namespace    https://github.com/Nicker2/Verificar-DR.EXAMES
// @version      4.9.4.7
// @description  Conta pacientes DR. EXAMES com logs detalhados, exibe apenas a lista superior por padrão, oculta a lista inferior até que a superior esteja fora de vista, nomes como hyperlinks azuis sem sublinhado, adiciona botão para alternar visibilidade, destaca "Primeira vez" com badge, intercepta dados de login e faz Bypass Invisível de sessão dupla via Fetch API com tela de carregamento, adiciona especialidade, mantém valor 30, e agora renderiza PDFs com cabeçalho/rodapé, calibração X/Y ao vivo e ajuste de escala do conteúdo.
// @author       Nicolas Bonza Cavalari Borges
// @match        https://*.feegow.com/*/*
// @match        https://example.com/*
// @downloadURL  https://raw.githubusercontent.com/Nicker2/Verificar-DR.EXAMES/refs/heads/main/VERIFICAR-DR-EXAMES.user.js
// @updateURL    https://raw.githubusercontent.com/Nicker2/Verificar-DR.EXAMES/refs/heads/main/VERIFICAR-DR-EXAMES.meta.js
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://app.feegow.com/&size=16
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==
