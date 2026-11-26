# Propostas HOC Derma (userscript do Feegow)

**Versão atual: 1.4.8** · arquivo [`hoc-derma-propostas.user.js`](../hoc-derma-propostas.user.js)

**[Instalar no Tampermonkey](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-derma-propostas.user.js)**

O script coloca o botão **"Imprimir HOC Derma"** na tela de proposta do prontuário do Feegow. Ele gera uma proposta de tratamento com o timbrado da HOC Derma, que pode ser impressa ou salva em PDF. A proposta inclui:

- os dados do paciente, a data e o profissional, lidos da própria proposta;
- **cada procedimento na ordem e com o nome do Feegow** (desde a 1.3.10, um bloco por item, inclusive repetidos), com a **descrição** dermatológica (toxina, preenchimento, laser, Liftera, MMP, peelings etc.), tirada dos modelos de texto da clínica;
- o **investimento** de cada procedimento. Por padrão é o valor que está na proposta do Feegow, e dá para trocar só para aquela impressão;
- o **total**, as formas de pagamento, as outras despesas e o texto complementar da proposta;
- a **validade** da proposta, se você quiser;
- o **nome de quem fez a proposta** no fim da folha;
- a **tabela de itens**, que é opcional e vem desligada por padrão.

> **Ao clicar em "Imprimir HOC Derma", o script clica no botão SALVAR da proposta** (desde a 1.3.5), como você faria, e logo em seguida abre o editor. As "Observações Internas" da proposta nunca são lidas nem impressas. Descrições, textos e opções do editor valem só para aquela impressão. O resto grava na proposta real e clica em SALVAR (1.3.6 e 1.3.7):
>
> - **"＋ Feegow" numa linha nova** (criada por "+ Adicionar linha"; também com Enter na descrição): o procedimento entra na proposta do Feegow. O ID vem do nome exato, procurado entre os itens que já estão na proposta e na mesma busca do campo "Procedimento" do Feegow (só leitura). Se o nome não for exato ou houver dois iguais, aparece uma lista para escolher. O script chama a função `itens('S','I', ID)` do próprio Feegow, espera a linha nova (até 10 s), preenche quantidade, valor unitário (se você digitou; senão fica o preço do Feegow), desconto e acréscimo, e clica em SALVAR. Ele nunca usa a opção de criar um procedimento novo. Erros aparecem na janela: paciente não selecionado, procedimento não encontrado ou tempo esgotado. Cada linha só é enviada uma vez.
> - **Desconto total** (em % ou R$): ao mudar o campo, o valor vai para o "Desconto total" (%) do Feegow. Um desconto em R$ vira % sobre o subtotal, com 2 casas e no máximo 100%. O script confere se o total do Feegow bate com o da janela e avisa se não bater (tolerância: centavos mais o arredondamento do %). Apagar o desconto zera o campo no Feegow.
> - **Fontes** (desde a 1.3.7): a janela e a folha usam a Poppins, embutida no script (funciona sem internet). O botão **"Aa Tamanho das fontes"** liga um modo de edição em que cada parte da folha tem um seletor de fonte e os botões [−] e [+] (de 0,5 em 0,5 pt, entre 6 e 28 pt, com "padrão"). A mudança aparece na hora na prévia, vale na impressão/PDF e fica salva neste PC. No "Padrão Poppins" (o inicial), os **títulos dos procedimentos** ficam na fonte original (desde a 1.3.9) e o resto em Poppins. "Padrão Poppins" e "Padrão original" (exatamente a 1.3.6) substituem todos os ajustes, depois de perguntar "Substituir os ajustes atuais?".
> - **Itens da proposta** (desde a 1.3.7): quantidade, valor unitário, desconto do item (R$ ou %) e acréscimo editados na janela vão para a linha correspondente do Feegow, e a proposta é salva 1,5 s depois da última tecla (ou logo ao sair do campo), com conferência do total. A janela mostra "Sincronizando...", depois "✔ Salvo no Feegow" ou o erro (por exemplo, linha real não encontrada). A "Seleção Rápida" do Feegow não é clicada. Remover uma linha na janela não remove o item no Feegow.

---

## Sumário

