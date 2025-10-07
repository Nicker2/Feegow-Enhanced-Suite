# 📋 Feegow: Contar DR. EXAMES com Logs Detalhados e Manter Valor 30 no Select 🩺📊

Este é um script **Tampermonkey** avançado projetado para otimizar a experiência na plataforma Feegow, focando na identificação, contagem e comparação de pacientes exclusivos no **DR. EXAMES**. Ele inclui logs detalhados para depuração, listas visuais de pacientes com destaques, automações para elementos da interface (como manutenção de configurações e remoção de itens indesejados), e funcionalidades inteligentes como detecção de visibilidade de listas e badges para pacientes de "Primeira vez". O script é altamente configurável e opera de forma assíncrona para não interferir no desempenho da página. 🧑‍💻🔍

---

## 🚀 Como Funciona?

O script executa uma série de tarefas automatizadas ao carregar páginas específicas da Feegow (como listas de espera). Aqui está o fluxo principal, baseado na versão 4.9:

1. **Inicialização e Verificações Iniciais**:
   - Remove elementos indesejados da página, como alertas (.alert-warning), notificações (.ui-pnotify), cabeçalhos desnecessários (#dp-spaces-header-container) e plugins como #ai-assistant-plugin.
   - Verifica se a página é de login e, se houver a mensagem "Este usuário já está conectado em outra máquina.", clica automaticamente no botão "Cancelar" para prosseguir.
   - Garante que o select de itens por página (#waitingRoomItemsPerPage) esteja sempre configurado para exibir 30 itens, disparando um evento de mudança se necessário.

2. **Adição de Informações de Especialidades**:
   - Analisa a tabela de lista de espera (#listaespera > tbody > tr > td) e o dropdown de profissionais (ul.multiselect-container.dropdown-menu li a label.radio).
   - Para cada profissional listado na constante `profissionais` (um objeto com nomes e especialidades), adiciona um botão ou texto indicativo da especialidade:
     - Na tabela: Um botão colorido (verde neon com sombra para Oftalmologia, vermelho com sombra para outras) ao lado do nome, com estilo minimalista e cursor default.
     - No dropdown: Um texto simples abaixo do nome, sem visual de botão, para manter a interface limpa.

3. **Busca e Comparação de Listas de Pacientes**:
   - Acessa URLs específicas da API da Feegow (urlApiTodos para todos os pacientes e urlApiDrExames para o DR. EXAMES específico, com ProfissionalID=1083).
   - Extrai listas de pacientes usando fetch assíncrono, parseando o HTML retornado para obter nomes, links (href) e descrições (small elements).
   - Compara as listas para identificar pacientes exclusivos no DR. EXAMES (aqueles que não aparecem na lista geral).
   - Registra logs detalhados no console, incluindo comparações linha a linha, pacientes exclusivos e timestamps.

4. **Exibição de Contagem e Listas**:
   - Cria ou atualiza um elemento de contagem (#drExamesCount) ao lado de "pacientes aguardando", com cor de fundo dinâmica (gradiente de verde para vermelho baseado na contagem: verde claro para 1-5, vermelho para >5).
   - Se houver pacientes exclusivos, adiciona um botão para alternar visibilidade das listas (#toggleListasDrExames).
   - Cria duas listas idênticas de pacientes exclusivos:
     - **Lista Superior** (#listaPacientesDrExames): Inserida antes do panel-menu, com cabeçalho estilizado. Exibe nomes como hyperlinks azuis sem sublinhado, descrições, e badges azuis para "Primeira vez". Itens alternam cores de fundo para legibilidade, com hover effects.
     - **Lista Inferior** (#segundaListaDrExames): Inserida abaixo da tabela #listaespera, inicialmente oculta. Usa IntersectionObserver para exibi-la automaticamente quando a lista superior sai da viewport (fora de vista), melhorando a usabilidade em páginas longas.
   - Se não houver pacientes exclusivos, remove listas, cabeçalhos e botão de toggle, exibindo apenas uma mensagem neutra.

5. **Monitoramento Contínuo**:
   - Usa MutationObserver para detectar mudanças no DOM e reaplicar remoções, adições de botões e verificações de select.
   - Executa verificações periódicas (a cada `intervaloVerificacao` ms) para atualizar contagens e listas em tempo real, sem recarregar a página.

O script não altera a tabela principal (#listaespera > tbody), garantindo compatibilidade e integridade da interface original. Todos os logs são condicionais ao `debugMode` e incluem timestamps para rastreamento preciso.

---

## 🛠️ Instalação

1. **Instale o Tampermonkey** no seu navegador (extensão essencial para executar userscripts):
   - [Tampermonkey para Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey para Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/tampermonkey/)
   - [Tampermonkey para Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

2. **Crie um novo script** no Tampermonkey:
   - Clique no ícone do Tampermonkey na barra de extensões e selecione "Criar um novo script".
   - Cole o código completo do script fornecido (incluindo o cabeçalho // ==UserScript== ... // ==/UserScript==).

3. **Salve e ative** o script (certifique-se de que está habilitado nas configurações do Tampermonkey).

4. **Acesse a plataforma Feegow**:
   - Navegue até páginas de lista de espera (ex.: https://app.feegow.com/v8/?P=ListaEspera&Pers=1).
   - O script ativará automaticamente nos matches definidos (@match), aplicando todas as funcionalidades. Ative o modo desenvolvedor no navegador (se necessário) para depuração.

Dica: Se usar Chrome, ative o "Modo Desenvolvedor" nas extensões para evitar restrições em scripts.

---

## ⚙️ Configurações

O script é altamente personalizável via variáveis no código. Edite-as diretamente no Tampermonkey para adaptar ao seu uso:

- **`exibirTodos`**: Define o modo inicial de exibição das listas (0: exibe todos os pacientes; 1: apenas exclusivos do DR. EXAMES). Padrão: 1.
- **`debugMode`**: Ativa (1) ou desativa (0) logs detalhados no console do navegador (F12 > Console). Útil para troubleshooting. Padrão: 1.
- **`intervaloVerificacao`**: Tempo em milissegundos para verificações automáticas (atualização de contagens, remoções, etc.). Padrão: 10000 (10 segundos).
- **`profissionais`**: Objeto com nomes de profissionais e suas especialidades. Adicione ou edite entradas para personalizar botões (ex.: "NOME COMPLETO": "Especialidade"). Cores automáticas: verde para "Oftalmologia", vermelho para outras.
- **`urlApiTodos`** e **`urlApiDrExames`**: URLs da API da Feegow para busca de listas. Ajuste se houver mudanças na estrutura da plataforma (ex.: ProfissionalID=1083 para DR. EXAMES).

Após editar, salve o script no Tampermonkey e recarregue a página Feegow para aplicar as mudanças.

---

## 🎨 Funcionalidades Extras

- **Cores Dinâmicas no Contador**: O fundo varia de verde claro (1-5 pacientes) para vermelho intenso (>5), com sombra de texto para melhor visibilidade. Para 0 pacientes, exibe mensagem neutra sem estilo.
- **Listas Duplas Inteligentes**: Duas listas idênticas para redundância – a inferior aparece via IntersectionObserver quando a superior rola para fora da tela, garantindo acesso rápido em listas longas.
- **Hyperlinks Estilizados**: Nomes de pacientes como links azuis sem sublinhado, com hover effects suaves nos itens da lista para interatividade.
- **Badges para Destaque**: Pacientes com "Primeira vez" na descrição recebem um badge azul escuro, facilitando identificação visual rápida.
- **Botão de Toggle Condicional**: Só aparece se houver pacientes exclusivos, permitindo esconder/mostrar listas com um clique. Texto alterna entre "Esconder Listas DR. EXAMES" e "Mostrar Listas DR. EXAMES".
- **Manutenção de Configurações**: Força o select de itens por página para 30, evitando mudanças acidentais e garantindo consistência.
- **Remoção Automática de Elementos**: Limpa a interface de distrações, incluindo plugins de IA, alertas e notificações, melhorando o foco.
- **Tratamento de Login**: Automatiza o clique em "Cancelar" para mensagens de sessão duplicada, agilizando o acesso.
- **Logs Avançados**: Todos os eventos (ex.: adição de botões, remoções, comparações de listas) são logados com timestamps, facilitando depuração sem impacto no desempenho.

Essas features tornam o script uma ferramenta robusta para profissionais de saúde, otimizando fluxos de trabalho na Feegow.

---

## 📝 Exemplo de Uso

1. **Acesse a Feegow e Vá para Lista de Espera**: Abra uma página como https://app.feegow.com/v8/?P=ListaEspera&Pers=1. O script removerá elementos indesejados e adicionará botões de especialidades automaticamente.
2. **Verifique a Contagem**: No topo, ao lado de "pacientes aguardando", veja o contador colorido de pacientes exclusivos no DR. EXAMES.
3. **Explore as Listas**: Role para baixo – a lista superior aparece primeiro; se ela sair de vista, a inferior surge automaticamente. Clique nos nomes (hyperlinks) para acessar detalhes do paciente.
4. **Alternar Visibilidade**: Use o botão ao lado do contador para esconder/mostrar as listas.
5. **Depuração**: Abra o console (F12) e ative `debugMode=1` para ver logs em tempo real, como "Paciente DR. EXAMES exclusivo: Nome - Descrição".
6. **Teste o Select**: Tente mudar o número de itens por página – o script o resetará para 30 automaticamente.

Em cenários reais, o script atualiza a cada 10 segundos, mantendo tudo fresco sem intervenção manual.

---

## 🛑 Problemas Comuns

- **Script Não Funciona ou Não Carrega**: Verifique se o Tampermonkey está ativado e se as URLs (@match) correspondem à sua instância da Feegow. Ative o modo desenvolvedor no navegador e recarregue. Certifique-se de que não há conflitos com outras extensões.
- **Logs Não Aparecem**: Confirme que `debugMode` está em 1. Abra o console do navegador para visualizar.
- **Contador ou Listas Não Aparecem**: Verifique se elementos como #listaespera ou .panel-menu existem na página. Se a API retornar erro (ex.: status não OK), logs indicarão o problema. Ajuste URLs da API se a Feegow mudar endpoints.
- **Botões de Especialidade Ausentes**: Certifique-se de que os nomes em `profissionais` correspondem exatamente aos da página (case-sensitive). Adicione novos profissionais ao objeto.
- **Lista Inferior Não Aparece**: O IntersectionObserver depende da viewport – teste em telas maiores ou role devagar. Threshold é 0.1 para sensibilidade.
- **Valor do Select Não Mantido**: Verifique se o ID #waitingRoomItemsPerPage existe; o script dispara eventos de mudança.
- **Erros de Fetch**: Sem internet ou se a Feegow bloquear, logs mostrarão "Erro ao buscar dados da API". Use VPN se necessário.

Se persistir, fork o repositório e teste modificações.

---

## 🤝 Contribuição

Contribuições são bem-vindas para melhorar o script! Siga estes passos:

1. **Fork** o repositório no GitHub.
2. Crie uma **branch** para sua feature ou fix (`git checkout -b feature/NovaFuncionalidade` ou `git checkout -b fix/CorrigirBug`).
3. **Commit** suas mudanças com mensagens claras (`git commit -m 'Adiciona suporte a nova especialidade'`).
4. **Push** para a branch (`git push origin feature/NovaFuncionalidade`).
5. Abra um **Pull Request** descrevendo as mudanças, testes realizados e como elas aprimoram o script.

Sugestões: Adicione mais especialidades, melhore o IntersectionObserver, ou integre notificações push.

---

## 📜 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. Em resumo: use, modifique e distribua livremente, mantendo os créditos.

---

## 🙏 Agradecimentos

- **Feegow** pela plataforma de gestão médica robusta e API acessível. 🏥
- **Tampermonkey** por habilitar automações client-side de forma simples e poderosa. 🐒
- **Comunidade Open-Source** por bibliotecas como MutationObserver e IntersectionObserver, que tornam features avançadas possíveis.
- **Você** por usar, testar e contribuir para este projeto! ❤️

---

Feito com ❤️ por [Nicolas Bonza Cavalari Borges] 🚀
