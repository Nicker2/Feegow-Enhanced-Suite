// ==UserScript==
// @name         Timbrador de PDF HOC DERMA (Example.com)
// @namespace    https://github.com/Nicker2
// @version      2.0
// @description  Renderiza PDF com cabeçalho/rodapé em cada página e calibração X/Y ao vivo
// @author       Nicolas Bonza Cavalari Borges
// @downloadURL  https://github.com/Nicker2/Feegow-Enhanced-Suite/raw/refs/heads/main/hoc-derma-stamping-tool.user.js
// @updateURL    https://github.com/Nicker2/Feegow-Enhanced-Suite/raw/refs/heads/main/hoc-derma-stamping-tool.meta.js
// @match        https://example.com/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    // =========================================================================
    // ⚙️ CONFIGURAÇÕES PRINCIPAIS
    // =========================================================================
    const MODO_DEBUG = false;

    // Substitua pelas suas imagens em Base64 reais
    const IMG_CABECALHO_B64 = "data:image/png;base64,testeaqui";
    const IMG_RODAPE_B64 = "data:image/png;base64,testeaqui";

    // Valores Iniciais de Calibração
    let CFG = {
        cabY: -3,
        cabX: 0,
        cabH: 110,
        rodY: -4,
        rodX: 0,
        rodH: 136,
        pdfY: -38,
        pdfScale: 96
    };

    // Configura o worker do PDF.js
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    // =========================================================================
    // 🧹 PREPARAÇÃO DA TELA & CSS
    // =========================================================================
    document.documentElement.innerHTML = `
        <head>
            <title>Impressão Timbrada HOC</title>
            <style>
                /* Variáveis CSS para atualização em tempo real ultrarrápida */
                :root {
                    --cab-y: ${CFG.cabY}px;
                    --cab-x: ${CFG.cabX}px;
                    --cab-h: ${CFG.cabH}px;
                    --rod-y: ${CFG.rodY}px;
                    --rod-x: ${CFG.rodX}px;
                    --rod-h: ${CFG.rodH}px;
                    --pdf-y: ${CFG.pdfY}px;
                    --pdf-scale: ${CFG.pdfScale / 100};
                }

                body {
                    margin: 0; padding: 0;
                    background-color: #525659;
                    font-family: Arial, sans-serif;
                }

                #hoc-painel-controles {
                    background: #333; color: white;
                    padding: 15px; text-align: center;
                    position: sticky; top: 0; z-index: 10000;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                }

                #hoc-painel-controles input, #hoc-painel-controles button {
                    margin: 0 10px; padding: 8px 15px; font-size: 14px; cursor: pointer;
                }
                .btn-imprimir { background-color: #007bff; color: white; border: none; border-radius: 4px; font-weight: bold; }
                .btn-imprimir:hover { background-color: #0056b3; }

                #pdf-container {
                    display: flex; flex-direction: column; align-items: center; padding: 30px 0;
                }

                /* A Folha do PDF na Tela */
                .pdf-page {
                    position: relative; /* FUNDAMENTAL: Prende as imagens absolutass dentro desta div */
                    background: white;
                    margin-bottom: 20px;
                    width: 210mm; /* Tamanho A4 cravado */
                    min-height: 297mm; /* Proporção A4 cravada */
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    overflow: hidden;
                }

                .pdf-page canvas {
                    width: 100% !important;
                    height: auto !important;
                    display: block;
                    transform: translateY(var(--pdf-y)) scale(var(--pdf-scale));
                    transform-origin: top center; /* Faz encolher por baixo, liberando espaço no rodapé */
                }

                /* Imagens Clonadas dentro de cada página */
                .hoc-cabecalho-clone {
                    position: absolute;
                    top: var(--cab-y);
                    left: calc(50% + var(--cab-x)); /* 50% centraliza, var(--cab-x) desloca pra esq/dir */
                    transform: translateX(-50%);
                    height: var(--cab-h);
                    z-index: 10;
                    pointer-events: none;
                }

                .hoc-rodape-clone {
                    position: absolute;
                    bottom: var(--rod-y);
                    left: calc(50% + var(--rod-x));
                    transform: translateX(-50%);
                    height: var(--rod-h);
                    z-index: 10;
                    pointer-events: none;
                }

                /* Estilos de Impressão */
                @media print {
                    @page { margin: 0; size: A4 portrait; }
                    html, body { margin: 0; padding: 0; background-color: white; }
                    #hoc-painel-controles, #hoc-painel-debug { display: none !important; }
                    #pdf-container { padding: 0; margin: 0; border: none; }

                    .pdf-page {
                        margin: 0;
                        box-shadow: none;
                        page-break-after: always; /* Força nova página após cada folha... */
                        page-break-inside: avoid;
                    }

                    /* NOVO: Remove a quebra de página da ÚLTIMA folha para evitar folha em branco */
                    .pdf-page:last-child {
                        page-break-after: auto;
                    }
                }
            </style>
        </head>
        <body>
            <div id="hoc-painel-controles" class="no-print">
                <label><b>1. Selecione o PDF:</b></label>
                <input type="file" id="arquivo-pdf" accept="application/pdf">
                <button id="btn-imprimir" class="btn-imprimir" style="display:none;">🖨️ Imprimir PDF Timbrado</button>
            </div>
            <div id="pdf-container"></div>
        </body>
    `;

    // =========================================================================
    // 📄 LÓGICA DE RENDERIZAÇÃO DO PDF
    // =========================================================================
    document.getElementById('arquivo-pdf').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            const reader = new FileReader();
            reader.onload = async function() {
                const typedarray = new Uint8Array(this.result);
                document.getElementById('pdf-container').innerHTML = '<h3 style="color:white;">Gerando páginas...</h3>';

                try {
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    document.getElementById('pdf-container').innerHTML = ''; // Limpa aviso

                    // Renderiza página por página e injeta imagens nelas
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 2.0 }); // Escala mais alta para evitar desfoque na impressão

                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                        const divPage = document.createElement('div');
                        divPage.className = 'pdf-page';

                        // Injeta o cabeçalho nesta página
                        const cabImg = document.createElement('img');
                        cabImg.className = 'hoc-cabecalho-clone';
                        cabImg.src = IMG_CABECALHO_B64;

                        // Injeta o rodapé nesta página
                        const rodImg = document.createElement('img');
                        rodImg.className = 'hoc-rodape-clone';
                        rodImg.src = IMG_RODAPE_B64;

                        divPage.appendChild(cabImg);
                        divPage.appendChild(canvas);
                        divPage.appendChild(rodImg);

                        document.getElementById('pdf-container').appendChild(divPage);
                    }

                    document.getElementById('btn-imprimir').style.display = 'inline-block';

                } catch (error) {
                    alert('Erro ao carregar o PDF: ' + error.message);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    });

    document.getElementById('btn-imprimir').addEventListener('click', () => window.print());

    // =========================================================================
    // 🎛️ PAINEL DE CALIBRAÇÃO (DEBUG X/Y)
    // =========================================================================
    if (MODO_DEBUG) {
        const painel = document.createElement('div');
        painel.id = 'hoc-painel-debug';
        painel.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 999999; background: #ffffff; border: 2px solid #0056b3; border-radius: 8px; padding: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.35); font-family: sans-serif; font-size: 11px; width: 320px; color: #333;';

        painel.innerHTML = `
            <div style="border-bottom: 2px solid #0056b3; padding-bottom: 6px; margin-bottom: 10px; text-align: center;">
                <strong style="color: #0056b3; font-size: 14px;">🎛️ Calibrador de Timbrado (Ao Vivo)</strong>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="background: #f8f9fa; padding: 5px; border-radius: 4px;">
                    <strong style="display:block; margin-bottom: 5px;">CABEÇALHO:</strong>
                    <label style="display: flex; justify-content: space-between;">↕️ Sobe/Desce (Y): <span id="v-cabY">${CFG.cabY}px</span></label>
                    <input type="range" id="rng-cabY" min="-20" max="250" value="${CFG.cabY}" style="width: 100%;">

                    <label style="display: flex; justify-content: space-between;">↔️ Esq/Dir (X): <span id="v-cabX">${CFG.cabX}px</span></label>
                    <input type="range" id="rng-cabX" min="-300" max="300" value="${CFG.cabX}" style="width: 100%;">

                    <label style="display: flex; justify-content: space-between;">🔍 Tamanho: <span id="v-cabH">${CFG.cabH}px</span></label>
                    <input type="range" id="rng-cabH" min="20" max="250" value="${CFG.cabH}" style="width: 100%;">
                </div>

                <div style="background: #f8f9fa; padding: 5px; border-radius: 4px;">
                    <strong style="display:block; margin-bottom: 5px;">RODAPÉ:</strong>
                    <label style="display: flex; justify-content: space-between;">↕️ Sobe/Desce (Y): <span id="v-rodY">${CFG.rodY}px</span></label>
                    <input type="range" id="rng-rodY" min="-20" max="250" value="${CFG.rodY}" style="width: 100%;">

                    <label style="display: flex; justify-content: space-between;">↔️ Esq/Dir (X): <span id="v-rodX">${CFG.rodX}px</span></label>
                    <input type="range" id="rng-rodX" min="-300" max="300" value="${CFG.rodX}" style="width: 100%;">

                    <label style="display: flex; justify-content: space-between;">🔍 Tamanho: <span id="v-rodH">${CFG.rodH}px</span></label>
                    <input type="range" id="rng-rodH" min="20" max="250" value="${CFG.rodH}" style="width: 100%;">

                    <div style="background: #f8f9fa; padding: 5px; border-radius: 4px;">
                    <strong style="display:block; margin-bottom: 5px;">CONTEÚDO DO PDF:</strong>
                    <label style="display: flex; justify-content: space-between;">↕️ Sobe/Desce (Y): <span id="v-pdfY">${CFG.pdfY}px</span></label>
                    <input type="range" id="rng-pdfY" min="-150" max="150" value="${CFG.pdfY}" style="width: 100%;">

                    <label style="display: flex; justify-content: space-between;">🔍 Escala/Tamanho (%): <span id="v-pdfScale">${CFG.pdfScale}%</span></label>
                    <input type="range" id="rng-pdfScale" min="70" max="100" value="${CFG.pdfScale}" style="width: 100%;">
                </div>
            </div>
        `;
        document.body.appendChild(painel);

        // Atualiza a variável CSS do :root instantaneamente ao mover o controle
        const ligarControle = (idInput, idTexto, variavelCss, sufixo = 'px') => {
            document.getElementById(idInput).addEventListener('input', (e) => {
                const valor = e.target.value;
                document.getElementById(idTexto).innerText = valor + sufixo;
                document.documentElement.style.setProperty(variavelCss, valor + sufixo);
            });
        };

        ligarControle('rng-cabY', 'v-cabY', '--cab-y');
        ligarControle('rng-cabX', 'v-cabX', '--cab-x');
        ligarControle('rng-cabH', 'v-cabH', '--cab-h');

        ligarControle('rng-rodY', 'v-rodY', '--rod-y');
        ligarControle('rng-rodX', 'v-rodX', '--rod-x');
        ligarControle('rng-rodH', 'v-rodH', '--rod-h');
        ligarControle('rng-pdfY', 'v-pdfY', '--pdf-y');

        // Controle especial para escala que converte % em decimal (ex: 95% = 0.95)
        document.getElementById('rng-pdfScale').addEventListener('input', (e) => {
            const valor = e.target.value;
            document.getElementById('v-pdfScale').innerText = valor + '%';
            document.documentElement.style.setProperty('--pdf-scale', valor / 100);
        });
    }
})();