1. [Instalação](#1-instalação)
2. [Atualização](#2-atualização)
3. [Como usar, passo a passo](#3-como-usar-passo-a-passo)
4. [O editor em detalhe](#4-o-editor-em-detalhe)
5. [Configurações das propostas](#5-configurações-das-propostas)
6. [Como o script encontra a descrição de cada procedimento](#6-como-o-script-encontra-a-descrição-de-cada-procedimento)
7. [Procedimentos cobertos](#7-procedimentos-cobertos)
8. [Limitações conhecidas](#8-limitações-conhecidas)
9. [Solução de problemas](#9-solução-de-problemas)
10. [Histórico de versões](#10-histórico-de-versões)
11. [Para desenvolvedores](#11-para-desenvolvedores)

---

## 1. Instalação

Você precisa do Google Chrome ou do Microsoft Edge com a extensão **Tampermonkey** instalada.

1. Instale o Tampermonkey pela loja de extensões do navegador, se ainda não tiver.
2. Clique no link de instalação:
   **https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-derma-propostas.user.js**
3. O Tampermonkey abre uma página com o código e o botão **Instalar**. Clique em **Instalar**.
4. Abra (ou recarregue com F5) o prontuário de um paciente no Feegow.

O script vale para os endereços `*.feegow.com` e `*.feegow.com.br` e não pede nenhuma permissão além do armazenamento do próprio Tampermonkey (`GM_getValue`/`GM_setValue`) e do item de menu (`GM_registerMenuCommand`).

### Instalado sozinho ou pela Suite?

Há dois jeitos de ter o script. Basta um deles:

| Jeito | Como funciona |
|---|---|
| **Sozinho** (recomendado) | Instalado pelo link acima. O Tampermonkey cuida das atualizações e o menu **"Configurações das propostas"** aparece no ícone do Tampermonkey. |
| **Pela Feegow Enhanced Suite** | Quem já usa `core.user.js` e `VERIFICAR-DR-EXAMES.user.js` recebe o módulo automaticamente: o VERIFICAR baixa o script do GitHub e guarda uma cópia por até 60 minutos. Para ligar ou desligar, use a engrenagem da Suite, opção **"Imprimir HOC Derma (Propostas)"**. Nesse modo, o menu do Tampermonkey pode não aparecer. Nesse caso, abra as configurações pelo botão **⚙ Configurações** dentro do editor. |

Se os dois estiverem ativos, o botão continua aparecendo uma vez só. Só que as configurações ficam gravadas separadamente em cada instalação, então prefira manter um só.

---

## 2. Atualização

Quando há versão nova no GitHub, o Tampermonkey atualiza sozinho, normalmente uma vez por dia. Para atualizar na hora:

- clique no ícone do Tampermonkey → **Utilitários** → **Verificar atualizações de scripts**, ou
- abra o **Painel** do Tampermonkey, clique no script e use **Verificar atualizações**.

Depois, recarregue o Feegow com F5. A versão instalada aparece no Painel do Tampermonkey, na coluna de versão.

Para checar a versão publicada, abra o arquivo [`hoc-derma-propostas.meta.js`](https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-derma-propostas.meta.js) e veja a linha `@version`.

---

## 3. Como usar, passo a passo

1. No Feegow, abra o **prontuário do paciente** → aba **Propostas** e abra (ou crie) a proposta.
2. Ao lado do botão de impressão padrão do Feegow aparece o botão vermelho **"Imprimir HOC Derma"**.
3. Clique nele. O script clica no **SALVAR** do Feegow (a proposta fica gravada como está na tela) e abre na hora o **editor**, sem esperar o salvamento terminar: à esquerda ficam os campos e à direita a **prévia** em folhas A4, que se atualiza enquanto você edita.
4. Confira o paciente, a data, o profissional e os itens, e ajuste o que precisar (veja a [seção 4](#4-o-editor-em-detalhe)).
5. Em **Descrições dos procedimentos**, confira os blocos encontrados. Desmarque o que não deve sair e escolha de onde vem o **Investimento** de cada um.
6. Clique em **Imprimir** (ou tecle **Ctrl+Enter**).
7. Abre a janela de impressão do navegador:
   - para **papel**, escolha a impressora;
   - para **PDF**, em "Destino" escolha **Salvar como PDF**. Use papel A4 e margens "Padrão" ou "Nenhuma". Se a opção **"Cabeçalhos e rodapés"** do navegador estiver marcada, desmarque, para não sair a data e o endereço do site na folha.
8. Pronto. Para fechar o editor sem imprimir, use **Cancelar**, o **×** ou **Esc**.

> **Dica:** se você adicionou um item na proposta, não precisa recarregar a página. O item novo já entra na impressão (desde a 1.3.2). Mas os valores precisam estar digitados no Feegow, ou ajustados no editor.

---

## 4. O editor em detalhe

### Dados da folha
- **Paciente**, com o **Formato do nome**: "NOME SOBRENOME" converte "SOBRENOME, NOME" do Feegow, e "Como no Feegow" mantém o texto original.
- **Data**, **Profissional** e **Título da folha** (padrão: "PROPOSTA DE TRATAMENTO").
- **Nome no final da folha (quem fez a proposta)**: vazio = automático. O automático é o "Criado por" da proposta no Feegow; se não houver, o profissional. **Cargo / registro** é opcional.

### Itens e valores
- Tabela com descrição, quantidade, valor unitário, desconto (R$ ou %), acréscimo e total da linha, já preenchida com os **valores do Feegow**. Dá para editar, adicionar linha (**+ Adicionar linha**) e remover.
- **Outras despesas**, **Desconto total %**, subtotal e **Total**. O editor avisa quando o total calculado é diferente do total do Feegow.
- **Formas de pagamento** e **Texto complementar**, que vêm do Feegow e são editáveis. O texto complementar passa por uma limpeza: scripts, imagens e formulários são removidos.

### Descrições dos procedimentos
Para cada procedimento reconhecido aparece um cartão com:
- a caixinha **incluir/excluir** o bloco da folha;
- **"Na proposta: ..."**, que mostra quais itens da proposta ativaram aquela descrição;
- **Investimento**, em que você escolhe de onde vem o valor impresso no fim do bloco:

  | Opção | O que sai |
  |---|---|
  | **Automático** (padrão) | O valor atual do item na proposta do Feegow. Se o item estiver sem valor, sai o valor do modelo de texto. Se o modelo também não tiver valor, não sai nada. |
  | **Feegow** | Sempre o valor da proposta. Com quantidade maior que 1, mostra também "(qtd × unitário)". |
  | **Modelo** | O valor escrito no modelo de texto (ex.: "R$ 1.300,00 cada", "de R$ 15.000,00 por R$ 12.000,00"). |
  | **Manual** | O que você digitar no campo ao lado ("1500" vira "R$ 1.500,00"). Pode ser texto livre. |
  | **Não imprimir** | O bloco sai sem a linha de investimento. |

  A escolha fica **lembrada por procedimento** neste PC. Quando o valor do Feegow e o do modelo são diferentes, aparece um aviso discreto no cartão.
- **Editar texto (só nesta impressão)**, para ajustar o título e o texto do bloco, com **Restaurar texto do catálogo**.
- Itens da proposta **sem descrição cadastrada** aparecem listados abaixo dos cartões. Na folha, eles saem em "Outros itens", com o valor, para o total bater.

### Opções
| Opção | Padrão | Efeito |
|---|---|---|
| Mostrar validade + Validade (dias) | ligada, 30 dias | Mostra "Válida até dd/mm/aaaa" nos dados e o selo "Proposta válida por X dias". Quando está ligada, some a frase "PROPOSTA VÁLIDA POR X DIAS." que vem do Feegow, para não repetir. |
| Ocultar tabela de itens | ligada (sem tabela) | Sem a tabela, a folha mostra as descrições com o investimento de cada uma, os "Outros itens" e o total. |
| Mostrar total | ligada | Mostra a caixa de TOTAL no fim. |
| "Investimento" em cada descrição | ligada | Mostra a linha de investimento no fim de cada bloco e o valor em "Outros itens". |
| Coluna de desconto / Coluna de acréscimo | desligadas | Só valem com a tabela visível. Com a coluna oculta, o valor é embutido no unitário. |
| Linha de assinatura | ligada | Mostra a linha de assinatura do paciente e o nome de quem fez a proposta. Desligada, sai "Proposta elaborada por ...". |
| Incluir descrições dos procedimentos | ligada | Liga ou desliga todos os blocos de descrição. |

As opções acima ficam **lembradas neste PC** para as próximas impressões.

### Ordem da folha
Dados do paciente → **Sobre os procedimentos** (todas as descrições) → **Outros itens** → tabela de itens (se visível) → outras despesas → **TOTAL** → pagamento, texto complementar, validade e assinatura.

A folha é repartida em páginas A4, cada uma com o cabeçalho e o rodapé do timbrado e "Página X de Y". Blocos, linhas da tabela e o total não são cortados no meio. A prévia mostra exatamente as mesmas folhas que serão impressas.

---

## 4.1 Gerenciar descrições (desde a 1.4.0)

O botão **Gerenciar descrições** fica ao lado de "Imprimir HOC Derma" na proposta (e no menu do Tampermonkey: "Gerenciar descrições dos procedimentos").

- **Lista e busca**: todos os procedimentos, padrão e personalizados, com a origem de cada um (padrão, alterado, personalizado, excluído). A busca olha título, palavras e texto.
- **＋ Adicionar / Editar**: título, **palavras para reconhecer** (uma frase por linha; o procedimento do Feegow é reconhecido quando o nome tem todas as palavras de alguma linha, sem acento nem maiúsculas), descrição, investimento (opcional) e "vem marcado na janela de impressão".
- **Excluir**: item personalizado é apagado; item padrão só deixa de ser usado neste PC. **Restaurar o padrão** volta o item ao texto original do script (também traz de volta um item padrão excluído).
- **Procedimentos do Feegow sem descrição**: "Buscar nesta página do Feegow" lê a lista de procedimentos da própria tela (campo Procedimento, só leitura) e mostra os que nenhuma descrição reconhece; **Criar descrição** abre o formulário já com o nome. A busca do Feegow devolve só os primeiros resultados de cada termo, então a lista pode vir incompleta: para a lista completa, **cole** a lista (um procedimento por linha; no Excel, copie a coluna do nome) ou **importe um arquivo CSV/TXT** (planilha .xlsx: copie a coluna e cole).
- **Fazer backup**: baixa `hoc-derma-descricoes-AAAA-MM-DD-HHMM.json` (com a versão do formato e do script). **Restaurar backup**: valida o arquivo (recusa arquivo que não é do HOC Derma ou com defeito, sem mudar nada), mostra a prévia (novos, alterados, removidos) e aplica com **Juntar com o atual** ou **Substituir tudo**. Antes de aplicar, o estado atual fica guardado automaticamente; **Desfazer a última restauração** volta a ele.
- **Enviar para a lista padrão**: gera o JSON e o trecho já no formato do catálogo (`DESCRICOES_PROCEDIMENTOS`) com o que foi personalizado neste PC. **Não envia nada sozinho**: baixe e entregue ao coordenador, que cola o trecho no script oficial.

**Buscar procedimento no Feegow** (botão na tela): digite o nome e a lista aparece enquanto você digita (até 20 por busca), com "tem descrição / sem descrição", **Criar descrição** ou **Editar descrição**. Com a proposta de um paciente aberta, também aparece **Inserir na proposta** (e caixas de seleção para inserir vários); o script usa o mesmo mecanismo do campo Procedimento do Feegow e **não salva**: confira e clique em SALVAR.

**Investimento** (valor que sai em cada descrição), em ordem de prioridade: 1) o valor do item na proposta; 2) o investimento da descrição no script (fixo ou "a partir de R$ X"); 3) o valor atual do procedimento no Feegow, lido na hora (só quando as anteriores não têm valor); 4) a tabela de valores embutida no script, se a leitura falhar. Valor 0 = sem valor: não imprime "R$ 0,00".

**Onde fica gravado**: `GM_setValue` (Tampermonkey) e `localStorage` do navegador, chave `hoc_propostas_descricoes` (as personalizações) e `hoc_propostas_descricoes_ultimo_backup` (último backup automático). Valem por cima do catálogo do script, por `id`; ao atualizar o script, as personalizações continuam e os itens padrão novos entram normalmente. É por PC/navegador: use o backup para levar para outro computador.

## 5. Configurações das propostas

Há dois jeitos de abrir:
- pelo **ícone do Tampermonkey** → **"Configurações das propostas"**, em qualquer tela do Feegow;
- pelo botão **⚙ Configurações** no rodapé do editor.

| Campo | O que faz |
|---|---|
| **Nome que aparece no final da folha** | Fixa um nome, por exemplo o da consultora. Vazio = automático ("Criado por" da proposta no Feegow; sem ele, o profissional). |
| **Cargo / registro (opcional)** | Aparece embaixo do nome (ex.: "Consultora de estética"). |
| **Mostrar tabela de itens** | Padrão: desligado. |
| **Mostrar total** | Padrão: ligado. |
| **"Investimento" em cada descrição** | Padrão: ligado. |
| **Descrições dos procedimentos** | Padrão: ligado. |
| **Mostrar validade** | Padrão: ligado. |
| **Linha de assinatura** | Padrão: ligado. |

- Tudo fica gravado **no Tampermonkey daquele PC e daquele navegador**. Cada computador tem a própria configuração, e nada vai para o Feegow nem para o GitHub.
- **Restaurar padrão** apaga o nome, o cargo, as opções e também as escolhas de Investimento feitas em cada procedimento.
- A quantidade de dias da validade e as colunas de desconto e acréscimo são definidas no próprio editor e também ficam lembradas.

---

## 6. Como o script encontra a descrição de cada procedimento

Cada item da proposta é comparado com o **catálogo de descrições**, a constante `DESCRICOES_PROCEDIMENTOS` no início do script. A comparação segue estes passos:

1. **Por código (prioridade máxima).** Se a entrada do catálogo tiver `codigos` e o item tiver aquele ID do Feegow, ou um código no nome, ela vence. Hoje nenhuma entrada usa código, então vale o passo 2.
2. **Normalização do nome.** O nome do item é preparado assim, só para comparar (o texto impresso não muda):
   - acentos, maiúsculas e pontuação são ignorados;
   - "01SS", "3 SS" e "sessão" viram "1 sessoes", "3 sessoes" e "sessoes", e zeros à esquerda caem ("03" = "3");
   - palavras de ligação são ignoradas (de, da, do, e, com, para, a, o, em, no, na, por...);
   - os **apelidos** são aplicados (constante `APELIDOS`), por exemplo: `botox` e `toxina botulinica` → `toxina`; `sup` → `superior`; `inf` → `inferior`; `bacio` → `baccio`; `luz intensa pulsada` → `lip`; `blefaroplastia` → `blefaro`; `prophilo`/`profilo` → `profhilo`; `skinbooster` → `skin booster`; `tranexamico` → `tranex`; `eletrocoagulacao` → `ecg`; `ultraformer` → `liftera`; `ah` → `acido hialuronico`.
3. **Palavras-chave.** Uma palavra-chave casa quando **todas** as palavras dela aparecem no nome, **em qualquer ordem**. Plural simples é aceito, e palavras com 6 letras ou mais aceitam **uma letra errada** (nunca em números). `peeling*` casa com qualquer palavra que comece com "peeling". A lista `excluir` impede o casamento.
4. **O mais específico vence.** Se duas entradas da mesma família casam (as frases têm palavra em comum), fica a da frase mais longa. Exemplo: em "LASER MANCHAS 03SS", vence "laser manchas 3 sessoes" e não "laser manchas".
5. **Itens combinados.** Num item como "TOXINA + PREENCHIMENTO", as frases não têm palavra em comum, então **saem os dois blocos**.
6. **Sem repetição.** Cada descrição sai uma vez só, mesmo que dois itens a ativem. O valor de cada item aparece em um bloco só, para a soma bater com o total.

**Exemplos:**

| Nome do item no Feegow | Descrição usada |
|---|---|
| TOXINA BOTULÍNICA - TERÇO SUPERIOR | TOXINA BOTULÍNICA \| TERÇO SUPERIOR |
| BOTOX SUP INF E MASSETER | TOXINA BOTULÍNICA \| TERÇO SUPERIOR, INFERIOR E MASSETER |
| BACIO LIP | BACIO LIP \| REVITALIZAÇÃO LABIAL |
| PREENCHIMENTO LABIAL | ÁCIDO HIALURÔNICO |
| LIFTERA TERÇO MÉDIO E PAPADA 03SS | LIFTERA \| TERÇO MÉDIO E PAPADA \| 03 SESSÕES |
| PEELING QUÍMICO | PEELING SUPERFICIAL (vem desmarcado) |
| CONSULTA DERMATOLÓGICA | nenhuma: sai em "Outros itens" |

---

## 7. Procedimentos cobertos

O catálogo tem **61 procedimentos**, todos com descrição, vindos dos modelos "Textos e Atestados" do Feegow e filtrados para a HOC Derma.

- **Todos são procedimentos normais** (desde a 1.3.5 não há mais o selo "a revisar"; as cirurgias palpebrais, o lifting de supercílios e o peeling superficial foram confirmados como HOC Derma). O texto do peeling superficial é de cuidados pós-peeling, e por isso o bloco **vem desmarcado**.
- **13 com texto repetido**: variações do mesmo produto têm a mesma descrição (Radiesse e Sculptra com 1 ou 2 frascos; laser para manchas com 1 ou 3 sessões; laser para qualidade da pele com 1 ou 3; MMP capilar com 1 ou 3; preenchimento com 1, 2 ou 3+).
- **30 sem valor padrão no modelo**. Nesses, o Investimento automático usa só o valor da proposta. Se a proposta estiver sem valor, o bloco sai sem investimento.

| Grupo | Procedimentos |
|---|---|
| **Toxina botulínica** (5) | Terço superior · Terço superior, inferior e masseter · Hiperidrose axilar · Pescoço · Rosto e pescoço |
| **Preenchedores e bioestimuladores** (14) | Bacio Lip · Radiesse (1 e 2 frascos) · Sculptra (1 e 2 frascos) · Empters · Glúteo Up HD · Hialuronidase · Ácido hialurônico / preenchimento (1, 2 e 3+) · Profhilo · Skinbooster · Skinvive |
| **Laser e luz** (8) | Laser para manchas (1 e 3 sessões) · Laser para qualidade da pele (1 e 3 sessões) · Laser Érbium área dos olhos · Luz intensa pulsada (vermelhidão; 3 sessões) · Fotobiomodulação pós-laser (cortesia) |
| **Liftera** (6) | Rosto · Pescoço · Rosto e pescoço · Área dos olhos · Terço médio e papada (3 sessões) · Preparo para blefaroplastia |
| **MMP / NCTF / Drug delivery / Microagulhamento** (9) | Drug delivery · Microagulhamento (3 sessões) · MMP capilar (1 e 3 sessões) · MMP facial (cicatrizes de acne) · MMP sobrancelhas · NCTF · NCTF capilar · Ácido tranexâmico + NCTF |
| **Peelings e limpeza** (4) | Limpeza de pele · Peeling retinoico + Jessner (3 sessões) · Peeling superficial · PRX |
| **Pequenas cirurgias** (5) | Eletrocoagulação (ECG) até 5 lesões · Exérese de lesão (baixa e média complexidade) · Exérese de cisto · Exérese de lipoma |
| **Fios e lifting** (3) | Fios Aptos rosto · Fios Aptos Hammock pescoço · Lifting cirúrgico do terço médio e pescoço |
| **Pálpebras / cirurgias** (7) | Blefaroplastia inferior, superior, e superior e inferior · Fotobiomodulação pós-blefaroplastia · Laser de CO2 · Lifting de supercílios · Correção de ptose |

A lista completa, com as palavras-chave, o valor do modelo e a situação de cada entrada, fica no arquivo de manutenção `LISTA_PROCEDIMENTOS_DERMATOLOGICOS.txt` (na pasta de trabalho do mantenedor, fora do repositório). A fonte oficial é sempre a constante `DESCRICOES_PROCEDIMENTOS` dentro do script.

---

## 8. Limitações conhecidas

- **"TOXINA BOTULÍNICA - TERÇO SUPERIOR + INFERIOR FEMININO/MASCULINO"** casa só com **"TOXINA BOTULÍNICA | TERÇO SUPERIOR"**, cujo texto fala da testa, da glabela e dos olhos e não menciona o terço inferior. O modelo "superior, inferior e masseter" exige a palavra "masseter". Por enquanto, ajuste o texto em **Editar texto** se precisar.
- **"TERÇO INFERIOR" sozinho não tem modelo.** "TOXINA BOTULÍNICA - TERÇO INFERIOR" não casa com nada e sai em "Outros itens".
- **Nomes muito genéricos** (ex.: "TOXINA BOTULÍNICA" sozinho, sem a região) não casam com nada, porque as palavras-chave pedem a região, o produto ou o número de sessões.
- **Títulos repetidos.** Se a mesma proposta tiver Radiesse com 1 e com 2 frascos, saem dois blocos com o mesmo título e o mesmo texto. Isso também vale para Sculptra e Ácido hialurônico. Desmarque um deles.
- **Os textos e valores do catálogo são fixos no script.** Alterar um modelo em "Textos e Atestados" no Feegow **não** muda o script. É preciso atualizar o catálogo e publicar uma versão nova (veja a [seção 11](#11-para-desenvolvedores)).
- As edições feitas no editor **não são salvas**: fechar o editor descarta tudo, exceto as opções e as escolhas de Investimento, que ficam lembradas.
- Os dados da empresa (razão social e CNPJ) **não** saem na folha (`mostrarCnpjNaFolha: false`).

---

## 9. Solução de problemas

| Problema | O que fazer |
|---|---|
| **O botão "Imprimir HOC Derma" não aparece** | 1) Confira no Tampermonkey se o script está **ativado**. 2) Recarregue o Feegow (F5). 3) O botão só aparece na **proposta do prontuário** (aba Propostas, com o formulário da proposta aberto). 4) Se você usa pela Suite, confira na engrenagem se **"Imprimir HOC Derma (Propostas)"** está ligado. |
| **O menu "Configurações das propostas" não aparece** | Ele só existe quando o script está instalado sozinho. Pela Suite, use o botão **⚙ Configurações** dentro do editor. |
| **Um procedimento ficou sem descrição** | O nome do item não casou com o catálogo (veja a [seção 6](#6-como-o-script-encontra-a-descrição-de-cada-procedimento)). Ele aparece em "Sem descrição cadastrada" no editor e sai em "Outros itens". Peça ao mantenedor para incluir a palavra-chave ou o apelido. |
| **Saiu a descrição errada** | Desmarque o bloco no editor ou ajuste o texto em **Editar texto**. Avise o mantenedor, informando o nome exato do item no Feegow. |
| **O investimento saiu errado ou vazio** | Confira o valor do item na proposta do Feegow. No cartão do procedimento, troque a fonte do **Investimento** (Feegow / Modelo / Manual). |
| **O total do editor é diferente do Feegow** | O editor mostra o aviso. Normalmente é desconto, acréscimo ou outra despesa editada no editor. Confira a tabela de itens. |
| **No PDF saíram a data e a URL no canto da folha** | Na janela de impressão, em "Mais configurações", desmarque **Cabeçalhos e rodapés**. |
| **O cabeçalho ou o rodapé saiu cortado ou fora do lugar** | Use papel **A4**, escala **100%** (ou "Padrão") e margens "Padrão" ou "Nenhuma". |
| **Quero voltar tudo ao padrão** | **Configurações das propostas** → **Restaurar padrão**. |
| **Item recém-adicionado não aparece** | Desde a 1.3.2 ele entra sem recarregar. Confira se a versão é 1.3.2 ou mais nova (seção 2) e se o item tem descrição e valor no Feegow. |

Para diagnóstico técnico, as mensagens no console do navegador (F12) usam o prefixo `[Propostas HOC Derma]`. Em produção, só aparecem avisos de falha (`console.warn`). As mensagens detalhadas aparecem com `window.__HOCDERMA_PROPOSTAS_OPCOES__.debug = true`, ou com `CONFIG.debug = true` numa cópia local do script.

---

## 10. Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| **1.4.8** | 26/11/2026 | **Valor atual do Feegow** lido na hora (campo Valor da página do procedimento; cache por sessão) quando o item está sem valor e o script também; ordem: proposta > investimento do script > valor atual > tabela embutida. Gerenciar descrições: **busca no Feegow** (sir.asp, 250 ms) com status tem/sem descrição, Criar/Editar; **Inserir na proposta** (`itens('S','I',id)`, múltipla, sem salvar). |
| **1.4.7** | 26/11/2026 | **Investimento sem vazio**: item da proposta sem valor usa o valor do procedimento no Feegow (tabela `VALORES_FEEGOW`, por ID ou nome exato); valor da proposta tem prioridade; 0 = sem valor (sem "R$ 0,00"); cortesia não ganha valor do catálogo; 46 entradas do catálogo preenchidas ("a partir de" onde há variantes). |
| **1.4.6** | 26/11/2026 | Título "BACCIO LIP \| REVITALIZAÇÃO LABIAL" (dois C), também casa "BACCIO LÁBIOS". Conferência com os nomes renomeados no Feegow: nada se perdeu. |
| **1.4.5** | 26/11/2026 | Falsos positivos: a sigla ECG não reconhece mais eletrocoagulação (só por extenso; fora eletrocardiograma, ergométrico, consulta); linhas de anestesista/auxiliar nunca recebem descrição; blefaroplastia sem tumor/biópsia/Plasma IQ; LIP sem oftalmo/glow; ácido hialurônico sem quadril; exérese de cisto não cai na de lesão baixa. |
| **1.4.4** | 26/11/2026 | "FIOS APTOS \| ROSTO" renomeada para "APTOS ROSTO" (mesmo texto) e reconhece "aptos rosto" (ex.: "LIFTING APTOS \| FIO ROSTO"); não pega "fios lisos". |
| **1.4.3** | 26/11/2026 | 7 descrições novas: crioterapia, curetagem (genérica e de molusco), ectrópio/entrópio, fios lisos (glabela, pálpebras inferiores) e Harmonyca; Harmonyca excluída do preenchimento genérico. |
| **1.4.2** | 26/11/2026 | Exérese de corpo e de rosto (baixa, média e alta complexidade) usam a mesma descrição (a de média complexidade); frases `exerese corpo/rosto/face`. |
| **1.4.1** | 26/11/2026 | "ANATOMOPATOLÓGICO (2 FRASCO)" usa a descrição de "MAIS DE 02 FRASCOS" (2 frascos e mais de 2); 1 frasco continua na própria. |
| **1.4.0** | 26/11/2026 | **Gerenciar descrições**: botão ao lado de "Imprimir HOC Derma" (e menu do Tampermonkey) com lista e busca de todos os procedimentos, adicionar, editar, excluir e "Restaurar o padrão" por item; personalizações gravadas no PC (`GM_setValue`, ou `localStorage`) e mescladas por id sobre o catálogo padrão; "Procedimentos do Feegow sem descrição" (lê o select2 `#ProcedimentoID`, só leitura, ou lista colada/CSV/TXT); backup JSON datado, restauração com prévia e "Juntar"/"Substituir tudo" (com backup automático antes); "Enviar para a lista padrão" (JSON + trecho do catálogo, sem envio). |
| **1.3.12** | 26/11/2026 | 16 descrições novas no catálogo (dacriocistorrinostomia, calázio, cisto de Moll, infiltração intralesional, ressecção de tumores palpebrais, peeling retinóico + Jessner 1 sessão, anatomopatológico 1 frasco / mais de 2 frascos, bioimpedância, biópsia por punch, blefaroplastia + ptose (2 combinações), cantopexia, cantoplastia tarsal strip, cauterização química, clipping ungueal); título/texto da ptose atualizados. A combinação mais específica vence. |
| **1.3.11** | 26/11/2026 | "LIFTING DE SUPERCÍLIO - BROW LIFT - CASTANHARES" (e "CASTANHARES (LIFT DE SUPERCÍLIO)") usa a descrição de `lifting-de-supercilio`: palavras-chave novas `brow lift` e `castanhares supercilio`. |
| **1.3.9** | 24/11/2026 | "Padrão Poppins" (e padrão inicial): **títulos dos procedimentos na fonte original** da 1.3.6 (Palatino 13,5 pt, peso e altura de linha originais); o resto continua em Poppins. Quem já tinha ajustes salvos só muda se o título estava no padrão Poppins (escolha manual de fonte ou tamanho do título é mantida). "Padrão original" e o seletor por parte não mudam. |
| **1.3.8** | 24/11/2026 | Aviso do topo da janela curto ("Itens, valores e descontos são salvos no Feegow · Descrições e textos valem só para a impressão") numa faixa fina própria, em uma linha (texto completo na dica). A barra superior volta à altura da 1.3.6. |
| **1.3.7** | 24/11/2026 | **Edições dos itens vão para o Feegow**: quantidade, valor unitário, desconto (R$/%) e acréscimo de itens vinculados a uma linha real são gravados na linha (`Quantidade`/`ValorUnitario`/`Desconto`/`DescontoTipo`/`Acrescimo` + `recalc`) junto com o desconto total, e a proposta é salva (debounce de 1,5 s ou ao sair do campo), com conferência do total e erro claro se a linha real não existir. Remover na janela não remove no Feegow. "Seleção Rápida" não é clicada. **Fontes**: Poppins passa a ser a fonte da janela e da folha (Google Fonts oficial, SIL OFL, subconjunto latino em woff2 embutido; licenças em `assets/fontes/`). **"Aa Tamanho das fontes"**: por parte da folha (título/dados, títulos dos procedimentos, descrições, investimento, tabela, totais, pagamento/textos, assinatura, rodapé legal), seletor de fonte (Poppins, Montserrat, Open Sans, Roboto, Lato, Arial, Times New Roman, Original) e [−] N pt [+] (passo 0,5; 6 a 28 pt; "padrão"), na hora na prévia e na impressão/PDF, salvo na hora neste PC. Botões **"Padrão Poppins"** e **"Padrão original"** (= 1.3.6, CSS intacto), com confirmação. A prévia e a impressão esperam as fontes carregarem antes de paginar. |
| **1.3.6** | 24/11/2026 | **"＋ Feegow" na linha nova**: inclui o procedimento na proposta real (`itens('S','I', ID)`, ID pelo nome exato nos itens da proposta ou na busca AJAX do select2 `#ProcedimentoID`; lista quando é ambíguo; nunca "criar novo"), preenche qtd/valores com `recalc()` e clica em SALVAR. Sem "Seleção Rápida". Mensagens de andamento e de erro (sem paciente, não encontrado, tempo esgotado de 10 s); não duplica. **Desconto total** da janela (agora em % ou R$) gravado no `#DescontoTotal` do Feegow (R$ → %), com conferência do total e SALVAR; apagar zera. |
| **1.3.5** | 24/11/2026 | **"Imprimir HOC Derma" salva a proposta antes**: clica no SALVAR do Feegow (`propostaSave(false)`; reserva: botão com texto SALVAR e ícone de disquete) e abre o editor na hora, sem esperar o salvamento. Sem o botão SALVAR na tela, abre o editor como antes. Os **8 procedimentos "a revisar"** (blefaroplastias, fotobiomodulação pós-blefaro, laser de CO2, lifting de supercílios, peeling superficial, ptose) viraram normais, sem selo; textos e valores iguais. |
| 1.3.4 | 21/11/2026 | **Versão de produção.** Logs de depuração desligados por padrão (só avisos de falha). A API `window.HOCDERMA_PROPOSTAS` tinha a chave `config` duplicada; agora o `CONFIG` fica em `constantes`. Descrição do userscript mais clara e changelog em ordem. Nenhuma mudança no editor nem na folha. |
| 1.3.3 | 21/11/2026 | A prévia do editor fica **sem barra de rolagem interna** em qualquer zoom e tamanho de janela, com a escala recalculada ao mudar o zoom. A impressão não mudou. |
| 1.3.2 | 21/11/2026 | **Item adicionado na proposta sem recarregar a página entra na impressão**, com descrição, valores e casamento com o catálogo. Item novo com unitário "0,00" e total preenchido: o unitário é calculado a partir do total. |
| 1.3.1 | 21/11/2026 | Com "Mostrar validade" ligado, some a frase "PROPOSTA VÁLIDA POR X DIAS." do Feegow, que ficava repetida. |
| 1.3.0 | 21/11/2026 | **Padrão sem tabela** (descrições + total). **Nome de quem fez a proposta** no fim da folha. Tela **"Configurações das propostas"** (menu do Tampermonkey e botão no editor) com "Restaurar padrão". |
| 1.2.2 | 21/11/2026 | Ordem fixa na folha (descrições → outros itens → tabela → total). O total nunca começa uma folha sozinho. |
| 1.2.1 | 21/11/2026 | **Paginação A4 real**, com timbrado em cada folha, "Página X de Y" e sem cortar blocos. A prévia mostra as folhas. |
| 1.2.0 | 21/11/2026 | **Catálogo real com 61 descrições** dos modelos do Feegow. Busca tolerante (acentos, sessões, apelidos, erro de 1 letra). **Investimento por descrição** (Automático/Feegow/Modelo/Manual/Não imprimir). |
| 1.1.x | 20/11/2026 | Opções "Ocultar tabela" e "Mostrar total". Descrições por procedimento. Opções do editor lembradas. |
| 1.0.x | 20/11/2026 | Primeira versão: botão "Imprimir HOC Derma", editor de valores e folha com o timbrado HOC Derma. |

As versões 1.1.x e 1.2.x foram testadas localmente e publicadas juntas na 1.3.0.

---

## 11. Para desenvolvedores

### Arquivos no repositório
| Arquivo | Papel |
|---|---|
| `hoc-derma-propostas.user.js` | O script completo (~540 KB): cabeçalho `==UserScript==` + timbrado embutido (`window.HOCDERMA_TIMBRADO`, PNGs em base64, ~390 KB) + o módulo. É o arquivo que o Tampermonkey instala e que a Suite baixa em cascata. |
| `hoc-derma-propostas.meta.js` | Só o bloco `==UserScript==`. É o `@updateURL`: o Tampermonkey baixa esse arquivo pequeno para saber se há versão nova. **Precisa ter o mesmo `@version` do `.user.js`.** |
| `docs/hoc-derma-propostas.md` | Este documento. |

O script inteiro fica dentro de `if (!window.HOCDERMA_PROPOSTAS) { ... }`, para não rodar duas vezes quando também é carregado pela Suite (`VERIFICAR-DR-EXAMES.user.js` → `eval`, cache de 60 min em `hoc_propostas_codigo`).

### Estrutura do módulo (seções numeradas no código)
- **Cabeçalho**: o que faz, opções externas e changelog.
- **★ Catálogo** `DESCRICOES_PROCEDIMENTOS`: campos `id`, `titulo` ("PROCEDIMENTO | DETALHE", com "CORTESIA" virando selo), `palavrasChave`, `excluir`, `codigos`, `texto` (linha em branco = parágrafo, `- ` = lista, `**negrito**`, `## ` = subtítulo, `---` = separador), `investimento`, `revisar`, `incluirPadrao`, `modeloFeegow`, `exemplo`.
- **★ Apelidos** `APELIDOS`: pares `[como pode vir escrito, como fica]`.
- **0. Configuração**: `VERSAO`, `CONFIG` (timbrado, empresa, textos, cores, `debug`).
- **1. Seletores** `SEL`: os seletores do DOM real do Feegow (`form#frmProposta`, `#btnsProposta`, `#order-tbody` etc.). `#Internas` é proibido.
- **2. Utilitários**, **2.1 Preferências** (`hoc_propostas_prefs`), **2.1.1 Configurações do PC** (`hoc_propostas_config`), **2.2 Detecção** (`normalizarBusca`, `entradasDoItem`, `detectarDescricoes`), **2.3 Investimento** (`hoc_propostas_invest`, `distribuirItens`, `investimentoDoBloco`).
- **3. Sanitização** do texto complementar (lista branca de tags, documento inerte).
- **4. Leitura da proposta** (`lerProposta`, cálculos `calcLinha`/`calcular`) e **5. Botão** "Imprimir HOC Derma" em `#btnsProposta`.
- **6. Editor** (modal em Shadow DOM, CSS isolado do Feegow) e **6.1 Configurações**.
- **7. Folha** (`montarHtmlImpressao`) e **7.1 Paginação** (`paginar`, repartição em A4).
- **8. Impressão**: iframe oculto + `print()`.
- **9. Boot**: `MutationObserver` com debounce (o Feegow troca o formulário por AJAX) e o menu do Tampermonkey.
- **API** `window.HOCDERMA_PROPOSTAS`: `versao`, `constantes`, `seletores`, `varrer`, `lerProposta`, `abrirEditor`, `calcular`, `catalogo`, `detectarDescricoes`, `normalizarBusca`, `investimentoDoBloco`, `paginar`, `imprimir`, `desligar`, `prefs`, `invest`, `config` (configurações do PC), `estado()` etc.

Armazenamento: só o `GM_getValue`/`GM_setValue` do próprio script. O script nunca lê cookies, `localStorage` nem a sessão do Feegow. Sem GM disponível, as opções ficam na memória até recarregar a página.

Opções externas (testes): `window.__HOCDERMA_PROPOSTAS_OPCOES__ = { somentePaciente, modoTeste, debug }` e `window.__HOCDERMA_PROPOSTAS_HOOKS__ = { dispararPrint }`. Na versão publicada, elas vêm vazias, sem trava de paciente e sem modo teste.

### Fluxo de manutenção (pasta de trabalho, fora do repo)
A fonte é o **módulo** `real/hoc-derma-propostas.js`, sem cabeçalho nem timbrado. Nunca edite o `.user.js` do repo à mão, exceto o cabeçalho (as linhas 1 a 36).

1. Edite `real/hoc-derma-propostas.js`. Para incluir um procedimento, acrescente uma entrada em `DESCRICOES_PROCEDIMENTOS`. Para uma grafia nova, acrescente um par em `APELIDOS`.
2. Suba `const VERSAO = 'x.y.z'` e escreva a nota no changelog do cabeçalho do módulo e na [seção 10](#10-histórico-de-versões).
3. Rode `python montar_userscripts.py`. Ele gera:
   - `repo/hoc-derma-propostas.user.js` = cabeçalho atual do repo (linhas 1 a 36, com `@version` trocado) + módulo + `}`;
   - `repo/hoc-derma-propostas.meta.js` com o `@version` novo;
   - `real/TESTE-hoc-derma-propostas.user.js`, a versão de teste com trava de paciente e faixa "MODO TESTE", que **não** vai para o repo.
4. **Autoteste offline**: a prévia `real/previa_vXYZ.html` simula a tela de proposta do Feegow (DOM real copiado, sem dados reais) e, com `?teste=1`, roda a bateria completa: módulo, TESTE e cópia do repo. Copie a prévia mais recente, ajuste as checagens de versão e rode **um Chrome headless por vez**:
   ```powershell
   Start-Process chrome.exe -ArgumentList '--headless=new','--disable-gpu','--window-size=1366,768','--virtual-time-budget=120000','--dump-dom','file:///C:/APACBOT/FEEGOW_ENHANCED_SUITE/real/previa_v135.html?teste=1' -RedirectStandardOutput saida.txt -Wait
   ```
   Procure `AUTOTESTE vX.Y.Z N/N OK` em `saida.txt`; nenhuma linha pode começar com `FALHA`. O `--virtual-time-budget` é necessário porque, sem ele, o `--dump-dom` grava a página antes de os testes assíncronos terminarem. O `--window-size` evita uma falha falsa de paginação na janela padrão do headless, que é pequena. Resultado da 1.3.5: **183/183 OK**. Resultado da 1.3.6 (`previa_v136.html`, com `itens`/`propostaSave`/select2 simulados): **228/228 OK**. Resultado da 1.3.7 (`previa_v137.html`, com sincronização dos itens e o modo de fontes): **272/272 OK**. Resultado da 1.3.8 (`previa_v138.html`): **278/278 OK**. Resultado da 1.3.9 (`previa_v139.html`): **290/290 OK**.
5. **Regras de teste**: teste só offline. Não abra o Feegow real em automação, não leia cookies nem storage, e nunca clique em Salvar, Duplicar ou Gerar contrato no Feegow real (a prévia simula o `propostaSave`).
6. **Publicar**: no repo, `git add hoc-derma-propostas.user.js hoc-derma-propostas.meta.js docs/hoc-derma-propostas.md`, commit, `git pull --rebase origin main` e `git push origin main`. Confira com:
   ```bash
   curl -s https://raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/hoc-derma-propostas.meta.js | grep @version
   ```
   O raw do GitHub pode levar alguns minutos para mostrar a versão nova (cache da CDN).

### Checklist de produção
- [ ] `@version` igual no `.user.js`, no `.meta.js` e em `VERSAO`.
- [ ] `@updateURL` → `.meta.js` e `@downloadURL` → `.user.js`, ambos no raw do `main`.
- [ ] `CONFIG.debug: false`; opções externas vazias (sem `somentePaciente`, sem `modoTeste`).
- [ ] Sem caminhos locais (`C:\`, `file://`), dados de paciente ou segredos no código publicado.
- [ ] Autoteste 100% OK.
- [ ] Changelog (módulo + seção 10) atualizado.
