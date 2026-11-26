# 📜 Histórico de alterações

> Voltar para o [README](../README.md). O histórico completo, commit a commit, está no [log do GitHub](https://github.com/Nicker2/Feegow-Enhanced-Suite/commits/main). O histórico detalhado das Propostas fica em [hoc-derma-propostas.md](hoc-derma-propostas.md#10-histórico-de-versões).

## Versões atuais

| Script | Versão |
| :--- | :---: |
| Core | 1.1.8.0 |
| Suite principal | 4.9.12.0 |
| PDF HOC Derma (Timbrador) | 3.1.0 |
| Propostas HOC Derma | 1.4.3 |
| HOC Gastos para Excel | 1.1.0 |
| HOC Reaplicar Permissões | 1.4.0 |

---

### Core 1.1.8.0, Suite 4.9.12.0 e Reaplicar Permissões 1.4.0 (26/11/2026): listas abrem em Ativo e ♻️ espera a aba carregar

- Nas listas `?P=Funcionarios&Pers=Follow` e `?P=Profissionais&Pers=Follow`, o filtro de status ("Filtrar por status de acesso", dentro do shadow root) abre sempre em **Ativo**. O módulo acha o `<select>`, define `value="active"` e dispara `input` + `change` (bubbles + composed), que é o que o componente escuta (conferido na página real: a lista refaz pela API e cai de 299 para 83 funcionários e de 167 para 50 profissionais). Vale uma vez por carregamento; se a pessoa trocar o filtro, é respeitado. Se o componente for recriado por navegação interna e a pessoa não tiver mexido, aplica de novo. Os botões 🔐/♻️ seguem funcionando com a lista filtrada.
- Engrenagem: **Listas de funcionários/profissionais abrem em Ativo** (ON, migração para ficar ON em todos os PCs). Atributo `data-hoc-cfg-lista-ativo`.
- **♻️ Reaplicar**: corrigido o "Este cadastro não tem regra marcada" que aparecia cedo demais. Agora espera o `#divPermissoes` carregar por completo (`#frmPermissoes` + tabela de regras com `editaRegra(...)`/Aplicar, e nada mudando por 700 ms; limite de 25 s) antes de procurar a regra com ✓. "Sem regra marcada" só aparece se a tabela carregou e não há ✓; se estourar o tempo: "A aba Permissões demorou para carregar; tente de novo" (nada é aplicado). O ♻️ existe só na lista de funcionários (profissional não tem regras predefinidas).
- Core 1.1.8.0 faz a Suite nova ser baixada na hora.

### Core 1.1.7.0 e Suite 4.9.11.0 (26/11/2026): botões de permissão ON em todos os PCs

- Os três botões de permissão (Reaplicar regra atual, 🔐 Permissões e ♻️ Reaplicar nas listas) voltam a ficar ON uma vez em todos os PCs, mesmo onde tinham sido desligados. Depois disso, a escolha feita na engrenagem passa a valer.
- O Core novo faz a Suite ser baixada na hora.

### Core 1.1.6.0, Suite 4.9.10.0 e Reaplicar Permissões 1.3.0 (26/11/2026): botões Permissões e Reaplicar nas listas

- **Abrir aba pelo link (&Aba=Permissoes)** passa a vir **DESLIGADA** por padrão. Migração: a Suite lia `aba_link` com padrão ON; agora o padrão é OFF. Quem nunca mexeu não tem valor guardado e fica OFF; quem ligou ou desligou à mão tem `true`/`false` guardado e é respeitado. No módulo avulso (sem Suite) a opção também vem desligada.
- Nas listas `?P=Funcionarios&Pers=Follow` e `?P=Profissionais&Pers=Follow`, ao lado do nome de cada cadastro **ativo** (qualquer estado de acesso menos Inativo e Desabilitado), botão **🔐 Permissões**: abre em nova aba o cadastro já na aba Permissões. O link usa `&Aba=Permissoes&hocAba=1`; o `hocAba=1` é honrado SEMPRE, mesmo com a opção global desligada.
- Só na lista de funcionários, botão **♻️ Reaplicar** (tom verde): abre a nova aba (`&hocAcao=reaplicar`), espera a aba Permissões carregar e clica no próprio **Aplicar** da regra com o ✓ verde (mesma função `regraAtual()` do botão Reaplicar regra atual). **Sem confirmação** por padrão. O `hocAcao` sai da URL (`history.replaceState`) assim que é lido, então recarregar não reaplica. Sem regra marcada: não aplica e avisa. Depois espera o `#divPermissoes` recarregar e mostra o toast com a contagem de permissões marcadas (antes → depois).
- Engrenagem: **Botão Permissões nas listas de funcionários e profissionais** (ON), **Botão Reaplicar nas listas** (ON) e **Pedir confirmação antes de reaplicar pela lista** (OFF).
- As listas são web components do Feegow com shadow DOM aberto; o módulo observa cada shadow root (paginação, filtro, busca) e confere o id de cada linha a cada varredura, sem duplicar botões.
- Core 1.1.6.0 e a Suite nova forçam o download imediato do módulo novo.

### Core 1.1.5.0, Suite 4.9.9.0 e Reaplicar Permissões 1.2.0 (26/11/2026): link direto para as abas do funcionário

- O Feegow passou a ignorar o `&Aba=...` do endereço. Agora o módulo lê `&Aba=Permissoes` (ou `#divPermissoes`) ao abrir `?P=Funcionarios` / `?P=Profissionais`, espera a aba aparecer (até 15 s) e clica nela **uma única vez** (o clique dispara o carregamento do próprio Feegow). Aceita `Permissoes`/`Permissao`/`divPermissoes`, `Acesso`/`divAcesso` e `Cadastro`/`divCadastroFuncionario`, sem diferenciar maiúsculas e acentos. Se a pessoa clicar em outra aba antes, o link perde a vez.
- Botão **🔗 Copiar link das permissões** ao lado do título da página: copia `https://app.feegow.com/main/?P=Funcionarios&Pers=1&I=<número>&Aba=Permissoes`.
- Novo item **Abrir aba pelo link (&Aba=Permissoes)** na engrenagem, ON por padrão. A Suite passa as opções ao módulo e agora baixa o módulo também em Profissionais.
- Core 1.1.5.0 só força o download imediato da Suite nova.

### Reaplicar Permissões 1.1.0 (26/11/2026): backup e restauração dos modelos de permissão

- Quatro botões novos à esquerda do **Reaplicar regra atual** (que não muda): **Backup das regras**, **Comparar com backup**, **Restaurar uma regra** e **Restaurar todas 🔒**. Mexem só nos MODELOS (regras predefinidas), nunca nas permissões do funcionário.
- **Backup** (só leitura): arquivo JSON datado no PC com todas as regras (marcadas e desmarcadas com rótulo, limites financeiros, "ocultar lançamento"); sai INCOMPLETO se não fechar N/N.
- **Comparar**: o que cada regra perdeu, ganhou e as permissões novas do Feegow.
- **Restaurar uma regra**: prévia, padrão "só repor o que falta", backup pré-restauração automático, releitura e conferência (vermelho se não bater).
- **Restaurar todas**: travado até haver backup completo e revisado e 10 restaurações individuais conferidas; pede `RESTAURAR TODAS` e para no 1º erro.
- Regras de desconto ficam fora (aviso nas janelas). Detalhes em [hoc-reaplicar-permissoes.md](hoc-reaplicar-permissoes.md).
- Chega pela Suite em até ~60 min (cache do módulo); não precisa atualizar o Core.

### Core 1.1.4.0 e Suite 4.9.8.0 (25/11/2026): sem pedido de notificações e sem popups de propaganda

- Novo item **Ocultar pedido de notificações do Feegow** (ON por padrão): o aviso "Gostaríamos de te notificar para ver nossas últimas atualizações" não aparece mais. A Suite clica em **Agora não** por você (o Feegow/Beamer grava a recusa) e remove o aviso; nunca clica em **Permitir**. Substitui o antigo "Pedir Notificações", com chave nova, então volta ligado para todos.
- Novo item **Ocultar propagandas e novidades do Feegow (popups)** (ON por padrão): popups como "Liberado: teste ... grátis" são fechados pelo **X** e removidos, sem clicar no botão da oferta.
- Os dois agem assim que o popup surge (CSS desde o carregamento + vigia leve dos elementos novos, sem polling).
- Core 1.1.4.0: só a versão muda, para o Tampermonkey atualizar e a Suite nova ser baixada na hora.

### Reaplicar Permissões 1.0.1 (25/11/2026): texto no botão

- O botão passa a mostrar **Reaplicar regra atual** ao lado do ícone (mesmas classes do histórico, numa linha só). A dica com o nome da regra continua. Desabilitado, o texto aparece esmaecido.
- Chega pela Suite em até ~60 min (cache do módulo); não precisa atualizar o Core.

### Core 1.1.3.0, Suite 4.9.7.0 e Reaplicar Permissões 1.0.0 (25/11/2026): novo módulo

- Novo **HOC Reaplicar Permissões**: no cadastro de funcionário (`?P=Funcionarios`, aba **Permissões**), botão 🔁 ao lado do histórico de permissões, no mesmo estilo dele. Reaplica a regra predefinida que a pessoa já tem (a linha com o check verde), depois de uma confirmação própria, clicando no próprio botão **Aplicar** da regra. Sem regra marcada, o botão fica desabilitado. Detalhes em [hoc-reaplicar-permissoes.md](hoc-reaplicar-permissoes.md).
- Carregado pela Suite (item **Reaplicar Permissões** na engrenagem, ON por padrão), só nessa tela.
- Core 1.1.3.0: só a versão muda, para o Tampermonkey atualizar e a Suite nova ser baixada na hora.

### Core 1.1.2.0, Suite 4.9.6.0 e Gastos para Excel 1.1.0 (24/11/2026): Gastos para Excel vem com o Core

- O **HOC Gastos para Excel** passa a ser carregado pela Suite (item **Gastos para Excel** na engrenagem, ON por padrão). Não precisa mais instalar avulso em cada PC.
- O avulso continua funcionando, mas, se o Core também estiver ativo, só um dos dois roda (marcador `data-hoc-gastos-excel-ativo` no `<html>`), sem botões duplicados. Recomendado: usar só o Core e desinstalar o avulso.
- Core 1.1.2.0: quando o Tampermonkey atualiza o Core, a Suite é baixada na hora, sem esperar o cache de 60 min.

### HOC Gastos para Excel 1.0.0 (24/11/2026): novo script

- Botão **📋 Copiar para Excel** em cada registro de gasto da linha do tempo do prontuário. Copia só os itens com quantidade (Item e Qtde; materiais e depois medicamentos), sem dados do paciente. Detalhes em [hoc-gastos-excel.md](hoc-gastos-excel.md).

### Suite 4.9.5.2 (23/11/2026): entrada com sessão ocupada volta a funcionar

- O Feegow trocou a tela de login por uma nova, em duas etapas (e-mail → Continuar → senha → Entrar), e o recurso de entrada com sessão ocupada tinha parado de funcionar. Agora ele funciona nas duas telas, a nova e a antiga.
- Tenta entrar de novo a cada 1,5 s, por cerca de 1 minuto. Se não conseguir, devolve a senha no campo para tentar na mão.
- **Senha errada é avisada na hora**: a Suite para e não fica tentando à toa.

### Propostas 1.4.3 (26/11/2026)

- **7 descrições novas**: crioterapia, curetagem com ou sem eletrocauterização, curetagem de molusco (vence a genérica), correção de ectrópio ou entrópio, fios lisos (glabela e pálpebras inferiores) e Harmonyca. A hialuronidase já existia com o mesmo texto. Curetagem uterina/ginecológica e crioterapia conjuntival ficam de fora; Harmonyca não cai no preenchimento com ácido hialurônico genérico.

### Propostas 1.4.2 (26/11/2026)

- **Exérese de corpo e de rosto** (baixa, média e alta complexidade) passam a usar a mesma descrição, a de "EXÉRESE DE LESÃO | MÉDIA COMPLEXIDADE". Antes, baixa e média usavam textos diferentes e a alta ficava sem descrição. As outras exéreses (cisto, lipoma, calázio, cisto de Moll) não mudam.

### Propostas 1.4.1 (26/11/2026)

- O procedimento do Feegow **"ANATOMOPATOLÓGICO (2 FRASCO)"** usa a mesma descrição de "ANATOMOPATOLÓGICO | MAIS DE 02 FRASCOS" (2 frascos e mais de 2). "1 frasco" continua na própria descrição.

### Propostas 1.4.0 (26/11/2026): Gerenciar descrições

- Novo botão **Gerenciar descrições**, ao lado de "Imprimir HOC Derma" (e no menu do Tampermonkey). Lista todos os procedimentos (padrão e personalizados) com busca; permite **adicionar**, **editar**, **excluir** e **"Restaurar o padrão"** de cada item.
- As personalizações ficam gravadas **neste PC** e valem por cima da lista padrão do script, sem se perder nas atualizações.
- **Procedimentos do Feegow sem descrição**: lê a lista de procedimentos da própria página do Feegow (só leitura) e mostra os que nenhuma descrição reconhece, com **Criar descrição** já preenchendo o nome. Também aceita lista colada ou arquivo CSV/TXT.
- **Backup**: "Fazer backup" baixa um JSON datado; "Restaurar backup" valida o arquivo, mostra a prévia (novos, alterados e removidos) e aplica com "Juntar com o atual" ou "Substituir tudo", guardando antes o estado atual ("Desfazer a última restauração").
- **Enviar para a lista padrão**: gera o JSON e o trecho pronto no formato do catálogo para o coordenador incorporar ao script oficial. Não envia nada pela internet.

### Propostas 1.3.12 (26/11/2026)

- **16 descrições novas** na lista padrão: dacriocistorrinostomia, exérese de calázio, exérese de cisto de Moll, infiltração intralesional, ressecção de tumores palpebrais, peeling ácido retinóico com Jessner (1 sessão), anatomopatológico (1 frasco e mais de 2 frascos), bioimpedância, biópsia por punch (1, 2 e 3 pontos), blefaroplastia superior e inferior + ptose, blefaroplastia superior + ptose, cantopexia, cantoplastia tarsal strip, cauterização química e clipping ungueal.
- Título e texto da **correção de ptose** atualizados. Nas blefaroplastias com ptose, sai uma descrição só (a da combinação), em vez de duas.

### Propostas 1.3.11 (26/11/2026)

- O procedimento do Feegow **"LIFTING DE SUPERCÍLIO - BROW LIFT - CASTANHARES"** (e o "CASTANHARES (LIFT DE SUPERCÍLIO) - BILATERAL") usa a mesma descrição de "LIFTING DE SUPERCÍLIOS | TÉCNICA DE CASTANHARES". Palavras novas: "brow lift" e "castanhares supercílio".

### Propostas 1.3.10 (26/11/2026)

- **Procedimentos como no Feegow.** A folha mostrava o título do modelo de texto (por exemplo "TERÇO SUPERIOR" para o item "TERÇO SUPERIOR + INFERIOR FEMININO") e juntava itens repetidos num bloco só, na ordem do catálogo. Agora sai **um bloco por item da proposta, na ordem do Feegow**, com o **nome do item como está no Feegow**, a descrição do modelo (texto intacto) e o **Investimento daquele item** (quantidade, valor, desconto e acréscimo). Item sem descrição, com a tabela oculta, sai na mesma ordem com nome e valor, e não mais agrupado em "Outros itens".

### Propostas 1.3.9 (24/11/2026)

- No "Padrão Poppins" (o padrão inicial), os **títulos dos procedimentos** voltam à fonte de antes; o resto continua em Poppins. Quem já tinha mudado a fonte ou o tamanho do título mantém a escolha.

### Propostas 1.3.8 (24/11/2026)

- O aviso do topo da janela ficou curto, numa faixa fina própria, e a barra superior voltou à altura de antes.

### Propostas 1.3.7 (24/11/2026)

- **O que muda na janela vai para o Feegow**: quantidade, valor unitário, desconto e acréscimo de cada item da proposta são gravados na linha real e a proposta é salva (1,5 s depois da última tecla ou ao sair do campo). O total é conferido.
- **Fontes**: a janela e a folha passam a usar a **Poppins** (embutida no script, funciona sem internet). O botão "Aa Tamanho das fontes" permite escolher a fonte e o tamanho de cada parte da folha, com mudança na hora na prévia e na impressão e gravação neste PC. Os botões "Padrão Poppins" e "Padrão original" (fontes e tamanhos da 1.3.6) substituem tudo, depois de uma confirmação.

### Propostas 1.3.6 (24/11/2026)

- **"＋ Feegow" na linha nova da janela**: o procedimento entra na proposta real do Feegow, como no campo "Procedimento" (o ID é achado pelo nome; quando há dúvida, aparece uma lista para escolher), com quantidade e valores preenchidos, e em seguida a proposta é salva. Não usa "criar procedimento novo" nem "Seleção Rápida".
- **Desconto total** da janela (em % ou R$) passa para o "Desconto total" do Feegow, que é salvo em seguida. O script confere se o total bate e avisa quando não bate.

### Propostas 1.3.5 (24/11/2026)

- **Imprimir HOC Derma salva a proposta antes**: clica no SALVAR do Feegow e abre o editor na hora, sem esperar o salvamento. Sem o botão SALVAR na tela, abre o editor como antes.
- Os **8 procedimentos "a revisar"** (blefaroplastias, fotobiomodulação pós-blefaro, laser de CO2, lifting de supercílios, peeling superficial, ptose) viraram procedimentos normais, sem selo. Textos e valores iguais.

### Propostas 1.3.0 a 1.3.4 (21/11/2026)

| Versão | Mudança |
| :--- | :--- |
| 1.3.4 | Versão de produção: logs de depuração desligados por padrão, correção na API de console e guia completo em [hoc-derma-propostas.md](hoc-derma-propostas.md). |
| 1.3.3 | Prévia do editor sem barra de rolagem interna em qualquer zoom. |
| 1.3.2 | Item adicionado sem recarregar a página entra na impressão. |
| 1.3.1 | Com "Mostrar validade", some a frase de validade duplicada do Feegow. |
| 1.3.0 | Tabela de itens oculta por padrão, nome de quem gerou no fim da folha, tela de configurações. |

### Core 1.1.1.0 · Suite 4.9.5.1

- O Core só aceita resposta válida do GitHub (HTTP 200 e cabeçalho de userscript) e usa o cache vencido quando não há rede.

### Suite 4.9.5.0 · Propostas 1.0.x (20/11/2026)

- Novo módulo **Propostas HOC Derma** carregado em cascata, com item próprio na engrenagem.

### Timbrador 3.1.0

- Exportação de **PDF nativo com texto selecionável** (pdf-lib embutido).

### Timbrador 3.0.0 a 3.0.7 (11/2026)

- 3.0.0: janela dentro do próprio Feegow e ajuste vertical manual.
- 3.0.4: pdf.js embutido no próprio script (sem depender de download).
- 3.0.5: acesso pela pílula **PDF HOC Derma** na barra superior e esticamento separado de topo e base.
- 3.0.6: **AUTO** encaixa o conteúdo exatamente entre os timbres.
- 3.0.7: ajuste **por página**, com navegação entre páginas.
- Suite 4.9.4.8: atalho vermelho **PDF HOC Derma** à esquerda da engrenagem e carregamento automático do Timbrador.

### Outubro de 2026

- Primeira versão do **PDF HOC Derma (Timbrador)**.

### Julho de 2026

- Criação do **Core** (injetor com cache), armazenamento persistente das preferências no Tampermonkey e ancoragem dinâmica do menu de configurações na barra superior.
- Botão de acesso ao **prontuário dentro da Agenda**.

### Suite 4.9.1.x a 4.9.2.0 (fevereiro de 2026)

- 4.9.2.0: fim do recarregamento da página no login com sessão ocupada e nova tela de carregamento.
- Atualizações periódicas da relação de profissionais e especialidades.

### 2025

- Primeiras versões do script de verificação do DR. EXAMES na Lista de Espera.
- Remoção de elementos desnecessários da tela, lista inferior que só aparece quando a superior sai de vista, links e visualização aprimorados.
