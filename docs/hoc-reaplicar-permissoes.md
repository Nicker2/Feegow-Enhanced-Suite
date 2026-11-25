# HOC Reaplicar Permissões (userscript do Feegow)

[Voltar ao README](../README.md)

**Versão atual: 1.0.0** · arquivo [`hoc-reaplicar-permissoes.user.js`](../hoc-reaplicar-permissoes.user.js)

## Instalação

**Recomendado: só o [Core](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/core.user.js).** Desde o Core 1.1.3.0 / Suite 4.9.7.0, o Reaplicar Permissões vem junto, ligado por padrão (item **Reaplicar Permissões** na engrenagem da Suite). A Suite só baixa o módulo no cadastro de funcionário.

O [avulso](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-reaplicar-permissoes.user.js) serve só para quem não usa o Core. Se os dois estiverem ativos, só um roda (marcador `data-hoc-reaplicar-permissoes-ativo` no `<html>`).

## O que faz

No cadastro de funcionário (`?P=Funcionarios&Pers=1&I=<número>`, com `P` em qualquer maiúscula), aba **Permissões**, aparece um botão 🔁 logo à esquerda do botão de histórico de permissões, com as mesmas classes dele (`btn btn-sm btn-default fright mt10`).

- **Passe o mouse**: a dica mostra `Reaplicar a regra atual: <nome da regra>`.
- **Clique**: abre uma janelinha *"Reaplicar a regra '<regra>' para <funcionário>?"* com **Reaplicar** e **Cancelar** (Enter confirma, Esc cancela).
- **Reaplicar**: o script clica no próprio botão **Aplicar** da regra na tabela *"Você também pode aplicar uma das regras predefinidas abaixo"*. É o mesmo caminho do clique manual (`permissoesAcao` e o token da própria página); o script não monta pedido nem copia token.
- **Aviso**: mostra "Reaplicando..." e, quando o Feegow recarrega as permissões, "✔ Regra '<regra>' reaplicada." (a Suite costuma esconder o aviso flutuante "Regra aplicada." do Feegow, por isso há um aviso próprio).
- **Sem regra marcada** (nenhuma linha com o check verde): o botão fica desabilitado, com a dica "Nenhuma regra aplicada a este funcionário".

## Como acha a regra atual

A linha da tabela de regras cuja primeira célula tem `<i class="far fa-check green">`. O nome vem da 2ª célula. `AplicaRegra` e `UsId` são lidos do `onclick` do botão **Aplicar** dessa linha (nada fixo no código). Na hora de confirmar, a tela é lida de novo; se a regra mudou enquanto a janelinha estava aberta, nada é feito.

## Detalhes técnicos

- O `#divPermissoes` é recarregado por AJAX depois de aplicar ou salvar. Um `MutationObserver` recoloca o botão (sem duplicar) e atualiza a dica e o estado.
- `@grant none`: não usa armazenamento nem rede, não guarda nem registra dados do funcionário.

## Histórico

- **1.0.0 (25/11/2026)**: primeira versão, já carregada pela Suite (Core).
