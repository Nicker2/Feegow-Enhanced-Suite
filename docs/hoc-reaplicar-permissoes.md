# HOC Reaplicar Permissões (userscript do Feegow)

[Voltar ao README](../README.md)

**Versão atual: 1.5.0** · arquivo [`hoc-reaplicar-permissoes.user.js`](../hoc-reaplicar-permissoes.user.js)

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

## Link direto para a aba (1.2.0)

Cole `https://app.feegow.com/main/?P=Funcionarios&Pers=1&I=<número>&Aba=Permissoes` (ou termine com `#divPermissoes`) e a aba **Permissões** abre sozinha. Valores aceitos em `Aba`: `Permissoes` (também `Permissao`, `divPermissoes`), `Acesso` (`divAcesso`) e `Cadastro` (`divCadastroFuncionario`), sem diferenciar maiúsculas nem acentos. Funciona em `P=Funcionarios` e `P=Profissionais`.

- Espera a aba existir (observador de mudanças + verificação a cada 250 ms, no máximo 15 s) e clica **uma vez**. Não clica se a aba já estiver ativa nem se a pessoa clicar em outra aba antes.
- Lê também a URL original da navegação, porque o Feegow reescreve o endereço e perde o `&Aba`.
- O botão **🔗 Copiar link das permissões** (perto do título) copia esse link para a área de transferência.
- Engrenagem: **Abrir aba pelo link (&Aba=Permissoes)**, **OFF por padrão desde a 1.3.0**. A Suite passa as opções pelos atributos `data-hoc-cfg-aba-link` (só `1` liga) e `data-hoc-cfg-reaplicar` do `<html>`. Com a opção desligada, links com `&hocAba=1` (gerados pelos botões das listas) abrem a aba do mesmo jeito.

## Botões nas listas de cadastros (1.3.0)

Em `?P=Funcionarios&Pers=Follow` e `?P=Profissionais&Pers=Follow`, ao lado do nome de cada cadastro **ativo** (estado de acesso diferente de Inativo e Desabilitado):

- **🔐 Permissões**: link para `...?P=<Funcionarios|Profissionais>&Pers=1&I=<id>&Aba=Permissoes&hocAba=1`, em nova aba. O `hocAba=1` faz o módulo abrir a aba mesmo com a opção global desligada.
- **♻️ Reaplicar** (só funcionários, tom verde): mesmo link com `&hocAcao=reaplicar`. Ao abrir, clica no **Aplicar** da regra com ✓ verde (reusa `regraAtual()`), **sem confirmação**, uma vez só (o parâmetro é apagado da URL na hora). Sem regra marcada, avisa e não aplica. Termina com toast verde ("Regra X reaplicada em Y (antes → depois permissões marcadas)") ou vermelho.
- Engrenagem: **Botão Permissões nas listas de funcionários e profissionais** (ON), **Botão Reaplicar nas listas** (ON) e **Pedir confirmação antes de reaplicar pela lista** (OFF; ligada, mostra o modal da Suite antes de aplicar).
- Atributos do `<html>`: `data-hoc-cfg-btn-perm`, `data-hoc-cfg-btn-reaplicar-lista`, `data-hoc-cfg-confirma-lista`.
- A lista é um web component (`<feegow-staff-list>`, `<feegow-professionals-list>`) com shadow DOM aberto; cada linha tem `a[href*="Pers=1"][href*="I="]` e `[data-testid="access-state-badge"][data-state]`. Um observador por shadow root refaz os botões na paginação/filtro/busca e confere o id da linha a cada varredura.

### Reaplicar em todos (1.5.0)

Botão **♻️ Reaplicar em todos (N)** à direita do filtro de status em `?P=Funcionarios&Pers=Follow`. N é a quantidade de funcionários ativos com linha na tela (o filtro, a busca e a paginação mudam o N; o botão se refaz sem duplicar). Em profissionais fica **desabilitado**, com dica (profissional não tem regras predefinidas).

1. **Confirmação** (janela da Suite): "Reaplicar a regra marcada em N funcionários desta página?" [Reaplicar] [Cancelar].
2. **Para cada funcionário, em sequência** (pausa de 500 ms, sem abrir abas): lê a aba com `POST ajxContent.asp?P=Permissoes&T=Funcionarios&I=<id>&Pers=1&q=&Div=divPermissoes` (corpo vazio, como o `ajxContent()` da aba), acha a regra com ✓ (`regraAtual()` sobre o HTML lido) e o `permissionProfileCsrf` do formulário, confere que o `UsId` bate com o do formulário e envia o mesmo corpo do `permissoesAcao` (`AplicaRegra`, `UsId`, `permissionProfileCsrf`) para `ajxContent.asp?P=Permissoes&T=Funcionarios&I=<id>&Pers=1&Div=divPermissoes`. A resposta precisa trazer a mesma regra marcada, senão conta como erro.
3. **Sem ✓**: pulado ("sem regra marcada"). **Erro** (HTTP, rede, 30 s, resposta estranha): registrado, segue para o próximo.
4. **Painel**: barra de progresso, **Parar** (termina o funcionário em curso e não começa outro) e, no fim, "Reaplicado: X · Sem regra: Y · Erros: Z" com a lista por nome e **Copiar relatório**.

Engrenagem: **Botão Reaplicar em todos nas listas** (ON) e **Confirmar antes de reaplicar em todos** (ON). Atributos do `<html>`: `data-hoc-cfg-btn-massa` e `data-hoc-cfg-confirma-massa` (só `0` desliga).

### Filtro em "Ativo" (1.4.0)

Ao abrir as duas listas, o filtro de status fica em **Ativo** (define o `<select>` e dispara `input`/`change`; uma vez por carregamento, respeitando a troca feita pela pessoa). Engrenagem: **Listas de funcionários/profissionais abrem em Ativo** (ON; atributo `data-hoc-cfg-lista-ativo`).

### Espera da aba no ♻️ (1.4.0)

O ♻️ espera `#frmPermissoes` e a tabela de regras (`editaRegra(...)`/Aplicar) ficarem presentes e estáveis por 700 ms (até 25 s) antes de procurar o ✓. Só avisa "não tem regra marcada" com a tabela carregada e sem ✓; estourando o tempo, avisa que a aba demorou e não aplica. O ♻️ só existe em funcionários.

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

- **1.5.0 (26/11/2026)**: botão **♻️ Reaplicar em todos (N)** nas listas de funcionários (sem abrir abas, com confirmação, progresso, Parar e relatório).
- **1.4.0 (26/11/2026)**: listas abrem com o filtro em Ativo; ♻️ espera a aba Permissões carregar por completo.

- **1.1.0 (26/11/2026)**: botões Backup das regras, Comparar com backup, Restaurar uma regra e Restaurar todas (travado), à esquerda do Reaplicar.
- **1.0.1 (25/11/2026)**: o botão mostra o texto "Reaplicar regra atual" ao lado do ícone.
- **1.0.0 (25/11/2026)**: primeira versão, já carregada pela Suite (Core).
