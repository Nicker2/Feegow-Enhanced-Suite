# 🩺 Feegow: Suíte de Aprimoramentos - Monitor Dr. Exames

<div align="center">

![Version](https://img.shields.io/badge/version-4.9.2.0-blue?style=for-the-badge&logo=semver)
![Platform](https://img.shields.io/badge/Platform-Feegow-green?style=for-the-badge)
![Maintainer](https://img.shields.io/badge/maintainer-Nicolas_Borges-orange?style=for-the-badge)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-00485B?style=for-the-badge&logo=tampermonkey&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

</div>

---

## 📋 Sobre o Projeto

Este é um **UserScript avançado** desenvolvido para otimizar o fluxo de trabalho na plataforma **Feegow**. Ele atua como uma camada de inteligência sobre a interface original, focando na identificação, contagem e comparação de pacientes exclusivos na fila do **DR. EXAMES**.

O script opera de forma assíncrona (non-blocking), manipulando o DOM em tempo real para fornecer insights visuais e automações de acesso sem prejudicar a performance do sistema.

---

## 🚀 Funcionalidades Principais

### ⚡ Automação e Anti-Travamentos
* **Login Bypass Invisível e UI Premium (Novo! 🚀):** Resolve definitivamente a tela de *"Usuário conectado em outra máquina"*. O script intercepta as credenciais temporariamente de forma segura e, caso a tela de bloqueio apareça, sobrepõe a página com uma **bela tela de carregamento corporativa e customizada**. Por baixo dos panos (via *Fetch API*), ele inicia um loop silencioso tentando o acesso repetidamente sem recarregar o navegador. 
    * **Importante:** O script *não* derruba ativamente ou expulsa a sessão aberta no outro computador. Ele fica apenas tentando o login incansavelmente (em frações de segundo) enquanto exibe a tela de carregamento para você. Assim que a sessão for liberada, ele te joga para dentro do sistema instantaneamente!
* **Anti-Clutter:** Remove elementos desnecessários da interface original (`.alert-warning`, plugins de IA, headers de espaço).
* **Force Config:** Garante que a visualização da fila esteja sempre e automaticamente configurada para **30 itens por página**.

### 🧠 Inteligência de Dados
* **Comparação em Tempo Real:** Cruza dados de duas APIs (`ProfissionalID=ALL` vs `ProfissionalID=1083`) para identificar pacientes exclusivos.
* **Logs Detalhados:** Sistema robusto de debug no console para rastreamento de requisições e processamento de listas.
* **Contador Dinâmico:** Badge visual inteligente que altera a cor baseada na carga de trabalho atual:
    * 🟢 **1-5 Pacientes:** Verde (Carga Leve)
    * 🔴 **>5 Pacientes:** Vermelho (Carga Alta)

### 🎨 Melhorias de UI/UX
* **Identificação de Especialidades:** Adiciona tags visuais coloridas ao lado dos nomes dos médicos diretamente na tabela e nos menus suspensos.
    * 🟢 **Oftalmologia:** Destaque Neon Green.
    * 🔴 **Outras:** Vermelho Padrão.
* **Listas Inteligentes (Smart Lists):**
    * **Primeira Lista:** Visível e fixada no topo.
    * **Segunda Lista (Sticky):** Aparece automaticamente no rodapé quando a lista superior sai do campo de visão (gerenciado via `IntersectionObserver`).
* **Badges de Status:** Identificação automática e destaque visual para pacientes de "Primeira vez".

---

## 🛠️ Tecnologias Utilizadas

O script utiliza recursos modernos da Web API:

| Tecnologia | Uso no Script |
| :--- | :--- |
| **Web Storage API** | Utiliza o `sessionStorage` como cofre temporário de credenciais para viabilizar a injeção do formulário fantasma no bypass de login. |
| **MutationObserver** | Monitora mudanças no DOM para reinjetar botões e remover alertas dinamicamente sem recarregar a página. |
| **IntersectionObserver** | Gerencia a visibilidade das listas duplas, criando um efeito de scroll inteligente/sticky. |
| **Fetch API** | Realiza requisições assíncronas aos endpoints da Feegow em background (agora utilizado também para o motor invisível de Auto-Login sem recarregar a tela). |
| **DOM Parser** | Lê e interpreta o HTML retornado pelas requisições "under the hood" para mapear os links dos pacientes. |

---

## 📦 Instalação

1.  **Pré-requisito:** Instale a extensão **Tampermonkey** no seu navegador.
    * [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/tampermonkey/) | [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

2.  **Adicionar Script:**
    * Clique no ícone do Tampermonkey > *Criar novo script*.
    * Apague o conteúdo padrão.
    * Cole o código completo do arquivo `VERIFICAR-DR-EXAMES.user.js`.
    * Pressione `Ctrl + S` para salvar.

3.  **Uso:**
    * O script será carregado automaticamente em qualquer subdomínio (`app`, `app2`, etc.) na lista de espera ou tela de login do Feegow.

---

## ⚙️ Configuração Personalizável

Você pode ajustar as variáveis no topo do código-fonte para adaptar ao seu fluxo de trabalho:

```javascript
// Configurações do Usuário
let exibirTodos = 1;              // 0: Mostra todos | 1: Apenas exclusivos DR. EXAMES
const debugMode = 1;              // 1: Ativa logs no console (F12)
const intervaloVerificacao = 10000; // Tempo de atualização em ms (10 segundos)

```

### Mapeamento de Profissionais

O script contém um objeto `profissionais` que mapeia nomes para especialidades. Para adicionar um novo médico, siga o padrão estabelecido no código:

```javascript
const profissionais = {
    "NOME DO MÉDICO": "Oftalmologia", // Gera badge Verde
    "OUTRO MÉDICO": "Dermatologia"    // Gera badge Vermelho
};

```

---

## 🐛 Troubleshooting

<details>
<summary><strong>Clique para expandir soluções comuns</strong></summary>

1. **O Script não carrega:**

* Verifique se a URL da página corresponde ao escopo `@match https://*.feegow.com/*/*`.
* Certifique-se de que a extensão Tampermonkey está habilitada no navegador.

2. **Lista Inferior não aparece:**

* Role a página até que a "Lista Superior" saia completamente da tela. O `IntersectionObserver` precisa detectar a saída do elemento para ativar a visualização da lista inferior.

3. **Logs de Erro de API:**

* Se visualizar a mensagem "Erro ao buscar dados" no console, verifique sua conexão com a internet ou se a sua sessão no Feegow expirou.

4. **Auto-Login não disparou:**

* O script requer que o botão "Entrar" original seja clicado para capturar as credenciais na primeira tentativa. Se usar um preenchimento automático externo que pule o botão, o script não terá os dados salvos para o reenvio na tela de sessão dupla.

</details>

---

## 🤝 Contribuição

Contribuições são bem-vindas!

1. Faça um Fork do projeto.
2. Crie uma Branch para sua Feature (`git checkout -b feature/Incrivel`).
3. Faça o Commit (`git commit -m 'Add some Incrivel'`).
4. Push para a Branch (`git push origin feature/Incrivel`).
5. Abra um Pull Request.

---

## 📝 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais informações.

<div align="center">
<sub>Feito com ❤️ por Nicolas Bonza Cavalari Borges</sub>
</div>
