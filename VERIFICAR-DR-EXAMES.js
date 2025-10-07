// ==UserScript==
// @name Contar DR. EXAMES com Logs Detalhados e Manter Valor 30 no Select
// @namespace http://tampermonkey.net/
// @version 4.9
// @description Conta pacientes DR. EXAMES com logs detalhados, exibe apenas a lista superior por padrão, oculta a lista inferior até que a superior esteja fora de vista, nomes como hyperlinks azuis sem sublinhado, sem alterar a tabela #listaespera > tbody, adiciona botão para alternar visibilidade das listas apenas quando há pacientes, destaca "Primeira vez" com badge, verifica mensagem de login na página de login, adiciona botão com especialidade (verde para Oftalmologia, vermelho para outras) ao lado do nome do profissional na tabela e abaixo do nome no dropdown, remove o elemento ai-assistant-plugin e mantém o valor 30 no select de itens por página.
// @author Você
// @match https://*.feegow.com/*/*
// @match https://*.feegow.com/v8/?P=ListaEspera&Pers=1
// @match https?://.*\.feegow\.com/v8/.*ListaEspera.*
// @match https://app.feegow.com/v8/?P=ListaEspera&Pers=1
// @match https://app2.feegow.com/v8/?P=ListaEspera&Pers=1
// @match https://*.feegow.com/v8/?p=listaespera&pers=1
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    // Lista de profissionais e suas especialidades
    const profissionais = {
        "AIMEE CALVI ASAM": "Oftalmologia",
        "ALEXANDRE SPIRANDELLI RODRIGUES COSTA": "Oftalmologia",
        "ANA CAROLINA BONINI DOMINGOS": "Oftalmologia",
        "ANDRE LUIS PELLEGRIN": "Ginecologia e Obstetrícia",
        "ANDRE LUIZ SITA E SOUZA BRAGANTE": "Oftalmologia",
        "ANTONIO ADOLFO COELHO OLIVEIRA": "Oftalmologia",
        "BIANCA PUJOL FREITAS DA SILVA": "Cardiologia",
        "BIANCA QUINTAS DA SILVA": "Oftalmologia",
        "BRUNA DA COSTA PEVIDE": "Oftalmologia",
        "BRUNO CAMPOS FROES MARANGONI": "Oftalmologia",
        "CARLOS EDUARDO SAMPAIO FALEIRO": "Psiquiatria",
        "CARMEM SILVA FERRARI RUBI": "Ortóptica",
        "CHARLY TORREGROSSA": "Otorrinolaringologia",
        "CINTIA NAVARRO LAMAS": "Dermatologia",
        "FERNANDA MAGALHAES DE MORAES LOPES": "Dermatologia",
        "HAMZE BAHJAT BOU HAMIE": "Oftalmologia",
        "HENRIQUE LAGE FERREIRA FERREIRA": "Oftalmologia",
        "IAGO RAFAEL BRITO GUIMARAES": "Clínica Geral",
        "ISRAEL EMILIANO PACHECO": "Oftalmologia",
        "JOSE ERNESTO GHEDIN SERVIDEI": "Oftalmologia",
        "LEONEL TELLES DE MENEZES MORAIS": "Oftalmologia",
        "LEONNE DI CARLO DEL VECCHIO": "Dermatologia",
        "LINDA MARIA AVELAR MEDEIROS": "Dermatologia",
        "MARIO MONTINGELLI JUNIOR": "Cirurgia Vascular",
        "NIXON LOPES DE ALMEIDA": "Oftalmologia",
        "PAULA RABELO HALFELD MENDONÇA": "Oftalmologia",
        "RAPHAEL GHEDIN SERVIDEI SANTANA": "Oftalmologia",
        "RODRIGO LIBERATO GONÇALVES VIANNA": "Oftalmologia",
        "ROGERIO GHEDIN SERVIDEI": "Dermatologia",
        "SILVIA MIRIAM DA SILVA DIAS": "Nutrição",
        "SIRLENE AVILA DA ROCHA": "Dermatologia",
        "VANESSA MARQUES MENDONÇA": "Oftalmologia"
    };

    // Função para verificar mensagem de login e clicar no botão Cancelar
    function verificarMensagemLogin() {
        if (window.location.href.startsWith('https://app.feegow.com/main/?P=Login')) {
            const mensagem = document.body.textContent || document.body.innerText;
            if (mensagem.includes('Este usuário já está conectado em outra máquina.')) {
                const botaoCancelar = document.querySelector('button.btn.btn-secondary[onclick="window.history.back();"]');
                if (botaoCancelar) {
                    botaoCancelar.click();
                    log('Mensagem "Este usuário já está conectado em outra máquina." detectada. Botão Cancelar clicado.');
                } else {
                    log('Botão Cancelar não encontrado na página de login.');
                }
            } else {
                log('Mensagem de login não encontrada na página.');
            }
        }
    }

    // Função para adicionar botão com a especialidade do profissional na tabela
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

    // Função para adicionar botão com a especialidade do profissional no dropdown
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

    // Função para remover elementos indesejados, incluindo o ai-assistant-plugin
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

    // Função para garantir que o valor 30 esteja sempre selecionado no select
    function manterValor30() {
        const selectElement = document.getElementById('waitingRoomItemsPerPage');
        if (selectElement && selectElement.value !== '30') {
            selectElement.value = '30';
            selectElement.dispatchEvent(new Event('change')); // Dispara o evento de mudança
            log('Valor do select waitingRoomItemsPerPage alterado para 30.');
        }
    }

    // Configura o MutationObserver para monitorar mudanças no DOM
    function configurarObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                removerElementosIndesejados();
                verificarMensagemLogin();
                adicionarBotaoEspecialidadeTabela();
                adicionarBotaoEspecialidadeDropdown();
                manterValor30(); // Adiciona a verificação do valor 30
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        log('MutationObserver configurado para remover .alert-warning, .ui-pnotify, #dp-spaces-header-container, #ai-assistant-plugin, verificar mensagem de login, adicionar botões de especialidade e manter valor 30 no select.');
    }

    // Aguarda o carregamento completo da página
    window.onload = function() {
        removerElementosIndesejados();
        verificarMensagemLogin();
        adicionarBotaoEspecialidadeTabela();
        adicionarBotaoEspecialidadeDropdown();
        manterValor30(); // Chama inicialmente para garantir o valor 30
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
