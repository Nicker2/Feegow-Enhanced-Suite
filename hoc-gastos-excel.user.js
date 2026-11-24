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

(function () {
    'use strict';

    var VERSAO = '1.1.0';
    var MARCA = 'data-hoc-gastos-excel';

    // Roda uma vez só por página: o módulo pode vir do Core (cascata da Suite) e
    // também do script avulso. Quem chegar primeiro marca o <html>; o outro sai.
    // (Marcador no DOM, e não em window, porque o avulso roda no contexto da
    // página e o Core na sandbox do Tampermonkey: os dois só compartilham o DOM.)
    var ATIVO = 'data-hoc-gastos-excel-ativo';
    var raizDoc = document.documentElement;
    if (!raizDoc || raizDoc.hasAttribute(ATIVO)) {
        if (raizDoc) console.info('[HOC Gastos para Excel] Já ativo nesta página (v' + raizDoc.getAttribute(ATIVO) + '); esta cópia não roda.');
        return;
    }
    raizDoc.setAttribute(ATIVO, VERSAO);
    var ROTULO = '\uD83D\uDCCB Copiar para Excel';

    // ---------- texto ----------

    // Texto visível da célula: &nbsp; vira espaço, <br> vira espaço, espaços repetidos somem.
    function limpar(txt) {
        return String(txt == null ? '' : txt)
            .replace(/[\u00a0\u2007\u202f\u200b\ufeff]/g, ' ')
            .replace(/[\t\r\n]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function textoCelula(cel) {
        if (!cel) return '';
        var copia = cel.cloneNode(true);
        var brs = copia.querySelectorAll('br');
        for (var i = 0; i < brs.length; i++) brs[i].replaceWith(' ');
        return limpar(copia.textContent);
    }

    // Maiúsculas sem acento, para comparar títulos e cabeçalhos.
    function chave(txt) {
        return limpar(txt).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function ehQtde(txt) {
        var k = chave(txt).replace(/[.:]/g, '');
        return k === 'QTDE' || k === 'QTD' || k === 'QUANTIDADE';
    }

    // ---------- tabela de itens ----------

    function celulasDaLinha(tr) {
        var out = [];
        for (var i = 0; i < tr.children.length; i++) {
            var c = tr.children[i];
            if (c.tagName === 'TD' || c.tagName === 'TH') out.push(c);
        }
        return out;
    }

    // Procura a linha de cabeçalho da tabela de itens: MATERIAL | QTDE | MEDICAMENTO | QTDE
    // (de forma geral: pares "nome | QTDE"). Devolve { linha, pares:[{item, qtde, tipo}] } ou null.
    function cabecalhoItens(tabela) {
        var linhas = tabela.querySelectorAll('tr');
        for (var i = 0; i < linhas.length && i < 4; i++) {
            if (linhas[i].closest('table') !== tabela) continue;
            var cels = celulasDaLinha(linhas[i]);
            var pares = [];
            for (var j = 1; j < cels.length; j++) {
                if (ehQtde(textoCelula(cels[j])) && !ehQtde(textoCelula(cels[j - 1])) && textoCelula(cels[j - 1])) {
                    var tipo = chave(textoCelula(cels[j - 1]));
                    pares.push({ item: j - 1, qtde: j, tipo: tipo });
                }
            }
            if (pares.length) return { linha: linhas[i], pares: pares };
        }
        return null;
    }

    function tabelaDeItens(raiz) {
        var tabelas = raiz.querySelectorAll('table');
        for (var i = 0; i < tabelas.length; i++) {
            var cab = cabecalhoItens(tabelas[i]);
            if (cab) return { tabela: tabelas[i], cab: cab };
        }
        return null;
    }

    // Itens com quantidade preenchida. Ordem: primeiro todas as linhas da 1ª metade
    // (MATERIAL), depois todas as da 2ª metade (MEDICAMENTO), cada uma na ordem da tabela.
    function extrairItens(raiz) {
        var achada = tabelaDeItens(raiz);
        if (!achada) return [];
        var tabela = achada.tabela, cab = achada.cab;
        var linhas = [];
        var trs = tabela.querySelectorAll('tr');
        var depoisDoCab = false;
        for (var i = 0; i < trs.length; i++) {
            if (trs[i].closest('table') !== tabela) continue;
            if (trs[i] === cab.linha) { depoisDoCab = true; continue; }
            if (depoisDoCab) linhas.push(celulasDaLinha(trs[i]));
        }
        var itens = [];
        cab.pares.forEach(function (par) {
            linhas.forEach(function (cels) {
                var nome = textoCelula(cels[par.item]);
                var qtde = textoCelula(cels[par.qtde]);
                if (!nome || !qtde) return;
                if (ehQtde(qtde) || chave(nome) === par.tipo) return; // cabeçalho repetido
                itens.push({ item: nome, qtde: qtde, tipo: par.tipo });
            });
        });
        return itens;
    }

    // ---------- formatos para o Excel ----------

    function montarTSV(itens) {
        var linhas = ['Item\tQtde'];
        itens.forEach(function (it) { linhas.push(it.item + '\t' + it.qtde); });
        return linhas.join('\r\n') + '\r\n';
    }

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Quantidade só com dígitos vai como número; qualquer outra (70UI, 1/2, 0,5)
    // vai como texto (mso-number-format @), para o Excel não transformar em data.
    function montarHTML(itens) {
        var txt = 'mso-number-format:\'\\@\'';
        var h = '<table border="1" style="border-collapse:collapse">'
            + '<tr><th style="' + txt + '">Item</th><th style="' + txt + '">Qtde</th></tr>';
        itens.forEach(function (it) {
            var estiloQ = /^\d+$/.test(it.qtde) ? '' : ' style="' + txt + '"';
            h += '<tr><td style="' + txt + '">' + esc(it.item) + '</td><td' + estiloQ + '>' + esc(it.qtde) + '</td></tr>';
        });
        return '<html><head><meta charset="utf-8"></head><body>' + h + '</table></body></html>';
    }

    // ---------- área de transferência ----------

    function copiarComEvento(tsv, html) {
        var ok = false;
        function aoCopiar(e) {
            e.clipboardData.setData('text/plain', tsv);
            e.clipboardData.setData('text/html', html);
            e.preventDefault();
            ok = true;
        }
        document.addEventListener('copy', aoCopiar, true);
        var ta = document.createElement('textarea');
        ta.value = tsv;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand('copy') || ok; } catch (e) { /* sem suporte */ }
        document.removeEventListener('copy', aoCopiar, true);
        ta.remove();
        return ok;
    }

    function copiar(tsv, html) {
        var cb = navigator.clipboard;
        if (cb && cb.write && window.ClipboardItem && window.isSecureContext) {
            var item = new ClipboardItem({
                'text/plain': new Blob([tsv], { type: 'text/plain' }),
                'text/html': new Blob([html], { type: 'text/html' })
            });
            return cb.write([item]).catch(function () {
                return cb.writeText(tsv);
            }).catch(function () {
                if (!copiarComEvento(tsv, html)) throw new Error('copia bloqueada');
            });
        }
        if (cb && cb.writeText && window.isSecureContext) {
            return cb.writeText(tsv).catch(function () {
                if (!copiarComEvento(tsv, html)) throw new Error('copia bloqueada');
            });
        }
        return copiarComEvento(tsv, html) ? Promise.resolve() : Promise.reject(new Error('copia bloqueada'));
    }

    // ---------- botão ----------

    function injetarCSS() {
        if (document.getElementById('hoc-gastos-excel-css')) return;
        var st = document.createElement('style');
        st.id = 'hoc-gastos-excel-css';
        st.textContent =
            '.hoc-gastos-excel-btn{display:inline-block;margin:0 6px;padding:2px 9px;font-size:12px;line-height:18px;'
            + 'border:1px solid #1d6f42;border-radius:4px;background:#fff;color:#1d6f42;cursor:pointer;font-weight:600;'
            + 'vertical-align:middle;white-space:nowrap}'
            + '.hoc-gastos-excel-btn:hover{background:#1d6f42;color:#fff}'
            + '.hoc-gastos-excel-btn.ok{background:#1d6f42;color:#fff}'
            + '.hoc-gastos-excel-btn.vazio{border-color:#b26a00;color:#b26a00;background:#fff8e6}';
        (document.head || document.documentElement).appendChild(st);
    }

    function feedback(btn, texto, classe) {
        clearTimeout(btn._hocTimer);
        btn.textContent = texto;
        btn.classList.remove('ok', 'vazio');
        if (classe) btn.classList.add(classe);
        btn._hocTimer = setTimeout(function () {
            btn.textContent = ROTULO;
            btn.classList.remove('ok', 'vazio');
        }, 2000);
    }

    function aoClicar(ev, registro) {
        ev.preventDefault();
        ev.stopPropagation();
        var btn = ev.currentTarget;
        var corpo = registro.querySelector('.panel-body') || registro;
        var itens = extrairItens(corpo);
        if (!itens.length) { feedback(btn, 'Nenhum item com quantidade', 'vazio'); return; }
        copiar(montarTSV(itens), montarHTML(itens)).then(function () {
            feedback(btn, '\u2714 Copiado (' + itens.length + (itens.length === 1 ? ' item)' : ' itens)'), 'ok');
        }, function () {
            feedback(btn, 'Não foi possível copiar', 'vazio');
        });
    }

    function tituloDoRegistro(registro) {
        var code = registro.querySelector('.panel-heading code');
        return code ? chave(code.textContent) : '';
    }

    function ehGasto(registro) {
        var corpo = registro.querySelector('.panel-body');
        if (corpo && tabelaDeItens(corpo)) return true;
        return tituloDoRegistro(registro).indexOf('GASTO') !== -1;
    }

    function prepararRegistro(registro) {
        if (registro.hasAttribute(MARCA)) return;
        var heading = registro.querySelector('.panel-heading');
        if (!heading) return;              // conteúdo ainda não chegou; tenta de novo depois
        if (!ehGasto(registro)) {
            // Só marca como "não gasto" quando o corpo já existe (registro completo).
            if (registro.querySelector('.panel-body')) registro.setAttribute(MARCA, 'nao');
            return;
        }
        if (registro.querySelector('.hoc-gastos-excel-btn')) { registro.setAttribute(MARCA, 'sim'); return; }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hoc-gastos-excel-btn';
        btn.textContent = ROTULO;
        btn.title = 'Copia só os itens do gasto com quantidade (Item e Qtde), para colar no Excel';
        btn.addEventListener('click', function (ev) { aoClicar(ev, registro); });
        var controles = heading.querySelector('.panel-controls');
        if (controles) {
            controles.insertBefore(btn, controles.firstChild);
        } else {
            var code = heading.querySelector('code');
            if (code && code.parentNode) code.parentNode.insertBefore(btn, code.nextSibling);
            else heading.appendChild(btn);
        }
        registro.setAttribute(MARCA, 'sim');
    }

    function varrer() {
        var regs = document.querySelectorAll('#timeline .timeline-item:not([' + MARCA + '])');
        if (!regs.length) return;
        injetarCSS();
        for (var i = 0; i < regs.length; i++) prepararRegistro(regs[i]);
    }

    var agendado = null;
    function agendar() {
        if (agendado) return;
        agendado = setTimeout(function () { agendado = null; varrer(); }, 250);
    }

    // Exposto só para a prévia/testes locais (não lê nada da página sozinho).
    window.__hocGastosExcel = {
        versao: VERSAO, extrairItens: extrairItens, montarTSV: montarTSV,
        montarHTML: montarHTML, varrer: varrer
    };

    varrer();
    new MutationObserver(agendar).observe(document.documentElement, { childList: true, subtree: true });
})();
