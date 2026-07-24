// ==UserScript==
// @name         Suite Feegow Enhanced Core Injector Agent
// @namespace    https://github.com/Nicker2
// @version      1.1.0.0
// @description  Puxa o código fonte do GitHub de forma inteligente usando Cache.
// @author       Nicolas Bonza Cavalari Borges
// @downloadURL https://github.com/Nicker2/Verificar-DR.EXAMES/raw/refs/heads/main/core.user.js
// @updateURL https://github.com/Nicker2/Verificar-DR.EXAMES/raw/refs/heads/main/core.meta.js
// @match        https://*.feegow.com/*/*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://app.feegow.com/&size=16
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';
    
    // DEFINA O TEMPO AQUI (em minutos)
    const TEMPO_CACHE_MINUTOS = 60; 
    
    const agora = new Date().getTime();
    const ultimoFetch = GM_getValue('last_fetch_time', 0);
    const scriptEmCache = GM_getValue('cached_script', '');
    
    // O ?nocache continua aqui para quando precisarmos furar o cache do GitHub
    const url = "https://raw.githubusercontent.com/Nicker2/Verificar-DR.EXAMES/main/VERIFICAR-DR-EXAMES.user.js?nocache=" + agora;

    // Se já passou o tempo limite OU se o cofre está vazio (primeira vez rodando)
    if (agora - ultimoFetch > (TEMPO_CACHE_MINUTOS * 60 * 1000) || !scriptEmCache) {
        
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                try {
                    const novoCodigo = response.responseText;
                    
                    // Salva o código novo e a hora atual no cofre do Tampermonkey
                    GM_setValue('cached_script', novoCodigo);
                    GM_setValue('last_fetch_time', agora);
                    
                    // Executa o código
                    // eslint-disable-next-line no-eval
                    eval(novoCodigo);
                    console.log("[Core Injector] Versão nova baixada do GitHub com sucesso!");
                } catch (e) {
                    console.error("Erro ao carregar o script remoto:", e);
                }
            }
        });
        
    } else {
        // Se ainda está dentro do tempo, roda direto da memória local (Instantâneo!)
        try {
            // eslint-disable-next-line no-eval
            eval(scriptEmCache);
            console.log(`[Core Injector] Rodando versão da memória local (Atualiza em ${Math.round((TEMPO_CACHE_MINUTOS * 60 * 1000 - (agora - ultimoFetch)) / 60000)} minutos).`);
        } catch (e) {
            console.error("Erro ao rodar o script salvo no cache:", e);
        }
    }
})();
