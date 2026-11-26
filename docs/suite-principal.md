# Suite principal (VERIFICAR-DR-EXAMES)

[Voltar ao README](../README.md)

Arquivo: `VERIFICAR-DR-EXAMES.user.js` (nome exibido: **Suite Feegow Enhanced**). Normalmente é carregada pelo Core ([core-e-cascata.md](core-e-cascata.md)); também pode ser instalada avulsa, mas **nunca junto com o Core**.

A Suite roda em todas as páginas `https://*.feegow.com/*/*`. Ela executa uma verificação ao abrir a página e depois **a cada 10 segundos**, e um `MutationObserver` reaplica botões e remoções sempre que o Feegow redesenha a tela.

## 1. Engrenagem de configurações

Um botão de engrenagem (`#btn-controle-feegow`) é inserido na barra superior, ancorado ao lado do Caixa, de Tarefas ou do sino de notificações (o primeiro que existir). Cada item mostra ON/OFF; o clique inverte o valor e **recarrega a página**. As escolhas são **por computador** (ficam no armazenamento do Tampermonkey) e todas vêm ON por padrão.

| Item | Quando ON | Chave |
| :--- | :--- | :--- |
| DR. EXAMES (Lista de Espera) | Contador e listas dos exclusivos do DR. EXAMES. Em OFF, a consulta extra ao Feegow não é feita. | `dr_exames_status` |
| Avisos Amarelos | Remove os avisos amarelos (`.alert-warning`) | `remove_alert_warning` |
| Notificações Flutuantes | Remove as notificações flutuantes (`.ui-pnotify`) | `remove_pnotify` |
| Barra DP Spaces | Remove a barra DP Spaces / Doctoralia | `remove_dp_spaces` |
| IA Feegow | Remove o plugin do assistente de IA | `remove_ai_assistant` |
| Anúncios Feegow | Remove os anúncios do Beamer (novidades, promoções) | `remove_beamer` |
| Ocultar pedido de notificações do Feegow | Esconde o aviso "Gostaríamos de te notificar..." (pop-up de push do Beamer, `#beamerPushModal`): CSS desde o início, clique em "Agora não" (`#pushActionRefuse`) para o Beamer gravar a recusa e remoção. Nunca clica em "Permitir" (`#pushConfirmation`). Reserva por texto e seletores do OneSignal. Substitui o antigo "Pedir Notificações" (`remove_beamer_push`). | `ocultar_pedido_notificacoes` |
| Ocultar propagandas e novidades do Feegow (popups) | Fecha os popups do Amplitude Engagement (`#engagement-toast-responsive-inner-div`, `.amplitude-engagement-popover-container`) clicando no X (`[data-testid="nudge-step-close-button"]`) e remove; CSS esconde antes de aparecer. Nunca clica no botão da oferta (`.amplitude-engagement-cta-button`). | `ocultar_propagandas_popups` |
| PDF HOC Derma (v3) | Carrega o Timbrador e mostra o botão vermelho **PDF HOC Derma** | `pdf_hoc_derma` |
| Imprimir HOC Derma (Propostas) | Carrega o módulo de Propostas | `propostas_hoc_derma` |
| Gastos para Excel | Carrega o módulo HOC Gastos para Excel | `gastos_excel` |
| Reaplicar Permissões | Carrega o módulo HOC Reaplicar Permissões (só no cadastro de funcionário) | `reaplicar_permissoes` |

## 2. Lista de Espera e DR. EXAMES

Vale na **Lista de Espera** (URL com `p=ListaEspera&Pers=1`, sem diferença de maiúsculas).

**Pacientes exclusivos do DR. EXAMES.** A cada 10 s a Suite consulta, no próprio Feegow e com a sessão já aberta, duas versões da lista de espera (30 por página): a de `ProfissionalID=ALL` e a do profissional DR. EXAMES. Quem aparece na lista do DR. EXAMES e **não** aparece na outra (comparando o nome e a descrição abaixo dele) é considerado **exclusivo** do DR. EXAMES.

- **Contador colorido** ao lado de "pacientes aguardando": a cor vai do verde ao vermelho entre 1 e 5 pacientes e fica vermelha acima de 5. Sem exclusivos, aparece "Nenhum paciente exclusivo do DR. EXAMES".
- **Lista de exclusivos** no topo da página, com o nome como link azul para o prontuário e o selo **Primeira vez** quando for o caso.
- **Lista inferior:** uma cópia da lista aparece abaixo da tabela da lista de espera **só quando a lista do topo sai da tela** (`IntersectionObserver`), para não precisar rolar de volta.
- Botão **Esconder/Mostrar Listas DR. EXAMES** alterna a exibição das duas listas.

