# 📋 Feegow: Contar DR. EXAMES com Logs Detalhados 🩺📊

Este é um script **Tampermonkey** que foi desenvolvido para facilitar a identificação, contagem e comparação de pacientes que estão apenas no **DR. EXAMES** na plataforma Feegow, com logs detalhados e uma lista de pacientes. 🧑‍💻🔍

---

## 🚀 Como Funciona?

O script faz o seguinte:

1. **Acessa URLs específicas** da lista de espera na plataforma Feegow para obter listas de pacientes. 🌐
2. **Compara as listas** de pacientes na lsita de espera do DR. EXAMES com a lista geral de pacientes. 🔄
3. **Identifica pacientes exclusivos** que existam apenas no DR. EXAMES. 🎯
4. **Exibe a contagem** de pacientes exclusivos e uma lista detalhada dos nomes e descrição na interface. 📈📜
5. **Logs detalhados** no console para facilitar a depuração e acompanhamento. 🖥️📝

---

## 🛠️ Instalação

1. **Instale o Tampermonkey** no seu navegador:
   - [Tampermonkey para Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey para Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/tampermonkey/)
   - [Tampermonkey para Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

2. **Crie um novo script** no Tampermonkey e cole o código fornecido.

3. **Salve e ative** o script.

4. **Acesse a plataforma Feegow** entre na lista de espera e veja a mágica acontecer! ✨

---

## ⚙️ Configurações

- **`exibirTodos`**: Controla se a lista exibida será de todos os pacientes (`0`) ou apenas os exclusivos do DR. EXAMES (`1`).
- **`debugMode`**: Ativa (`1`) ou desativa (`0`) os logs detalhados no console.
- **`intervaloVerificacao`**: Define o intervalo de tempo (em milissegundos) para verificar e atualizar a lista de pacientes.

---

## 🎨 Funcionalidades Extras

- **Cores Dinâmicas**: A cor de fundo do contador muda conforme o número de pacientes exclusivos:
  - 🟢 Verde para 1 a 5 pacientes.
  - 🔴 Vermelho para mais de 5 pacientes.
- **Lista de Pacientes**: Exibe uma lista detalhada dos pacientes exclusivos do DR. EXAMES. 📋
- **Logs Detalhados**: Registra no console o nome e a descrição de cada paciente, facilitando a depuração. 🖥️📝

---

## 📝 Exemplo de Uso

1. **Acesse a plataforma Feegow** e navegue até a lista de espera.
2. **Veja a contagem** de pacientes exclusivos do DR. EXAMES no topo da página.
3. **Clique no contador** para alternar entre exibir todos os pacientes ou apenas os exclusivos.
4. **Verifique os logs** no console para mais detalhes sobre os pacientes.

---

## 🛑 Problemas Comuns

- **Script não funciona**: Verifique se o Tampermonkey está ativado, se estiver no Google Chrome ative o modo de Desenvolvedor nas extensões e verifique se as URLs correspondem às da plataforma para o seu caso.
- **Logs não aparecem**: Certifique-se de que o `debugMode` está ativado (`1`).
- **Contador não aparece**: Verifique se o elemento `pacientesAguardando` existe na página.

---

## 🤝 Contribuição

Se você quiser contribuir para este projeto, sinta-se à vontade para:

1. **Fork** o repositório.
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`).
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`).
4. **Push** para a branch (`git push origin feature/AmazingFeature`).
5. Abra um **Pull Request**.

---

## 📜 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- **Feegow** pela plataforma incrível. 🏥
- **Tampermonkey** por tornar a automação de scripts tão fácil. 🐒
- **Você** por usar e contribuir para este projeto! ❤️

---

Feito com ❤️ por [Nicolas Bonza Cavalari Borges] 🚀

---
