// ==UserScript==
// @name         Suite Feegow Enhanced Core Injector Agent
// @namespace    https://github.com/Nicker2
// @version      1.1.6.0
// @description  Puxa o código fonte do GitHub de forma inteligente usando Cache. Inclui a Suite, o PDF HOC Derma, as Propostas HOC Derma, o HOC Gastos para Excel e o HOC Reaplicar Permissões.
// @author       Nicolas Bonza Cavalari Borges
// @downloadURL https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/core.user.js
// @updateURL   https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/core.meta.js
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

    // Core atualizado pelo Tampermonkey (versão diferente da última que rodou):
    // baixa a Suite na hora, sem esperar o cache vencer, para os módulos novos
    // (ex.: Gastos para Excel no Core 1.1.2.0, Reaplicar Permissões no 1.1.3.0, ocultar pedido de notificações e popups no 1.1.4.0, abrir aba pelo link no 1.1.5.0, botões Permissões/Reaplicar nas listas no 1.1.6.0) chegarem logo.
    const versaoCore = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '';
    const coreAtualizado = !!versaoCore && GM_getValue('core_versao', '') !== versaoCore;

    // O ?nocache continua aqui para quando precisarmos furar o cache do GitHub
    const url = "https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/VERIFICAR-DR-EXAMES.user.js?nocache=" + agora;

    // Roda um código guardado/baixado. Devolve true se executou sem erro.
    function executar(codigo, origem) {
        try {
            // eslint-disable-next-line no-eval
            eval(codigo);
            console.log("[Core Injector] Suite executada a partir de " + origem + ".");
            return true;
        } catch (e) {
            console.error("[Core Injector] Erro ao executar a Suite (" + origem + "):", e);
            return false;
        }
    }

    // Sem rede / GitHub fora / resposta inválida: usa o que estiver no cofre, mesmo vencido.
    function usarCacheReserva(motivo) {
        if (scriptEmCache) {
            console.warn("[Core Injector] " + motivo + " Usando a versão guardada no cofre.");
            executar(scriptEmCache, "memória local (reserva)");
        } else {
            console.error("[Core Injector] " + motivo + " E não há versão guardada no cofre.");
        }
    }

    // Se já passou o tempo limite OU se o cofre está vazio (primeira vez rodando)
    if (agora - ultimoFetch > (TEMPO_CACHE_MINUTOS * 60 * 1000) || !scriptEmCache || coreAtualizado) {

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            timeout: 30000,
            onload: function(response) {
                const novoCodigo = (response && response.responseText) || '';
                const status = response ? response.status : 0;
                // Só aceita uma resposta válida: HTTP 200 e cabeçalho de userscript.
                // (Antes, uma página de erro do GitHub ia parar no cofre e a Suite sumia.)
                if (status !== 200 || novoCodigo.indexOf('// ==UserScript==') < 0) {
                    usarCacheReserva("Resposta inesperada do GitHub (HTTP " + status + ").");
                    return;
                }
                if (executar(novoCodigo, "GitHub (versão nova)")) {
                    // Só guarda no cofre a versão que rodou sem erro.
                    GM_setValue('cached_script', novoCodigo);
                    GM_setValue('last_fetch_time', agora);
                    if (versaoCore) GM_setValue('core_versao', versaoCore);
                } else if (scriptEmCache && scriptEmCache !== novoCodigo) {
                    usarCacheReserva("A versão nova falhou ao iniciar.");
                }
            },
            onerror: function() { usarCacheReserva("Falha de rede ao baixar do GitHub."); },
            ontimeout: function() { usarCacheReserva("Tempo esgotado ao baixar do GitHub."); }
        });

    } else {
        // Se ainda está dentro do tempo, roda direto da memória local (Instantâneo!)
        if (executar(scriptEmCache, "memória local")) {
            console.log(`[Core Injector] Atualiza em ${Math.round((TEMPO_CACHE_MINUTOS * 60 * 1000 - (agora - ultimoFetch)) / 60000)} minutos.`);
        }
    }
})();