**Especialidade do médico.** Na tabela, uma etiqueta aparece ao lado do nome do profissional: verde para Oftalmologia, vermelha para as demais especialidades. Nos menus suspensos de profissional, a especialidade aparece em texto abaixo do nome. A relação nome → especialidade fica no objeto `profissionais` do código.

**Protocolo de dilatação.** Se o médico do atendimento tem protocolo de dilatação cadastrado (`protocolosDilatacao`) **e** a idade do paciente está na faixa definida para ele (`verificarIdadeCompativel()`), aparece o selo laranja **Dilatar (clique aqui)**. O clique abre um balão com o protocolo. Idades em meses são convertidas em anos; se a idade não puder ser lida, o selo aparece por segurança.

**30 itens por página.** O seletor de itens por página da lista de espera é mantido sempre em 30.

## 3. Agenda: atalho para o prontuário

Nas telas de agenda (`agenda-1`) e de equipamentos alocados, um botão aparece ao lado do nome do paciente e abre o **prontuário em nova aba**, sem sair da agenda.

## 4. Entrada com sessão ocupada

Quando o Feegow recusa a entrada com *"Este usuário já está conectado em outra máquina."*, a Suite:

1. cobre a página com uma tela de espera no visual do Feegow;
2. tenta entrar de novo sozinha, a cada 1,5 s, por cerca de 1 minuto;
3. quando a sessão é liberada, entra no sistema e apaga os dados de acesso que tinha guardado.

Funciona na tela de login nova do Feegow (em duas etapas: e-mail → Continuar → senha → Entrar) e na antiga. Se a **senha estiver errada**, a Suite avisa na hora e não fica tentando. Se não conseguir entrar em cerca de 1 minuto, devolve a senha no campo para você tentar na mão.

Os dados de acesso só são guardados quando você clica em **Entrar** (um preenchimento automático que envie o formulário sozinho impede a nova tentativa). Veja o aviso de privacidade no [README](../README.md#-privacidade).

## 5. Botão PDF HOC Derma e cascata

Com o item **PDF HOC Derma** ON, a Suite:

- baixa e executa o Timbrador (cache de 60 min);
- coloca a pílula vermelha **PDF HOC Derma** imediatamente à esquerda da engrenagem;
- coloca o mesmo botão no cabeçalho do painel **Arquivos do Paciente** do prontuário.

Com o item **Imprimir HOC Derma (Propostas)** ON, baixa e executa o módulo de Propostas, que cuida do próprio botão.

Com o item **Gastos para Excel** ON, baixa e executa o [HOC Gastos para Excel](hoc-gastos-excel.md) (cache de 60 min), que põe o botão **📋 Copiar para Excel** nos registros de gasto da linha do tempo. Se o script avulso também estiver instalado, só um dos dois roda.

Com o item **Reaplicar Permissões** ON, e só no cadastro de funcionário (`?P=Funcionarios`), baixa e executa o [HOC Reaplicar Permissões](hoc-reaplicar-permissoes.md) (cache de 60 min), que põe o botão 🔁 ao lado do histórico de permissões.

## 6. Personalização (no código)

Na cascata o código vem do GitHub, então mudanças precisam ser publicadas no repositório (ou testadas com a Suite avulsa e o Core desativado).

```javascript
let exibirTodos = 1;                // 0: mostra todos | 1: apenas exclusivos DR. EXAMES
const debugMode = 1;                // 1: logs no console com o prefixo [Script Tampermonkey]
const intervaloVerificacao = 10000; // intervalo da verificação, em ms
```

- `profissionais`: nome do profissional (como aparece no Feegow) → especialidade. `"Oftalmologia"` gera a etiqueta verde.
- `protocolosDilatacao`: HTML do protocolo de cada médico.
- `verificarIdadeCompativel()`: faixa de idade em que o selo de dilatação aparece para cada médico.
- O ID do profissional DR. EXAMES usado na consulta fica nas constantes `urlApiDrExames` / `urlApiTodos`.

## 7. Problemas comuns

- **Engrenagem não aparece:** nenhum ponto de ancoragem na barra (o console mostra "Nenhum ponto de ancoragem encontrado") ou janela estreita (o Feegow esconde esses itens em telas pequenas).
- **"Erro ao buscar dados da API":** sessão expirada ou sem conexão.
- **Lista inferior não aparece:** ela só surge quando a lista do topo sai da tela.
