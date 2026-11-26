# HOC Reaplicar Permissões (userscript do Feegow)

[Voltar ao README](../README.md)

**Versão atual: 1.1.0** · arquivo [`hoc-reaplicar-permissoes.user.js`](../hoc-reaplicar-permissoes.user.js)

## Instalação

**Recomendado: só o [Core](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/core.user.js).** Desde o Core 1.1.3.0 / Suite 4.9.7.0, o Reaplicar Permissões vem junto, ligado por padrão (item **Reaplicar Permissões** na engrenagem da Suite). A Suite só baixa o módulo no cadastro de funcionário.

O [avulso](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-reaplicar-permissoes.user.js) serve só para quem não usa o Core. Se os dois estiverem ativos, só um roda (marcador `data-hoc-reaplicar-permissoes-ativo` no `<html>`).

## O que faz

No cadastro de funcionário (`?P=Funcionarios&Pers=1&I=<número>`, com `P` em qualquer maiúscula), aba **Permissões**, aparece o botão **🔁 Reaplicar regra atual** logo à esquerda do botão de histórico de permissões, com as mesmas classes dele (`btn btn-sm btn-default fright mt10`).

- **Passe o mouse**: a dica mostra `Reaplicar a regra atual: <nome da regra>`.
- **Clique**: abre uma janelinha *"Reaplicar a regra '<regra>' para <funcionário>?"* com **Reaplicar** e **Cancelar** (Enter confirma, Esc cancela).
- **Reaplicar**: o script clica no próprio botão **Aplicar** da regra na tabela *"Você também pode aplicar uma das regras predefinidas abaixo"*. É o mesmo caminho do clique manual (`permissoesAcao` e o token da própria página); o script não monta pedido nem copia token.
- **Aviso**: mostra "Reaplicando..." e, quando o Feegow recarrega as permissões, "✔ Regra '<regra>' reaplicada." (a Suite costuma esconder o aviso flutuante "Regra aplicada." do Feegow, por isso há um aviso próprio).
- **Sem regra marcada** (nenhuma linha com o check verde): o botão fica desabilitado (mesmo texto, esmaecido), com a dica "Nenhuma regra aplicada a este funcionário".

## Como acha a regra atual

A linha da tabela de regras cuja primeira célula tem `<i class="far fa-check green">`. O nome vem da 2ª célula. `AplicaRegra` e `UsId` são lidos do `onclick` do botão **Aplicar** dessa linha (nada fixo no código). Na hora de confirmar, a tela é lida de novo; se a regra mudou enquanto a janelinha estava aberta, nada é feito.

## Backup e restauração dos MODELOS de permissão (1.1.0)

À esquerda do **Reaplicar regra atual** (que continua igual) aparecem 4 botões. Todos mexem nos **MODELOS** (a tabela de regras predefinidas), **nunca nas permissões do funcionário aberto** e nunca aplicam regra em ninguém:

`[Backup das regras] [Comparar com backup] [Restaurar uma regra] [Restaurar todas 🔒] | [Reaplicar regra atual] [histórico]`

> ⚠ **As regras de desconto** (quadro "Regras para Aplicação de Desconto", gravadas por outro endpoint) **não entram** no backup nem na restauração. O aviso aparece em todas as janelas.

### Backup das regras (só leitura)
- Lê as regras da tabela uma por vez (~300 ms entre elas), pelo mesmo pedido do botão **Editar** da regra.
- Por regra (chave = número da regra): nome, total, permissões **marcadas e desmarcadas** com o rótulo legível ("Agenda › Agenda Check-in (Visualizar)"), `limitarecpag`, `limitarcontaspagar` e "Ocultar lançamento de particular".
- Cabeçalho: data, autor, nota opcional, versão do script, `revisado: false`, contagem N/N e o aviso dos descontos.
- A regra é recusada se vier sem formulário ou sem token (sessão expirada), com menos de 600 permissões ou com 0 marcadas. Se não fechar N/N, o arquivo sai **INCOMPLETO** (`...-INCOMPLETO.json`).
- Baixa `feegow-regras-AAAA-MM-DD-HHMM.json` para a pasta de Downloads. Guarde fora do Feegow e **fora do repositório**. O navegador guarda só o índice e o último backup compacto (pela Suite, no armazenamento do Tampermonkey; no avulso, no `localStorage`). Não guarda HTML nem token.

### Comparar com backup (só leitura)
Lê tudo de novo e mostra, por regra, o que ela **PERDEU**, o que **GANHOU**, as **permissões novas do Feegow** (que não existiam no backup) e as que deixaram de existir. Também mostra regras novas ou sumidas. Dá para baixar o relatório em `.txt`.

### Restaurar uma regra
1. Escolha a regra (lista com busca) e o backup (o último guardado ou um arquivo JSON).
2. A regra é **relida agora** e aparece a prévia: o que vai voltar, o que ela ganhou, as permissões novas (não são tocadas).
3. **Padrão: só repor o que falta** (marcadas agora ∪ faltando). Nome e limites financeiros ficam como estão, a não ser que você marque a opção (com o antes → depois). "**Igual ao backup**" (desmarcar o que a regra ganhou) fica atrás de uma caixa própria, com aviso.
4. Ao gravar: relê de novo (se a regra mudou durante a prévia, não grava), baixa um **backup pré-restauração** da regra, grava com o formulário atual completo (o mesmo formato do Salvar do modal, sem executar a resposta) e **relê para conferir**. Se não bater, aparece em **vermelho** e para.

### Restaurar todas 🔒
Começa **travado**. Clicar mostra as condições: último backup **COMPLETO (N/N)**, marcado como **revisado** (a própria janela permite marcar, com o nome de quem conferiu as regras críticas) e pelo menos **10 restaurações individuais conferidas** neste navegador. Liberado, ele lê tudo (e baixa esse estado como backup automático), mostra a prévia agregada, pede para digitar `RESTAURAR TODAS`, roda só no modo "repor o que falta", uma regra por vez, e **para no primeiro erro**.

### Testes feitos
- Prévia local com Feegow simulado (`previa/previa_regras_permissoes.html`, fora do repo): 58 checagens (backup completo e incompleto, comparar, restaurar uma com e sem "Igual", financeiro só com opção, divergência em vermelho, regra mudando durante a prévia, trava e "Restaurar todas" parando no 1º erro).
- No Feegow real: backup 88/88 (~40 s), comparar (0 mudanças) e restaurar uma regra só numa regra de teste duplicada. Antes disso, um teste confirmou que salvar a regra **não altera** as permissões do funcionário cujo número vai na URL do salvar (página e histórico de permissões iguais antes e depois).

## Detalhes técnicos

- O `#divPermissoes` é recarregado por AJAX depois de aplicar ou salvar. Um `MutationObserver` recoloca o botão (sem duplicar) e atualiza a dica e o estado.
- O avulso continua `@grant none`: os pedidos são `fetch` para o próprio Feegow (mesma origem) e o armazenamento é o `localStorage`. Pela Suite, usa o `GM_setValue`/`GM_getValue` dela. Nada é enviado para fora do Feegow.
- Não guarda nem registra dados de pacientes nem o token de segurança da página.

## Histórico

- **1.1.0 (26/11/2026)**: botões Backup das regras, Comparar com backup, Restaurar uma regra e Restaurar todas (travado), à esquerda do Reaplicar.
- **1.0.1 (25/11/2026)**: o botão mostra o texto "Reaplicar regra atual" ao lado do ícone.
- **1.0.0 (25/11/2026)**: primeira versão, já carregada pela Suite (Core).
