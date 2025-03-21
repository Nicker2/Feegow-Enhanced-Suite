// ==UserScript==
// @name         Contar DR. EXAMES com Logs Detalhados (Comparação Correta)
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  Conta pacientes DR. EXAMES com logs detalhados e lista de pacientes.
// @author       Você
// @match        https?://.*\.feegow\.com/v8/.*ListaEspera.*
// @match        https://app.feegow.com/v8/?P=ListaEspera&Pers=1
// @match        https://app2.feegow.com/v8/?P=ListaEspera&Pers=1
// @match        https://*.feegow.com/v8/?P=ListaEspera&Pers=1
// @match        https://*.feegow.com/v8/?p=listaespera&pers=1
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

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
                // Modificação aqui: acessa a terceira célula <td> após a célula do nome
                const descricao = nome.parentElement.parentElement.nextElementSibling.nextElementSibling.nextElementSibling ? nome.parentElement.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.textContent.trim() : '';
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

        // Logs detalhados das listas (comparação correta por nome e descrição)
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
            // Exibe todos os pacientes
            exibirContagem(listaTodos.length, listaTodos);
        } else {
            // Exibe apenas os pacientes exclusivos
            exibirContagem(pacientesExclusivos.length, pacientesExclusivos);
        }
    }

    // Função para calcular a cor de fundo com base na contagem
    function calcularCorFundo(contador) {
        if (contador <= 5) {
            const green = Math.round(200 - (contador - 1) * 40); // Diminui o verde gradualmente
            const red = Math.round(255 - (5 - contador) * 51); // Aumenta o vermelho gradualmente
            return `rgb(${red}, ${green}, 0)`; // Cria a cor RGB com componente azul zero
        } else {
            return '#FF0000'; // Vermelho puro para números acima de 5
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

    // Define o conteúdo, a cor de fundo e a cor do texto com base na contagem
    if (contador === 0) {
        contadorElement.textContent = 'Nenhum paciente apenas no DR. EXAMES';
        contadorElement.style.backgroundColor = 'transparent';
        contadorElement.style.padding = '0';
        contadorElement.style.borderRadius = '0';
        contadorElement.style.fontSize = 'inherit';
        contadorElement.style.textShadow = 'none';
        contadorElement.style.color = 'black';
    } else {
        contadorElement.style.padding = '8px 15px';
        contadorElement.style.borderRadius = '8px';
        contadorElement.style.fontSize = '16px';
        contadorElement.style.textShadow = '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black';
        contadorElement.style.color = 'white';
        contadorElement.style.backgroundColor = calcularCorFundo(contador);
        contadorElement.textContent = `Pacientes apenas no DR. EXAMES: ${contador}`;
    }
    log('Contagem atualizada no elemento.');

    // Cria a lista de pacientes abaixo do contador
    let listaPacientesElement = document.getElementById('listaPacientesDrExames');
    let listaDrExamesHeader = document.getElementById('listaDrExamesHeader');

    // Remove a lista e o cabeçalho se não houver pacientes
    if (!pacientes || pacientes.length === 0) {
        if (listaPacientesElement) {
            listaPacientesElement.remove();
        }
        if (listaDrExamesHeader) {
            listaDrExamesHeader.remove();
        }
        return; // Sai da função se não houver pacientes
    }

    // Cria a lista se ela não existir
    if (!listaPacientesElement) {
        log('Elemento da lista de pacientes não encontrado. Criando.');
        listaPacientesElement = document.createElement('div');
        listaPacientesElement.id = 'listaPacientesDrExames';

        // Encontra o elemento <div class="panel-menu br-n hidden-xs">
        const panelMenuElement = document.querySelector('div.panel-menu.br-n.hidden-xs');

        if (panelMenuElement && panelMenuElement.parentNode) {
            // Cria o elemento "LISTA DE EXCLUSIVOS NO DR EXAMES" com os mesmos estilos do thead
            listaDrExamesHeader = document.createElement('div');
            listaDrExamesHeader.textContent = 'LISTA DE EXCLUSIVOS NO DR EXAMES';
            listaDrExamesHeader.style.backgroundColor = '#d9edf7'; // Cor de fundo do thead info
            listaDrExamesHeader.style.color = '#31708f'; // Cor do texto do thead info
            listaDrExamesHeader.style.padding = '8px';
            listaDrExamesHeader.style.fontWeight = 'bold';
            listaDrExamesHeader.style.textAlign = 'center';
            listaDrExamesHeader.id = 'listaDrExamesHeader'; // Adiciona um ID para o cabeçalho

            // Insere o cabeçalho acima da lista
            panelMenuElement.parentNode.insertBefore(listaDrExamesHeader, panelMenuElement);

            // Insere a lista abaixo do cabeçalho
            panelMenuElement.parentNode.insertBefore(listaPacientesElement, panelMenuElement);

            log('Elemento da lista de pacientes inserido antes do elemento <div class="panel-menu br-n hidden-xs">.');

            // Adiciona CSS para garantir que a lista seja exibida como um bloco abaixo do contador
            listaPacientesElement.style.display = 'block';
            listaPacientesElement.style.marginTop = '10px';
            listaPacientesElement.style.width = '100%';
        } else {
            log('Elemento <div class="panel-menu br-n hidden-xs"> não encontrado.');
        }
    }

    // Limpa a lista anterior e preenche com os pacientes atuais
    listaPacientesElement.innerHTML = '';
    if (pacientes && pacientes.length > 0) {
        const lista = document.createElement('ul');
        pacientes.forEach(paciente => {
            const item = document.createElement('li');
            // Verifica se paciente.descricao existe e não é nulo antes de concatenar
            const descricao = paciente.descricao ? paciente.descricao : 'Sem detalhes';
            item.textContent = `${paciente.nome} - ${descricao}`;
            lista.appendChild(item);
        });
        listaPacientesElement.appendChild(lista);

        // Adiciona loop para exibir nome e descrição no console usando log()
        pacientes.forEach(paciente => {
            log(`Nome: ${paciente.nome}, Descrição: ${paciente.descricao}`);
        });
    }
}

    // Função para executar a verificação e contagem
    async function executarVerificacao() {
        log('Executando verificação e contagem (comparando listas estritamente da API).');
        await contarDrExames();
    }

    // Chama a função inicialmente
    log('Chamando funções iniciais.');
    executarVerificacao();

    // Configura o intervalo
    setInterval(executarVerificacao, intervaloVerificacao);

    log('Script finalizado.');
})();
