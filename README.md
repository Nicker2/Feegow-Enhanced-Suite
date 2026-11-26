<p align="center">
  <img src="assets/banner.svg" alt="Feegow Enhanced Suite" width="100%">
</p>

<h1 align="center">🧩 Feegow Enhanced Suite</h1>

<p align="center">
  <b>O Feegow do jeito que a recepção precisa.</b><br>
  Um conjunto de userscripts que acrescenta ao Feegow contador de fila, tela mais limpa, atalhos, papel timbrado em PDF e propostas prontas para imprimir, <b>sem mudar nada no sistema</b>.
</p>

<p align="center">
  <img alt="Userscript Tampermonkey" src="https://img.shields.io/badge/userscript-Tampermonkey-00485B?logo=tampermonkey&logoColor=white">
  <img alt="Chrome | Edge" src="https://img.shields.io/badge/navegador-Chrome%20%7C%20Edge-4285F4?logo=googlechrome&logoColor=white">
  <img alt="Plataforma Feegow" src="https://img.shields.io/badge/plataforma-Feegow-2ea44f">
  <img alt="Suite 4.9.14.0" src="https://img.shields.io/badge/suite-4.9.14.0-blue">
  <a href="LICENSE"><img alt="Licença MIT" src="https://img.shields.io/github/license/Nicker2/Feegow-Enhanced-Suite?label=licen%C3%A7a"></a>
  <img alt="Último commit" src="https://img.shields.io/github/last-commit/Nicker2/Feegow-Enhanced-Suite?label=%C3%BAltima%20atualiza%C3%A7%C3%A3o">
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/core.user.js"><b>⬇️ Instalar o Core</b></a>
  &nbsp;·&nbsp;
  <a href="#-instalação">📦 Instalar</a>
  &nbsp;·&nbsp;
  <a href="#-configuração">⚙️ Configurar</a>
  &nbsp;·&nbsp;
  <a href="#-solução-de-problemas">🩹 Problemas</a>
</p>

---

## 📑 Sumário

