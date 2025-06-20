// ==UserScript==
// @name         Contar DR. EXAMES com Logs Detalhados (Comparação Correta)
// @namespace    http://tampermonkey.net/
// @version      3.6
// @description  Conta pacientes DR. EXAMES com logs detalhados, lista de pacientes e remove elementos indesejados do DOM.
// @author       Você
// @match        https?://.*\.feegow\.com/v8/.*ListaEspera.*
// @match        https://app.feegow.com/v8/?P=ListaEspera&Pers=1
// @match        https://app2.feegow.com/v8/?P=ListaEspera&Pers=1
// @match        https://*.feegow.com/v8/?P=ListaEspera&Pers=1
// @match        https://*.feegow.com/v8/?p=listaespera&pers=1
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

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
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
    const urlApiDrExames = 'https://app.feegow.com/v8/ListaEsperaCont.asp?itemsPerPage=30&Ordem=HoraSta&StatusExibir=4&Page=1&ProfissionalID=1083&EspecialidadeID=';
    const urlApiTodos = 'https://app.feegow.com/v8/ListaEsperaCont.asp?itemsPerPage=30&Ordem=HoraSta&StatusExibir=4&Page=1&ProfissionalID=ALL&EspecialidadeID=';

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
            const nomes = doc.querySelectorAll('a[href*="./?P=Pacientes&Pers=1&I="] i.text-dark');
            nomes.forEach(nome => {
                const smallElement = nome.parentElement.parentElement.querySelector('small');
                const descricao = smallElement ? smallElement.textContent.trim() : '';
                pacientes.push({
                    nome: nome.parentElement.textContent.trim(),
                    descricao: descricao
                });
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
                log(`  ${pacienteTodos.nome} - ${pacienteTodos.descricao} | ${pacienteDr.nome} - ${pacienteDr.descricao}`);
            } else {
                log(`  N/A | ${pacienteDr.nome} - ${pacienteDr.descricao}`);
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

    // Função para exibir a contagem e a lista de pacientes
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

        let listaPacientesElement = document.getElementById('listaPacientesDrExames');
        let listaDrExamesHeader = document.getElementById('listaDrExamesHeader');

        if (!pacientes || pacientes.length === 0) {
            if (listaPacientesElement) {
                listaPacientesElement.remove();
            }
            if (listaDrExamesHeader) {
                listaDrExamesHeader.remove();
            }
            return;
        }

        if (!listaPacientesElement) {
            log('Elemento da lista de pacientes não encontrado. Criando.');
            listaPacientesElement = document.createElement('div');
            listaPacientesElement.id = 'listaPacientesDrExames';

            const panelMenuElement = document.querySelector('div.panel-menu.br-n.hidden-xs');

            if (panelMenuElement && panelMenuElement.parentNode) {
                listaDrExamesHeader = document.createElement('div');
                listaDrExamesHeader.textContent = 'LISTA DE EXCLUSIVOS NO DR EXAMES';
                listaDrExamesHeader.style.backgroundColor = '#d9edf7';
                listaDrExamesHeader.style.color = '#31708f';
                listaDrExamesHeader.style.padding = '8px';
                listaDrExamesHeader.style.fontSize = '16px';
                listaDrExamesHeader.style.fontWeight = 'bold';
                listaDrExamesHeader.style.textAlign = 'center';
                listaDrExamesHeader.id = 'listaDrExamesHeader';

                panelMenuElement.parentNode.insertBefore(listaDrExamesHeader, panelMenuElement);
                panelMenuElement.parentNode.insertBefore(listaPacientesElement, panelMenuElement);

                log('Elemento da lista de pacientes inserido antes do elemento <div class="panel-menu br-n hidden-xs">.');
                listaPacientesElement.style.display = 'block';
                listaPacientesElement.style.marginTop = '10px';
                listaPacientesElement.style.width = '100%';
            } else {
                log('Elemento <div class="panel-menu br-n hidden-xs"> não encontrado.');
            }
        }

        listaPacientesElement.innerHTML = '';
        if (pacientes && pacientes.length > 0) {
            const lista = document.createElement('ul');
            pacientes.forEach(paciente => {
                const item = document.createElement('li');
                const descricao = paciente.descricao ? paciente.descricao : 'Sem detalhes';
                item.textContent = `${paciente.nome} - ${descricao}`;
                item.style.fontSize = '18px';
                lista.appendChild(item);
            });
            listaPacientesElement.appendChild(lista);

            pacientes.forEach(paciente => {
                log(`Nome: ${paciente.nome}, Descrição: ${paciente.descricao}`);
            });
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
