// ==UserScript==
// @name         Suite Feegow Enhanced Core Injector Agent
// @namespace    https://github.com/Nicker2
// @version      1.0
// @description  Puxa o código fonte em tempo real do GitHub.
// @author Nicolas Bonza Cavalari Borges
// @downloadURL https://github.com/Nicker2/Verificar-DR.EXAMES/raw/refs/heads/main/core.user.js
// @updateURL https://github.com/Nicker2/Verificar-DR.EXAMES/raw/refs/heads/main/core.meta.js
// @match        https://*.feegow.com/*/*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://app.feegow.com/&size=16
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';
    
    // O ?nocache gera um número aleatório toda vez, enganando o cache do GitHub
    const url = "https://raw.githubusercontent.com/Nicker2/Verificar-DR.EXAMES/main/VERIFICAR-DR-EXAMES.user.js?nocache=" + new Date().getTime();

    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function(response) {
            try {
                // Executa o código puxado do seu GitHub
                eval(response.responseText);
            } catch (e) {
                console.error("Erro ao carregar o script remoto:", e);
            }
        }
    });
})();
