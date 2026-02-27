// ==UserScript==
// @name Contar DR. EXAMES com Logs Detalhados e Manter Valor 30 no Select
// @namespace https://github.com/Nicker2/Verificar-DR.EXAMES
// @version 4.9.2.1
// @description Conta pacientes DR. EXAMES com logs detalhados, exibe apenas a lista superior por padrão, oculta a lista inferior até que a superior esteja fora de vista, nomes como hyperlinks azuis sem sublinhado, adiciona botão para alternar visibilidade, destaca "Primeira vez" com badge, intercepta dados de login e faz Bypass Invisível de sessão dupla via Fetch API com tela de carregamento, adiciona especialidade e mantém valor 30.
// @author Você
// @match https://*.feegow.com/*/*
// @downloadURL https://raw.githubusercontent.com/Nicker2/Verificar-DR.EXAMES/refs/heads/main/VERIFICAR-DR-EXAMES.user.js
// @updateURL https://raw.githubusercontent.com/Nicker2/Verificar-DR.EXAMES/refs/heads/main/VERIFICAR-DR-EXAMES.meta.js
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://app.feegow.com/&size=16
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    // Lista de profissionais e suas especialidades
    const profissionais = {
        "AIMEE CALVI ASAM": "Oftalmologia",
        "ALEXANDRE SPIRANDELLI RODRIGUES COSTA": "Oftalmologia",
        "ANA CAROLINA BONINI DOMINGOS": "Oftalmologia",
        "ANA CAROLINA BUHLER": "Oftalmologia",
        "ANDRE LUIS PELLEGRIN": "Ginecologia e Obstetrícia",
        "ANDRE LUIZ SITA E SOUZA BRAGANTE": "Oftalmologia",
        "ANTONIO ADOLFO COELHO OLIVEIRA": "Oftalmologia",
        "BIANCA PUJOL FREITAS DA SILVA": "Cardiologia",
        "BIANCA QUINTAS DA SILVA": "Oftalmologia",
        "BRUNA DA COSTA PEVIDE": "Oftalmologia",
        "BRUNO CAMPOS FROES MARANGONI": "Oftalmologia",
        "CAMILA APARECIDA DE ALMEIDA FERREIRA": "Oftalmologia",
        "CARLOS EDUARDO SAMPAIO FALEIRO": "Psiquiatria",
        "CARMEM SILVA FERRARI RUBI": "Ortóptica",
        "CHARLY TORREGROSSA": "Otorrinolaringologia",
        "CINTIA NAVARRO LAMAS": "Dermatologia",
        "FERNANDA MAGALHAES DE MORAES LOPES": "Dermatologia",
        "GIAN LUCCA ANGELINI DOS SANTOS": "Oftalmologia",
        "GUILHERME ARAUJO DE ABREU": "Oftalmologia",
        "HAMZE BAHJAT BOU HAMIE": "Oftalmologia",
        "HENRIQUE LAGE FERREIRA FERREIRA": "Oftalmologia",
        "IAGO RAFAEL BRITO GUIMARAES": "Clínica Geral",
        "ISRAEL EMILIANO PACHECO": "Oftalmologia",
        "JOSE ERNESTO GHEDIN SERVIDEI": "Oftalmologia",
        "JOÃO VICTOR DE ALMEIDA WESTPHAL": "Oftalmologia",
        "LEONARDO DE ANGELLI BENEDITO CARDOSO": "Oftalmologia",
        "LEONEL TELLES DE MENEZES MORAIS": "Oftalmologia",
        "LEONNE DI CARLO DEL VECCHIO": "Dermatologia",
        "LINDA MARIA AVELAR MEDEIROS": "Dermatologia",
        "LUIS CLAUDIO PIMENTEL DA SILVA": "Oftalmologia",
        "LUIZA AMARANTE RODRIGUES": "Dermatologia",
        "MARCOS AURELIO COSTA": "Oftalmologia",
        "MARIO MONTINGELLI JUNIOR": "Cirurgia Vascular",
        "MARIA CAROLINA RODRIGUES MARTINI": "Cardiologia"
        "NIXON LOPES DE ALMEIDA": "Oftalmologia",
        "PAULA RABELO HALFELD MENDONÇA": "Oftalmologia",
        "RAPHAEL GHEDIN SERVIDEI SANTANA": "Oftalmologia",
        "RODRIGO LIBERATO GONÇALVES VIANNA": "Oftalmologia",
        "ROGERIO GHEDIN SERVIDEI": "Dermatologia",
        "SILVIA MIRIAM DA SILVA DIAS": "Nutrição",
        "SIRLENE AVILA DA ROCHA": "Dermatologia",
        "VANESSA MARQUES MENDONÇA": "Oftalmologia"
    };

    // Função para criar e exibir a tela de carregamento customizada
    function mostrarTelaDeCarregamento() {
        if (document.getElementById('feegow-custom-loader')) return; // Evita duplicar a tela

        const overlay = document.createElement('div');
        overlay.id = 'feegow-custom-loader';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgb(23, 162, 184)';
        overlay.style.zIndex = '9999999'; // Fica por cima de absolutamente tudo
        overlay.style.display = 'flex';
        overlay.style.fontFamily = '"Segoe UI", Roboto, Helvetica, Arial, sans-serif';

        // Metade Esquerda
        const leftSide = document.createElement('div');
        leftSide.style.width = '50%';
        leftSide.style.height = '100%';
        leftSide.style.backgroundImage = 'url("https://cdn.feegow.com/marketing/assets/fw-login/login_bem_vindo.webp")';
        leftSide.style.backgroundSize = 'auto 100%';
        leftSide.style.backgroundPosition = 'left center';
        leftSide.style.backgroundRepeat = 'no-repeat';
        leftSide.style.boxShadow = '5px 0 25px rgba(0,0,0,0.3)';
        leftSide.style.zIndex = '2';

        // Metade Direita
        const rightSide = document.createElement('div');
        rightSide.style.width = '50%';
        rightSide.style.height = '100%';
        rightSide.style.display = 'flex';
        rightSide.style.flexDirection = 'column';
        rightSide.style.justifyContent = 'center';
        rightSide.style.alignItems = 'center';
        rightSide.style.zIndex = '1';

        // Logo
        const logoContainer = document.createElement('div');
        logoContainer.style.backgroundColor = '#ffffff';
        logoContainer.style.borderRadius = '20px';
        logoContainer.style.padding = '25px 30px';
        logoContainer.style.marginBottom = '35px';
        logoContainer.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
        logoContainer.style.display = 'flex';
        logoContainer.style.justifyContent = 'center';
        logoContainer.style.alignItems = 'center';

        const logo = document.createElement('img');
        logo.src = 'https://app.feegow.com/main/assets/img/login_logo.svg';
        logo.style.width = '220px';
        logoContainer.appendChild(logo);

        // GIF
        const loadingGif = document.createElement('img');
        loadingGif.src = 'https://core.feegow.com/img/feegow-loading.gif';
        loadingGif.style.width = '75px';
        loadingGif.style.height = '75px';
        loadingGif.style.objectFit = 'contain';
        loadingGif.style.backgroundColor = '#ffffff';
        loadingGif.style.padding = '10px';
        loadingGif.style.borderRadius = '18px';
        loadingGif.style.marginBottom = '25px';
        loadingGif.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';

        // Textos
        const textTitle = document.createElement('h2');
        textTitle.textContent = 'Autenticando Acesso';
        textTitle.style.color = '#ffffff';
        textTitle.style.margin = '0 0 12px 0';
        textTitle.style.fontSize = '26px';
        textTitle.style.fontWeight = '600';
        textTitle.style.letterSpacing = '0.5px';

        const textSub = document.createElement('p');
        textSub.textContent = 'Encerrando sessões ativas e estabelecendo uma nova conexão segura. Por favor, aguarde um instante...';
        textSub.style.color = '#e0f7fa';
        textSub.style.fontSize = '16px';
        textSub.style.textAlign = 'center';
        textSub.style.maxWidth = '65%';
        textSub.style.lineHeight = '1.6';
        textSub.style.margin = '0';

        rightSide.appendChild(logoContainer);
        rightSide.appendChild(loadingGif);
        rightSide.appendChild(textTitle);
        rightSide.appendChild(textSub);

        overlay.appendChild(leftSide);
        overlay.appendChild(rightSide);

        document.body.appendChild(overlay);
    }

    // Função para interceptar o clique no botão "Entrar" e salvar os dados
    function interceptarLogin() {
        const botaoEntrar = document.getElementById('Entrar');

        if (botaoEntrar && !botaoEntrar.dataset.interceptado) {
            botaoEntrar.dataset.interceptado = "true";

            botaoEntrar.addEventListener('click', function() {
                const usuarioInput = document.getElementById('User');
                const senhaInput = document.getElementById('password');
                const formElement = botaoEntrar.closest('form');

                if (usuarioInput && senhaInput && formElement) {
                    sessionStorage.setItem('feegow_user_temp', usuarioInput.value);
                    sessionStorage.setItem('feegow_pass_temp', senhaInput.value);
                    sessionStorage.setItem('feegow_action_temp', formElement.action || window.location.href);
                    log('Dados de login interceptados para possível bypass.');
                }
            });
        }
    }

    // Função para rodar o Bypass INVISÍVEL no background usando Fetch API
    async function executarBypassInvisivel(actionUrl, user, pass) {
        const formData = new URLSearchParams();
        formData.append('User', user);
        formData.append('password', pass);

        let sucesso = false;
        let tentativas = 0;

        while (!sucesso) {
            tentativas++;
            try {
                // Envia os dados silenciosamente por debaixo dos panos (sem recarregar a tela)
                const res = await fetch(actionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });

                const html = await res.text();

                // Verifica se a resposta do servidor AINDA é a tela de erro
                if (html.includes('Este usuário já está conectado em outra máquina.')) {
                    log(`[Bypass Background] Tentativa ${tentativas}: Sessão ainda ocupada. Disparando novamente em 50ms...`);
                    // Espera só 50ms (ultra rápido) e tenta de novo. O visual do usuário fica 100% congelado!
                    await new Promise(resolve => setTimeout(resolve, 50));
                } else {
                    // A resposta mudou! O login passou!
                    log(`[Bypass Background] SUCESSO na tentativa ${tentativas}! Acesso liberado.`);
                    sucesso = true;

                    // Limpa o cofre
                    sessionStorage.removeItem('feegow_user_temp');
                    sessionStorage.removeItem('feegow_pass_temp');

                    // Agora sim, redireciona a página inteira para o sistema principal
                    window.location.href = res.url || 'https://app.feegow.com/main/';
                }
            } catch (error) {
                log(`[Bypass Background] Erro de rede: ${error.message}. Tentando novamente...`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    // Verifica se caiu na tela de erro e aciona a tela de loading + loop invisível
    function verificarMensagemLogin() {
        const urlAtual = window.location.href;

        if (urlAtual.includes('feegow.com') && urlAtual.includes('/main/?P=Login')) {
            const mensagem = document.body.textContent || document.body.innerText;

            if (mensagem.includes('Este usuário já está conectado em outra máquina.')) {
                log('Mensagem de conexão detectada. Congelando a tela e iniciando bypass de background...');

                const user = sessionStorage.getItem('feegow_user_temp');
                const pass = sessionStorage.getItem('feegow_pass_temp');
                const actionUrl = sessionStorage.getItem('feegow_action_temp') || window.location.href;

                if (user && pass) {
                    // 1. Congela a tela original com a nossa interface bonita
                    mostrarTelaDeCarregamento();

                    // 2. Inicia o loop assíncrono que não recarrega a página
                    executarBypassInvisivel(actionUrl, user, pass);
                }
            } else {
                interceptarLogin();
            }
        }
    }

    // Funções visuais da tabela de espera
    function adicionarBotaoEspecialidadeTabela() {
        const tds = document.querySelectorAll('#listaespera > tbody > tr > td');
        tds.forEach(td => {
            const textoTd = td.textContent.trim();
            for (const [nome, especialidade] of Object.entries(profissionais)) {
                if (textoTd.includes(nome) && !td.querySelector(`.botao-especialidade-${nome.replace(/\s+/g, '-')}`)) {
                    const botao = document.createElement('button');
                    botao.className = `botao-especialidade-${nome.replace(/\s+/g, '-')}`;
                    botao.textContent = especialidade;
                    botao.style.backgroundColor = especialidade === 'Oftalmologia' ? '#39FF14' : '#FF0000';
                    botao.style.color = '#000000';
                    botao.style.border = 'none';
                    botao.style.borderRadius = '4px';
                    botao.style.padding = '4px 8px';
                    botao.style.marginLeft = '10px';
                    botao.style.fontSize = '12px';
                    botao.style.fontWeight = '600';
                    botao.style.cursor = 'default';
                    botao.style.boxShadow = especialidade === 'Oftalmologia' ? '0 0 8px #39FF14' : '0 0 8px #FF0000';
                    botao.style.display = 'inline-flex';
                    botao.style.alignItems = 'center';
                    td.appendChild(botao);
                    log(`Botão "${especialidade}" adicionado ao lado de "${nome}" em <td> com cor ${especialidade === 'Oftalmologia' ? 'verde' : 'vermelho'}.`);
                }
            }
        });
    }

    function adicionarBotaoEspecialidadeDropdown() {
        const labels = document.querySelectorAll('ul.multiselect-container.dropdown-menu li a label.radio');
        labels.forEach(label => {
            const textoLabel = label.textContent.trim();
            for (const [nomeCompleto, especialidade] of Object.entries(profissionais)) {
                const nomeNormalizado = textoLabel.replace(/^(DR\.|DRA\.)\s*/, '').trim().toUpperCase();
                if (nomeCompleto.includes(nomeNormalizado) && !label.querySelector(`.botao-especialidade-${nomeCompleto.replace(/\s+/g, '-')}`)) {
                    const botao = document.createElement('div');
                    botao.className = `botao-especialidade-${nomeCompleto.replace(/\s+/g, '-')}`;
                    botao.textContent = especialidade;
                    botao.style.backgroundColor = 'transparent';
                    botao.style.color = '#333333';
                    botao.style.border = 'none';
                    botao.style.borderRadius = '0';
                    botao.style.padding = '0';
                    botao.style.marginTop = '2px';
                    botao.style.fontSize = '12px';
                    botao.style.fontWeight = '600';
                    botao.style.display = 'block';
                    botao.style.textAlign = 'left';
                    botao.style.boxShadow = 'none';
                    label.appendChild(botao);
                    log(`Texto "${especialidade}" adicionado abaixo de "${nomeCompleto}" no dropdown (sem visual de botão).`);
                }
            }
        });
    }

    function removerElementosIndesejados() {
        const elementos = [
            ...document.querySelectorAll('.alert-warning'),
            ...document.querySelectorAll('.ui-pnotify'),
            document.querySelector('#dp-spaces-header-container'),
            document.querySelector('#ai-assistant-plugin')
        ];
        elementos.forEach(elemento => {
            if (elemento) {
                elemento.remove();
                log(`Elemento removido: ${elemento.className || elemento.id}`);
            }
        });
    }

    function manterValor30() {
        const selectElement = document.getElementById('waitingRoomItemsPerPage');
        if (selectElement && selectElement.value !== '30') {
            selectElement.value = '30';
            selectElement.dispatchEvent(new Event('change'));
            log('Valor do select waitingRoomItemsPerPage alterado para 30.');
        }
    }

    function configurarObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                removerElementosIndesejados();
                verificarMensagemLogin();
                adicionarBotaoEspecialidadeTabela();
                adicionarBotaoEspecialidadeDropdown();
                manterValor30();
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        log('MutationObserver configurado para remover elementos, verificar login, especialidades e select.');
    }

    window.onload = function() {
        removerElementosIndesejados();
        verificarMensagemLogin();
        adicionarBotaoEspecialidadeTabela();
        adicionarBotaoEspecialidadeDropdown();
        manterValor30();
        configurarObserver();
    };

    let exibirTodos = 1;
    const debugMode = 1;
    const intervaloVerificacao = 10000;
    const urlApiTodos = 'https://app.feegow.com/pre-v8/ListaEsperaCont.asp?waitingRoomItemsPerPage=30&Ordem=HoraSta&StatusExibir=4,2,33&Page=1&ProfissionalID=ALL&EspecialidadeID=';
    const urlApiDrExames = 'https://app.feegow.com/pre-v8/ListaEsperaCont.asp?waitingRoomItemsPerPage=30&Ordem=HoraSta&StatusExibir=4,2,33&Page=1&ProfissionalID=1083&EspecialidadeID=';

    function log(message) {
        if (debugMode) {
            const now = new Date();
            const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
            console.log(`[Script Tampermonkey] [${timestamp}] ${message}`);
        }
    }

    log('Script iniciado.');

    async function obterListaPacientes(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ao buscar dados da API: ${response.status}`);
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const pacientes = [];
            const linhas = doc.querySelectorAll('#listaespera > tbody > tr');
            linhas.forEach(linha => {
                const linkElement = linha.querySelector('a[href*="./?P=Pacientes&Pers=1&I="]');
                const nome = linkElement ? linkElement.textContent.trim() : '';
                const href = linkElement ? linkElement.getAttribute('href') : '';
                const smallElement = linkElement ? linkElement.parentElement.querySelector('small') : null;
                const descricao = smallElement ? smallElement.textContent.trim() : '';
                if (nome && href) {
                    pacientes.push({
                        nome,
                        href,
                        descricao
                    });
                }
            });
            return pacientes;
        } catch (error) {
            log(`Erro ao buscar dados da API: ${error.message}`);
            return [];
        }
    }

    function compararListas(listaDrExames, listaTodos) {
        return listaDrExames.filter(pacienteDr => {
            return !listaTodos.some(pacienteTodos => {
                return pacienteTodos.nome === pacienteDr.nome && pacienteTodos.descricao === pacienteDr.descricao;
            });
        });
    }

    async function contarDrExames() {
        log('Iniciando contagem de pacientes DR. EXAMES (comparando listas estritamente da API).');
        const listaDrExames = await obterListaPacientes(urlApiDrExames);
        const listaTodos = await obterListaPacientes(urlApiTodos);
        log('Comparação de Pacientes (Todos | DR. EXAMES):');
        listaDrExames.forEach(pacienteDr => {
            const pacienteTodos = listaTodos.find(pacienteTodos => {
                return pacienteTodos.nome === pacienteDr.nome;
            });
            if (pacienteTodos) {
                log(` ${pacienteTodos.nome} - ${pacienteTodos.descricao} | ${pacienteDr.nome} - ${pacienteDr.descricao}`);
            } else {
                log(` N/A | ${pacienteDr.nome} - ${pacienteDr.descricao}`);
            }
        });
        const pacientesExclusivos = compararListas(listaDrExames, listaTodos);
        pacientesExclusivos.forEach(paciente => {
            log(`Paciente DR. EXAMES exclusivo: ${paciente.nome} - ${paciente.descricao}`);
        });
        log(`Total de pacientes DR. EXAMES exclusivos: ${pacientesExclusivos.length}`);
        if (exibirTodos === 0) {
            exibirContagem(listaTodos.length, listaTodos);
        } else {
            exibirContagem(pacientesExclusivos.length, pacientesExclusivos);
        }
    }

    function calcularCorFundo(contador) {
        if (contador <= 5) {
            const green = Math.round(200 - (contador - 1) * 40);
            const red = Math.round(255 - (5 - contador) * 51);
            return `rgb(${red}, ${green}, 0)`;
        } else {
            return '#FF0000';
        }
    }

    function toggleListasVisibilidade() {
        const lista1 = document.getElementById('listaPacientesDrExames');
        const header1 = document.getElementById('listaDrExamesHeader');
        const lista2 = document.getElementById('segundaListaDrExames');
        const header2 = document.getElementById('segundaListaDrExamesHeader');
        const botao = document.getElementById('toggleListasDrExames');
        if (lista1 && lista2) {
            const visivel = lista1.style.display !== 'none';
            lista1.style.display = visivel ? 'none' : 'block';
            header1.style.display = visivel ? 'none' : 'block';
            lista2.style.display = visivel ? 'none' : 'none';
            header2.style.display = visivel ? 'none' : 'none';
            botao.textContent = visivel ? 'Mostrar Listas DR. EXAMES' : 'Esconder Listas DR. EXAMES';
            log(`Listas DR. EXAMES ${visivel ? 'escondidas' : 'exibidas'}.`);
        }
    }

    function configurarIntersectionObserver() {
        const lista1 = document.getElementById('listaPacientesDrExames');
        const header1 = document.getElementById('listaDrExamesHeader');
        const lista2 = document.getElementById('segundaListaDrExames');
        const header2 = document.getElementById('segundaListaDrExamesHeader');
        if (lista1 && header1 && lista2 && header2) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        lista2.style.display = 'block';
                        header2.style.display = 'block';
                        log('Lista superior fora de vista. Exibindo lista inferior.');
                    } else {
                        lista2.style.display = 'none';
                        header2.style.display = 'none';
                        log('Lista superior visível. Ocultando lista inferior.');
                    }
                });
            }, {
                root: null,
                threshold: 0.1
            });
            observer.observe(lista1);
            log('IntersectionObserver configurado para monitorar visibilidade da lista superior.');
        }
    }

    function exibirContagem(contador, pacientes) {
        log(`Exibindo contagem: ${contador}`);
        let contadorElement = document.getElementById('drExamesCount');
        let botaoToggle = document.getElementById('toggleListasDrExames');
        if (!contadorElement) {
            log('Elemento de contagem não encontrado. Criando.');
            contadorElement = document.createElement('span');
            contadorElement.id = 'drExamesCount';
            contadorElement.className = 'va-m ml15';
            const pacientesAguardando = document.querySelector('li.crumb-link.hidden-sm.hidden-xs');
            if (pacientesAguardando && pacientesAguardando.parentNode) {
                pacientesAguardando.parentNode.insertBefore(contadorElement, pacientesAguardando.nextSibling);
                log('Elemento de contagem inserido à direita de "pacientes aguardando".');
            } else {
                log('Elemento "pacientes aguardando" não encontrado ou sem pai.');
            }
        }
        if (contador === 0) {
            contadorElement.textContent = 'Nenhum paciente exclusivo do DR. EXAMES';
            contadorElement.style.backgroundColor = 'transparent';
            contadorElement.style.padding = '0';
            contadorElement.style.borderRadius = '0';
            contadorElement.style.fontSize = '18px';
            contadorElement.style.textShadow = 'none';
            contadorElement.style.color = 'black';
            if (botaoToggle) {
                botaoToggle.remove();
                log('Botão de visibilidade removido pois não há pacientes exclusivos.');
            }
            const listaPacientesElement = document.getElementById('listaPacientesDrExames');
            const listaDrExamesHeader = document.getElementById('listaDrExamesHeader');
            const segundaListaElement = document.getElementById('segundaListaDrExames');
            const segundaListaHeader = document.getElementById('segundaListaDrExamesHeader');
            if (listaPacientesElement) {
                listaPacientesElement.remove();
            }
            if (listaDrExamesHeader) {
                listaDrExamesHeader.remove();
            }
            if (segundaListaElement) {
                segundaListaElement.remove();
            }
            if (segundaListaHeader) {
                segundaListaHeader.remove();
            }
            log('Nenhum paciente exclusivo. Listas e cabeçalhos removidos.');
            return;
        }
        contadorElement.style.padding = '8px 15px';
        contadorElement.style.borderRadius = '8px';
        contadorElement.style.fontSize = '16px';
        contadorElement.style.textShadow = '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black';
        contadorElement.style.color = 'white';
        contadorElement.style.backgroundColor = calcularCorFundo(contador);
        contadorElement.textContent = `Pacientes exclusivos no DR. EXAMES: ${contador}`;
        log('Contagem atualizada no elemento.');
        if (!botaoToggle && pacientes.length > 0) {
            botaoToggle = document.createElement('button');
            botaoToggle.id = 'toggleListasDrExames';
            botaoToggle.textContent = 'Esconder Listas DR. EXAMES';
            botaoToggle.style.marginLeft = '10px';
            botaoToggle.style.padding = '8px 15px';
            botaoToggle.style.borderRadius = '8px';
            botaoToggle.style.backgroundColor = '#31708f';
            botaoToggle.style.color = 'white';
            botaoToggle.style.border = 'none';
            botaoToggle.style.cursor = 'pointer';
            botaoToggle.addEventListener('click', toggleListasVisibilidade);
            contadorElement.parentNode.insertBefore(botaoToggle, contadorElement.nextSibling);
            log('Botão de alternar visibilidade das listas adicionado.');
        }
        let listaPacientesElement = document.getElementById('listaPacientesDrExames');
        let listaDrExamesHeader = document.getElementById('listaDrExamesHeader');
        if (!listaPacientesElement) {
            log('Elemento da primeira lista de pacientes não encontrado. Criando.');
            listaPacientesElement = document.createElement('div');
            listaPacientesElement.id = 'listaPacientesDrExames';
            const panelMenuElement = document.querySelector('div.panel-menu.br-n.hidden-xs');
            if (panelMenuElement && panelMenuElement.parentNode) {
                listaDrExamesHeader = document.createElement('div');
                listaDrExamesHeader.textContent = 'LISTA DE EXCLUSIVOS NO DR EXAMES';
                listaDrExamesHeader.style.backgroundColor = '#d9edf7';
                listaDrExamesHeader.style.color = '#31708f';
                listaDrExamesHeader.style.padding = '12px';
                listaDrExamesHeader.style.fontSize = '18px';
                listaDrExamesHeader.style.fontWeight = '600';
                listaDrExamesHeader.style.textAlign = 'center';
                listaDrExamesHeader.style.borderRadius = '8px 8px 0 0';
                listaDrExamesHeader.style.borderBottom = '2px solid #31708f';
                listaDrExamesHeader.id = 'listaDrExamesHeader';
                panelMenuElement.parentNode.insertBefore(listaDrExamesHeader, panelMenuElement);
                panelMenuElement.parentNode.insertBefore(listaPacientesElement, panelMenuElement);
                log('Elemento da primeira lista de pacientes inserido antes do elemento <div class="panel-menu br-n hidden-xs">.');
                listaPacientesElement.style.display = 'block';
                listaPacientesElement.style.marginTop = '10px';
                listaPacientesElement.style.width = '100%';
                listaPacientesElement.style.backgroundColor = '#f9f9f9';
                listaPacientesElement.style.borderRadius = '0 0 8px 8px';
                listaPacientesElement.style.border = '1px solid #d9edf7';
                listaPacientesElement.style.padding = '10px';
            } else {
                log('Elemento <div class="panel-menu br-n hidden-xs"> não encontrado.');
            }
        }
        listaPacientesElement.innerHTML = '';
        if (pacientes && pacientes.length > 0) {
            const lista = document.createElement('ul');
            lista.style.listStyleType = 'none';
            lista.style.padding = '0';
            lista.style.margin = '0';
            pacientes.forEach((paciente, index) => {
                const item = document.createElement('li');
                const descricao = paciente.descricao ? paciente.descricao : 'Sem detalhes';
                const link = document.createElement('a');
                link.href = paciente.href || '#';
                link.textContent = paciente.nome;
                link.style.color = 'blue';
                link.style.textDecoration = 'none';
                link.style.cursor = 'pointer';
                item.style.fontSize = '16px';
                item.style.padding = '10px 15px';
                item.style.borderBottom = '1px solid #e0e0e0';
                item.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f1f1f1';
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.transition = 'background-color 0.2s';
                if (descricao.includes('Primeira vez')) {
                    const badge = document.createElement('span');
                    badge.textContent = 'Primeira vez';
                    badge.style.backgroundColor = '#31708f';
                    badge.style.color = 'white';
                    badge.style.padding = '2px 8px';
                    badge.style.borderRadius = '4px';
                    badge.style.marginRight = '10px';
                    badge.style.fontSize = '12px';
                    item.appendChild(badge);
                }
                item.appendChild(link);
                item.appendChild(document.createTextNode(` - ${descricao}`));
                item.style.cursor = 'pointer';
                item.addEventListener('mouseover', () => {
                    item.style.backgroundColor = '#e6f3fa';
                });
                item.addEventListener('mouseout', () => {
                    item.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f1f1f1';
                });
                lista.appendChild(item);
                log(`Nome estilizado como hyperlink azul sem sublinhado na primeira lista: ${paciente.nome}${descricao.includes('Primeira vez') ? ' (com badge Primeira vez)' : ''}`);
            });
            listaPacientesElement.appendChild(lista);
            pacientes.forEach(paciente => {
                log(`Nome: ${paciente.nome}, Descrição: ${paciente.descricao}`);
            });
            log('Tabela #listaespera > tbody não será modificada, conforme solicitado.');
            const listaEsperaTable = document.querySelector('#listaespera');
            if (listaEsperaTable) {
                const segundaListaAntiga = document.getElementById('segundaListaDrExames');
                if (segundaListaAntiga) {
                    segundaListaAntiga.remove();
                    log('Segunda lista antiga removida.');
                }
                const segundaListaHeaderAntiga = document.getElementById('segundaListaDrExamesHeader');
                if (segundaListaHeaderAntiga) {
                    segundaListaHeaderAntiga.remove();
                    log('Cabeçalho da segunda lista antiga removido.');
                }
                const segundaListaHeader = document.createElement('div');
                segundaListaHeader.textContent = 'SEGUNDA LISTA DE EXCLUSIVOS NO DR EXAMES';
                segundaListaHeader.style.backgroundColor = '#d9edf7';
                segundaListaHeader.style.color = '#31708f';
                segundaListaHeader.style.padding = '12px';
                segundaListaHeader.style.fontSize = '18px';
                segundaListaHeader.style.fontWeight = '600';
                segundaListaHeader.style.textAlign = 'center';
                segundaListaHeader.style.borderRadius = '8px 8px 0 0';
                segundaListaHeader.style.borderBottom = '2px solid #31708f';
                segundaListaHeader.id = 'segundaListaDrExamesHeader';
                segundaListaHeader.style.display = 'none';
                listaEsperaTable.parentNode.insertBefore(segundaListaHeader, listaEsperaTable.nextSibling);
                const segundaListaElement = document.createElement('div');
                segundaListaElement.id = 'segundaListaDrExames';
                segundaListaElement.style.display = 'none';
                segundaListaElement.style.marginTop = '10px';
                segundaListaElement.style.width = '100%';
                segundaListaElement.style.backgroundColor = '#f9f9f9';
                segundaListaElement.style.borderRadius = '0 0 8px 8px';
                segundaListaElement.style.border = '1px solid #d9edf7';
                segundaListaElement.style.padding = '10px';
                const lista = document.createElement('ul');
                lista.style.listStyleType = 'none';
                lista.style.padding = '0';
                lista.style.margin = '0';
                pacientes.forEach((paciente, index) => {
                    const item = document.createElement('li');
                    const descricao = paciente.descricao ? paciente.descricao : 'Sem detalhes';
                    const link = document.createElement('a');
                    link.href = paciente.href || '#';
                    link.textContent = paciente.nome;
                    link.style.color = 'blue';
                    link.style.textDecoration = 'none';
                    link.style.cursor = 'pointer';
                    item.style.fontSize = '16px';
                    item.style.padding = '10px 15px';
                    item.style.borderBottom = '1px solid #e0e0e0';
                    item.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f1f1f1';
                    item.style.display = 'flex';
                    item.style.alignItems = 'center';
                    item.style.transition = 'background-color 0.2s';
                    if (descricao.includes('Primeira vez')) {
                        const badge = document.createElement('span');
                        badge.textContent = 'Primeira vez';
                        badge.style.backgroundColor = '#31708f';
                        badge.style.color = 'white';
                        badge.style.padding = '2px 8px';
                        badge.style.borderRadius = '4px';
                        badge.style.marginRight = '10px';
                        badge.style.fontSize = '12px';
                        item.appendChild(badge);
                    }
                    item.appendChild(link);
                    item.appendChild(document.createTextNode(` - ${descricao}`));
                    item.style.cursor = 'pointer';
                    item.addEventListener('mouseover', () => {
                        item.style.backgroundColor = '#e6f3fa';
                    });
                    item.addEventListener('mouseout', () => {
                        item.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f1f1f1';
                    });
                    lista.appendChild(item);
                    log(`Nome estilizado como hyperlink azul sem sublinhado na segunda lista: ${paciente.nome}${descricao.includes('Primeira vez') ? ' (com badge Primeira vez)' : ''}`);
                });
                segundaListaElement.appendChild(lista);
                listaEsperaTable.parentNode.insertBefore(segundaListaElement, segundaListaHeader.nextSibling);
                log('Segunda lista (idêntica à primeira) adicionada abaixo do #listaespera, inicialmente oculta.');
                configurarIntersectionObserver();
            } else {
                log('Tabela #listaespera não encontrada para adicionar a segunda lista.');
            }
        }
    }

    async function executarVerificacao() {
        log('Executando verificação e contagem (comparando listas estritamente da API).');
        removerElementosIndesejados();
        verificarMensagemLogin();
        adicionarBotaoEspecialidadeTabela();
        adicionarBotaoEspecialidadeDropdown();
        manterValor30(); // Verifica o valor 30 no select durante a verificação periódica
        await contarDrExames();
    }

    log('Chamando funções iniciais.');
    executarVerificacao();
    setInterval(executarVerificacao, intervaloVerificacao);
    log('Script finalizado.');
})();
