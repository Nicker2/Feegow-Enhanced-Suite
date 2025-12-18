# 🩺 Feegow: Suíte de Aprimoramentos - Monitor Dr. Exames

<div align="center">

![Version](https://img.shields.io/badge/version-4.9.1.4-blue?style=for-the-badge&logo=semver)
![Platform](https://img.shields.io/badge/Platform-Feegow-green?style=for-the-badge)
![Maintainer](https://img.shields.io/badge/maintainer-Nicolas_Borges-orange?style=for-the-badge)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-00485B?style=for-the-badge&logo=tampermonkey&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

</div>

---

## 📋 Sobre o Projeto

Este é um **UserScript avançado** desenvolvido para otimizar o fluxo de trabalho na plataforma **Feegow**. Ele atua como uma camada de inteligência sobre a interface original, focando na identificação, contagem e comparação de pacientes exclusivos na fila do **DR. EXAMES**.

O script opera de forma assíncrona (non-blocking), manipulando o DOM em tempo real para fornecer insights visuais sem prejudicar a performance do sistema.

---

## 🚀 Funcionalidades Principais

### 🧠 Inteligência de Dados
* **Comparação em Tempo Real:** Cruza dados de duas APIs (`ProfissionalID=ALL` vs `ProfissionalID=1083`) para identificar pacientes exclusivos.
* **Logs Detalhados:** Sistema robusto de debug no console para rastreamento de requisições e processamento de lista.
* **Contador Dinâmico:** Badge visual que altera a cor baseada na carga de trabalho:
    * 🟢 **1-5 Pacientes:** Verde (Carga Leve)
    * 🔴 **>5 Pacientes:** Vermelho (Carga Alta)

### 🎨 Melhorias de UI/UX
* **Identificação de Especialidades:** Adiciona tags visuais coloridas ao lado dos nomes dos médicos.
    * 🟢 **Oftalmologia:** Destaque Neon Green.
    * 🔴 **Outras:** Vermelho Padrão.
* **Listas Inteligentes (Smart Lists):**
    * **Primeira Lista:** Fixada no topo.
    * **Segunda Lista (Sticky):** Aparece automaticamente no rodapé quando a lista superior sai da visão (usando `IntersectionObserver`).
* **Badges de Status:** Identificação automática de pacientes de "Primeira vez".

### ⚡ Automação e Limpeza
* **Anti-Clutter:** Remove elementos desnecessários (`.alert-warning`, plugins de IA, headers de espaço).
* **Login Handler:** Detecta e resolve automaticamente o conflito de "Usuário conectado em outra máquina".
* **Force Config:** Garante que a visualização esteja sempre configurada para **30 itens por página**.

---

## 🛠️ Tecnologias Utilizadas

O script utiliza recursos modernos da Web API:

| Tecnologia | Uso no Script |
| :--- | :--- |
| **MutationObserver** | Monitora mudanças no DOM para reinjetar botões e remover alertas dinamicamente. |
| **IntersectionObserver** | Gerencia a visibilidade das listas duplas (efeito de scroll infinito/sticky). |
| **Fetch API** | Realiza requisições assíncronas aos endpoints da Feegow em background. |
| **DOM Parser** | Lê e interpreta o HTML retornado pelas requisições "under the hood". |

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
    * Acesse a lista de espera do Feegow (ex: `https://app.feegow.com/v8/?P=ListaEspera...`).
    * O script será carregado automaticamente.

---

## ⚙️ Configuração Personalizável

Você pode ajustar as variáveis no topo do script para adaptar ao seu uso:

```javascript
// Configurações do Usuário
let exibirTodos = 1;              // 0: Mostra todos | 1: Apenas exclusivos DR. EXAMES
const debugMode = 1;              // 1: Ativa logs no console (F12)
const intervaloVerificacao = 10000; // Tempo em ms (10 segundos)

```

### Mapeamento de Profissionais

O script contém um objeto `profissionais` que mapeia nomes para especialidades. Para adicionar um novo médico, siga o padrão:

```javascript
const profissionais = {
    "NOME DO MÉDICO": "Oftalmologia", // Gera botão Verde
    "OUTRO MÉDICO": "Dermatologia"    // Gera botão Vermelho
};

```

---

## 🐛 Troubleshooting

<details>
<summary><strong>Clique para expandir soluções comuns</strong></summary>

1. **O Script não carrega:**
* Verifique se a URL da página corresponde ao `@match https://*.feegow.com/*/*`.
* Certifique-se de que o Tampermonkey está ativo.


2. **Lista Inferior não aparece:**
* Role a página até que a "Lista Superior" saia completamente da tela. O `IntersectionObserver` precisa detectar a saída para ativar a lista inferior.


3. **Logs de Erro de API:**
* Se vir "Erro ao buscar dados", verifique sua conexão ou se a sessão do Feegow expirou.



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
