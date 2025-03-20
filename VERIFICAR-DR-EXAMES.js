// ==UserScript==
// @name         Contar DR. EXAMES com Logs Detalhados (Comparação Correta)
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Conta pacientes DR. EXAMES com logs detalhados (comparação correta por nome e descrição) e destaque visual, à esquerda de total-pacientes com espaço.
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
                const descricao = nome.parentElement.nextElementSibling ? nome.parentElement.nextElementSibling.textContent.trim() : '';
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
        exibirContagem(pacientesExclusivos.length);
    }

    // Função para exibir a contagem com destaque visual ajustado e mais à esquerda
    function exibirContagem(contador) {
        log(`Exibindo contagem: ${contador}`);
        let contadorElement = document.getElementById('drExamesCount');
        if (!contadorElement) {
            log('Elemento de contagem não encontrado. Criando.');
            contadorElement = document.createElement('span');
            contadorElement.id = 'drExamesCount';
            contadorElement.className = 'va-m ml15';

            // Adiciona estilos CSS para destaque visual ajustado
            contadorElement.style.backgroundColor = 'green';
            contadorElement.style.color = 'white';
            contadorElement.style.padding = '8px 15px';
            contadorElement.style.borderRadius = '8px';
            contadorElement.style.fontSize = '16px';
            contadorElement.style.textShadow = '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black';

            const totalPacientes = document.getElementById('total-pacientes');
            if (totalPacientes && totalPacientes.parentNode) {
                totalPacientes.style.marginRight = '15px'; // Adiciona 15px de espaço à esquerda
                totalPacientes.parentNode.insertBefore(contadorElement, totalPacientes);
                log('Elemento de contagem inserido à esquerda de "total-pacientes" com 15px de espaço.');
            } else {
                log('Elemento "total-pacientes" não encontrado ou sem pai.');
            }
        }
        contadorElement.textContent = `DR. EXAMES: ${contador}`;
        log('Contagem atualizada no elemento.');
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