- [✨ O que faz](#-o-que-faz)
- [📚 Os scripts](#-os-scripts)
- [🧭 Como funciona](#-como-funciona)
- [📋 Requisitos](#-requisitos)
- [📦 Instalação](#-instalação)
- [🔧 Configuração](#-configuração)
- [🚀 Como usar no dia a dia](#-como-usar-no-dia-a-dia)
- [🔒 Privacidade](#-privacidade)
- [🩹 Solução de problemas](#-solução-de-problemas)
- [❓ Perguntas frequentes](#-perguntas-frequentes)
- [🧰 Para quem mantém](#-para-quem-mantém)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença e autor](#-licença-e-autor)

---

## ✨ O que faz

São **userscripts** para a extensão Tampermonkey. Eles rodam **no seu navegador**, mudam só o que você vê na tela e **nunca gravam nada no Feegow**. Foram escritos para a rotina do HOC (oftalmologia e HOC Derma), mas qualquer usuário do Feegow consegue instalar.

| | Recurso | Em poucas palavras |
| :---: | :--- | :--- |
| 🔢 | **Contador do DR. EXAMES** | Na Lista de Espera, mostra ao lado de "pacientes aguardando" quantos estão **só** na fila do DR. EXAMES, com cor de alerta e a lista de nomes (com link para o prontuário e selo "Primeira vez"). Atualiza a cada 10 s. |
| 🩺 | **Especialidade e dilatação** | Etiqueta com a especialidade ao lado do nome do médico e selo laranja **Dilatar (clique aqui)** quando o protocolo de dilatação do médico vale para a idade do paciente. |
| 📄 | **Sempre 30 por página** | A Lista de Espera fica sempre com 30 itens por página. |
| 🗂️ | **Prontuário a um clique** | Na agenda, um botão ao lado do paciente abre o prontuário em nova aba, sem sair da agenda. |
| 🧹 | **Tela mais limpa** | Esconde avisos amarelos, notificações flutuantes, barra DP Spaces/Doctoralia, assistente de IA, anúncios, o pedido de notificações ("Gostaríamos de te notificar...") e os popups de propaganda/novidades. |
| 🔑 | **Entrada sem dor de cabeça** | Quando o Feegow diz que o usuário *já está conectado em outra máquina*, a Suite mostra uma tela de espera e tenta entrar sozinha por cerca de 1 minuto. Senha errada é avisada na hora. |
| ⚙️ | **Engrenagem de configurações** | Um botão na barra superior liga e desliga cada função, por computador. |
| 🖨️ | **PDF HOC Derma (Timbrador)** | Aplica o cabeçalho e o rodapé HOC Derma em **qualquer PDF**, encaixa o conteúdo sozinho e exporta um PDF com texto selecionável. O arquivo não sai do computador. |
| 💼 | **Propostas HOC Derma** | Botão **Imprimir HOC Derma** na proposta do prontuário: editor com prévia A4, descrição de cada procedimento, valores editáveis só para a impressão e timbrado HOC Derma. |
| 📋 | **Gastos para Excel** | Na linha do tempo do prontuário, botão **Copiar para Excel** em cada registro de gasto: copia só os itens com quantidade (Item e Qtde), sem dados do paciente. Já vem com o Core. |
| 🔁 | **Reaplicar Permissões** | No cadastro de funcionário (aba Permissões), botão ao lado do histórico de permissões que **reaplica a regra que a pessoa já tem** (a do check verde), com confirmação. Também faz **backup, comparação e restauração dos modelos de permissão** (regras predefinidas), com prévia e conferência. Já vem com o Core. |
| 🔄 | **Atualiza sozinho** | Instalando só o Core, uma versão nova chega a todos os computadores em até cerca de 1 hora. Sem internet, roda a última cópia guardada. |

<p align="center">
  <img src="assets/engrenagem.svg" alt="Ilustração do menu de engrenagem com as funções da Suite ligadas" width="560"><br>
  <sub>Ilustração do menu de engrenagem (desenho, sem dados reais).</sub>
</p>

---

## 📚 Os scripts

| Script | Para que serve | Versão | Instalar |
| :--- | :--- | :---: | :--- |
| 🚀 **Core** (`core.user.js`) | Injetor: baixa a Suite do GitHub, guarda em cache e executa. É o **único** que você precisa instalar para ter a Suite, o Timbrador, as Propostas, o Gastos para Excel e o Reaplicar Permissões. | 1.1.9.0 | [instalar](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/core.user.js) |
| 🧩 **Suite principal** (`VERIFICAR-DR-EXAMES.user.js`) | Contador do DR. EXAMES, especialidade e dilatação, engrenagem, limpeza da tela, atalho para o prontuário e entrada com sessão ocupada. | 4.9.14.0 | carregada pelo Core ([avulsa](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/VERIFICAR-DR-EXAMES.user.js)) |
| 🖨️ **PDF HOC Derma** (`hoc-derma-stamping-tool.user.js`) | Janela que aplica o timbrado HOC Derma em qualquer PDF, ajusta o encaixe e exporta ou imprime. | 3.1.0 | carregado pela Suite ([avulso](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-derma-stamping-tool.user.js)) |
| 💼 **Propostas HOC Derma** (`hoc-derma-propostas.user.js`) | Botão **Imprimir HOC Derma** na proposta do prontuário, com editor e folha A4 timbrada, e botão **Gerenciar descrições** (adicionar/editar/excluir descrições, com backup). | 1.4.8 | carregado pela Suite ([avulso](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-derma-propostas.user.js)) |
| 📋 **HOC Gastos para Excel** (`hoc-gastos-excel.user.js`) | Botão **📋 Copiar para Excel** nos registros de gasto da linha do tempo do prontuário. | 1.1.0 | carregado pela Suite ([avulso](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-gastos-excel.user.js)) |
| 🔁 **HOC Reaplicar Permissões** (`hoc-reaplicar-permissoes.user.js`) | Botão que reaplica a regra de permissões atual no cadastro de funcionário, mais backup/comparar/restaurar dos modelos de permissão, link direto para a aba (`&Aba=Permissoes`) e botão para copiar esse link; nas listas de funcionários e profissionais, filtro de status sempre em "Ativo" ao abrir. | 1.4.0 | carregado pela Suite ([avulso](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-reaplicar-permissoes.user.js)) |

A versão vigente de cada script é a do `@version` no respectivo `.meta.js`.

---

## 🧭 Como funciona

```mermaid
flowchart TD
    A([🌐 Você abre o Feegow]) --> B[Tampermonkey roda o Core]
    B --> C{Cópia guardada da Suite<br/>tem menos de 60 min?}
    C -->|sim| E[Executa a cópia guardada<br/>instantâneo, sem rede]
    C -->|não| D[Baixa a versão nova do GitHub]
    D -->|resposta válida| E2[Executa e guarda a versão nova]
    D -->|sem rede ou erro| E
    E --> S[🧩 Suite principal]
    E2 --> S
    S --> G[⚙️ Engrenagem na barra superior]
    S --> L[🔢 Lista de Espera:<br/>contador, especialidade, dilatação]
    S --> K[🧹 Limpeza da tela e<br/>🗂️ atalho para o prontuário]
    S -->|PDF HOC Derma ON| T[🖨️ Timbrador]
    S -->|Propostas ON| P[💼 Propostas HOC Derma]
    S -->|Gastos para Excel ON| X[📋 Gastos para Excel]
    S -->|Reaplicar Permissões ON| RP[🔁 Reaplicar Permissões]
```

A Suite carrega o Timbrador, as Propostas, o Gastos para Excel e o Reaplicar Permissões do mesmo jeito (cópia guardada por até 60 min), mas só quando o item está **ON** na engrenagem. Nenhum dos scripts grava no Feegow por conta própria: eles leem a tela e acrescentam botões e informações. Exceções: as **Propostas** o Imprimir HOC Derma clica no SALVAR da proposta antes de abrir o editor (desde a 1.3.5), e no editor o "＋ Feegow" de uma linha nova, as quantidades, valores, descontos e acréscimos dos itens e o desconto total gravam na proposta real, seguidos de SALVAR (1.3.6 e 1.3.7). O **Reaplicar Permissões** também grava, mas só depois da confirmação: ele clica no próprio botão **Aplicar** da regra que o funcionário já tem. Desde a 1.1.0, o **Restaurar uma regra** / **Restaurar todas** gravam nos modelos de permissão (nunca no funcionário), só depois da prévia e da confirmação, e conferem relendo a regra; o Backup e o Comparar só leem.

---

## 📋 Requisitos

| | Item | Observação |
| :---: | :--- | :--- |
| 🌐 | **Google Chrome** ou **Microsoft Edge** | Navegadores usados na rotina. O Firefox também tem Tampermonkey, mas não é o foco dos testes. |
| 🐒 | **Extensão Tampermonkey** | [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) · [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) · [Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/tampermonkey/) |
| 🔑 | **Acesso ao Feegow** | Os scripts rodam em `https://<algo>.feegow.com/...` (ex.: `app.feegow.com`). |
| 📶 | **Internet na primeira vez** | Para baixar o código. Depois, sem internet, roda a última cópia guardada. |

---

## 📦 Instalação

### Recomendado: só o Core

1. Instale o **Tampermonkey** no navegador (links em [Requisitos](#-requisitos)).
2. Clique em **[⬇️ Instalar o Core](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/core.user.js)**. O Tampermonkey abre a tela de instalação: clique em **Instalar**.
3. Abra o Feegow e recarregue a página (F5). O Core baixa a Suite, e a Suite baixa o Timbrador e as Propostas.
4. A **engrenagem** aparece na barra superior do Feegow. Pronto.

> [!NOTE]
> No Chrome recente, a extensão pode exigir o **Modo do desenvolvedor** ligado em `chrome://extensions` (ou a opção "Permitir scripts do usuário" nos detalhes da extensão) para executar userscripts.

### Instalação avulsa (sem o Core)

Cada script também funciona sozinho: abra o link *avulso* na [tabela dos scripts](#-os-scripts) e confirme no Tampermonkey. Use isso para testar um script isolado ou para ter só as Propostas, por exemplo.

> [!WARNING]
> **Não instale a Suite avulsa junto com o Core**: ela rodaria duas vezes. Também evite instalar o Timbrador ou as Propostas avulsos com o Core ativo e o item ON na engrenagem: os scripts evitam botões duplicados, mas o código carregaria duas vezes e as configurações ficariam separadas.

---

## 🔧 Configuração

### Engrenagem da Suite

Clique na **engrenagem** da barra superior. Cada clique liga ou desliga o item e **recarrega a página**. As escolhas valem **para aquele computador** e todas vêm ligadas.

| Item da engrenagem | Quando ON | Padrão |
| :--- | :--- | :---: |
| DR. EXAMES (Lista de Espera) | Contador e lista dos pacientes só do DR. EXAMES | ON |
| Avisos Amarelos | Esconde os avisos amarelos | ON |
| Notificações Flutuantes | Esconde as notificações flutuantes | ON |
| Barra DP Spaces | Esconde a barra DP Spaces / Doctoralia | ON |
| IA Feegow | Esconde o assistente de IA | ON |
| Anúncios Feegow | Esconde os anúncios de novidades | ON |
| Ocultar pedido de notificações do Feegow | Esconde o aviso "Gostaríamos de te notificar..." (clica em "Agora não", nunca em "Permitir") | ON |
| Ocultar propagandas e novidades do Feegow (popups) | Fecha pelo X os popups de propaganda/novidades (ex.: "teste grátis"), sem clicar na oferta | ON |
| PDF HOC Derma (v3) | Carrega o Timbrador e mostra o botão vermelho **PDF HOC Derma** | ON |
| Imprimir HOC Derma (Propostas) | Carrega o módulo de Propostas | ON |
| Gastos para Excel | Botão **📋 Copiar para Excel** nos registros de gasto do prontuário | ON |
| Reaplicar Permissões | Botão que reaplica a regra de permissões atual no cadastro de funcionário | ON |
| Abrir aba pelo link (&Aba=Permissoes) | Abre a aba pedida no link do funcionário/profissional e mostra o botão "Copiar link das permissões" | **OFF** |
| Botão Permissões nas listas de funcionários e profissionais | Botão "🔐 Permissões" ao lado de cada cadastro ativo; abre a aba Permissões em nova aba (funciona mesmo com a opção acima desligada) | ON |
| Botão Reaplicar nas listas | Botão "♻️ Reaplicar" na lista de funcionários ativos: abre o cadastro e reaplica a regra marcada (✓), uma vez só | ON |
| Botão Reaplicar em todos nas listas | Botão "♻️ Reaplicar em todos (N)" à direita do filtro de status da lista de funcionários: reaplica a regra marcada (✓) em todos os ativos da tela, um por vez, sem abrir abas (desabilitado em profissionais) | ON |
| Confirmar antes de reaplicar em todos | Janela "Reaplicar a regra marcada em N funcionários desta página?" antes de começar | ON |
| Pedir confirmação antes de reaplicar pela lista | Modal da Suite antes de o ♻️ aplicar | **OFF** |

### Configurações das Propostas

No editor de propostas, botão **⚙ Configurações** (ou, com o script instalado avulso, no ícone do Tampermonkey → **Configurações das propostas**): nome e cargo de quem assina a folha, tabela de itens, total, investimento por procedimento, validade e linha de assinatura. Detalhes em [docs/hoc-derma-propostas.md](docs/hoc-derma-propostas.md#5-configurações-das-propostas).

### Ajustes do Timbrador

O Timbrador lembra o encaixe de cada PDF sozinho. Modo de impressão e diagnóstico ficam no menu **⋯** da janela. Detalhes em [docs/pdf-hoc-derma-timbrador.md](docs/pdf-hoc-derma-timbrador.md).

> [!TIP]
> A relação de médicos e especialidades e os protocolos de dilatação ficam no código da Suite. Para incluir um médico novo, veja [docs/suite-principal.md](docs/suite-principal.md#6-personalização-no-código).

---

## 🚀 Como usar no dia a dia

| Situação | O que fazer |
| :--- | :--- |
| Ver quem está só na fila do DR. EXAMES | Abra a **Lista de Espera**: o contador colorido aparece ao lado de "pacientes aguardando" e a lista fica no topo. O botão **Esconder/Mostrar Listas DR. EXAMES** alterna a exibição. |
| Saber se o paciente precisa dilatar | Na Lista de Espera, clique no selo laranja **Dilatar (clique aqui)** para ver o protocolo do médico. |
| Abrir o prontuário pela agenda | Clique no botão ao lado do nome do paciente: abre em nova aba. |
| Feegow diz "usuário já conectado em outra máquina" | Não faça nada: a tela de espera aparece e a Suite tenta entrar sozinha. Se a senha estiver errada, ela avisa e para. |
| Pôr o timbrado HOC Derma num PDF | Botão vermelho **PDF HOC Derma** (barra superior ou painel **Arquivos do Paciente**) ou `Ctrl + Shift + H` → escolha ou arraste o PDF → confira a prévia → **Exportar PDF nativo** ou **Imprimir**. |
| Imprimir uma proposta da HOC Derma | Prontuário → aba **Propostas** → abra a proposta → **Imprimir HOC Derma** → ajuste no editor → **Imprimir** (ou `Ctrl + Enter`). Para PDF, escolha **Salvar como PDF**. |
| Passar os itens de um gasto para o Excel | Prontuário → linha do tempo → no registro de gasto, **📋 Copiar para Excel** → Ctrl+V no Excel (item **Gastos para Excel** ON na engrenagem; detalhes em [docs/hoc-gastos-excel.md](docs/hoc-gastos-excel.md)). |
| Link direto para a aba Permissões de um funcionário | Cadastro do funcionário → botão **🔗 Copiar link das permissões** ao lado do título → cole o link (`…&Aba=Permissoes`; também aceita `Acesso` e `Cadastro`, ou `#divPermissoes`). Item **Abrir aba pelo link** ON na engrenagem; detalhes em [docs/hoc-reaplicar-permissoes.md](docs/hoc-reaplicar-permissoes.md). |
| Reaplicar a regra de permissões de um funcionário | Cadastro do funcionário → aba **Permissões** → botão **🔁 Reaplicar regra atual** ao lado do histórico (a dica mostra a regra atual) → **Reaplicar** (item **Reaplicar Permissões** ON na engrenagem; detalhes em [docs/hoc-reaplicar-permissoes.md](docs/hoc-reaplicar-permissoes.md)). |
| Fazer backup / restaurar os modelos de permissão (regras predefinidas) | Cadastro de qualquer funcionário → aba **Permissões** → **Backup das regras** (baixa um JSON datado), **Comparar com backup**, **Restaurar uma regra** (prévia, só repõe o que falta) ou **Restaurar todas 🔒** (travado até haver backup revisado e 10 restaurações conferidas). Regras de desconto ficam de fora. |
| Desligar uma função neste computador | Engrenagem → clique no item (vira OFF e a página recarrega). |

---

## 🔒 Privacidade

- **Nenhum script envia dados para servidores de terceiros.** Fora do Feegow, só baixam o próprio código do GitHub (e, raramente, uma biblioteca pública de PDF).
- **Nenhum script grava no Feegow.** Não há cadastro, edição ou exclusão de registros.
- **O PDF do Timbrador não sai do computador**: tudo é feito no navegador.
- **As Propostas leem a tela e clicam no SALVAR da proposta** (ao clicar em Imprimir HOC Derma, desde a 1.3.5). No editor, o "＋ Feegow" de uma linha nova, quantidades, valores, descontos e acréscimos dos itens e o desconto total gravam no Feegow (1.3.6/1.3.7); descrições e textos valem só para aquela impressão. As "Observações Internas" nunca são lidas nem impressas.
- **Entrada com sessão ocupada:** para tentar entrar de novo sozinha, a Suite guarda o usuário e a senha digitados **na própria aba**, até a entrada dar certo ou a aba ser fechada. Em computador compartilhado, feche a aba depois de sair do Feegow.

A análise completa, script por script, está em [docs/AVANCADO.md](docs/AVANCADO.md#privacidade-e-segurança).

---

## 🩹 Solução de problemas

| Sintoma | O que fazer |
| :--- | :--- |
| ⚙️ A engrenagem não aparece | Confira se o Core está **ativo** no Tampermonkey e se o endereço é `https://<algo>.feegow.com/...`. Em janela estreita o Feegow esconde os botões da barra: aumente a janela. |
| 🔴 O botão PDF HOC Derma ou Imprimir HOC Derma não aparece | Confira se o item está **ON** na engrenagem. O Imprimir HOC Derma só aparece na **proposta aberta no prontuário**. |
| 🐒 Instalei e nada acontece | No Chrome recente, ligue o **Modo do desenvolvedor** em `chrome://extensions` (ou "Permitir scripts do usuário" nos detalhes do Tampermonkey) e recarregue o Feegow. |
| ⏳ Publiquei uma versão e ela não chegou | Pela cascata, espere até 60 min ou force o download (passo a passo em [docs/AVANCADO.md](docs/AVANCADO.md#atualização-automática)). Instalação avulsa: **Verificar atualizações** no Tampermonkey; confira se o `@version` subiu também no `.meta.js`. |
| 🔑 A entrada automática não disparou | Os dados só são guardados quando você clica em **Entrar**. Um preenchimento automático que envie o formulário sozinho impede a nova tentativa: digite e clique em **Entrar**. |
| 🖨️ Impressão do Timbrador bloqueada | Libere pop-ups para o Feegow ou escolha **Sempre nesta janela** no menu **⋯**. O **Diagnóstico** (menu ⋯) mostra o que falha. |
| 📄 Saíram data e endereço do site na folha | Na janela de impressão, em "Mais configurações", desmarque **Cabeçalhos e rodapés**. |
| 🌐 Sem internet | A Suite roda a última cópia guardada, mesmo vencida. Só falha na primeira execução, com o cache vazio. |
| 🧾 "Erro ao buscar dados da API" no console | A conexão caiu ou a sessão do Feegow expirou: recarregue e entre de novo. |

Problemas específicos de cada script: [Suite](docs/suite-principal.md#7-problemas-comuns) · [Timbrador](docs/pdf-hoc-derma-timbrador.md#problemas-comuns) · [Propostas](docs/hoc-derma-propostas.md#9-solução-de-problemas).

---

## ❓ Perguntas frequentes

<details>
<summary><b>Os scripts podem estragar alguma coisa no Feegow?</b></summary>

Não. Eles só mudam o que aparece na tela do seu navegador: escondem elementos, acrescentam botões e leem informações que já estão na página. Nenhum deles cadastra, edita ou apaga registros.
</details>

<details>
<summary><b>Preciso instalar os quatro scripts?</b></summary>

Não. Instale só o **Core**: ele baixa a Suite, e a Suite baixa o Timbrador e as Propostas. Os links avulsos existem para testes ou para quem quer um script isolado.
</details>

<details>
<summary><b>Como fico sabendo de uma versão nova?</b></summary>

Não precisa ficar sabendo: com o Core, a versão nova chega sozinha em até cerca de 1 hora. O que mudou em cada versão está em [docs/HISTORICO.md](docs/HISTORICO.md).
</details>

<details>
<summary><b>Funciona sem internet?</b></summary>

O Feegow é on-line, então você precisa de internet para usá-lo. Mas, se o GitHub estiver fora ou a rede cair no meio do dia, a Suite continua rodando com a última cópia guardada.
</details>

<details>
<summary><b>Posso desligar só uma função?</b></summary>

Sim. Na engrenagem, clique no item para deixá-lo OFF. A escolha vale só para aquele computador.
</details>

<details>
<summary><b>Uso o Feegow em outra clínica. Serve para mim?</b></summary>

Serve. A limpeza da tela, a engrenagem, o atalho para o prontuário, a entrada com sessão ocupada e o Timbrador funcionam em qualquer conta do Feegow. O contador do DR. EXAMES, a relação de especialidades, os protocolos de dilatação e o timbrado HOC Derma são da rotina do HOC: para outra clínica, é preciso adaptar no código (veja [docs/suite-principal.md](docs/suite-principal.md#6-personalização-no-código)).
</details>

<details>
<summary><b>A proposta impressa muda alguma coisa na proposta do Feegow?</b></summary>

Não. Valores, textos e itens ajustados no editor valem só para aquela impressão. A proposta no Feegow continua como estava.
</details>

---

## 🧰 Para quem mantém

| Documento | Conteúdo |
| :--- | :--- |
| 📘 [docs/AVANCADO.md](docs/AVANCADO.md) | Cascata do Core, atualização, privacidade e segurança em detalhe, estrutura do repositório, testes offline e como publicar uma versão. |
| 🔗 [docs/core-e-cascata.md](docs/core-e-cascata.md) | Cache, chaves salvas no Tampermonkey, permissões e como forçar o download. |
| 🧩 [docs/suite-principal.md](docs/suite-principal.md) | Todas as funções da Suite e a personalização no código. |
| 🖨️ [docs/pdf-hoc-derma-timbrador.md](docs/pdf-hoc-derma-timbrador.md) | Guia completo do Timbrador. |
| 💼 [docs/hoc-derma-propostas.md](docs/hoc-derma-propostas.md) | Guia completo das Propostas, catálogo de procedimentos e manutenção. |
| 📋 [docs/hoc-gastos-excel.md](docs/hoc-gastos-excel.md) | HOC Gastos para Excel: o que copia, ordem e detecção dos registros. |
| 📜 [docs/HISTORICO.md](docs/HISTORICO.md) | Histórico de versões. |

Atalhos:

```bash
node --check VERIFICAR-DR-EXAMES.user.js   # confere a sintaxe antes de publicar
python montar_userscripts.py               # (pasta de trabalho) gera o userscript das Propostas
git pull --rebase origin main && git push origin main
```

> [!IMPORTANT]
> Ao publicar, aumente o `@version` **no `.user.js` e no `.meta.js`** (os dois precisam ser iguais). Sem isso, o Tampermonkey não percebe a versão nova.

---

## 🤝 Contribuição

Contribuições são bem-vindas:

1. Faça um **fork** e crie uma branch (`git checkout -b minha-melhoria`).
2. Faça as alterações e rode `node --check` nos arquivos alterados.
3. Teste com o script instalado avulso (e o Core desativado).
4. Abra um **Pull Request** explicando o que mudou e por quê.

> [!CAUTION]
> Este repositório é **público**, e o código publicado aqui roda no navegador de quem usa o Core. Nunca envie senhas, tokens, capturas de tela ou qualquer dado de pacientes.

---

## 📄 Licença e autor

Distribuído sob a **Licença MIT**. Veja [LICENSE](LICENSE).

As Propostas HOC Derma embutem as fontes Poppins, Montserrat, Open Sans, Roboto e Lato (Google Fonts, subconjunto latino), distribuídas sob a **SIL Open Font License 1.1**. As licenças estão em [assets/fontes/](assets/fontes/).

Criado por **Nicolas Bonza Cavalari Borges**.
