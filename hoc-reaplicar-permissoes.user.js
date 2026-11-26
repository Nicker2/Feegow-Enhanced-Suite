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

(function () {
    'use strict';

    var VERSAO = '1.8.0';
    var PREFIXO = '[HOC Reaplicar Permissões]';

    // Telas tratadas: cadastro de funcionário e de profissional (os dois têm regras predefinidas de permissões;
    // a única diferença nas requisições é T=Funcionarios x T=Profissionais).
    // telaDeFuncionario() mantém o nome antigo: vale para as duas telas de cadastro.
    function telaDeFuncionario() {
        return /[?&]P=(?:funcionarios|profissionais)(?:&|#|$)/i.test(location.search + location.hash);
    }
    // Valor do parâmetro T= do ajxContent/EditaPermissoes para a tela aberta.
    function tipoDaTela() {
        return /[?&]P=profissionais(?:&|#|$)/i.test(location.search + location.hash) ? 'Profissionais' : 'Funcionarios';
    }
    function telaDePessoal() {
        return /[?&]P=(?:funcionarios|profissionais)(?:&|#|$)/i.test(location.search + location.hash);
    }
    if (!telaDePessoal()) return;

    // Roda uma vez só por página: o módulo pode vir do Core (cascata da Suite) e
    // também do script avulso. Quem chegar primeiro marca o <html>; o outro sai.
    var ATIVO = 'data-hoc-reaplicar-permissoes-ativo';
    var raizDoc = document.documentElement;
    if (!raizDoc || raizDoc.hasAttribute(ATIVO)) {
        if (raizDoc) console.info(PREFIXO + ' Já ativo nesta página (v' + raizDoc.getAttribute(ATIVO) + '); esta cópia não roda.');
        return;
    }
    raizDoc.setAttribute(ATIVO, VERSAO);

    // Opções da engrenagem da Suite (atributos do <html>; sem o atributo = ligado, como no avulso).
    var ligadoReaplicar = raizDoc.getAttribute('data-hoc-cfg-reaplicar') !== '0';
    // "Abrir aba pelo link" vem DESLIGADA por padrão desde a 1.3.0 (só liga com '1', que a Suite grava).
    var ligadoAbaLink = raizDoc.getAttribute('data-hoc-cfg-aba-link') === '1';
    // Botões das listas (ligados por padrão) e confirmação do ♻️ (desligada por padrão).
    var ligadoBtnPerm = raizDoc.getAttribute('data-hoc-cfg-btn-perm') !== '0';
    var ligadoBtnReaplicarLista = raizDoc.getAttribute('data-hoc-cfg-btn-reaplicar-lista') !== '0';
    var ligadoConfirmaLista = raizDoc.getAttribute('data-hoc-cfg-confirma-lista') === '1';
    // Listas abrem com o filtro de status em "Ativo" (ligado por padrão).
    var ligadoListaAtivo = raizDoc.getAttribute('data-hoc-cfg-lista-ativo') !== '0';
    // Botão "Reaplicar em todos (N)" nas listas (ligado por padrão) e confirmação antes de começar (ligada por padrão).
    var ligadoBtnMassa = raizDoc.getAttribute('data-hoc-cfg-btn-massa') !== '0';
    var ligadoConfirmaMassa = raizDoc.getAttribute('data-hoc-cfg-confirma-massa') !== '0';
    // Mostrar todos os cadastros na lista, sem páginas (ligado por padrão).
    var ligadoTodos = raizDoc.getAttribute('data-hoc-cfg-todos') !== '0';
    var massaRodando = false;
    // (SÓ PROFISSIONAIS) Troca de regra ao reaplicar (origem -> destino, comparando o nome da regra sem acento/caixa/espaços extras) e
    // "profissional sem regra recebe MÉDICOS". A Suite grava as duas opções no <html>; sem a Suite valem os padrões.
    var TROCAS_PADRAO = [['Permissão Médicos Padrão', 'MÉDICOS'], ['Perfil Padrão', 'MÉDICOS']];
    var REGRA_MEDICOS = 'MÉDICOS';
    var ligadoProfSemRegra = raizDoc.getAttribute('data-hoc-cfg-prof-sem-regra') !== '0';
    var TROCAS = (function () {
        var v = raizDoc.getAttribute('data-hoc-cfg-trocas');
        if (v === '0') return [];
        if (v) {
            try {
                var arr = JSON.parse(v), ok = [];
                for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i][0] && arr[i][1]) ok.push([String(arr[i][0]), String(arr[i][1])]);
                return ok;
            } catch (e) { /* configuração inválida: usa o padrão */ }
        }
        return TROCAS_PADRAO;
    })();

    // ---------- LINK DIRETO PARA ABA (&Aba=Permissoes ou #divPermissoes) ----------

    // Nome do link (sem acento, minúsculo) -> como reconhecer a aba na página.
    // Cada aba é um <a href="#div..."> do menu lateral; o clique dispara o carregamento do próprio Feegow.
    var ABAS_LINK = {
        // No cadastro de profissional vários links usam href="#divPermissoes" (e até o mesmo id gtPermissoes): Procedimentos da
        // Agenda, Permissões e Compartilhamento de Prontuário. O que identifica a aba certa é o onclick ajxContent('Permissoes...').
        permissoes: { hrefs: ['#divpermissoes'], id: 'gtPermissoes', texto: /^permiss/, onclick: /ajxContent\(\s*['"]Permissoes(?:&|['"])/i },
        permissao: 'permissoes',
        divpermissoes: 'permissoes',
        acesso: { hrefs: ['#divacesso'], texto: /acesso/ },
        divacesso: 'acesso',
        cadastro: { hrefs: ['#divcadastrofuncionario', '#divcadastroprofissional', '#divcadastro'], texto: /^cadastro/ },
        divcadastrofuncionario: 'cadastro',
        divcadastroprofissional: 'cadastro'
    };

    function semAcento(t) {
        return String(t == null ? '' : t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    // URL original da navegação (o Feegow pode reescrever a barra de endereço e perder o &Aba).
    function urlsDaPagina() {
        var urls = [location.href];
        try {
            var nav = performance.getEntriesByType('navigation')[0];
            if (nav && nav.name && urls.indexOf(nav.name) < 0) urls.push(nav.name);
        } catch (e) { /* sem Performance API */ }
        return urls;
    }

    // Devolve o nome pedido (já sem acento/minúsculo) ou ''.
    function abaPedida() {
        var urls = urlsDaPagina();
        for (var i = 0; i < urls.length; i++) {
            var u;
            try { u = new URL(urls[i]); } catch (e) { continue; }
            var q = u.searchParams.get('Aba');
            if (!q) {
                // parâmetro com outra caixa (aba=, ABA=)
                u.searchParams.forEach(function (v, k) { if (!q && k.toLowerCase() === 'aba') q = v; });
            }
            if (q) return semAcento(q);
            if (u.hash && u.hash.length > 1) return semAcento(u.hash.slice(1));
        }
        return '';
    }

    function descreverAba(nome) {
        var d = ABAS_LINK[nome];
        if (typeof d === 'string') d = ABAS_LINK[d];
        if (d) return d;
        // Qualquer outro nome: tenta a aba cujo href é "#div<nome>" (ou "#<nome>").
        if (/^[a-z0-9_-]{2,40}$/.test(nome)) {
            return { hrefs: ['#' + nome, '#div' + nome], texto: null, generico: true };
        }
        return null;
    }

    function acharAba(desc) {
        if (desc.onclick) {
            var todos = document.querySelectorAll('a[onclick]');
            for (var k = 0; k < todos.length; k++) {
                if (desc.onclick.test(todos[k].getAttribute('onclick') || '') && /^#div/i.test(todos[k].getAttribute('href') || '')) return todos[k];
            }
        }
        var links = document.querySelectorAll('a[href^="#div"], a[href^="#"][onclick]');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            var href = semAcento(a.getAttribute('href'));
            if (href.length < 4) continue;
            if (desc.hrefs.indexOf(href) >= 0) return a;
            if (desc.id && a.id === desc.id) return a;
        }
        if (desc.texto) {
            for (var j = 0; j < links.length; j++) {
                if (/^#div/i.test(links[j].getAttribute('href') || '') && desc.texto.test(semAcento(links[j].textContent))) return links[j];
            }
        }
        return null;
    }

    function abaJaAtiva(a) {
        var li = a.closest('li');
        return !!(li && li.classList.contains('active'));
    }

    function abrirAbaPeloLink() {
        var nome = abaPedida();
        if (!nome && /^reaplicar$/i.test(paramDaUrl('hocAcao'))) nome = 'permissoes';
        if (!nome) return;
        var desc = descreverAba(nome);
        if (!desc) return;

        var terminou = false;
        var observador = null, tick = null, limite = null;
        function encerrar() {
            terminou = true;
            if (observador) observador.disconnect();
            clearInterval(tick); clearTimeout(limite);
            document.removeEventListener('click', usuarioClicou, true);
        }
        // Se a pessoa clicar em qualquer aba depois do carregamento, o link perde a vez.
        function usuarioClicou(ev) {
            if (!ev.isTrusted || !ev.target || !ev.target.closest) return;
            if (ev.target.closest('#lMenu a, .sidebar-menu a, a[href^="#div"]')) encerrar();
        }
        document.addEventListener('click', usuarioClicou, true);

        function tentar() {
            if (terminou) return;
            var a = acharAba(desc);
            if (!a) return;
            encerrar();
            if (abaJaAtiva(a)) return;
            a.click();   // uma única vez; o onclick do Feegow (ajxContent etc.) faz o resto
            console.info(PREFIXO + ' Aba aberta pelo link: ' + nome);
        }
        observador = new MutationObserver(tentar);
        observador.observe(document.documentElement, { childList: true, subtree: true });
        tick = setInterval(tentar, 250);
        limite = setTimeout(encerrar, 15000);   // desiste depois de 15 s
        tentar();
    }

    // ---------- botão "Copiar link das permissões" ----------

    var CLASSE_COPIAR = 'hoc-copiar-link-permissoes';

    function idDaPessoa() {
        var m = /[?&]I=(\d+)/i.exec(location.search);
        return m ? m[1] : '';
    }

    function linkDasPermissoes() {
        var id = idDaPessoa();
        if (!id) return '';
        var p = tipoDaTela();
        return location.origin + '/main/?P=' + p + '&Pers=1&I=' + id + '&Aba=Permissoes';
    }

    function copiarTexto(texto) {
        function reserva() {
            return new Promise(function (resolve, reject) {
                var ta = document.createElement('textarea');
                ta.value = texto;
                ta.setAttribute('readonly', '');
                ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
                document.body.appendChild(ta);
                ta.select();
                var ok = false;
                try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
                ta.remove();
                if (ok) resolve(); else reject(new Error('copy falhou'));
            });
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(texto).catch(reserva);
        }
        return reserva();
    }

    function injetarBotaoCopiarLink() {
        if (!telaDePessoal() || !idDaPessoa()) return;
        var existentes = document.querySelectorAll('.' + CLASSE_COPIAR);
        for (var i = 1; i < existentes.length; i++) existentes[i].remove();
        if (existentes.length) return;
        var esquerda = document.querySelector('#topbar .topbar-left');
        var direita = document.querySelector('#topbar .topbar-right #rbtns, #topbar .topbar-right');
        if (!esquerda && !direita) return;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn-xs btn-default ' + CLASSE_COPIAR;
        b.style.cssText = 'margin-left:12px;white-space:nowrap;vertical-align:middle;';
        b.title = 'Copia o link direto para a aba Permissões desta pessoa (…&Aba=Permissoes)';
        b.textContent = '🔗 Copiar link das permissões';
        b.addEventListener('click', function (ev) {
            ev.preventDefault(); ev.stopPropagation();
            var link = linkDasPermissoes();
            if (!link) { aviso('Não achei o número desta pessoa na página.', 'erro'); return; }
            copiarTexto(link).then(function () {
                aviso('✔ Link das permissões copiado.', 'ok', 3000);
            }, function () {
                aviso('Não consegui copiar. Link: ' + link, 'erro', 9000);
            });
        });
        if (esquerda) esquerda.appendChild(b);
        else direita.insertBefore(b, direita.firstChild);
    }

    function varrerLink() {
        if (ligadoAbaLink) injetarBotaoCopiarLink();
    }

    // Os botões das listas usam &hocAba=1, que o módulo SEMPRE honra, mesmo com a opção global desligada.
    if (ligadoAbaLink || paramDaUrl('hocAba') === '1' || /^reaplicar$/i.test(paramDaUrl('hocAcao'))) abrirAbaPeloLink();
    if (ligadoAbaLink) {
        varrerLink();
        var agLink = null;
        new MutationObserver(function () {
            if (agLink) return;
            agLink = setTimeout(function () { agLink = null; varrerLink(); }, 300);
        }).observe(document.documentElement, { childList: true, subtree: true });
    }

    // =====================================================================
    // BOTÕES NAS LISTAS DE CADASTROS (Profissionais / Funcionários, ?Pers=Follow)
    // =====================================================================
    // As listas são web components do Feegow (<feegow-staff-list> e <feegow-professionals-list>)
    // com shadow DOM aberto. Cada linha é um <tr> com o link do nome (?P=...&Pers=1&I=<id>) e um
    // selo data-testid="access-state-badge" com data-state (active, invite_pending, invite_expired,
    // legacy_invalid, no_invite, disabled, inactive). Cadastro ATIVO = qualquer estado menos
    // "inactive" e "disabled". Os botões são <a> comuns (nova aba), sem mexer nos dados do Feegow.

    var HOSTS_LISTA = ['feegow-staff-list', 'feegow-professionals-list'];
    var CLASSE_GRUPO_LISTA = 'hoc-perm-grupo';
    var ESTADOS_INATIVOS = { inactive: true, disabled: true };
    var raizesObservadas = (typeof WeakSet === 'function') ? new WeakSet() : null;

    function tela_lista() {
        return /[?&]Pers=Follow(?:&|#|$)/i.test(location.search) && telaDePessoal();
    }

    function paramDaUrl(nome) {
        var urls = urlsDaPagina();
        for (var i = 0; i < urls.length; i++) {
            var u;
            try { u = new URL(urls[i]); } catch (e) { continue; }
            var achado = '';
            u.searchParams.forEach(function (v, k) { if (!achado && k.toLowerCase() === nome.toLowerCase()) achado = v; });
            if (achado) return achado;
        }
        return '';
    }

    function linkDoCadastro(p, id, reaplicar) {
        return location.origin + '/main/?P=' + p + '&Pers=1&I=' + id + '&Aba=Permissoes&hocAba=1' + (reaplicar ? '&hocAcao=reaplicar' : '');
    }

    function cssDasListas() {
        return [
            '.hoc-perm-grupo{display:inline-flex;align-items:center;gap:6px;margin-left:8px;vertical-align:middle;}',
            '.hoc-perm-btn{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 9px;font-family:inherit;font-size:12px;font-weight:450;line-height:1;white-space:nowrap;',
            'border-radius:999px;border:1px solid var(--w-color-border-primary,#d4d8d8);background:var(--w-color-background-primary,#f8f9f9);color:var(--w-color-foreground-secondary,#515959);',
            'text-decoration:none;cursor:pointer;transition:background .12s,border-color .12s,color .12s;}',
            '.hoc-perm-btn:hover{background:var(--w-color-background-hover,rgba(229,231,231,.6));border-color:var(--w-color-border-highlight,#868e8e);color:var(--w-color-foreground-primary,#181818);text-decoration:none;}',
            '.hoc-perm-btn:focus-visible{outline:2px solid var(--w-color-border-highlight,#868e8e);outline-offset:2px;}',
            '.hoc-perm-btn.hoc-perm-reaplicar{color:var(--w-color-foreground-accent,#006453);border-color:rgba(0,100,83,.35);background:rgba(0,100,83,.07);}',
            '.hoc-perm-btn.hoc-perm-massa{height:28px;margin-left:12px;padding:0 12px;font-size:13px;align-self:center;}',
            '.hoc-perm-btn[disabled]{opacity:.5;cursor:not-allowed;pointer-events:auto;}',
            '.hoc-perm-btn.hoc-perm-reaplicar:hover{background:rgba(0,100,83,.15);border-color:var(--w-color-foreground-accent,#006453);color:var(--w-color-foreground-accent,#006453);}'
        ].join('');
    }

    function criarBotaoLista(classe, texto, titulo, href) {
        var a = document.createElement('a');
        a.className = 'hoc-perm-btn ' + classe;
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.title = titulo;
        a.textContent = texto;
        a.addEventListener('click', function (ev) { ev.stopPropagation(); });   // não vaza para a linha
        return a;
    }

    // Decide o que a linha deve ter: null (nada) ou {p, id, reaplicar}.
    function alvoDaLinha(tr) {
        var badge = tr.querySelector('[data-testid="access-state-badge"]');
        var a = tr.querySelector('a[href*="Pers=1"][href*="I="]');
        if (!badge || !a) return null;
        var estado = String(badge.getAttribute('data-state') || '').toLowerCase();
        if (!estado || ESTADOS_INATIVOS[estado]) return null;
        var u;
        try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { return null; }
        var p = (u.searchParams.get('P') || '').toLowerCase();
        var id = u.searchParams.get('I') || '';
        if (!/^\d+$/.test(id) || (p !== 'funcionarios' && p !== 'profissionais')) return null;
        return {
            a: a,
            p: p === 'funcionarios' ? 'Funcionarios' : 'Profissionais',
            id: id,
            funcionario: p === 'funcionarios',
            perm: ligadoBtnPerm,
            reaplicar: ligadoBtnReaplicarLista   // funcionários e profissionais têm regras predefinidas
        };
    }

    function processarLinha(tr) {
        var alvo = alvoDaLinha(tr);
        var cont = alvo ? alvo.a.parentNode : (tr.querySelector('a[href*="Pers=1"][href*="I="]') || {}).parentNode;
        if (!cont) return;
        var grupos = cont.querySelectorAll('.' + CLASSE_GRUPO_LISTA);
        var quer = alvo && (alvo.perm || alvo.reaplicar);
        var chave = quer ? [alvo.p, alvo.id, alvo.perm ? 1 : 0, alvo.reaplicar ? 1 : 0].join('|') : '';
        // Linha reaproveitada pela lista (paginação/filtro): confere a chave e refaz se mudou.
        for (var i = 0; i < grupos.length; i++) {
            if (i === 0 && chave && grupos[i].getAttribute('data-chave') === chave) continue;
            grupos[i].remove();
        }
        if (!quer || (grupos.length && grupos[0].isConnected && grupos[0].getAttribute('data-chave') === chave)) return;

        // Nome e "Último acesso" ficavam em coluna; passam a quebrar linha para o botão ficar AO LADO do nome.
        if (!cont.hasAttribute('data-hoc-perm-ajustado')) {
            cont.setAttribute('data-hoc-perm-ajustado', '1');
            cont.style.flexDirection = 'row';
            cont.style.flexWrap = 'wrap';
            cont.style.alignItems = 'center';
            for (var k = 0; k < cont.children.length; k++) {
                if (cont.children[k] !== alvo.a && cont.children[k].tagName === 'P') cont.children[k].style.flexBasis = '100%';
            }
        }
        var g = document.createElement('span');
        g.className = CLASSE_GRUPO_LISTA;
        g.setAttribute('data-chave', chave);
        if (alvo.perm) g.appendChild(criarBotaoLista('hoc-perm-abrir', '🔐 Permissões', 'Abrir as permissões deste cadastro em nova aba', linkDoCadastro(alvo.p, alvo.id, false)));
        if (alvo.reaplicar) g.appendChild(criarBotaoLista('hoc-perm-reaplicar', '♻️ Reaplicar', 'Abrir e reaplicar a regra de permissões deste cadastro', linkDoCadastro(alvo.p, alvo.id, true)));
        alvo.a.parentNode.insertBefore(g, alvo.a.nextSibling);
    }

    function processarRaiz(raiz) {
        if (!raiz.getElementById || !raiz.querySelector('#hoc-perm-lista-css')) {
            var st = document.createElement('style');
            st.id = 'hoc-perm-lista-css';
            st.textContent = cssDasListas();
            raiz.appendChild(st);
        }
        var badges = raiz.querySelectorAll('[data-testid="access-state-badge"]');
        for (var i = 0; i < badges.length; i++) {
            var tr = badges[i].closest('tr');
            if (tr) processarLinha(tr);
        }
        atualizarBotaoMassa(raiz);
    }

    // ---- Botão "Reaplicar em todos (N)" à direita do filtro de status ----
    // N = cadastros ATIVOS (funcionários ou profissionais, conforme a lista) com linha na tela agora (mesma regra do ♻️ de cada linha).
    var TEXTO_MASSA = '♻️ Reaplicar em todos';
    function funcionariosDaTela(raiz) {
        var achados = [], vistos = {};
        var badges = raiz.querySelectorAll('[data-testid="access-state-badge"]');
        for (var i = 0; i < badges.length; i++) {
            var tr = badges[i].closest('tr');
            var alvo = tr && alvoDaLinha(tr);
            if (!alvo || vistos[alvo.id]) continue;
            vistos[alvo.id] = true;
            achados.push({ id: alvo.id, tipo: alvo.p, nome: limpar(alvo.a.textContent) || (alvo.p === 'Profissionais' ? 'Profissional ' : 'Funcionário ') + alvo.id });
        }
        return achados;
    }

    function atualizarBotaoMassa(raiz) {
        var sel = raiz.querySelector('select[aria-label="Filtrar por status de acesso"]');
        var lab = sel && (sel.closest('label') || sel);
        var pai = lab && lab.parentNode;
        var antigo = pai ? pai.querySelector('.hoc-perm-massa') : null;
        if (!pai || !ligadoBtnMassa) { if (antigo) antigo.remove(); return; }
        var ehProf = !!raiz.host && raiz.host.tagName.toLowerCase() === 'feegow-professionals-list';
        var quem = ehProf ? 'profissionais' : 'funcionários';
        var n = funcionariosDaTela(raiz).length;
        var texto = TEXTO_MASSA + ' (' + n + ')';
        var titulo = n ? 'Reaplica a regra de permissões marcada (✓) em cada um dos ' + n + ' ' + quem + ' ativos desta lista, um por vez, sem abrir abas.' : 'Nenhum ' + (ehProf ? 'profissional ativo' : 'funcionário ativo') + ' na tela.';
        var b = antigo;
        if (!b) {
            b = document.createElement('button');
            b.type = 'button';
            b.className = 'hoc-perm-btn hoc-perm-reaplicar hoc-perm-massa';
            b.addEventListener('click', function (ev) {
                ev.stopPropagation();
                if (b.disabled) return;
                iniciarMassa(raiz);
            });
            pai.insertBefore(b, lab.nextSibling);
        } else if (b.previousSibling !== lab) {
            pai.insertBefore(b, lab.nextSibling);
        }
        if (b.textContent !== texto) b.textContent = texto;
        if (b.title !== titulo) b.title = titulo;
        var carregando = !!raiz.host && expansaoEmCurso(raiz.host);
        if (carregando) titulo = 'Carregando todos os cadastros da lista...';
        if (b.title !== titulo) b.title = titulo;
        var desab = !n || massaRodando || carregando;
        if (b.disabled !== desab) b.disabled = desab;
    }

    // ---- Mostrar todos os cadastros (sem páginas) ----
    // O componente da lista não aceita tamanho de página: o BFF (accounts-bff.feegow.com/staff|professionals/view-data)
    // ignora pageSize (sempre 20) e a lista não re-renderiza se a propriedade `list` for trocada (ele guarda estado interno).
    // Então o módulo coloca no fetch DA PÁGINA um gancho: quando o componente pede view-data (primeira página, com o filtro/busca/letra
    // dele), o gancho busca as demais páginas com a MESMA URL e os MESMOS cabeçalhos (Authorization do próprio componente), junta as
    // linhas e devolve ao componente uma única resposta com pagination {page:1, totalPages:1}. Só GET de leitura; teto de 1000 cadastros;
    // se qualquer página falhar, devolve a resposta original (a lista continua paginada, nada quebra). O gancho roda no mundo da
    // página (<script> injetado), porque o Tampermonkey isola o `window` do script.
    var TODOS_TETO = 1000;
    var hookTodosOk = false;

    function hookTodosNaPagina(TETO) {
        var H = document.documentElement;
        if (H.getAttribute('data-hoc-todos-hook')) return;
        var orig = window.fetch;
        if (typeof orig !== 'function' || typeof Response !== 'function') return;
        function ehViewData(url) {
            try {
                var u = new URL(url, location.href);
                return /^accounts-bff\./i.test(u.hostname) && /^\/(?:staff|professionals)\/view-data\/?$/.test(u.pathname) ? u : null;
            } catch (e) { return null; }
        }
        function fim() { H.removeAttribute('data-hoc-todos-carregando'); }
        window.fetch = function (input, init) {
            var args = arguments, self = this;
            var url = typeof input === 'string' ? input : (input && input.url) || String(input);
            var metodo = String((init && init.method) || (input && typeof input === 'object' && input.method) || 'GET').toUpperCase();
            var u = ehViewData(url);
            if (!u || metodo !== 'GET' || H.getAttribute('data-hoc-cfg-todos') === '0') return orig.apply(self, args);
            var cab = (init && init.headers) || (input && typeof input === 'object' && input.headers) || undefined;
            var opts = { method: 'GET', headers: cab, credentials: (init && init.credentials) || (input && typeof input === 'object' && input.credentials) || 'same-origin', signal: init && init.signal };
            function pagina(n) {
                var x = new URL(u.toString()); x.searchParams.set('page', String(n));
                return orig.call(window, x.toString(), opts).then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.text().then(function (t) { return { r: r, t: t, j: JSON.parse(t) }; });
                });
            }
            H.setAttribute('data-hoc-todos-carregando', '1');
            return pagina(1).then(function (p1) {
                var L = p1.j && p1.j.list, pg = L && L.pagination;
                var devolverOriginal = function () { return new Response(p1.t, { status: p1.r.status, statusText: p1.r.statusText, headers: { 'Content-Type': p1.r.headers.get('content-type') || 'application/json' } }); };
                if (!L || !pg || !L.items || !(pg.totalPages > 1)) { fim(); return devolverOriginal(); }
                var tamanho = L.items.length || pg.pageSize || 20;
                var ultima = Math.min(pg.totalPages, Math.max(1, Math.ceil(TETO / tamanho)));
                var paginas = [], n;
                for (n = 2; n <= ultima; n++) paginas.push(n);
                var resultados = {}, fila = paginas.slice(), erro = false;
                function trabalhador() {
                    if (erro || !fila.length) return Promise.resolve();
                    var k = fila.shift();
                    return pagina(k).then(function (px) { resultados[k] = px.j; }).catch(function () { erro = true; }).then(trabalhador);
                }
                return Promise.all([trabalhador(), trabalhador(), trabalhador(), trabalhador()]).then(function () {
                    if (erro) { fim(); return devolverOriginal(); }
                    var itens = L.items.slice(), vistos = {};
                    itens.forEach(function (it) { if (it && it.id != null) vistos[it.id] = true; });
                    paginas.forEach(function (k) {
                        var li = resultados[k] && resultados[k].list && resultados[k].list.items;
                        (li || []).forEach(function (it) { if (it && it.id != null && vistos[it.id]) return; if (it && it.id != null) vistos[it.id] = true; itens.push(it); });
                    });
                    var truncado = ultima < pg.totalPages;
                    var novo = JSON.parse(JSON.stringify(p1.j));
                    novo.list.items = itens;
                    novo.list.pagination = { page: 1, pageSize: Math.max(itens.length, pg.pageSize || 20), total: truncado ? pg.total : itens.length, totalPages: 1 };
                    H.setAttribute('data-hoc-todos-n', String(itens.length));
                    if (truncado) H.setAttribute('data-hoc-todos-truncado', String(pg.total)); else H.removeAttribute('data-hoc-todos-truncado');
                    fim();
                    return new Response(JSON.stringify(novo), { status: 200, statusText: 'OK', headers: { 'Content-Type': p1.r.headers.get('content-type') || 'application/json' } });
                });
            }).catch(function (e) {
                fim();
                return orig.apply(self, args);   // qualquer falha: pedido original, sem juntar
            });
        };
        window.fetch.__hocTodos = true;
        H.setAttribute('data-hoc-todos-hook', '1');
    }

    function instalarHookTodos() {
        if (!ligadoTodos || document.documentElement.getAttribute('data-hoc-todos-hook')) { hookTodosOk = !!document.documentElement.getAttribute('data-hoc-todos-hook'); return; }
        try {
            var sc = document.createElement('script');
            sc.textContent = '(' + hookTodosNaPagina.toString() + ')(' + TODOS_TETO + ');';
            (document.head || document.documentElement).appendChild(sc);
            sc.remove();
        } catch (e) { console.warn(PREFIXO + ' Não foi possível instalar o gancho de "mostrar todos":', e); }
        hookTodosOk = !!document.documentElement.getAttribute('data-hoc-todos-hook');
        if (!hookTodosOk) console.warn(PREFIXO + ' "Mostrar todos os cadastros" indisponível nesta página (script bloqueado?); a lista segue paginada.');
    }

    // Troca a paginação por "Mostrando todos: N cadastros" quando a lista inteira está na tela (1-N de N).
    var REGEX_FAIXA = /^\s*1\s*[-–]\s*(\d+)\s+de\s+(\d+)/;
    function ajustarPaginacao(raiz) {
        var faixa = raiz.querySelector('[data-testid$="pagination-range"]');
        var nav = raiz.querySelector('nav[data-testid$="pagination"]');
        var nosso = raiz.querySelector('.hoc-todos-texto');
        var m = ligadoTodos && hookTodosOk && faixa ? REGEX_FAIXA.exec(faixa.textContent || '') : null;
        var inteira = !!m && m[1] === m[2];
        var trunc = document.documentElement.getAttribute('data-hoc-todos-truncado');
        if (!ligadoTodos || !hookTodosOk || !faixa || (!inteira && !(m && trunc))) {
            if (nosso) nosso.remove();
            if (faixa && faixa.hasAttribute('data-hoc-oculto')) { faixa.removeAttribute('data-hoc-oculto'); faixa.style.display = ''; }
            if (nav && nav.hasAttribute('data-hoc-oculto')) { nav.removeAttribute('data-hoc-oculto'); nav.style.display = ''; }
            return;
        }
        var texto = inteira ? 'Mostrando todos: ' + m[2] + ' cadastros' : 'Mostrando ' + m[1] + ' de ' + trunc + ' cadastros (limite de ' + TODOS_TETO + ')';
        if (!nosso) {
            nosso = document.createElement('p');
            nosso.className = (faixa.className || '') + ' hoc-todos-texto';
            nosso.setAttribute('data-testid', 'hoc-todos-texto');
            faixa.parentNode.insertBefore(nosso, faixa.nextSibling);
        }
        if (nosso.textContent !== texto) nosso.textContent = texto;
        if (!faixa.hasAttribute('data-hoc-oculto')) { faixa.setAttribute('data-hoc-oculto', '1'); faixa.style.display = 'none'; }
        if (nav && !nav.hasAttribute('data-hoc-oculto')) { nav.setAttribute('data-hoc-oculto', '1'); nav.style.display = 'none'; }
    }

    // Primeira carga: a lista vem pronta no atributo (20 linhas), sem fetch. Pede ao componente a mesma lista de novo
    // (re-dispara o change do filtro de status com o valor atual) para o gancho juntar as páginas. Uma vez por host.
    var hostsExpandidos = (typeof WeakSet === 'function') ? new WeakSet() : null;
    var hostsPendentes = (typeof WeakMap === 'function') ? new WeakMap() : null;   // host -> instante em que a expansão foi pedida
    function expandirNoHost(host, raiz, filtroDisparou) {
        if (!ligadoTodos || !hookTodosOk || !hostsExpandidos || hostsExpandidos.has(host)) return;
        var faixa = raiz.querySelector('[data-testid$="pagination-range"]');
        var m = faixa && REGEX_FAIXA.exec(faixa.textContent || '');
        if (!filtroDisparou) {
            if (m && m[1] === m[2]) { hostsExpandidos.add(host); return; }   // já inteira
            var sel = raiz.querySelector('select[aria-label="Filtrar por status de acesso"]');
            if (!sel) return;   // ainda não renderizou; tenta na próxima varredura
            sel.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            sel.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        }
        hostsExpandidos.add(host);
        if (hostsPendentes) hostsPendentes.set(host, Date.now());
    }
    function expansaoEmCurso(host) {
        if (!ligadoTodos || !hookTodosOk) return false;
        if (document.documentElement.getAttribute('data-hoc-todos-carregando') === '1') return true;
        var t = hostsPendentes && hostsPendentes.get(host);
        if (!t) return false;
        var faixa = host.shadowRoot && host.shadowRoot.querySelector('[data-testid$="pagination-range"]');
        var m = faixa && REGEX_FAIXA.exec(faixa.textContent || '');
        if (m && m[1] === m[2]) { hostsPendentes.delete(host); return false; }
        if (Date.now() - t > 10000) { hostsPendentes.delete(host); return false; }   // não deu certo: não trava o botão
        return true;
    }

    var agendadoListas = null;
    function agendarListas() {
        if (agendadoListas) return;
        agendadoListas = setTimeout(function () { agendadoListas = null; varrerListas(); }, 150);
    }

    // ---- Filtro de status em "Ativo" ao abrir ----
    // O <select aria-label="Filtrar por status de acesso"> está no shadow root do componente (staff-status-filter
    // em funcionários, professionals-status-filter em profissionais). O componente reage a input/change (testado):
    // ao mudar o valor ele refaz a lista pela API. Aplica UMA vez por select; se o usuário mexer no filtro
    // (evento confiável), nunca mais mexe naquele componente. Se o componente recriar o select sem o usuário
    // ter mexido, aplica de novo.
    var selectsAplicados = (typeof WeakSet === 'function') ? new WeakSet() : null;
    var hostsDoUsuario = (typeof WeakSet === 'function') ? new WeakSet() : null;
    var hostsComEscuta = (typeof WeakSet === 'function') ? new WeakSet() : null;

    function filtroAtivoNoHost(host, raiz) {
        if (!ligadoListaAtivo || !selectsAplicados) return false;
        if (!hostsComEscuta.has(host)) {
            hostsComEscuta.add(host);
            raiz.addEventListener('change', function (ev) { if (ev.isTrusted) hostsDoUsuario.add(host); }, true);
        }
        if (hostsDoUsuario.has(host)) return false;
        var sel = raiz.querySelector('select[aria-label="Filtrar por status de acesso"]');
        if (!sel || selectsAplicados.has(sel)) return false;
        var temAtivo = false;
        for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === 'active') temAtivo = true;
        if (!temAtivo) return false;
        selectsAplicados.add(sel);
        if (sel.value === 'active') return false;
        sel.value = 'active';
        sel.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        return true;   // o change já refaz a lista (e o gancho junta as páginas)
    }

    function varrerListas() {
        if (!tela_lista()) return;
        if (!ligadoBtnPerm && !ligadoBtnReaplicarLista && !ligadoListaAtivo && !ligadoBtnMassa && !ligadoTodos) return;
        for (var i = 0; i < HOSTS_LISTA.length; i++) {
            var hosts = document.querySelectorAll(HOSTS_LISTA[i]);
            for (var j = 0; j < hosts.length; j++) {
                var raiz = hosts[j].shadowRoot;
                if (!raiz) continue;
                if (raizesObservadas && !raizesObservadas.has(raiz)) {
                    raizesObservadas.add(raiz);
                    new MutationObserver(agendarListas).observe(raiz, { childList: true, subtree: true });
                }
                var filtroDisparou = filtroAtivoNoHost(hosts[j], raiz);
                expandirNoHost(hosts[j], raiz, filtroDisparou);
                if (ligadoTodos) ajustarPaginacao(raiz);
                if (ligadoBtnPerm || ligadoBtnReaplicarLista || ligadoBtnMassa) processarRaiz(raiz);
            }
        }
    }

    if (tela_lista() && (ligadoBtnPerm || ligadoBtnReaplicarLista || ligadoListaAtivo || ligadoBtnMassa || ligadoTodos)) {
        if (ligadoTodos) instalarHookTodos();
        varrerListas();
        new MutationObserver(agendarListas).observe(document.documentElement, { childList: true, subtree: true });
        setInterval(varrerListas, 1000);   // rede de segurança: o shadow root pode surgir depois do host
    }
    window.__hocPermListas = { varrer: varrerListas, alvoDaLinha: alvoDaLinha, linkDoCadastro: linkDoCadastro };

    // =====================================================================
    // REAPLICAR EM TODOS: reaplica a regra marcada (✓) em todos os cadastros ativos da tela (funcionários ou profissionais)
    // =====================================================================
    // Sem abrir abas: para cada funcionário, em sequência (pausa de 500 ms), usa as MESMAS requisições que o
    // Feegow faz na aba Permissões:
    //   1) ler:    POST ajxContent.asp?P=Permissoes&T=<Funcionarios|Profissionais>&I=<id>&Pers=1&q=&Div=divPermissoes (corpo vazio, como o
    //              ajxContent() da aba) -> HTML com o formulário (permissionProfileCsrf) e a tabela de regras (✓ + Aplicar);
    //   2) aplicar: POST ajxContent.asp?P=Permissoes&T=<Funcionarios|Profissionais>&I=<id>&Pers=1&Div=divPermissoes com
    //              AplicaRegra, UsId e permissionProfileCsrf (corpo igual ao permissoesAcao() da página).
    // A regra e o UsId saem do onclick do botão Aplicar da linha com ✓ (regraAtual() sobre o HTML lido); o token vem
    // do próprio formulário daquele funcionário. A resposta do aplicar é conferida (regra segue marcada).
    var MASSA_PAUSA_MS = 500;
    var MASSA_TIMEOUT_MS = 30000;

    function pedidoPermissoes(id, aplicar, tipo) {
        var url = location.origin + '/main/ajxContent.asp?P=Permissoes&T=' + (tipo === 'Profissionais' ? 'Profissionais' : 'Funcionarios') + '&I=' + encodeURIComponent(id) + '&Pers=1' + (aplicar ? '' : '&q=') + '&Div=divPermissoes';
        var ctl = (typeof AbortController === 'function') ? new AbortController() : null;
        var timer = ctl ? setTimeout(function () { ctl.abort(); }, MASSA_TIMEOUT_MS) : null;
        return fetch(url, {
            method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: ctl ? ctl.signal : undefined,
            body: aplicar ? new URLSearchParams(aplicar).toString() : '',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }
        }).then(function (r) {
            clearTimeout(timer);
            if (!r.ok) return { ok: false, motivo: 'HTTP ' + r.status };
            return r.text().then(function (html) { return { ok: true, html: html }; });
        }).catch(function (e) {
            clearTimeout(timer);
            return { ok: false, motivo: (e && e.name === 'AbortError') ? 'demorou mais de ' + (MASSA_TIMEOUT_MS / 1000) + ' s' : 'falha de rede (' + (e && e.message || e) + ')' };
        });
    }

    // Lê a aba Permissões de um funcionário sem abrir nada. Devolve {ok, semRegra, regra, csrf, doc} ou {ok:false, motivo}.
    function lerPermissoesDe(id, tipo) {
        return pedidoPermissoes(id, null, tipo).then(function (res) {
            if (!res.ok) return res;
            var doc = new DOMParser().parseFromString(res.html, 'text/html');
            var form = doc.getElementById('frmPermissoes');
            if (!form) return { ok: false, motivo: 'a aba Permissões não veio (sessão expirada ou sem acesso?)' };
            var campo = form.querySelector('input[name="permissionProfileCsrf"]');
            var csrf = campo && campo.value;
            if (!csrf) { var m = /permissionProfileCsrf\s*=\s*["']([^"']+)["']/.exec(res.html); csrf = m ? m[1] : ''; }
            if (!csrf) return { ok: false, motivo: 'sem token de segurança na aba (sessão expirada?)' };
            var plano = planoDe(doc, tipo === 'Profissionais' ? 'Profissionais' : 'Funcionarios');
            if (plano.acao === 'erro') return { ok: false, motivo: plano.motivo };
            if (plano.acao === 'sem') return { ok: true, semRegra: true, doc: doc };
            var regra = plano.regra;
            var e = form.querySelector('input[name="e"]');
            if (e && e.value && e.value !== regra.usId) return { ok: false, motivo: 'UsId da regra não confere com o do formulário; nada enviado' };
            return { ok: true, regra: regra, troca: plano.troca, csrf: csrf, doc: doc };
        });
    }

    // Parâmetros EXATOS que o Aplicar envia (os mesmos do permissoesAcao).
    function parametrosDoAplicar(leitura) {
        return { AplicaRegra: leitura.regra.aplicaRegra, UsId: leitura.regra.usId, permissionProfileCsrf: leitura.csrf };
    }

    function aplicarRegraDe(id, leitura, tipo) {
        return pedidoPermissoes(id, parametrosDoAplicar(leitura), tipo).then(function (res) {
            if (!res.ok) return res;
            var doc = new DOMParser().parseFromString(res.html, 'text/html');
            var nova = regraAtual(doc);
            if (!nova) return { ok: false, motivo: 'enviado, mas a resposta não mostra regra marcada; confira o cadastro' };
            if (nova.aplicaRegra !== leitura.regra.aplicaRegra) return { ok: false, motivo: 'enviado, mas a regra marcada na resposta é outra (' + nova.nome + '); confira o cadastro' };
            return { ok: true, nome: nova.nome };
        });
    }

    function pausaMassa(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    function cssMassa() {
        if (document.getElementById('hoc-massa-css')) return;
        var st = document.createElement('style');
        st.id = 'hoc-massa-css';
        st.textContent = [
            '.hoc-massa-fundo{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:2147483000;display:flex;align-items:center;justify-content:center;}',
            '.hoc-massa-caixa{background:#fff;border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,.3);width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 48px);display:flex;flex-direction:column;padding:18px 20px 14px;font-size:14px;color:#333;}',
            '.hoc-massa-caixa h4{margin:0 0 10px;font-size:16px;font-weight:600;}',
            '.hoc-massa-atual{margin:0 0 8px;line-height:1.4;min-height:20px;}',
            '.hoc-massa-barra{height:10px;background:#e5e7e7;border-radius:999px;overflow:hidden;margin:0 0 12px;}',
            '.hoc-massa-barra>div{height:100%;width:0;background:#006453;transition:width .2s;}',
            '.hoc-massa-resumo{margin:0 0 8px;font-weight:600;}',
            '.hoc-massa-lista{list-style:none;margin:0 0 14px;padding:0;overflow:auto;border:1px solid #e5e7e7;border-radius:4px;max-height:42vh;font-size:13px;}',
            '.hoc-massa-lista li{padding:4px 10px;border-bottom:1px solid #f0f1f1;display:flex;gap:8px;justify-content:space-between;}',
            '.hoc-massa-lista li:last-child{border-bottom:0;}',
            '.hoc-massa-lista .ok{color:#2e7d32;}.hoc-massa-lista .sem{color:#8a6d00;}.hoc-massa-lista .erro{color:#c62828;}.hoc-massa-lista .pend{color:#777;}',
            '.hoc-massa-acoes{display:flex;justify-content:flex-end;gap:8px;}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(st);
    }

    function textoRelatorioMassa(itens, contagem, parou) {
        var linhas = ['Reaplicar em todos (' + new Date().toLocaleString('pt-BR') + ')',
            'Reaplicado: ' + contagem.ok + ' · Sem regra: ' + contagem.sem + ' · Erros: ' + contagem.erro + (parou ? ' · Não processados (parado): ' + contagem.pend : ''), ''];
        itens.forEach(function (it) { linhas.push(it.nome + ' (' + it.id + '): ' + it.txt); });
        return linhas.join('\n');
    }

    function iniciarMassa(raiz) {
        if (massaRodando) return;
        if (raiz.host && expansaoEmCurso(raiz.host)) { aviso('A lista ainda está carregando todos os cadastros. Tente de novo em instantes.', 'erro', 5000); return; }
        var alvos = funcionariosDaTela(raiz);
        var quem = (alvos[0] && alvos[0].tipo === 'Profissionais') ? 'profissionais' : 'funcionários';
        if (!alvos.length) { aviso('Nenhum cadastro ativo na tela. Nada foi feito.', 'erro', 6000); return; }
        var etapa = ligadoConfirmaMassa
            ? perguntar('Reaplicar em todos', 'Reaplicar a regra marcada em ' + alvos.length + ' ' + quem + ' desta lista?', 'Reaplicar')
            : Promise.resolve(true);
        etapa.then(function (sim) {
            if (!sim) { aviso('Cancelado. Nada foi alterado.', '', 4000); return; }
            executarMassa(alvos);
        });
    }

    function executarMassa(alvos) {
        if (massaRodando) return;
        massaRodando = true;
        agendarListas();
        cssMassa();
        var itens = alvos.map(function (a) { return { id: a.id, tipo: a.tipo, nome: a.nome, estado: 'pend', txt: 'aguardando' }; });
        var parar = false, concluido = false;
        var fundo = el('div', { classe: 'hoc-massa-fundo' });
        var titulo = el('h4', { texto: 'Reaplicar em todos' });
        var atual = el('p', { classe: 'hoc-massa-atual', texto: 'Preparando...' });
        var preench = el('div');
        var barra = el('div', { classe: 'hoc-massa-barra' }, [preench]);
        var resumo = el('p', { classe: 'hoc-massa-resumo' });
        var ul = el('ul', { classe: 'hoc-massa-lista' });
        var bParar = el('button', { type: 'button', classe: 'btn btn-sm btn-default', texto: 'Parar' });
        var bCopiar = el('button', { type: 'button', classe: 'btn btn-sm btn-default', texto: 'Copiar relatório' });
        var bFechar = el('button', { type: 'button', classe: 'btn btn-sm btn-primary', texto: 'Fechar' });
        bCopiar.style.display = 'none'; bFechar.style.display = 'none';
        var acoes = el('div', { classe: 'hoc-massa-acoes' }, [bParar, bCopiar, bFechar]);
        var caixa = el('div', { classe: 'hoc-massa-caixa', role: 'dialog', 'aria-modal': 'true' }, [titulo, atual, barra, resumo, ul, acoes]);
        fundo.appendChild(caixa);

        function contagem() {
            var c = { ok: 0, sem: 0, erro: 0, pend: 0 };
            itens.forEach(function (it) { c[it.estado === 'pend' ? 'pend' : it.estado]++; });
            return c;
        }
        function desenhar() {
            var c = contagem(), feitas = itens.length - c.pend;
            preench.style.width = Math.round(feitas * 100 / itens.length) + '%';
            resumo.textContent = 'Reaplicado: ' + c.ok + ' · Sem regra: ' + c.sem + ' · Erros: ' + c.erro + (concluido && c.pend ? ' · Não processados: ' + c.pend : '');
            ul.textContent = '';
            itens.forEach(function (it) {
                ul.appendChild(el('li', { classe: it.estado }, [el('span', { texto: it.nome }), el('span', { texto: it.txt })]));
            });
        }
        function encerrar() {
            concluido = true;
            massaRodando = false;
            bParar.style.display = 'none';
            bCopiar.style.display = ''; bFechar.style.display = '';
            titulo.textContent = parar ? 'Reaplicar em todos: parado' : 'Reaplicar em todos: concluído';
            if (parar) itens.forEach(function (it) { if (it.estado === 'pend') it.txt = 'não processado (parado)'; });
            var c = contagem();
            atual.textContent = parar ? 'Parado pelo usuário. Quem já foi processado ficou como está na lista.' : 'Terminou: ' + itens.length + ' cadastros.';
            desenhar();
            bFechar.focus();
            agendarListas();
            window.__hocUltimoRelatorioMassa = textoRelatorioMassa(itens, c, parar);
        }
        bParar.addEventListener('click', function () { parar = true; bParar.disabled = true; bParar.textContent = 'Parando...'; });
        bFechar.addEventListener('click', function () { fundo.remove(); });
        bCopiar.addEventListener('click', function () {
            copiarTexto(textoRelatorioMassa(itens, contagem(), parar)).then(function () { aviso('Relatório copiado.', 'ok', 3000); }, function () { aviso('Não consegui copiar o relatório.', 'erro', 5000); });
        });
        document.body.appendChild(fundo);
        desenhar();

        function proximo(i) {
            if (i >= itens.length || parar) return encerrar();
            var it = itens[i];
            atual.textContent = 'Processando ' + (i + 1) + ' de ' + itens.length + ': ' + it.nome;
            lerPermissoesDe(it.id, it.tipo).then(function (leitura) {
                if (!leitura.ok) { it.estado = 'erro'; it.txt = 'erro ao ler: ' + leitura.motivo; return; }
                if (leitura.semRegra) { it.estado = 'sem'; it.txt = 'sem regra marcada (pulado)'; return; }
                if (parar) return;   // parou durante a leitura: nada enviado para este
                return aplicarRegraDe(it.id, leitura, it.tipo).then(function (r) {
                    if (r.ok) { it.estado = 'ok'; it.txt = leitura.troca ? leitura.troca + ' (aplicada)' : 'regra \'' + leitura.regra.nome + '\' reaplicada'; }
                    else { it.estado = 'erro'; it.txt = 'erro: ' + r.motivo; }
                });
            }).catch(function (e) {
                it.estado = 'erro'; it.txt = 'erro: ' + (e && e.message || e);
            }).then(function () {
                desenhar();
                return pausaMassa(MASSA_PAUSA_MS);
            }).then(function () { proximo(i + 1); });
        }
        proximo(0);
    }

    window.__hocPermMassa = { ler: lerPermissoesDe, parametros: parametrosDoAplicar, iniciar: iniciarMassa, funcionarios: funcionariosDaTela };

    // =====================================================================
    // AÇÃO PELO LINK: &hocAcao=reaplicar (botão ♻️ das listas)
    // =====================================================================
    // Dispara UMA vez: o parâmetro sai da URL (history.replaceState) assim que é lido, então
    // recarregar a página não reaplica. Sem confirmação por padrão (a opção "Pedir confirmação"
    // da engrenagem vem desligada). Reusa regraAtual(), perguntar() e aviso() do módulo e clica no
    // próprio "Aplicar" da regra com ✓ verde.

    function removerParamDaUrl(nome) {
        try {
            var u = new URL(location.href);
            var apagar = [];
            u.searchParams.forEach(function (v, k) { if (k.toLowerCase() === nome.toLowerCase()) apagar.push(k); });
            if (!apagar.length) return;
            apagar.forEach(function (k) { u.searchParams.delete(k); });
            history.replaceState(history.state, '', u.pathname + u.search + u.hash);
        } catch (e) { /* sem history API: segue */ }
    }

    function contarMarcadas() {
        var f = document.getElementById('frmPermissoes');
        return f ? f.querySelectorAll('input[type="checkbox"]:checked').length : 0;
    }

    function nomeDoCadastroAberto() {
        var f = document.getElementById('frmPermissoes');
        var h = f && f.querySelector('.panel-heading');
        return h ? nomeFuncionario(h) : 'este cadastro';
    }

    function esperarAte(teste, ms, passo) {
        return new Promise(function (resolve) {
            var fim = Date.now() + ms;
            (function volta() {
                var r;
                try { r = teste(); } catch (e) { r = null; }
                if (r) return resolve(r);
                if (Date.now() >= fim) return resolve(null);
                setTimeout(volta, passo || 300);
            })();
        });
    }

    // Espera a aba Permissões carregar POR COMPLETO: #frmPermissoes + tabela de regras predefinidas
    // (botões editaRegra(...) / AplicaRegra) presentes e ESTÁVEIS (nada mudou no #divPermissoes por 700 ms).
    // Devolve Promise<'ok' | 'sem-form' | 'sem-tabela'> (timeout padrão 25 s).
    var SEL_TABELA_REGRAS = '[onclick*="editaRegra("], [onclick*="AplicaRegra"]';
    function aguardarPermissoesCarregada(ms, estavelMs) {
        ms = ms || 25000; estavelMs = estavelMs || 700;
        return new Promise(function (resolve) {
            var fim = Date.now() + ms, ultimaMudanca = Date.now(), assinatura = '', obs = null, timer = null;
            function assin() {
                var f = document.getElementById('frmPermissoes');
                if (!f) return '';
                var d = document.getElementById('divPermissoes') || document;
                var n = d.querySelectorAll(SEL_TABELA_REGRAS).length;
                if (!n) return '';
                return n + '|' + d.querySelectorAll('td i.fa-check.green').length + '|' + f.querySelectorAll('input[type="checkbox"]').length;
            }
            function fechar(r) {
                if (obs) obs.disconnect();
                clearTimeout(timer);
                resolve(r);
            }
            function checar() {
                var a = assin();
                if (a !== assinatura) { assinatura = a; ultimaMudanca = Date.now(); }
                if (a && Date.now() - ultimaMudanca >= estavelMs) return fechar('ok');
                if (Date.now() >= fim) return fechar(document.getElementById('frmPermissoes') ? 'sem-tabela' : 'sem-form');
                timer = setTimeout(checar, 150);
            }
            try {
                obs = new MutationObserver(function () { ultimaMudanca = Date.now(); });
                obs.observe(document.documentElement, { childList: true, subtree: true });
            } catch (e) { obs = null; }
            checar();
        });
    }

    function reaplicarPelaLista() {
        aguardarPermissoesCarregada(25000, 700).then(function (estado) {
            if (estado !== 'ok') {
                aviso('A aba Permissões demorou para carregar; tente de novo. Nada foi aplicado.', 'erro', 9000);
                return;
            }
            var plano = planoDe(document, tipoDaTela());
            if (plano.acao === 'erro') { aviso('Nada foi aplicado: ' + plano.motivo + '.', 'erro', 10000); return; }
            if (plano.acao === 'sem') { aviso('Este cadastro não tem regra marcada. Nada foi aplicado.', 'erro', 9000); return; }
            var regra = plano.regra;
            var nome = nomeDoCadastroAberto();
            var etapa = ligadoConfirmaLista
                ? perguntar('Reaplicar regra de permissões', (plano.troca ? 'Trocar a regra (' + plano.troca + ')' : 'Reaplicar a regra \'' + regra.nome + '\'') + ' em ' + nome + '?', 'Reaplicar')
                : Promise.resolve(true);
            etapa.then(function (sim) {
                if (!sim) { aviso('Cancelado. Nada foi alterado.', '', 4000); return; }
                var agoraPlano = planoDe(document, tipoDaTela());
                var agora = agoraPlano.acao === 'aplicar' ? agoraPlano.regra : null;
                if (!agora || agora.aplicaRegra !== regra.aplicaRegra || agora.usId !== regra.usId) {
                    aviso('A regra marcada mudou na tela. Nada foi feito.', 'erro', 8000);
                    return;
                }
                var formAntigo = document.getElementById('frmPermissoes');
                var antes = contarMarcadas();
                agora.botao.click();   // mesmo caminho do "Aplicar" original (permissoesAcao + token da página)
                aviso((plano.troca ? 'Aplicando ' + plano.troca : 'Reaplicando a regra \'' + regra.nome + '\'') + '...', '', 20000);
                esperarAte(function () {
                    var f = document.getElementById('frmPermissoes');
                    return (f && f !== formAntigo && regraAtual()) ? true : null;   // #divPermissoes foi recarregado
                }, 20000, 300).then(function (recarregou) {
                    if (!recarregou) {
                        aviso('Pedido enviado, mas não vi a tela recarregar. Confira se apareceu "Regra aplicada.".', 'erro', 10000);
                        return;
                    }
                    var depois = contarMarcadas();
                    var nova = regraAtual();
                    if (!nova || nova.aplicaRegra !== regra.aplicaRegra) {
                        aviso('Recarregou, mas a regra \'' + regra.nome + '\' não aparece marcada. Confira o cadastro.', 'erro', 10000);
                        return;
                    }
                    aviso('✔ ' + (plano.troca ? plano.troca + ': regra \'' + regra.nome + '\' aplicada' : 'Regra \'' + regra.nome + '\' reaplicada') + ' em ' + nome + ' (' + (antes === depois ? depois + ' permissões marcadas, sem mudança' : antes + ' → ' + depois + ' permissões marcadas') + ').', 'ok', 9000);
                });
            });
        });
    }

    var acaoPedida = paramDaUrl('hocAcao').toLowerCase();
    if (acaoPedida) removerParamDaUrl('hocAcao');   // uma vez só: recarregar não repete
    if (acaoPedida === 'reaplicar' && ligadoBtnReaplicarLista && telaDeFuncionario() && idDaPessoa()) {
        reaplicarPelaLista();
    }

    // Daqui para baixo: Reaplicar Permissões (cadastro de funcionário e de profissional).
    if (!ligadoReaplicar || !telaDeFuncionario()) return;

    var CLASSE_BTN = 'hoc-reaplicar-regra-btn';
    var ICONE = 'far fa-redo';
    var TEXTO = 'Reaplicar regra atual';

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
    // raiz (opcional): um Document já interpretado (resposta do ajxContent); sem ela, lê a página aberta.
    function nomeLimpoDaCelula(td) {
        // O nome pode vir com etiquetas <span> (ex.: "Perfil Padrão"); elas não fazem parte do nome da regra.
        var copia = td.cloneNode(true);
        var tags = copia.querySelectorAll('span, button, a, i');
        for (var i = 0; i < tags.length; i++) tags[i].remove();
        return limpar(copia.textContent);
    }

    function regraDaLinha(tr) {
        var botoes = tr.querySelectorAll('button[onclick*="AplicaRegra"], a[onclick*="AplicaRegra"]');
        for (var j = 0; j < botoes.length; j++) {
            var oc = botoes[j].getAttribute('onclick');
            var aplicaRegra = parametroOnclick(oc, 'AplicaRegra');
            var usId = parametroOnclick(oc, 'UsId');
            if (!aplicaRegra || !usId) continue;
            var celulas = tr.cells || tr.querySelectorAll('td');
            var nome = celulas.length > 1 ? nomeLimpoDaCelula(celulas[1]) : '';
            return { nome: nome || '(sem nome)', aplicaRegra: aplicaRegra, usId: usId, botao: botoes[j] };
        }
        return null;
    }

    // Regra atual: a linha da tabela de regras predefinidas com <i class="fa-check green">
    // e um botão "Aplicar" (onclick com AplicaRegra). Devolve null se não houver.
    // raiz (opcional): um Document já interpretado (resposta do ajxContent); sem ela, lê a página aberta.
    function regraAtual(raiz) {
        var base = raiz || document;
        var escopo = base.getElementById('divPermissoes') || base;
        var checks = escopo.querySelectorAll('td i.fa-check.green');
        if (!checks.length && escopo !== base) checks = base.querySelectorAll('td i.fa-check.green');
        for (var i = 0; i < checks.length; i++) {
            var tr = checks[i].closest('tr');
            var r = tr && regraDaLinha(tr);
            if (r) return r;
        }
        return null;
    }

    function normNomeRegra(t) { return semAcento(limpar(t)); }

    // Procura, na tabela de regras do cadastro, a regra pelo nome (normalizado). Devolve a regra ou null.
    function acharRegraPorNome(base, nome) {
        var alvo = normNomeRegra(nome);
        var escopo = base.getElementById('divPermissoes') || base;
        var trs = escopo.querySelectorAll('tr');
        for (var i = 0; i < trs.length; i++) {
            if (!trs[i].querySelector('[onclick*="AplicaRegra"]')) continue;
            var r = regraDaLinha(trs[i]);
            if (r && normNomeRegra(r.nome) === alvo) return r;
        }
        return null;
    }

    // Decide o que reaplicar neste cadastro. tipo: 'Funcionarios' | 'Profissionais'. base: Document (ou página).
    // Devolve {acao:'aplicar', regra, atual, troca} | {acao:'sem'} | {acao:'erro', motivo}.
    // TUDO de MÉDICOS vale SÓ para profissionais:
    //  - profissional com regra marcada na tabela de trocas -> aplica o destino (ex.: Permissão Médicos Padrão -> MÉDICOS);
    //  - profissional sem regra marcada (opção ligada) -> aplica MÉDICOS;
    //  - funcionário: reaplica sempre a própria regra marcada (mesmo "Perfil Padrão"); sem regra marcada: nada.
    function planoDe(base, tipo) {
        var atual = regraAtual(base);
        function destino(nomeDestino, rotulo) {
            var d = acharRegraPorNome(base, nomeDestino);
            if (!d) return { acao: 'erro', motivo: 'a regra \'' + nomeDestino + '\' não existe na tabela de regras deste cadastro; nada aplicado' };
            if (atual && d.aplicaRegra === atual.aplicaRegra) return { acao: 'aplicar', regra: atual, atual: atual, troca: '' };
            return { acao: 'aplicar', regra: d, atual: atual, troca: rotulo + ' → ' + d.nome };
        }
        if (atual) {
            var n = normNomeRegra(atual.nome);
            // Troca para MÉDICOS: só em profissionais. Funcionário reaplica sempre a própria regra marcada.
            for (var i = 0; tipo === 'Profissionais' && i < TROCAS.length; i++) {
                if (normNomeRegra(TROCAS[i][0]) === n) return destino(TROCAS[i][1], TROCAS[i][0]);
            }
            return { acao: 'aplicar', regra: atual, atual: atual, troca: '' };
        }
        if (tipo === 'Profissionais' && ligadoProfSemRegra) return destino(REGRA_MEDICOS, 'sem regra');
        return { acao: 'sem' };
    }

    function nomeFuncionario(heading) {
        var copia = heading.cloneNode(true);
        var lixo = copia.querySelectorAll('button, .btn, script, style');
        for (var i = 0; i < lixo.length; i++) lixo[i].remove();
        var txt = limpar(copia.textContent);
        var m = /Permiss(?:õ|o)es\s+de\s+(.+)$/i.exec(txt);
        return m ? limpar(m[1]) : 'este cadastro';
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
        var plano = planoDe(document, tipoDaTela());
        if (plano.acao === 'erro') { perguntar('Reaplicar regra', 'Nada será aplicado: ' + plano.motivo + '.', ''); return; }
        if (plano.acao === 'sem') {
            perguntar('Reaplicar regra', 'Nenhuma regra aplicada a este cadastro.', '');
            return;
        }
        var regra = plano.regra;
        var funcionario = heading ? nomeFuncionario(heading) : 'este cadastro';
        perguntar('Reaplicar regra de permissões',
            (plano.troca ? 'Trocar a regra (' + plano.troca + ')' : 'Reaplicar a regra \'' + regra.nome + '\'') + ' para ' + funcionario + '?',
            plano.troca ? 'Trocar' : 'Reaplicar').then(function (sim) {
            if (!sim) return;
            // Relê a tela: o #divPermissoes pode ter sido recarregado enquanto o modal estava aberto.
            var agoraPlano = planoDe(document, tipoDaTela());
            var agora = agoraPlano.acao === 'aplicar' ? agoraPlano.regra : null;
            if (!agora || agora.aplicaRegra !== regra.aplicaRegra || agora.usId !== regra.usId) {
                aviso('A regra atual mudou na tela. Nada foi feito; confira e tente de novo.', 'erro', 6000);
                return;
            }
            // Mesmo caminho do botão "Aplicar" original (permissoesAcao + token da própria página).
            agora.botao.click();
            aviso((plano.troca ? 'Aplicando ' + plano.troca : 'Reaplicando a regra \'' + regra.nome + '\'') + '...', '', 10000);
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
        var plano = planoDe(document, tipoDaTela());
        var titulo = plano.acao === 'aplicar'
            ? (plano.troca ? 'Trocar a regra: ' + plano.troca : 'Reaplicar a regra atual: ' + plano.regra.nome)
            : (plano.acao === 'erro' ? 'Indisponível: ' + plano.motivo : 'Nenhuma regra aplicada a este cadastro');
        if (btn.title !== titulo) btn.title = titulo;
        var desabilitar = plano.acao !== 'aplicar';
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
            btn.style.whiteSpace = 'nowrap';   // texto numa linha só, sem quebrar o cabeçalho
            var ic = document.createElement('i');
            ic.className = ICONE;
            btn.appendChild(ic);
            btn.appendChild(document.createTextNode(' ' + TEXTO));
            btn.addEventListener('click', aoClicar);
            var hist = heading.querySelector('[onclick*="MostraLogsPermissoes"]');
            // Os dois flutuam à direita: vindo depois do histórico no DOM, fica à esquerda dele.
            if (hist && hist.parentNode) hist.parentNode.insertBefore(btn, hist.nextSibling);
            else heading.insertBefore(btn, heading.firstChild);
            recemInjetado = true;
        }
        atualizarEstado(btn);
        injetarGrupo(heading, btn);

        if (recemInjetado && aguardandoRecarga) {
            // O Feegow recarregou o #divPermissoes depois do Aplicar.
            clearTimeout(aguardandoRecarga.timer);
            aviso('✔ Regra \'' + aguardandoRecarga.nome + '\' reaplicada.', 'ok', 5000);
            aguardandoRecarga = null;
        }
    }

    // =====================================================================
    // BACKUP / COMPARAR / RESTAURAR dos MODELOS de permissão (regras predefinidas)
    // =====================================================================
    // Mexe só nas REGRAS (modelos) da tabela "regras predefinidas", nunca nas
    // permissões do funcionário aberto. Lê cada regra pelo mesmo endpoint do
    // botão EDITAR (POST EditaPermissoes.asp, corpo vazio) e grava pelo mesmo
    // endpoint do Salvar do modal (saveEditaPermissoes.asp), com o corpo montado
    // a partir do formulário atual completo (como o serialize do jQuery), sem eval.
    // As regras de DESCONTO (rd.asp) ficam fora do backup.

    var REGRAS = {
        atrasoMs: 300,          // pausa entre leituras/gravações
        minCheckboxes: 600,     // menos que isso = leitura suspeita (sessão expirada etc.)
        minRestauracoes: 10,    // restaurações individuais verificadas para destravar "Restaurar todas"
        maxIndice: 20,
        maxPre: 10
    };
    var CH_INDICE = 'hoc_regras_backup_indice';
    var CH_ULTIMO = 'hoc_regras_backup_ultimo';
    var CH_CONTADOR = 'hoc_regras_restauracoes_verificadas';
    var CH_PRE = 'hoc_regras_pre_restauracao';
    var CH_AUTOR = 'hoc_regras_autor';
    var AVISO_DESCONTO = 'As regras de DESCONTO (quadro "Regras para Aplicação de Desconto") não entram no backup nem na restauração.';
    var CLASSE_GRUPO = 'hoc-regras-grupo';
    var ocupado = false;

    // ---------- armazenamento (GM_* pela Suite; localStorage no avulso @grant none) ----------

    function lerGuardado(chave, padrao) {
        try {
            if (typeof GM_getValue === 'function') {
                var v = GM_getValue(chave, null);
                if (v == null) return padrao;
                return typeof v === 'string' ? JSON.parse(v) : v;
            }
        } catch (e) { /* cai no localStorage */ }
        try {
            var s = window.localStorage.getItem(chave);
            return s == null ? padrao : JSON.parse(s);
        } catch (e2) { return padrao; }
    }
    function gravarGuardado(chave, valor) {
        var txt = JSON.stringify(valor);
        try {
            if (typeof GM_setValue === 'function') { GM_setValue(chave, txt); return true; }
        } catch (e) { /* cai no localStorage */ }
        try { window.localStorage.setItem(chave, txt); return true; } catch (e2) { return false; }
    }

    // ---------- utilitários ----------

    function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function dois(n) { return (n < 10 ? '0' : '') + n; }
    function carimbo(d) {   // AAAA-MM-DD-HHMM
        d = d || new Date();
        return d.getFullYear() + '-' + dois(d.getMonth() + 1) + '-' + dois(d.getDate()) + '-' + dois(d.getHours()) + dois(d.getMinutes());
    }
    function dataBR(iso) {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return String(iso || '?');
        return dois(d.getDate()) + '/' + dois(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + dois(d.getHours()) + ':' + dois(d.getMinutes());
    }
    function hashTexto(s) {     // FNV-1a 32 bits (só para identificar o backup no índice)
        var h = 0x811c9dc5;
        for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
        return ('0000000' + h.toString(16)).slice(-8);
    }
    function conjunto(arr) { var s = {}; (arr || []).forEach(function (v) { s[v] = true; }); return s; }
    function menos(a, b) { var sb = conjunto(b); return (a || []).filter(function (v) { return !sb[v]; }); }
    function iguaisComoConjunto(a, b) {
        a = (a || []).slice().sort(); b = (b || []).slice().sort();
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    }
    function el(tag, props, filhos) {
        var e = document.createElement(tag);
        if (props) Object.keys(props).forEach(function (k) {
            if (k === 'texto') e.textContent = props[k];
            else if (k === 'classe') e.className = props[k];
            else if (k === 'estilo') e.style.cssText = props[k];
            else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), props[k]);
            else e.setAttribute(k, props[k]);
        });
        (filhos || []).forEach(function (f) { if (f != null) e.appendChild(typeof f === 'string' ? document.createTextNode(f) : f); });
        return e;
    }

    // Download local do JSON (fica no PC; nada vai para servidor nenhum).
    function baixarArquivo(nome, texto, tipo) {
        var api = window.__hocReaplicarPermissoes;
        if (api && typeof api.capturarDownload === 'function' && api.capturarDownload(nome, texto) === true) return;
        var blob = new Blob([texto], { type: tipo || 'application/json;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = el('a', { href: url, download: nome, estilo: 'display:none' });
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
    }

    // ---------- leitura das regras ----------

    function pessoaId() {
        var m = /[?&]I=(\d+)/i.exec(location.search);
        return m ? m[1] : '';
    }

    // Regras da tabela de regras predefinidas: botões com onclick "editaRegra(<id>)".
    function listarRegras() {
        var vistos = {}, lista = [];
        var botoes = document.querySelectorAll('[onclick*="editaRegra("]');
        for (var i = 0; i < botoes.length; i++) {
            var m = /editaRegra\(\s*['"]?(\d+)['"]?\s*\)/.exec(botoes[i].getAttribute('onclick') || '');
            if (!m || vistos[m[1]]) continue;
            vistos[m[1]] = true;
            var tr = botoes[i].closest('tr');
            var celulas = tr ? (tr.cells || tr.querySelectorAll('td')) : [];
            var nome = celulas.length > 1 ? limpar(celulas[1].textContent) : '';
            lista.push({ id: m[1], nome: nome || ('Regra ' + m[1]) });
        }
        return lista;
    }

    // Rótulo legível de um checkbox: "Seção › Linha (Coluna)".
    function rotuloCheckbox(cb) {
        try {
            var td = cb.closest('td');
            var tr = cb.closest('tr');
            if (!td || !tr) return cb.value;
            var linha = limpar(tr.cells[0] ? tr.cells[0].textContent : '');
            var idx = td.cellIndex;
            var cab = tr.previousElementSibling;
            while (cab && !cab.querySelector('th')) cab = cab.previousElementSibling;
            var secao = cab && cab.cells[0] ? limpar(cab.cells[0].textContent) : '';
            var coluna = cab && cab.cells[idx] ? limpar(cab.cells[idx].textContent) : '';
            var txt = (secao ? secao + ' › ' : '') + (linha || cb.value) + (coluna ? ' (' + coluna + ')' : '');
            return txt || cb.value;
        } catch (e) { return cb.value; }
    }

    function selecionados(f, nome) {
        var s = f.querySelector('select[name="' + nome + '"]');
        if (!s) return [];
        return Array.prototype.filter.call(s.options, function (o) { return o.hasAttribute('selected'); })
            .map(function (o) { return o.value; });
    }

    // Lê o estado de uma regra a partir do HTML do EditaPermissoes.asp.
    // Devolve {ok:true, ...} ou {ok:false, motivo}.
    function analisarHtmlRegra(html, id) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var f = doc.getElementById('FormEditaPermissoes');
        if (!f) return { ok: false, motivo: 'formulário da regra não veio (sessão expirada ou sem permissão?)' };
        var csrf = f.querySelector('[name="permissionProfileCsrf"]');
        if (!csrf || !csrf.value) return { ok: false, motivo: 'formulário sem token de segurança (sessão expirada?)' };
        var cbs = f.querySelectorAll('input[type="checkbox"][name="Permissoes"]');
        if (cbs.length < REGRAS.minCheckboxes) return { ok: false, motivo: 'só ' + cbs.length + ' permissões no formulário (esperado ' + REGRAS.minCheckboxes + '+)' };
        var universo = [], marcadas = [], rotulos = {};
        for (var i = 0; i < cbs.length; i++) {
            var v = cbs[i].value;
            if (rotulos[v] == null) { universo.push(v); rotulos[v] = rotuloCheckbox(cbs[i]); }
            if (cbs[i].hasAttribute('checked')) marcadas.push(v);
        }
        var nome = f.querySelector('[name="Regra"]');
        var oc = f.querySelector('input[name="OcultarLanctoParticular"]');
        return {
            ok: true, id: String(id), form: f,
            nome: nome ? nome.value : '',
            total: universo.length,
            universo: universo, marcadas: marcadas, rotulos: rotulos,
            limitarecpag: selecionados(f, 'limitarecpag'),
            limitarcontaspagar: selecionados(f, 'limitarcontaspagar'),
            ocultar: !!(oc && oc.hasAttribute('checked'))
        };
    }

    function lerRegraAgora(id) {
        var url = 'EditaPermissoes.asp?I=' + encodeURIComponent(id) + '&T=' + tipoDaTela() + '&PessoaID=' + encodeURIComponent(pessoaId());
        return fetch(url, {
            method: 'POST', body: '', credentials: 'same-origin', cache: 'no-store',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }
        }).then(function (r) {
            if (!r.ok) return { ok: false, motivo: 'HTTP ' + r.status };
            return r.text().then(function (html) { return analisarHtmlRegra(html, id); });
        }).catch(function (e) { return { ok: false, motivo: 'falha de rede (' + (e && e.message || e) + ')' }; });
    }

    // ---------- gravação ----------

    // Corpo no formato do $(form).serialize(): todos os campos "bem-sucedidos" na
    // ordem do formulário, Permissoes repetido. alvo = {permissoes:[...], limitarecpag, limitarcontaspagar, ocultar, nome}
    // (campo ausente em alvo = mantém o valor atual do formulário).
    function montarCorpo(f, alvo) {
        var p = new URLSearchParams();
        var perm = alvo.permissoes ? conjunto(alvo.permissoes) : null;
        Array.prototype.forEach.call(f.elements, function (e) {
            if (!e.name || e.disabled) return;
            var t = String(e.type || '').toLowerCase();
            if (['submit', 'button', 'reset', 'file', 'image'].indexOf(t) >= 0) return;
            if (t === 'checkbox' || t === 'radio') {
                var on = e.hasAttribute('checked');
                if (e.name === 'Permissoes' && perm) on = !!perm[e.value];
                if (e.name === 'OcultarLanctoParticular' && typeof alvo.ocultar === 'boolean') on = alvo.ocultar;
                if (on) p.append(e.name, e.value || 'on');
                return;
            }
            if (e.tagName === 'SELECT') {
                var lista = alvo[e.name] && Array.isArray(alvo[e.name]) ? conjunto(alvo[e.name]) : null;
                Array.prototype.forEach.call(e.options, function (o) {
                    var sel = lista ? !!lista[o.value] : o.hasAttribute('selected');
                    if (sel) p.append(e.name, o.value);
                });
                return;
            }
            if (e.name === 'Regra' && typeof alvo.nome === 'string') { p.append(e.name, alvo.nome); return; }
            p.append(e.name, e.value);
        });
        return p;
    }

    function gravarRegra(id, form, alvo) {
        var url = 'saveEditaPermissoes.asp?I=' + encodeURIComponent(id) + '&T=' + tipoDaTela() + '&PessoaID=' + encodeURIComponent(pessoaId());
        var corpo = montarCorpo(form, alvo);
        return fetch(url, {
            method: 'POST', body: corpo.toString(), credentials: 'same-origin',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }
        }).then(function (r) {
            return r.text().then(function (txt) {
                // A resposta é JS (o Feegow faz eval). Aqui só lemos como texto: a prova é a releitura.
                return { http: r.status, respostaOk: /Regra alterada/i.test(txt), tamanho: txt.length };
            });
        }).catch(function (e) { return { http: 0, respostaOk: false, erro: String(e && e.message || e) }; });
    }

    // Confere a releitura contra o esperado. Devolve lista de divergências (vazia = ok).
    function conferir(lido, alvo) {
        var div = [];
        if (!lido.ok) return ['releitura falhou: ' + lido.motivo];
        var faltou = menos(alvo.permissoes, lido.marcadas);
        var sobrou = menos(lido.marcadas, alvo.permissoes);
        faltou.forEach(function (v) { div.push('não ficou marcada: ' + (lido.rotulos[v] || v)); });
        sobrou.forEach(function (v) { div.push('ficou marcada sem pedir: ' + (lido.rotulos[v] || v)); });
        ['limitarecpag', 'limitarcontaspagar'].forEach(function (k) {
            if (!iguaisComoConjunto(lido[k], alvo[k])) div.push(k + ' diferente do esperado');
        });
        if (lido.ocultar !== alvo.ocultar) div.push('"Ocultar lançamento de particular" diferente do esperado');
        if (lido.nome !== alvo.nome) div.push('nome da regra diferente do esperado');
        return div;
    }

    // ---------- formato do backup ----------

    function regraParaArquivo(r) {
        var m = conjunto(r.marcadas);
        return {
            id: r.id, nome: r.nome, total: r.total,
            totalMarcadas: r.marcadas.length,
            marcadas: r.universo.filter(function (v) { return m[v]; }).map(function (v) { return { valor: v, rotulo: r.rotulos[v] }; }),
            desmarcadas: r.universo.filter(function (v) { return !m[v]; }).map(function (v) { return { valor: v, rotulo: r.rotulos[v] }; }),
            limitarecpag: r.limitarecpag, limitarcontaspagar: r.limitarcontaspagar,
            OcultarLanctoParticular: r.ocultar
        };
    }

    function montarArquivoBackup(lidas, esperadas, erros, autor, nota, tipo) {
        var regras = {};
        lidas.forEach(function (r) { regras[r.id] = regraParaArquivo(r); });
        var completo = lidas.length === esperadas && !erros.length;
        var agora = new Date();
        var arq = {
            tipo: 'feegow-regras-backup',
            formato: 1,
            versaoScript: VERSAO,
            origem: tipo || 'backup',
            data: agora.toISOString(),
            dataLocal: dataBR(agora.toISOString()),
            autor: autor || '',
            nota: nota || '',
            revisado: false, revisadoPor: null, revisadoEm: null,
            esperadas: esperadas, lidas: lidas.length,
            contagem: lidas.length + '/' + esperadas,
            status: completo ? 'COMPLETO' : 'INCOMPLETO',
            aviso: AVISO_DESCONTO,
            erros: erros,
            regras: regras
        };
        arq.hash = hashTexto(JSON.stringify(regras));
        return arq;
    }

    // Versão compacta (índices numa lista única de permissões) para o GM_setValue.
    function compactar(arq) {
        var valores = [], rotulos = [], pos = {};
        function idx(item) {
            if (pos[item.valor] == null) { pos[item.valor] = valores.length; valores.push(item.valor); rotulos.push(item.rotulo); }
            return pos[item.valor];
        }
        var regras = {};
        Object.keys(arq.regras).forEach(function (id) {
            var r = arq.regras[id];
            regras[id] = { nome: r.nome, total: r.total, m: r.marcadas.map(idx), d: r.desmarcadas.map(idx),
                lr: r.limitarecpag, lc: r.limitarcontaspagar, oc: r.OcultarLanctoParticular };
        });
        var cab = {};
        Object.keys(arq).forEach(function (k) { if (k !== 'regras') cab[k] = arq[k]; });
        return { compacto: 1, cab: cab, valores: valores, rotulos: rotulos, regras: regras };
    }

    // Normaliza (arquivo completo ou compacto) para {cab, regras:{id:{nome,total,marcadas[],universo[],rotulos{},limitarecpag,limitarcontaspagar,ocultar}}}.
    function normalizarBackup(obj) {
        if (!obj || typeof obj !== 'object') throw new Error('arquivo vazio ou inválido');
        var regras = {}, cab;
        if (obj.compacto) {
            cab = obj.cab || {};
            Object.keys(obj.regras || {}).forEach(function (id) {
                var r = obj.regras[id], rot = {};
                var marc = r.m.map(function (i) { return obj.valores[i]; });
                var uni = r.m.concat(r.d).map(function (i) { rot[obj.valores[i]] = obj.rotulos[i]; return obj.valores[i]; });
                regras[id] = { id: id, nome: r.nome, total: r.total, marcadas: marc, universo: uni, rotulos: rot,
                    limitarecpag: r.lr || [], limitarcontaspagar: r.lc || [], ocultar: !!r.oc };
            });
        } else {
            if (obj.tipo !== 'feegow-regras-backup' || !obj.regras) throw new Error('não é um backup de regras do Feegow Enhanced Suite');
            cab = {};
            Object.keys(obj).forEach(function (k) { if (k !== 'regras') cab[k] = obj[k]; });
            Object.keys(obj.regras).forEach(function (id) {
                var r = obj.regras[id], rot = {};
                var item = function (x) { if (typeof x === 'string') { rot[x] = rot[x] || x; return x; } rot[x.valor] = x.rotulo || x.valor; return x.valor; };
                var marc = (r.marcadas || []).map(item);
                var des = (r.desmarcadas || []).map(item);
                regras[id] = { id: String(r.id || id), nome: r.nome || '', total: r.total || (marc.length + des.length),
                    marcadas: marc, universo: marc.concat(des), rotulos: rot,
                    limitarecpag: r.limitarecpag || [], limitarcontaspagar: r.limitarcontaspagar || [],
                    ocultar: !!r.OcultarLanctoParticular };
            });
        }
        return { cab: cab, regras: regras };
    }

    function guardarUltimoBackup(arq) {
        var okUlt = gravarGuardado(CH_ULTIMO, compactar(arq));
        var indice = lerGuardado(CH_INDICE, []);
        if (!Array.isArray(indice)) indice = [];
        indice.unshift({ arquivo: arq.arquivo, data: arq.data, autor: arq.autor, nota: arq.nota, hash: arq.hash,
            contagem: arq.contagem, status: arq.status, revisado: false });
        gravarGuardado(CH_INDICE, indice.slice(0, REGRAS.maxIndice));
        return okUlt;
    }

    function ultimoBackup() {
        var c = lerGuardado(CH_ULTIMO, null);
        if (!c) return null;
        try { return normalizarBackup(c); } catch (e) { return null; }
    }

    function descreverBackup(b) {
        if (!b) return 'nenhum';
        var c = b.cab;
        return dataBR(c.data) + ' · ' + (c.contagem || '?') + ' · ' + (c.status || '?') +
            (c.revisado ? ' · revisado por ' + (c.revisadoPor || '?') : ' · NÃO revisado') +
            (c.autor ? ' · por ' + c.autor : '') + (c.nota ? ' · "' + c.nota + '"' : '');
    }

    // ---------- diff ----------

    // atual = leitura de agora; antigo = regra do backup.
    function diffRegra(atual, antigo) {
        var uniB = conjunto(antigo.universo), uniA = conjunto(atual.universo);
        var marcA = conjunto(atual.marcadas);
        var perdeu = antigo.marcadas.filter(function (v) { return uniA[v] && !marcA[v]; });
        var ganhou = atual.marcadas.filter(function (v) { return uniB[v] && antigo.marcadas.indexOf(v) < 0; });
        var novas = atual.universo.filter(function (v) { return !uniB[v]; });
        var sumiram = antigo.universo.filter(function (v) { return !uniA[v]; });
        var fin = [];
        if (!iguaisComoConjunto(atual.limitarecpag, antigo.limitarecpag)) fin.push('limitarecpag');
        if (!iguaisComoConjunto(atual.limitarcontaspagar, antigo.limitarcontaspagar)) fin.push('limitarcontaspagar');
        if (atual.ocultar !== antigo.ocultar) fin.push('OcultarLanctoParticular');
        return {
            perdeu: perdeu, ganhou: ganhou, novas: novas, sumiram: sumiram, financeiro: fin,
            nomeMudou: atual.nome !== antigo.nome,
            mudou: !!(perdeu.length || ganhou.length || novas.length || sumiram.length || fin.length || atual.nome !== antigo.nome)
        };
    }

    function rot(r, v, outro) { return (r.rotulos && r.rotulos[v]) || (outro && outro.rotulos && outro.rotulos[v]) || v; }

    // ---------- janelas ----------

    function injetarCSSRegras() {
        if (document.getElementById('hoc-regras-css')) return;
        var st = document.createElement('style');
        st.id = 'hoc-regras-css';
        st.textContent = [
            '.hoc-regras-grupo{float:right;display:flex;align-items:flex-start;margin-right:6px;white-space:nowrap;line-height:normal;}',
            '.hoc-regras-grupo .btn{margin-left:4px;white-space:nowrap;}',
            '.hoc-regras-grupo .hoc-travado{opacity:.55;}',
            '.hoc-regras-grupo .hoc-todas{color:#8a4b00;border-color:#e0b878;background:#fff8ec;}',
            '.hoc-rg-fundo{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:2147483000;display:flex;align-items:center;justify-content:center;}',
            '.hoc-rg-caixa{background:#fff;border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,.3);width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 40px);display:flex;flex-direction:column;font-size:13px;color:#333;}',
            '.hoc-rg-topo{padding:14px 18px 8px;border-bottom:1px solid #eee;}',
            '.hoc-rg-topo h4{margin:0;font-size:16px;font-weight:600;}',
            '.hoc-rg-corpo{padding:12px 18px;overflow:auto;flex:1 1 auto;line-height:1.45;}',
            '.hoc-rg-rodape{padding:10px 18px;border-top:1px solid #eee;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;}',
            '.hoc-rg-aviso{background:#fff8e1;border:1px solid #f0d27a;border-radius:4px;padding:6px 10px;margin:0 0 10px;font-size:12px;}',
            '.hoc-rg-barra{height:14px;background:#eee;border-radius:7px;overflow:hidden;margin:8px 0;}',
            '.hoc-rg-barra>div{height:100%;width:0;background:#4a89dc;transition:width .2s;}',
            '.hoc-rg-lista{max-height:220px;overflow:auto;border:1px solid #ddd;border-radius:4px;margin:6px 0;}',
            '.hoc-rg-lista label{display:block;padding:4px 8px;margin:0;font-weight:normal;cursor:pointer;border-bottom:1px solid #f3f3f3;}',
            '.hoc-rg-lista label:hover{background:#f5f8ff;}',
            '.hoc-rg-bloco{border:1px solid #e3e3e3;border-radius:4px;padding:8px 10px;margin:8px 0;}',
            '.hoc-rg-bloco h5{margin:0 0 4px;font-size:13px;font-weight:600;}',
            '.hoc-rg-bloco ul{margin:2px 0 4px 18px;padding:0;}',
            '.hoc-rg-perdeu{color:#b71c1c;}',
            '.hoc-rg-ganhou{color:#1b5e20;}',
            '.hoc-rg-novas{color:#0d47a1;}',
            '.hoc-rg-ok{background:#e8f5e9;border:1px solid #81c784;border-radius:4px;padding:8px 10px;margin:8px 0;color:#1b5e20;}',
            '.hoc-rg-erro{background:#ffebee;border:1px solid #e57373;border-radius:4px;padding:8px 10px;margin:8px 0;color:#b71c1c;font-weight:600;}',
            '.hoc-rg-campo{display:block;margin:6px 0;}',
            '.hoc-rg-campo input[type=text]{width:100%;padding:4px 6px;border:1px solid #ccc;border-radius:3px;}',
            '.hoc-rg-opcao{display:block;margin:6px 0;font-weight:normal;}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(st);
    }

    function abrirJanela(titulo) {
        injetarCSSRegras();
        var anterior = document.querySelector('.hoc-rg-fundo');
        if (anterior) anterior.remove();
        var corpo = el('div', { classe: 'hoc-rg-corpo' });
        var rodape = el('div', { classe: 'hoc-rg-rodape' });
        var tituloEl = el('h4', { texto: titulo });
        var caixa = el('div', { classe: 'hoc-rg-caixa', role: 'dialog', 'aria-modal': 'true' },
            [el('div', { classe: 'hoc-rg-topo' }, [tituloEl]), corpo, rodape]);
        var fundo = el('div', { classe: 'hoc-rg-fundo' }, [caixa]);
        var j = {
            fundo: fundo, corpo: corpo, rodape: rodape, titulo: tituloEl, travada: false,
            fechar: function () { document.removeEventListener('keydown', tecla, true); fundo.remove(); },
            botao: function (texto, classe, acao) {
                var b = el('button', { type: 'button', classe: 'btn btn-sm ' + (classe || 'btn-default'), texto: texto });
                b.addEventListener('click', acao);
                rodape.appendChild(b);
                return b;
            },
            limparRodape: function () { rodape.innerHTML = ''; }
        };
        function tecla(ev) { if (ev.key === 'Escape' && !j.travada) { ev.preventDefault(); ev.stopPropagation(); j.fechar(); } }
        document.addEventListener('keydown', tecla, true);
        document.body.appendChild(fundo);
        return j;
    }

    function avisoDesconto() { return el('div', { classe: 'hoc-rg-aviso', texto: '⚠ ' + AVISO_DESCONTO }); }

    function barraProgresso(j) {
        var interno = el('div');
        var txt = el('div', { texto: '' });
        j.corpo.appendChild(el('div', { classe: 'hoc-rg-barra' }, [interno]));
        j.corpo.appendChild(txt);
        return function (feitas, total, msg) {
            interno.style.width = (total ? Math.round(100 * feitas / total) : 0) + '%';
            txt.textContent = feitas + '/' + total + (msg ? ' · ' + msg : '');
        };
    }

    function listaUl(itens, classe, limite) {
        limite = limite || 400;
        var ul = el('ul', { classe: classe || '' });
        itens.slice(0, limite).forEach(function (t) { ul.appendChild(el('li', { texto: t })); });
        if (itens.length > limite) ul.appendChild(el('li', { texto: '... e mais ' + (itens.length - limite) }));
        return ul;
    }

    // Lê várias regras em sequência com progresso. Devolve {lidas, erros}.
    function lerTodas(regras, progresso, parar) {
        var lidas = [], erros = [], i = 0;
        function proxima() {
            if (i >= regras.length || (parar && parar())) return Promise.resolve({ lidas: lidas, erros: erros });
            var r = regras[i];
            progresso(i, regras.length, 'lendo ' + r.nome);
            return lerRegraAgora(r.id).then(function (res) {
                if (res.ok && res.marcadas.length === 0) res = { ok: false, motivo: '0 permissões marcadas (leitura suspeita)' };
                if (res.ok) lidas.push(res);
                else erros.push({ id: r.id, nome: r.nome, motivo: res.motivo });
                i++;
                progresso(i, regras.length, res.ok ? r.nome : 'ERRO em ' + r.nome);
                return esperar(REGRAS.atrasoMs).then(proxima);
            });
        }
        return proxima();
    }

    // Pede autor e nota (opcional) antes do backup.
    function pedirAutorNota(titulo, explicacao) {
        return new Promise(function (resolve) {
            var j = abrirJanela(titulo);
            j.corpo.appendChild(el('p', { texto: explicacao }));
            j.corpo.appendChild(avisoDesconto());
            var autor = el('input', { type: 'text', value: lerGuardado(CH_AUTOR, '') || nomeUsuarioLogado() });
            var nota = el('input', { type: 'text', placeholder: 'opcional, ex.: antes de mexer na regra da recepção' });
            j.corpo.appendChild(el('label', { classe: 'hoc-rg-campo' }, ['Autor (quem está fazendo o backup)', autor]));
            j.corpo.appendChild(el('label', { classe: 'hoc-rg-campo' }, ['Nota', nota]));
            j.botao('Cancelar', 'btn-default', function () { j.fechar(); resolve(null); });
            j.botao('Começar', 'btn-primary', function () {
                var a = limpar(autor.value);
                if (a) gravarGuardado(CH_AUTOR, a);
                resolve({ autor: a, nota: limpar(nota.value), janela: j });
            });
            autor.focus();
        });
    }

    function nomeUsuarioLogado() {
        var sel = ['.user-name', '.navbar-user-name', '#nomeUsuario', '[data-username]', '.dropdown-user .name'];
        for (var i = 0; i < sel.length; i++) {
            var e = document.querySelector(sel[i]);
            if (e) { var t = limpar(e.getAttribute('data-username') || e.textContent); if (t && t.length < 80) return t; }
        }
        return '';
    }

    // ---------- 1. Backup ----------

    function acaoBackup() {
        if (ocupado) return;
        var regras = listarRegras();
        if (!regras.length) { aviso('Não achei a tabela de regras predefinidas nesta tela.', 'erro', 6000); return; }
        pedirAutorNota('Backup dos MODELOS de permissão (regras)',
            'Lê as ' + regras.length + ' regras predefinidas, uma por vez (só leitura), e baixa um arquivo JSON datado para o seu PC. Não altera nenhuma regra nem as permissões deste funcionário.')
            .then(function (dados) {
                if (!dados) return;
                var j = dados.janela;
                ocupado = true; j.travada = true;
                j.corpo.innerHTML = '';
                j.corpo.appendChild(avisoDesconto());
                j.limparRodape();
                var cancelado = false;
                var bCancelar = j.botao('Parar', 'btn-default', function () { cancelado = true; bCancelar.disabled = true; });
                var prog = barraProgresso(j);
                return lerTodas(regras, prog, function () { return cancelado; }).then(function (res) {
                    if (cancelado) res.erros.push({ id: '-', nome: '-', motivo: 'leitura interrompida pelo usuário' });
                    var arq = montarArquivoBackup(res.lidas, regras.length, res.erros, dados.autor, dados.nota, 'backup');
                    arq.arquivo = 'feegow-regras-' + carimbo() + (arq.status === 'COMPLETO' ? '' : '-INCOMPLETO') + '.json';
                    baixarArquivo(arq.arquivo, JSON.stringify(arq, null, 1));
                    var guardou = guardarUltimoBackup(arq);
                    ocupado = false; j.travada = false;
                    j.limparRodape();
                    var cx = el('div', { classe: arq.status === 'COMPLETO' ? 'hoc-rg-ok' : 'hoc-rg-erro' },
                        [(arq.status === 'COMPLETO' ? '✔ Backup COMPLETO: ' : '✖ Backup INCOMPLETO: ') + arq.contagem + ' regras lidas.']);
                    j.corpo.appendChild(cx);
                    j.corpo.appendChild(el('p', { texto: 'Arquivo baixado: ' + arq.arquivo + ' (pasta de Downloads do navegador). Guarde-o fora do Feegow; ele é a sua cópia de segurança.' }));
                    j.corpo.appendChild(el('p', { texto: guardou ? 'Uma cópia compacta também ficou guardada neste navegador (último backup), para comparar e restaurar.' : 'Não consegui guardar a cópia compacta neste navegador; use o arquivo baixado.' }));
                    j.corpo.appendChild(el('p', { texto: 'Este backup nasce "NÃO revisado". Confira as regras críticas antes de confiar nele (o botão "Restaurar todas" exige backup revisado).' }));
                    if (res.erros.length) {
                        j.corpo.appendChild(el('h5', { texto: 'Regras com erro (não entraram no backup):' }));
                        j.corpo.appendChild(listaUl(res.erros.map(function (e) { return e.nome + ' (' + e.id + '): ' + e.motivo; }), 'hoc-rg-perdeu'));
                    }
                    j.botao('Fechar', 'btn-primary', function () { j.fechar(); });
                    atualizarBotoesRegras();
                });
            }).catch(function (e) {
                ocupado = false;
                aviso('Erro no backup: ' + (e && e.message || e), 'erro', 8000);
            });
    }

    // ---------- escolher backup (último guardado ou arquivo) ----------

    function seletorBackup(j, aoMudar) {
        var ult = ultimoBackup();
        var escolhido = ult;
        var info = el('div', { texto: 'Backup: ' + descreverBackup(ult) });
        var arquivo = el('input', { type: 'file', accept: '.json,application/json', estilo: 'display:none' });
        var bArq = el('button', { type: 'button', classe: 'btn btn-xs btn-default', texto: 'Carregar arquivo JSON...' });
        bArq.addEventListener('click', function () { arquivo.click(); });
        arquivo.addEventListener('change', function () {
            var f = arquivo.files && arquivo.files[0];
            if (!f) return;
            var leitor = new FileReader();
            leitor.onload = function () {
                try {
                    escolhido = normalizarBackup(JSON.parse(String(leitor.result)));
                    escolhido.cab.arquivoCarregado = f.name;
                    info.textContent = 'Backup: ' + f.name + ' · ' + descreverBackup(escolhido);
                } catch (e) {
                    info.textContent = 'Arquivo inválido: ' + (e && e.message || e);
                    escolhido = null;
                }
                if (aoMudar) aoMudar(escolhido);
            };
            leitor.readAsText(f, 'utf-8');
        });
        j.corpo.appendChild(el('div', { classe: 'hoc-rg-bloco' }, [info, el('div', { estilo: 'margin-top:4px' }, [bArq, arquivo])]));
        return function () { return escolhido; };
    }

    // ---------- 2. Comparar ----------

    function acaoComparar() {
        if (ocupado) return;
        var regras = listarRegras();
        if (!regras.length) { aviso('Não achei a tabela de regras predefinidas nesta tela.', 'erro', 6000); return; }
        var j = abrirJanela('Comparar os MODELOS (regras) com um backup');
        j.corpo.appendChild(el('p', { texto: 'Lê de novo as ' + regras.length + ' regras (só leitura) e mostra o que mudou em relação ao backup escolhido. Não altera nada.' }));
        j.corpo.appendChild(avisoDesconto());
        var pegar = seletorBackup(j);
        j.botao('Cancelar', 'btn-default', function () { j.fechar(); });
        j.botao('Comparar', 'btn-primary', function () {
            var b = pegar();
            if (!b) { aviso('Escolha um backup primeiro (faça um backup ou carregue um arquivo).', 'erro', 6000); return; }
            ocupado = true; j.travada = true;
            j.corpo.innerHTML = '';
            j.limparRodape();
            var prog = barraProgresso(j);
            lerTodas(regras, prog).then(function (res) {
                ocupado = false; j.travada = false;
                j.corpo.innerHTML = '';
                var rel = relatorioComparacao(res, b, regras);
                j.corpo.appendChild(avisoDesconto());
                rel.nos.forEach(function (n) { j.corpo.appendChild(n); });
                j.botao('Baixar relatório (.txt)', 'btn-default', function () {
                    baixarArquivo('feegow-regras-comparacao-' + carimbo() + '.txt', rel.texto, 'text/plain;charset=utf-8');
                });
                j.botao('Fechar', 'btn-primary', function () { j.fechar(); });
            });
        });
    }

    function relatorioComparacao(res, b, regrasPagina) {
        var nos = [], linhas = [];
        var cab = 'Comparação com o backup de ' + descreverBackup(b);
        linhas.push(cab, AVISO_DESCONTO, '');
        nos.push(el('p', { texto: cab }));
        var mudaram = 0, iguais = 0;
        res.lidas.forEach(function (atual) {
            var antigo = b.regras[atual.id];
            if (!antigo) {
                nos.push(el('div', { classe: 'hoc-rg-bloco' }, [el('h5', { classe: 'hoc-rg-novas', texto: atual.nome + ' (' + atual.id + '): regra NOVA, não existe no backup' })]));
                linhas.push('* ' + atual.nome + ' (' + atual.id + '): regra NOVA, não existe no backup');
                mudaram++;
                return;
            }
            var d = diffRegra(atual, antigo);
            if (!d.mudou) { iguais++; return; }
            mudaram++;
            var bloco = el('div', { classe: 'hoc-rg-bloco' }, [el('h5', { texto: atual.nome + ' (' + atual.id + ')' + (d.nomeMudou ? ' (no backup: "' + antigo.nome + '")' : '') })]);
            linhas.push('* ' + atual.nome + ' (' + atual.id + ')' + (d.nomeMudou ? ' (no backup: "' + antigo.nome + '")' : ''));
            function secao(titulo, itens, classe) {
                if (!itens.length) return;
                bloco.appendChild(el('div', { classe: classe, texto: titulo + ' (' + itens.length + '):' }));
                bloco.appendChild(listaUl(itens, classe));
                linhas.push('  ' + titulo + ' (' + itens.length + '):');
                itens.forEach(function (t) { linhas.push('    - ' + t); });
            }
            secao('PERDEU', d.perdeu.map(function (v) { return rot(antigo, v, atual); }), 'hoc-rg-perdeu');
            secao('GANHOU', d.ganhou.map(function (v) { return rot(atual, v, antigo); }), 'hoc-rg-ganhou');
            secao('Permissões NOVAS do Feegow (não existiam no backup)', d.novas.map(function (v) { return rot(atual, v) + (atual.marcadas.indexOf(v) >= 0 ? ' [marcada]' : ' [desmarcada]'); }), 'hoc-rg-novas');
            secao('Permissões que não existem mais no Feegow', d.sumiram.map(function (v) { return rot(antigo, v); }), '');
            secao('Campos financeiros diferentes', d.financeiro, 'hoc-rg-perdeu');
            nos.push(bloco);
            linhas.push('');
        });
        var lidasIds = conjunto(res.lidas.map(function (r) { return r.id; }));
        var paginaIds = conjunto(regrasPagina.map(function (r) { return r.id; }));
        var ausentes = Object.keys(b.regras).filter(function (id) { return !paginaIds[id]; });
        if (ausentes.length) {
            var t = ausentes.map(function (id) { return b.regras[id].nome + ' (' + id + ')'; });
            nos.push(el('div', { classe: 'hoc-rg-bloco' }, [el('h5', { classe: 'hoc-rg-perdeu', texto: 'Regras do backup que não estão mais na tabela (' + t.length + '):' }), listaUl(t)]));
            linhas.push('Regras do backup que não estão mais na tabela:'); t.forEach(function (x) { linhas.push('  - ' + x); });
        }
        if (res.erros.length) {
            var te = res.erros.map(function (e) { return e.nome + ' (' + e.id + '): ' + e.motivo; });
            nos.push(el('div', { classe: 'hoc-rg-erro' }, ['Não consegui ler ' + te.length + ' regra(s); a comparação delas ficou de fora:', listaUl(te)]));
            linhas.push('ERROS DE LEITURA:'); te.forEach(function (x) { linhas.push('  - ' + x); });
        }
        var resumo = mudaram + ' regra(s) mudaram e ' + iguais + ' estão iguais ao backup (' + res.lidas.length + '/' + regrasPagina.length + ' lidas agora).';
        nos.splice(1, 0, el('div', { classe: mudaram ? 'hoc-rg-aviso' : 'hoc-rg-ok', texto: resumo }));
        linhas.splice(2, 0, resumo);
        void lidasIds;
        return { nos: nos, texto: linhas.join('\r\n'), mudaram: mudaram, iguais: iguais };
    }

    // ---------- 3. Restaurar uma regra ----------

    function acaoRestaurarUma() {
        if (ocupado) return;
        var regras = listarRegras();
        if (!regras.length) { aviso('Não achei a tabela de regras predefinidas nesta tela.', 'erro', 6000); return; }
        var j = abrirJanela('Restaurar UM modelo de permissão (regra)');
        j.corpo.appendChild(el('p', { texto: 'Restaura só a REGRA escolhida (o modelo), a partir de um backup. Não mexe nas permissões deste funcionário nem aplica a regra em ninguém.' }));
        j.corpo.appendChild(avisoDesconto());
        var busca = el('input', { type: 'text', placeholder: 'Buscar regra pelo nome ou número...' });
        j.corpo.appendChild(el('label', { classe: 'hoc-rg-campo' }, ['Regra', busca]));
        var lista = el('div', { classe: 'hoc-rg-lista' });
        j.corpo.appendChild(lista);
        var escolhida = null;
        function desenhar() {
            var q = limpar(busca.value).toLowerCase();
            lista.innerHTML = '';
            regras.filter(function (r) { return !q || r.nome.toLowerCase().indexOf(q) >= 0 || r.id === q; }).forEach(function (r) {
                var radio = el('input', { type: 'radio', name: 'hoc-rg-regra', value: r.id });
                if (escolhida === r.id) radio.checked = true;
                radio.addEventListener('change', function () { escolhida = r.id; });
                lista.appendChild(el('label', {}, [radio, ' ' + r.nome + ' ', el('small', { estilo: 'color:#888', texto: '(' + r.id + ')' })]));
            });
        }
        busca.addEventListener('input', desenhar);
        desenhar();
        var pegar = seletorBackup(j);
        j.botao('Cancelar', 'btn-default', function () { j.fechar(); });
        j.botao('Ver prévia', 'btn-primary', function () {
            var b = pegar();
            if (!escolhida) { aviso('Escolha a regra.', 'erro', 4000); return; }
            if (!b) { aviso('Escolha um backup (faça um backup ou carregue um arquivo).', 'erro', 6000); return; }
            if (!b.regras[escolhida]) { aviso('Essa regra não existe no backup escolhido.', 'erro', 6000); return; }
            var r = regras.filter(function (x) { return x.id === escolhida; })[0];
            previaRestaurarUma(j, r, b);
        });
        busca.focus();
    }

    function previaRestaurarUma(j, regra, b) {
        var antigo = b.regras[regra.id];
        ocupado = true; j.travada = true;
        j.titulo.textContent = 'Restaurar a regra "' + regra.nome + '"';
        j.corpo.innerHTML = '';
        j.limparRodape();
        j.corpo.appendChild(el('p', { texto: 'Lendo a regra agora...' }));
        lerRegraAgora(regra.id).then(function (atual) {
            ocupado = false; j.travada = false;
            j.corpo.innerHTML = '';
            if (!atual.ok) {
                j.corpo.appendChild(el('div', { classe: 'hoc-rg-erro', texto: 'Não consegui ler a regra agora: ' + atual.motivo + '. Nada foi alterado.' }));
                j.botao('Fechar', 'btn-primary', function () { j.fechar(); });
                return;
            }
            var d = diffRegra(atual, antigo);
            j.corpo.appendChild(el('p', { texto: 'Backup: ' + descreverBackup(b) }));
            j.corpo.appendChild(avisoDesconto());
            if (atual.marcadas.length === 0) j.corpo.appendChild(el('div', { classe: 'hoc-rg-erro', texto: 'Atenção: a regra está agora com 0 permissões marcadas.' }));
            var bloco = el('div', { classe: 'hoc-rg-bloco' });
            function secao(titulo, itens, classe) {
                bloco.appendChild(el('div', { classe: classe, texto: titulo + ' (' + itens.length + ')' + (itens.length ? ':' : '') }));
                if (itens.length) bloco.appendChild(listaUl(itens, classe));
            }
            secao('Vai VOLTAR (estava marcada no backup e sumiu)', d.perdeu.map(function (v) { return rot(antigo, v, atual); }), 'hoc-rg-perdeu');
            secao('Ganhou desde o backup (mantida, a não ser que marque "Igual ao backup")', d.ganhou.map(function (v) { return rot(atual, v, antigo); }), 'hoc-rg-ganhou');
            if (d.novas.length) secao('Permissões novas do Feegow (não existem no backup; não são tocadas)', d.novas.map(function (v) { return rot(atual, v) + (atual.marcadas.indexOf(v) >= 0 ? ' [marcada]' : ' [desmarcada]'); }), 'hoc-rg-novas');
            if (d.sumiram.length) secao('Não existem mais no Feegow (ignoradas)', d.sumiram.map(function (v) { return rot(antigo, v); }), '');
            j.corpo.appendChild(bloco);

            var opIgual = el('input', { type: 'checkbox' });
            var opFin = el('input', { type: 'checkbox' });
            var opNome = el('input', { type: 'checkbox' });
            if (d.ganhou.length) {
                j.corpo.appendChild(el('label', { classe: 'hoc-rg-opcao' }, [opIgual, ' Igual ao backup: também DESMARCAR as ' + d.ganhou.length + ' permissões que a regra ganhou. ',
                    el('span', { classe: 'hoc-rg-perdeu', texto: 'Cuidado: desfaz mudanças feitas de propósito depois do backup.' })]));
            }
            if (d.financeiro.length) {
                var txtFin = d.financeiro.map(function (k) {
                    if (k === 'OcultarLanctoParticular') return 'Ocultar lançamento de particular: agora ' + (atual.ocultar ? 'SIM' : 'NÃO') + ' → backup ' + (antigo.ocultar ? 'SIM' : 'NÃO');
                    return k + ': agora [' + atual[k].join(' ') + '] → backup [' + antigo[k].join(' ') + ']';
                }).join(' · ');
                j.corpo.appendChild(el('label', { classe: 'hoc-rg-opcao' }, [opFin, ' Restaurar também os limites financeiros (' + txtFin + ')']));
            }
            if (d.nomeMudou) {
                j.corpo.appendChild(el('label', { classe: 'hoc-rg-opcao' }, [opNome, ' Restaurar também o nome: "' + atual.nome + '" → "' + antigo.nome + '"']));
            }
            var nadaPadrao = !d.perdeu.length;
            j.corpo.appendChild(el('p', { estilo: 'font-size:12px;color:#666', texto: 'Padrão: só repor o que falta (o que estava marcado no backup e sumiu volta; o resto não é tocado). Antes de gravar, o estado atual da regra é baixado num arquivo (backup pré-restauração). Depois de gravar, a regra é relida e conferida.' }));
            j.botao('Cancelar', 'btn-default', function () { j.fechar(); });
            var bGravar = j.botao('Gravar na regra', 'btn-primary', function () {
                var opcoes = { igual: opIgual.checked, fin: opFin.checked, nome: opNome.checked };
                if (nadaPadrao && !opcoes.igual && !opcoes.fin && !opcoes.nome) { aviso('Nada a restaurar: não falta nenhuma permissão do backup.', '', 5000); return; }
                executarRestauracaoUma(j, regra, antigo, atual, opcoes);
            });
            if (nadaPadrao) {
                j.corpo.appendChild(el('div', { classe: 'hoc-rg-ok', texto: 'Não falta nenhuma permissão do backup nesta regra.' }));
                if (!d.ganhou.length && !d.financeiro.length && !d.nomeMudou) bGravar.disabled = true;
            }
        });
    }

    // Calcula o alvo a partir de uma leitura atual e da regra do backup.
    function calcularAlvo(atual, antigo, opcoes) {
        var d = diffRegra(atual, antigo);
        var perm = atual.marcadas.concat(d.perdeu);
        if (opcoes.igual) perm = menos(perm, d.ganhou);
        var opcoesFin = conjunto(atual.form ? Array.prototype.map.call(atual.form.querySelectorAll('select option'), function (o) { return o.value; }) : []);
        function finValidos(lista) { return (lista || []).filter(function (v) { return opcoesFin[v]; }); }
        return {
            permissoes: perm,
            limitarecpag: opcoes.fin ? finValidos(antigo.limitarecpag) : atual.limitarecpag.slice(),
            limitarcontaspagar: opcoes.fin ? finValidos(antigo.limitarcontaspagar) : atual.limitarcontaspagar.slice(),
            ocultar: opcoes.fin ? antigo.ocultar : atual.ocultar,
            nome: opcoes.nome ? antigo.nome : atual.nome,
            diff: d
        };
    }

    function backupPreRestauracao(lidas, origem) {
        var arq = montarArquivoBackup(lidas, lidas.length, [], lerGuardado(CH_AUTOR, ''), 'automático antes de ' + origem, 'pre-restauracao');
        arq.arquivo = 'feegow-regras-pre-restauracao-' + (lidas.length === 1 ? 'regra' + lidas[0].id + '-' : '') + carimbo() + '.json';
        baixarArquivo(arq.arquivo, JSON.stringify(arq, null, 1));
        try {
            var lista = lerGuardado(CH_PRE, []);
            if (!Array.isArray(lista)) lista = [];
            if (lidas.length === 1) lista.unshift(compactar(arq));
            else lista.unshift({ cab: { arquivo: arq.arquivo, data: arq.data, contagem: arq.contagem } });
            gravarGuardado(CH_PRE, lista.slice(0, REGRAS.maxPre));
        } catch (e) { /* noop */ }
        return arq;
    }

    // Grava e confere uma regra. Devolve {ok, divergencias, resposta, alvo}.
    function gravarEConferir(id, leituraAtual, alvo) {
        return gravarRegra(id, leituraAtual.form, alvo).then(function (resp) {
            return esperar(400).then(function () { return lerRegraAgora(id); }).then(function (relida) {
                var div = conferir(relida, alvo);
                if (resp.http !== 200) div.unshift('o Feegow respondeu HTTP ' + resp.http);
                return { ok: !div.length, divergencias: div, resposta: resp, relida: relida };
            });
        });
    }

    function executarRestauracaoUma(j, regra, antigo, leituraPrevia, opcoes) {
        ocupado = true; j.travada = true;
        j.corpo.innerHTML = '';
        j.limparRodape();
        var passo = el('p', { texto: 'Relendo a regra antes de gravar...' });
        j.corpo.appendChild(passo);
        lerRegraAgora(regra.id).then(function (atual) {
            if (!atual.ok) throw new Error('não consegui reler a regra: ' + atual.motivo);
            if (!iguaisComoConjunto(atual.marcadas, leituraPrevia.marcadas) || atual.nome !== leituraPrevia.nome ||
                !iguaisComoConjunto(atual.limitarecpag, leituraPrevia.limitarecpag) || !iguaisComoConjunto(atual.limitarcontaspagar, leituraPrevia.limitarcontaspagar) ||
                atual.ocultar !== leituraPrevia.ocultar) {
                throw new Error('a regra mudou enquanto a prévia estava aberta. Nada foi gravado; abra a prévia de novo.');
            }
            passo.textContent = 'Baixando o backup pré-restauração da regra...';
            var pre = backupPreRestauracao([atual], 'restaurar a regra ' + regra.id);
            var alvo = calcularAlvo(atual, antigo, opcoes);
            passo.textContent = 'Gravando a regra... (backup pré-restauração: ' + pre.arquivo + ')';
            return gravarEConferir(regra.id, atual, alvo).then(function (res) { res.pre = pre; res.alvo = alvo; return res; });
        }).then(function (res) {
            ocupado = false; j.travada = false;
            j.corpo.innerHTML = '';
            if (res.ok) {
                var n = (Number(lerGuardado(CH_CONTADOR, 0)) || 0) + 1;
                gravarGuardado(CH_CONTADOR, n);
                j.corpo.appendChild(el('div', { classe: 'hoc-rg-ok', texto: '✔ Regra "' + regra.nome + '" restaurada e conferida (' + res.alvo.diff.perdeu.length + ' permissões repostas' +
                    (opcoes.igual ? ', ' + res.alvo.diff.ganhou.length + ' desmarcadas' : '') + ').' }));
                j.corpo.appendChild(el('p', { texto: 'Backup pré-restauração baixado: ' + res.pre.arquivo }));
                j.corpo.appendChild(el('p', { estilo: 'font-size:12px;color:#666', texto: 'Restaurações individuais verificadas neste navegador: ' + n + '. As permissões dos funcionários só mudam quando a regra for aplicada neles (isso continua manual).' }));
            } else {
                j.corpo.appendChild(el('div', { classe: 'hoc-rg-erro', texto: '✖ A releitura NÃO bate com o esperado. Pare e confira a regra "' + regra.nome + '" no Feegow.' }));
                j.corpo.appendChild(listaUl(res.divergencias, 'hoc-rg-perdeu'));
                j.corpo.appendChild(el('p', { texto: 'O estado anterior está no arquivo ' + res.pre.arquivo + '.' }));
            }
            j.botao('Fechar', 'btn-primary', function () { j.fechar(); });
            atualizarBotoesRegras();
        }).catch(function (e) {
            ocupado = false; j.travada = false;
            j.corpo.innerHTML = '';
            j.corpo.appendChild(el('div', { classe: 'hoc-rg-erro', texto: '✖ ' + (e && e.message || e) }));
            j.limparRodape();
            j.botao('Fechar', 'btn-primary', function () { j.fechar(); });
        });
    }

    // ---------- 4. Restaurar todas (travado) ----------

    function estadoTrava() {
        var b = ultimoBackup();
        var cont = Number(lerGuardado(CH_CONTADOR, 0)) || 0;
        var completo = !!(b && b.cab.status === 'COMPLETO');
        var revisado = !!(b && b.cab.revisado);
        return { backup: b, contador: cont, completo: completo, revisado: revisado,
            liberado: completo && revisado && cont >= REGRAS.minRestauracoes };
    }

    function marcarRevisado(quem) {
        var c = lerGuardado(CH_ULTIMO, null);
        if (!c || !c.cab) return false;
        c.cab.revisado = true; c.cab.revisadoPor = quem; c.cab.revisadoEm = new Date().toISOString();
        gravarGuardado(CH_ULTIMO, c);
        var indice = lerGuardado(CH_INDICE, []);
        if (Array.isArray(indice)) {
            indice.forEach(function (it) { if (it.hash === c.cab.hash && it.data === c.cab.data) { it.revisado = true; it.revisadoPor = quem; it.revisadoEm = c.cab.revisadoEm; } });
            gravarGuardado(CH_INDICE, indice);
        }
        return true;
    }

    function acaoRestaurarTodas() {
        if (ocupado) return;
        var st = estadoTrava();
        if (!st.liberado) { janelaTrava(st); return; }
        var regras = listarRegras();
        var b = st.backup;
        var j = abrirJanela('Restaurar TODOS os modelos (regras): só repor o que falta');
        j.corpo.appendChild(el('p', { texto: 'Backup: ' + descreverBackup(b) }));
        j.corpo.appendChild(avisoDesconto());
        j.corpo.appendChild(el('p', { texto: 'Primeiro todas as regras são lidas agora (e esse estado é baixado como backup automático). Depois aparece a prévia. Só repõe permissões que estavam marcadas no backup e sumiram; não desmarca nada e não mexe em limites financeiros nem nomes. Não aplica em funcionário nenhum.' }));
        j.botao('Cancelar', 'btn-default', function () { j.fechar(); });
        j.botao('Ler e ver prévia', 'btn-primary', function () {
            ocupado = true; j.travada = true;
            j.corpo.innerHTML = ''; j.limparRodape();
            var prog = barraProgresso(j);
            lerTodas(regras, prog).then(function (res) {
                ocupado = false; j.travada = false;
                j.corpo.innerHTML = '';
                if (res.erros.length) {
                    j.corpo.appendChild(el('div', { classe: 'hoc-rg-erro', texto: 'Não consegui ler ' + res.erros.length + ' regra(s). Nada foi gravado.' }));
                    j.corpo.appendChild(listaUl(res.erros.map(function (e) { return e.nome + ' (' + e.id + '): ' + e.motivo; })));
                    j.botao('Fechar', 'btn-primary', function () { j.fechar(); });
                    return;
                }
                var pre = backupPreRestauracao(res.lidas, 'restaurar todas');
                var plano = [];
                res.lidas.forEach(function (atual) {
                    var antigo = b.regras[atual.id];
                    if (!antigo) return;
                    var d = diffRegra(atual, antigo);
                    if (d.perdeu.length) plano.push({ atual: atual, antigo: antigo, perdeu: d.perdeu });
                });
                var totalPerm = plano.reduce(function (s, p) { return s + p.perdeu.length; }, 0);
                j.corpo.appendChild(el('p', { texto: 'Backup automático baixado: ' + pre.arquivo }));
                if (!plano.length) {
                    j.corpo.appendChild(el('div', { classe: 'hoc-rg-ok', texto: 'Nenhuma regra está com permissões faltando em relação ao backup. Nada a fazer.' }));
                    j.botao('Fechar', 'btn-primary', function () { j.fechar(); });
                    return;
                }
                j.corpo.appendChild(el('div', { classe: 'hoc-rg-aviso', texto: plano.length + ' regra(s) vão receber de volta ' + totalPerm + ' permissão(ões) no total.' }));
                plano.forEach(function (p) {
                    j.corpo.appendChild(el('div', { classe: 'hoc-rg-bloco' }, [el('h5', { texto: p.atual.nome + ' (' + p.atual.id + '): ' + p.perdeu.length + ' a repor' }),
                        listaUl(p.perdeu.map(function (v) { return rot(p.antigo, v, p.atual); }), 'hoc-rg-perdeu', 30)]));
                });
                var conf = el('input', { type: 'text', placeholder: 'digite RESTAURAR TODAS' });
                j.corpo.appendChild(el('label', { classe: 'hoc-rg-campo' }, ['Para confirmar, digite RESTAURAR TODAS', conf]));
                j.botao('Cancelar', 'btn-default', function () { j.fechar(); });
                var bOk = j.botao('Restaurar ' + plano.length + ' regra(s)', 'btn-warning', function () {
                    if (conf.value.trim() !== 'RESTAURAR TODAS') { aviso('Digite exatamente RESTAURAR TODAS.', 'erro', 5000); return; }
                    executarTodas(j, plano, pre);
                });
                void bOk;
            });
        });
    }

    function janelaTrava(st) {
        var j = abrirJanela('Restaurar todas 🔒 (travado)');
        j.corpo.appendChild(el('p', { texto: '"Restaurar todas" só é liberado quando as três condições abaixo estiverem cumpridas:' }));
        function item(ok, txt) { return el('div', { classe: ok ? 'hoc-rg-ganhou' : 'hoc-rg-perdeu', texto: (ok ? '✔ ' : '✖ ') + txt }); }
        j.corpo.appendChild(item(st.completo, 'Último backup COMPLETO (N/N regras): ' + descreverBackup(st.backup)));
        j.corpo.appendChild(item(st.revisado, 'Último backup marcado como REVISADO (alguém conferiu as regras críticas: MASTER, faturamento, médicos, recepção)'));
        j.corpo.appendChild(item(st.contador >= REGRAS.minRestauracoes, 'Pelo menos ' + REGRAS.minRestauracoes + ' restaurações individuais verificadas neste navegador (agora: ' + st.contador + ')'));
        j.corpo.appendChild(avisoDesconto());
        if (st.completo && !st.revisado) {
            var quem = el('input', { type: 'text', value: lerGuardado(CH_AUTOR, '') || '' });
            var conferi = el('input', { type: 'checkbox' });
            j.corpo.appendChild(el('div', { classe: 'hoc-rg-bloco' }, [
                el('h5', { texto: 'Marcar o último backup como revisado' }),
                el('label', { classe: 'hoc-rg-campo' }, ['Quem revisou', quem]),
                el('label', { classe: 'hoc-rg-opcao' }, [conferi, ' Conferi no arquivo do backup as regras críticas e elas estão corretas.'])
            ]));
            j.botao('Marcar como revisado', 'btn-default', function () {
                if (!limpar(quem.value) || !conferi.checked) { aviso('Preencha quem revisou e marque a confirmação.', 'erro', 5000); return; }
                marcarRevisado(limpar(quem.value));
                j.fechar();
                aviso('✔ Último backup marcado como revisado por ' + limpar(quem.value) + '.', 'ok', 5000);
                atualizarBotoesRegras();
            });
        }
        j.botao('Fechar', 'btn-primary', function () { j.fechar(); });
    }

    function executarTodas(j, plano, pre) {
        ocupado = true; j.travada = true;
        j.corpo.innerHTML = ''; j.limparRodape();
        var prog = barraProgresso(j);
        var feitas = [], i = 0;
        function proxima() {
            if (i >= plano.length) return Promise.resolve(null);
            var p = plano[i];
            prog(i, plano.length, 'restaurando ' + p.atual.nome);
            return lerRegraAgora(p.atual.id).then(function (agora) {
                if (!agora.ok) return { regra: p.atual, divergencias: ['não consegui reler: ' + agora.motivo] };
                if (!iguaisComoConjunto(agora.marcadas, p.atual.marcadas)) return { regra: p.atual, divergencias: ['a regra mudou depois da prévia; nada gravado nela'] };
                var alvo = calcularAlvo(agora, p.antigo, { igual: false, fin: false, nome: false });
                return gravarEConferir(p.atual.id, agora, alvo).then(function (res) {
                    if (!res.ok) return { regra: p.atual, divergencias: res.divergencias };
                    feitas.push(p.atual.nome + ' (' + p.atual.id + '): ' + p.perdeu.length + ' repostas');
                    i++;
                    prog(i, plano.length, p.atual.nome + ' OK');
                    return esperar(REGRAS.atrasoMs).then(proxima);
                });
            });
        }
        proxima().then(function (falha) {
            ocupado = false; j.travada = false;
            j.corpo.innerHTML = '';
            if (feitas.length) {
                j.corpo.appendChild(el('div', { classe: 'hoc-rg-ok', texto: '✔ ' + feitas.length + ' regra(s) restauradas e conferidas.' }));
                j.corpo.appendChild(listaUl(feitas, 'hoc-rg-ganhou'));
            }
            if (falha) {
                j.corpo.appendChild(el('div', { classe: 'hoc-rg-erro', texto: '✖ Parei na regra "' + falha.regra.nome + '" (' + falha.regra.id + '). As seguintes não foram tocadas.' }));
                j.corpo.appendChild(listaUl(falha.divergencias, 'hoc-rg-perdeu'));
            }
            j.corpo.appendChild(el('p', { texto: 'Estado anterior de todas as regras: ' + pre.arquivo }));
            j.botao('Fechar', 'btn-primary', function () { j.fechar(); });
        });
    }

    // ---------- botões ----------

    var DEF_BOTOES = [
        { chave: 'backup', icone: 'far fa-save', texto: 'Backup das regras', acao: function () { acaoBackup(); },
            dica: 'Salva uma cópia (arquivo JSON) dos MODELOS de permissão (regras predefinidas). Só leitura: não mexe nas regras nem nas permissões deste funcionário. Regras de desconto não entram.' },
        { chave: 'comparar', icone: 'far fa-exchange-alt', texto: 'Comparar com backup', acao: function () { acaoComparar(); },
            dica: 'Lê de novo os MODELOS de permissão (regras) e mostra o que cada um perdeu ou ganhou desde o backup. Só leitura.' },
        { chave: 'uma', icone: 'far fa-undo', texto: 'Restaurar uma regra', acao: function () { acaoRestaurarUma(); },
            dica: 'Restaura UM modelo de permissão (regra) a partir do backup, com prévia antes de gravar. Mexe na REGRA, não no funcionário.' },
        { chave: 'todas', icone: 'far fa-undo-alt', texto: 'Restaurar todas 🔒', acao: function () { acaoRestaurarTodas(); },
            dica: '' }
    ];

    function atualizarBotoesRegras() {
        var b = document.querySelector('.' + CLASSE_GRUPO + ' [data-hoc-regras="todas"]');
        if (!b) return;
        var st = estadoTrava();
        var txt = st.liberado ? 'Restaurar todas' : 'Restaurar todas 🔒';
        var dica = st.liberado
            ? 'Repõe, em TODOS os modelos de permissão (regras), o que falta em relação ao backup revisado. Não mexe em funcionários.'
            : 'Travado: precisa de backup completo e revisado e de ' + REGRAS.minRestauracoes + ' restaurações individuais verificadas (agora ' + st.contador + '). Clique para ver.';
        if (b.lastChild && b.lastChild.nodeType === 3 && b.lastChild.nodeValue !== ' ' + txt) b.lastChild.nodeValue = ' ' + txt;
        if (b.title !== dica) b.title = dica;
        b.classList.toggle('hoc-travado', !st.liberado);
        b.setAttribute('aria-disabled', st.liberado ? 'false' : 'true');
    }

    // Grupo dos 4 botões, logo à esquerda do "Reaplicar regra atual".
    function injetarGrupo(heading, btnReaplicar) {
        var grupos = heading.querySelectorAll('.' + CLASSE_GRUPO);
        for (var i = 1; i < grupos.length; i++) grupos[i].remove();
        var g = grupos[0];
        if (!g) {
            injetarCSSRegras();
            g = el('span', { classe: CLASSE_GRUPO });
            DEF_BOTOES.forEach(function (d) {
                var b = el('button', { type: 'button', classe: 'btn btn-sm btn-default mt10' + (d.chave === 'todas' ? ' hoc-todas' : ''), 'data-hoc-regras': d.chave, title: d.dica });
                b.appendChild(el('i', { classe: d.icone }));
                b.appendChild(document.createTextNode(' ' + d.texto));
                b.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); d.acao(); });
                g.appendChild(b);
            });
            // Flutua à direita; vindo depois do "Reaplicar" no DOM, fica à esquerda dele.
            if (btnReaplicar && btnReaplicar.parentNode) btnReaplicar.parentNode.insertBefore(g, btnReaplicar.nextSibling);
            else heading.appendChild(g);
        }
        atualizarBotoesRegras();
    }

    var agendado = null;
    function agendar() {
        if (agendado) return;
        agendado = setTimeout(function () { agendado = null; varrer(); }, 200);
    }

    // Exposto só para a prévia/testes locais.
    window.__hocReaplicarPermissoes = {
        versao: VERSAO, varrer: varrer, regraAtual: regraAtual, parametroOnclick: parametroOnclick,
        config: REGRAS, listarRegras: listarRegras, lerRegraAgora: lerRegraAgora, analisarHtmlRegra: analisarHtmlRegra,
        montarCorpo: montarCorpo, diffRegra: diffRegra, calcularAlvo: calcularAlvo, conferir: conferir,
        normalizarBackup: normalizarBackup, compactar: compactar, montarArquivoBackup: montarArquivoBackup,
        ultimoBackup: ultimoBackup, estadoTrava: estadoTrava, gravarEConferir: gravarEConferir,
        capturarDownload: null
    };

    varrer();
    new MutationObserver(agendar).observe(document.documentElement, { childList: true, subtree: true });
})();
