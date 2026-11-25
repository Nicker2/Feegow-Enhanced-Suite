// ==UserScript==
// @name         HOC Reaplicar Permissões (Feegow)
// @namespace    https://github.com/Nicker2
// @version      1.0.0
// @description  No cadastro de funcionário do Feegow (aba Permissões), coloca um botão ao lado do histórico de permissões que REAPLICA a regra predefinida que a pessoa já tem (a linha com o check verde na tabela de regras). Pede confirmação numa janelinha própria e clica no próprio botão "Aplicar" da regra, usando o caminho normal do Feegow. Não guarda nem envia dados. Já vem com o Core da Feegow Enhanced Suite (item "Reaplicar Permissões" na engrenagem); com o Core instalado, este avulso não é necessário.
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

(function () {
    'use strict';

    var VERSAO = '1.0.0';
    var PREFIXO = '[HOC Reaplicar Permissões]';

    // Só na tela de cadastro de funcionário (?P=Funcionarios, com ou sem maiúscula).
    function telaDeFuncionario() {
        return /[?&]P=funcionarios(?:&|#|$)/i.test(location.search + location.hash);
    }
    if (!telaDeFuncionario()) return;

    // Roda uma vez só por página: o módulo pode vir do Core (cascata da Suite) e
    // também do script avulso. Quem chegar primeiro marca o <html>; o outro sai.
    var ATIVO = 'data-hoc-reaplicar-permissoes-ativo';
    var raizDoc = document.documentElement;
    if (!raizDoc || raizDoc.hasAttribute(ATIVO)) {
        if (raizDoc) console.info(PREFIXO + ' Já ativo nesta página (v' + raizDoc.getAttribute(ATIVO) + '); esta cópia não roda.');
        return;
    }
    raizDoc.setAttribute(ATIVO, VERSAO);

    var CLASSE_BTN = 'hoc-reaplicar-regra-btn';
    var ICONE = 'far fa-redo';

    // ---------- leitura da tela ----------

    function limpar(txt) {
        return String(txt == null ? '' : txt)
            .replace(/[   ​﻿]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Parâmetro do onclick "permissoesAcao('Permissoes', {AplicaRegra: '128', UsId: '...'})".
    function parametroOnclick(onclick, nome) {
        var re = new RegExp('[{,\\s]' + nome + '\\s*:\\s*(?:\'([^\']*)\'|"([^"]*)"|([^,}\\s]+))');
        var m = re.exec(String(onclick || ''));
        if (!m) return '';
        return limpar(m[1] != null ? m[1] : (m[2] != null ? m[2] : m[3]));
    }

    // Regra atual: a linha da tabela de regras predefinidas com <i class="fa-check green">
    // e um botão "Aplicar" (onclick com AplicaRegra). Devolve null se não houver.
    function regraAtual() {
        var escopo = document.getElementById('divPermissoes') || document;
        var checks = escopo.querySelectorAll('td i.fa-check.green');
        if (!checks.length && escopo !== document) checks = document.querySelectorAll('td i.fa-check.green');
        for (var i = 0; i < checks.length; i++) {
            var tr = checks[i].closest('tr');
            if (!tr) continue;
            var botoes = tr.querySelectorAll('button[onclick*="AplicaRegra"], a[onclick*="AplicaRegra"]');
            for (var j = 0; j < botoes.length; j++) {
                var oc = botoes[j].getAttribute('onclick');
                var aplicaRegra = parametroOnclick(oc, 'AplicaRegra');
                var usId = parametroOnclick(oc, 'UsId');
                if (!aplicaRegra || !usId) continue;
                var celulas = tr.cells || tr.querySelectorAll('td');
                var nome = celulas.length > 1 ? limpar(celulas[1].textContent) : '';
                return { nome: nome || '(sem nome)', aplicaRegra: aplicaRegra, usId: usId, botao: botoes[j] };
            }
        }
        return null;
    }

    function nomeFuncionario(heading) {
        var copia = heading.cloneNode(true);
        var lixo = copia.querySelectorAll('button, .btn, script, style');
        for (var i = 0; i < lixo.length; i++) lixo[i].remove();
        var txt = limpar(copia.textContent);
        var m = /Permiss(?:õ|o)es\s+de\s+(.+)$/i.exec(txt);
        return m ? limpar(m[1]) : 'este funcionário';
    }

    // ---------- estilo (só do modal e do aviso; o botão usa as classes do Feegow) ----------

    function injetarCSS() {
        if (document.getElementById('hoc-reaplicar-css')) return;
        var st = document.createElement('style');
        st.id = 'hoc-reaplicar-css';
        st.textContent = [
            '.hoc-reaplicar-fundo{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:2147483000;display:flex;align-items:center;justify-content:center;}',
            '.hoc-reaplicar-caixa{background:#fff;border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,.3);width:min(420px,calc(100vw - 32px));padding:18px 20px 14px;font-size:14px;color:#333;}',
            '.hoc-reaplicar-caixa h4{margin:0 0 10px;font-size:16px;font-weight:600;}',
            '.hoc-reaplicar-caixa p{margin:0 0 16px;line-height:1.45;}',
            '.hoc-reaplicar-acoes{display:flex;justify-content:flex-end;gap:8px;}',
            '.hoc-reaplicar-aviso{position:fixed;right:18px;bottom:18px;z-index:2147483001;background:#333;color:#fff;padding:10px 14px;border-radius:5px;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.3);max-width:360px;}',
            '.hoc-reaplicar-aviso.ok{background:#2e7d32;}',
            '.hoc-reaplicar-aviso.erro{background:#c62828;}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(st);
    }

    // ---------- aviso e confirmação ----------

    var avisoTimer = null;
    function aviso(texto, tipo, ms) {
        injetarCSS();
        var el = document.getElementById('hoc-reaplicar-aviso');
        if (!el) {
            el = document.createElement('div');
            el.id = 'hoc-reaplicar-aviso';
            document.body.appendChild(el);
        }
        el.className = 'hoc-reaplicar-aviso' + (tipo ? ' ' + tipo : '');
        el.textContent = texto;
        clearTimeout(avisoTimer);
        avisoTimer = setTimeout(function () { if (el.parentNode) el.remove(); }, ms || 4000);
    }

    // Janelinha própria (sem alert/confirm nativo). textoOk vazio = só "Fechar".
    function perguntar(titulo, mensagem, textoOk) {
        injetarCSS();
        return new Promise(function (resolve) {
            var anterior = document.querySelector('.hoc-reaplicar-fundo');
            if (anterior) anterior.remove();
            var fundo = document.createElement('div');
            fundo.className = 'hoc-reaplicar-fundo';
            var caixa = document.createElement('div');
            caixa.className = 'hoc-reaplicar-caixa';
            caixa.setAttribute('role', 'dialog');
            caixa.setAttribute('aria-modal', 'true');
            var h = document.createElement('h4');
            h.textContent = titulo;
            var p = document.createElement('p');
            p.textContent = mensagem;
            var acoes = document.createElement('div');
            acoes.className = 'hoc-reaplicar-acoes';
            var cancelar = document.createElement('button');
            cancelar.type = 'button';
            cancelar.className = 'btn btn-sm btn-default';
            cancelar.textContent = textoOk ? 'Cancelar' : 'Fechar';
            acoes.appendChild(cancelar);
            var ok = null;
            if (textoOk) {
                ok = document.createElement('button');
                ok.type = 'button';
                ok.className = 'btn btn-sm btn-primary';
                ok.textContent = textoOk;
                acoes.appendChild(ok);
            }
            caixa.appendChild(h); caixa.appendChild(p); caixa.appendChild(acoes);
            fundo.appendChild(caixa);

            function fechar(res) {
                document.removeEventListener('keydown', teclado, true);
                fundo.remove();
                resolve(res);
            }
            function teclado(ev) {
                if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fechar(false); }
                else if (ev.key === 'Enter' && ok) { ev.preventDefault(); ev.stopPropagation(); fechar(true); }
            }
            cancelar.addEventListener('click', function () { fechar(false); });
            if (ok) ok.addEventListener('click', function () { fechar(true); });
            fundo.addEventListener('click', function (ev) { if (ev.target === fundo) fechar(false); });
            document.addEventListener('keydown', teclado, true);
            document.body.appendChild(fundo);
            (ok || cancelar).focus();
        });
    }

    // ---------- ação ----------

    var aguardandoRecarga = null;   // {nome, timer} enquanto espera o #divPermissoes recarregar

    function aoClicar(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var btn = ev.currentTarget;
        var heading = btn.closest('.panel-heading');
        var regra = regraAtual();
        if (!regra) {
            perguntar('Reaplicar regra', 'Nenhuma regra aplicada a este funcionário.', '');
            return;
        }
        var funcionario = heading ? nomeFuncionario(heading) : 'este funcionário';
        perguntar('Reaplicar regra de permissões',
            'Reaplicar a regra \'' + regra.nome + '\' para ' + funcionario + '?',
            'Reaplicar').then(function (sim) {
            if (!sim) return;
            // Relê a tela: o #divPermissoes pode ter sido recarregado enquanto o modal estava aberto.
            var agora = regraAtual();
            if (!agora || agora.aplicaRegra !== regra.aplicaRegra || agora.usId !== regra.usId) {
                aviso('A regra atual mudou na tela. Nada foi feito; confira e tente de novo.', 'erro', 6000);
                return;
            }
            // Mesmo caminho do botão "Aplicar" original (permissoesAcao + token da própria página).
            agora.botao.click();
            aviso('Reaplicando a regra \'' + regra.nome + '\'...', '', 10000);
            clearTimeout(aguardandoRecarga && aguardandoRecarga.timer);
            aguardandoRecarga = {
                nome: regra.nome,
                timer: setTimeout(function () {
                    if (!aguardandoRecarga) return;
                    aguardandoRecarga = null;
                    aviso('Pedido enviado ao Feegow. Confira se apareceu "Regra aplicada.".', '', 6000);
                }, 10000)
            };
        });
    }

    // ---------- injeção ----------

    function atualizarEstado(btn) {
        var regra = regraAtual();
        var titulo = regra ? 'Reaplicar a regra atual: ' + regra.nome : 'Nenhuma regra aplicada a este funcionário';
        if (btn.title !== titulo) btn.title = titulo;
        var desabilitar = !regra;
        if (btn.disabled !== desabilitar) btn.disabled = desabilitar;
    }

    function varrer() {
        if (!telaDeFuncionario()) return;
        var form = document.getElementById('frmPermissoes');
        if (!form) return;
        var heading = form.querySelector('.panel-heading');
        if (!heading) return;

        var existentes = heading.querySelectorAll('.' + CLASSE_BTN);
        for (var i = 1; i < existentes.length; i++) existentes[i].remove();
        var btn = existentes[0];
        var recemInjetado = false;

        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-sm btn-default fright mt10 ' + CLASSE_BTN;
            btn.style.cssFloat = 'right';
            btn.style.marginRight = '6px';
            var ic = document.createElement('i');
            ic.className = ICONE;
            btn.appendChild(ic);
            btn.addEventListener('click', aoClicar);
            var hist = heading.querySelector('[onclick*="MostraLogsPermissoes"]');
            // Os dois flutuam à direita: vindo depois do histórico no DOM, fica à esquerda dele.
            if (hist && hist.parentNode) hist.parentNode.insertBefore(btn, hist.nextSibling);
            else heading.insertBefore(btn, heading.firstChild);
            recemInjetado = true;
        }
        atualizarEstado(btn);

        if (recemInjetado && aguardandoRecarga) {
            // O Feegow recarregou o #divPermissoes depois do Aplicar.
            clearTimeout(aguardandoRecarga.timer);
            aviso('✔ Regra \'' + aguardandoRecarga.nome + '\' reaplicada.', 'ok', 5000);
            aguardandoRecarga = null;
        }
    }

    var agendado = null;
    function agendar() {
        if (agendado) return;
        agendado = setTimeout(function () { agendado = null; varrer(); }, 200);
    }

    // Exposto só para a prévia/testes locais.
    window.__hocReaplicarPermissoes = { versao: VERSAO, varrer: varrer, regraAtual: regraAtual, parametroOnclick: parametroOnclick };

    varrer();
    new MutationObserver(agendar).observe(document.documentElement, { childList: true, subtree: true });
})();
