// ==UserScript==
// @name         Contar DR. EXAMES com Logs Detalhados (Comparação Correta)
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Conta pacientes DR. EXAMES com logs detalhados, exibe duas listas idênticas (acima e abaixo do tbody) com nomes como hyperlinks azuis sem sublinhado, e adiciona linhas na tabela existente.
// @author       Você
// @match        https://*.feegow.com/*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Função para remover elementos indesejados
    function removerElementosIndesejados() {
        const elementos = [
            ...document.querySelectorAll('.alert-warning'),
            ...document.querySelectorAll('.ui-pnotify'),
            document.querySelector('#dp-spaces-header-container')
        ];
        elementos.forEach(elemento => {
            if (elemento) {
                elemento.remove();
                log(`Elemento removido: ${elemento.className || elemento.id}`);
            }
        });
    }

    // Configura o MutationObserver para monitorar mudanças no DOM
    function configurarObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                removerElementosIndesejados();
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        log('MutationObserver configurado para remover .alert-warning, .ui-pnotify e #dp-spaces-header-container.');
    }

    // Aguarda o carregamento completo da página
    window.onload = function() {
        removerElementosIndesejados();
        configurarObserver();
    };

    let exibirTodos = 1; // Variável para controlar qual lista exibir (0 para todos, 1 para exclusivos)
    const debugMode = 1; // 1 para ativar logs, 0 para desativar
    const intervaloVerificacao = 10000; // 10 segundos
    const urlApiDrExames = 'https://app2.feegow.com/pre-v8/ListaEsperaCont.asp?waitingRoomItemsPerPage=30&Ordem=HoraSta&StatusExibir=4,2,33&Page=1&ProfissionalID=1083&EspecialidadeID=';
    const urlApiTodos = 'https://app2.feegow.com/pre-v8/ListaEsperaCont.asp?waitingRoomItemsPerPage=30&Ordem=HoraSta&StatusExibir=4,2,33&Page=1&ProfissionalID=ALL&EspecialidadeID=';

    function log(message) {
        if (debugMode) {
            const now = new Date();
            const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
            console.log(`[Script Tampermonkey] [${timestamp}] ${message}`);
        }
    }

    log('Script iniciado.');

    // Função para obter lista de pacientes com detalhes de uma URL da API
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
                const exameElement = linha.querySelector('td:nth-child(6)');
                const exame = exameElement ? exameElement.textContent.trim() : '';
                const idadeElement = linha.querySelector('td:nth-child(4)');
                const idade = idadeElement ? idadeElement.textContent.trim() : '';
                const horaStatusElement = linha.querySelector('td:nth-child(1)');
                const horaStatus = horaStatusElement ? horaStatusElement.textContent.trim() : '';
                const horaChegadaElement = linha.querySelector('td:nth-child(2)');
                const horaChegada = horaChegadaElement ? horaChegadaElement.textContent.trim() : '';
                const statusElement = linha.querySelector('td:nth-child(7)');
                const status = statusElement ? statusElement.textContent.trim() : '';
                const localElement = linha.querySelector('td:nth-child(8) code');
                const local = localElement ? localElement.textContent.trim() : '';
                const medicoElement = linha.querySelector('td:nth-child(5)');
                const medico = medicoElement ? medicoElement.textContent.trim() : '';
                if (nome && href) {
                    pacientes.push({
                        nome,
                        href,
                        descricao,
                        exame,
                        idade,
                        horaStatus,
                        horaChegada,
                        status,
                        local,
                        medico
                    });
                }
            });
            return pacientes;
        } catch (error) {
            log(`Erro ao buscar dados da API: ${error.message}`);
            return [];
        }
    }

    // Função para comparar listas de pacientes com detalhes (comparação estrita)
    function compararListas(listaDrExames, listaTodos) {
        return listaDrExames.filter(pacienteDr => {
            return !listaTodos.some(pacienteTodos => {
                return pacienteTodos.nome === pacienteDr.nome && pacienteTodos.descricao === pacienteDr.descricao;
            });
        });
    }

    // Função para contar pacientes DR. EXAMES (comparando listas estritamente)
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

    // Função para calcular a cor de fundo com base na contagem
    function calcularCorFundo(contador) {
        if (contador <= 5) {
            const green = Math.round(200 - (contador - 1) * 40);
            const red = Math.round(255 - (5 - contador) * 51);
            return `rgb(${red}, ${green}, 0)`;
        } else {
            return '#FF0000';
        }
    }

    // Função para exibir a contagem e as listas de pacientes
    function exibirContagem(contador, pacientes) {
        log(`Exibindo contagem: ${contador}`);
        let contadorElement = document.getElementById('drExamesCount');
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
        } else {
            contadorElement.style.padding = '8px 15px';
            contadorElement.style.borderRadius = '8px';
            contadorElement.style.fontSize = '16px';
            contadorElement.style.textShadow = '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black';
            contadorElement.style.color = 'white';
            contadorElement.style.backgroundColor = calcularCorFundo(contador);
            contadorElement.textContent = `Pacientes exclusivos no DR. EXAMES: ${contador}`;
        }
        log('Contagem atualizada no elemento.');

        // Primeira lista (acima do tbody)
        let listaPacientesElement = document.getElementById('listaPacientesDrExames');
        let listaDrExamesHeader = document.getElementById('listaDrExamesHeader');
        if (!pacientes || pacientes.length === 0) {
            if (listaPacientesElement) {
                listaPacientesElement.remove();
            }
            if (listaDrExamesHeader) {
                listaDrExamesHeader.remove();
            }
            // Remove a segunda lista se não houver pacientes
            const segundaListaElement = document.getElementById('segundaListaDrExames');
            if (segundaListaElement) {
                segundaListaElement.remove();
            }
            const segundaListaHeader = document.getElementById('segundaListaDrExamesHeader');
            if (segundaListaHeader) {
                segundaListaHeader.remove();
            }
            return;
        }

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
                log(`Nome estilizado como hyperlink azul sem sublinhado na primeira lista: ${paciente.nome}`);
            });

            listaPacientesElement.appendChild(lista);
            pacientes.forEach(paciente => {
                log(`Nome: ${paciente.nome}, Descrição: ${paciente.descricao}`);
            });

            // Adiciona nova linha na tabela #listaespera > tbody para cada paciente exclusivo
            const tbody = document.querySelector('#listaespera > tbody');
            if (tbody) {
                const linhasAntigas = tbody.querySelectorAll('tr.custom-row');
                linhasAntigas.forEach(linha => linha.remove());
                log('Linhas personalizadas antigas removidas do tbody.');

                pacientes.forEach(paciente => {
                    const novaLinha = document.createElement('tr');
                    novaLinha.classList.add('custom-row');
                    novaLinha.innerHTML = `
                        <td class="" nowrap=""><span data-val="2" class="fas fa-play-circle text-system badge-icon-status" style="font-size:17px;"></span>${paciente.horaStatus || '15:00'}</td>
                        <td class="">${paciente.horaChegada || '14:36'}</td>
                        <td>
                            <a href="${paciente.href}" style="color:blue; text-decoration:none;">${paciente.nome}</a><br>
                            <small>${paciente.descricao || 'OCT OE'}</small>
                        </td>
                        <td>${paciente.idade || '43 anos'}</td>
                        <td>${paciente.medico || 'NIXON LOPES DE ALMEIDA'}</td>
                        <td>${paciente.exame || 'TOMOGRAFIA DE COERÊNCIA ÓPTICA DE MACULA – MONOCULAR'}</td>
                        <td nowrap="nowrap">${paciente.status || 'Em atendimento'}</td>
                        <td nowrap="nowrap" class="text-center"><br><code>${paciente.local || 'PARTICULAR - SÃO SEBASTIÃO'}</code></td>
                        <td>
                            <button class="btn btn-xs btn-warning" type="button" onclick="rechamar(234398, 2, )"><i class="far fa-bell"></i> CHAMAR </button>
                        </td>
                        <td>
                            <button onclick="window.location='${paciente.href}'" class="btn btn-xs btn-primary" type="button">IR PARA ATENDIMENTO</button>
                        </td>
                    `;
                    tbody.appendChild(novaLinha);
                    log(`Nova linha adicionada ao tbody para paciente: ${paciente.nome}`);
                });
            } else {
                log('Tabela #listaespera > tbody não encontrada para adicionar nova linha.');
            }

            // Cria a segunda lista (idêntica à primeira) abaixo do #listaespera
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
                listaEsperaTable.parentNode.insertBefore(segundaListaHeader, listaEsperaTable.nextSibling);

                const segundaListaElement = document.createElement('div');
                segundaListaElement.id = 'segundaListaDrExames';
                segundaListaElement.style.display = 'block';
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
                    log(`Nome estilizado como hyperlink azul sem sublinhado na segunda lista: ${paciente.nome}`);
                });

                segundaListaElement.appendChild(lista);
                listaEsperaTable.parentNode.insertBefore(segundaListaElement, segundaListaHeader.nextSibling);
                log('Segunda lista (idêntica à primeira) adicionada abaixo do #listaespera.');
            } else {
                log('Tabela #listaespera não encontrada para adicionar a segunda lista.');
            }
        }
    }

    // Função para executar a verificação e contagem
    async function executarVerificacao() {
        log('Executando verificação e contagem (comparando listas estritamente da API).');
        removerElementosIndesejados();
        await contarDrExames();
    }

    // Chama a função inicialmente
    log('Chamando funções iniciais.');
    executarVerificacao();

    // Configura o intervalo
    setInterval(executarVerificacao, intervaloVerificacao);
    log('Script finalizado.');
})();
