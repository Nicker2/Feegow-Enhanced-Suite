# HOC Gastos para Excel (userscript do Feegow)

[Voltar ao README](../README.md)

**Versão atual: 1.1.0** · arquivo [`hoc-gastos-excel.user.js`](../hoc-gastos-excel.user.js)

## Instalação

**Recomendado: só o [Core](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/core.user.js).** Desde o Core 1.1.2.0 / Suite 4.9.6.0, o Gastos para Excel vem junto, ligado por padrão (item **Gastos para Excel** na engrenagem da Suite). Não precisa instalar nada em cada PC além do Core.

> Se você instalou o [avulso](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-gastos-excel.user.js) antes, **desinstale-o** no Tampermonkey. Ele continua funcionando e não duplica botões (quem roda primeiro marca a página com `data-hoc-gastos-excel-ativo` e o outro não faz nada), mas fica uma cópia a mais para manter atualizada.

O avulso serve só para quem não usa o Core.

## O que faz

Na **linha do tempo do prontuário**, cada registro de gasto ganha o botão **📋 Copiar para Excel**. Um clique copia só os itens do gasto que têm quantidade, prontos para colar no Excel (Ctrl+V), em duas colunas:

| Item | Qtde |
| :--- | :--- |
| GAZE 7,5 X 7,5 ESTÉRIL | 1 |
| DYSPORT 500 UI | 70UI |

- **Nenhum dado do paciente é copiado** (nome, prontuário, convênio etc. ficam de fora).
- A primeira linha é o cabeçalho `Item | Qtde`.
- A quantidade vai **exatamente como está** no registro (ex.: `70UI`), só sem espaços extras.
- **Ordem**: primeiro todos os materiais (coluna MATERIAL, de cima para baixo), depois todos os medicamentos (coluna MEDICAMENTO, de cima para baixo).
- Linhas sem quantidade (ou vazias) são ignoradas.
- O botão mostra **✔ Copiado (N itens)** por 2 s. Se nenhum item tiver quantidade, mostra **Nenhum item com quantidade**.

## Quais registros ganham o botão

Os registros (`#timeline .timeline-item`) cuja tabela tem o cabeçalho **MATERIAL | QTDE | MEDICAMENTO | QTDE** (detecção principal) **ou** cujo título contém **GASTO** (ex.: "GASTO DE BOTOX"). Laudos, receituários e outros registros ficam sem botão. O botão vai em `.panel-controls` do cabeçalho do registro (ou logo depois do título, se não houver).

Funciona também quando a linha do tempo é carregada aos poucos (AJAX), sem duplicar botões.

## Detalhes técnicos

- Copia em dois formatos ao mesmo tempo: texto separado por TAB e uma `<table>` HTML (`ClipboardItem`), para o Excel manter as colunas. Quantidades que não são só dígitos (`70UI`, `1/2`, `0,5`) vão como texto no HTML, para o Excel não convertê-las em data ou número. Se o navegador não aceitar, usa `navigator.clipboard.writeText` e, por último, `document.execCommand('copy')`.
- `@grant none`: não usa armazenamento nem rede. Só lê a tela; não grava nada no Feegow.
- O cabeçalho é reconhecido de forma geral (pares "nome | QTDE"), sem diferenciar maiúsculas/acentos e ignorando `&nbsp;` e `<br>`.

## Histórico

- **1.1.0 (24/11/2026)**: carregado pela Suite (Core); roda uma vez só por página, mesmo com o avulso instalado junto.
- **1.0.0 (24/11/2026)**: primeira versão, só avulso.
