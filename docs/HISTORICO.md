# 📜 Histórico de alterações

> Voltar para o [README](../README.md). O histórico completo, commit a commit, está no [log do GitHub](https://github.com/Nicker2/Feegow-Enhanced-Suite/commits/main). O histórico detalhado das Propostas fica em [hoc-derma-propostas.md](hoc-derma-propostas.md#10-histórico-de-versões).

## Versões atuais

| Script | Versão |
| :--- | :---: |
| Core | 1.1.3.0 |
| Suite principal | 4.9.7.0 |
| PDF HOC Derma (Timbrador) | 3.1.0 |
| Propostas HOC Derma | 1.3.9 |
| HOC Gastos para Excel | 1.1.0 |
| HOC Reaplicar Permissões | 1.0.0 |

---

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
