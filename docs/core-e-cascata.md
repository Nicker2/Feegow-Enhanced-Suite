# Core e cascata de carregamento

[Voltar ao README](../README.md)

O **Core** (`core.user.js`) é o único script que precisa estar instalado para ter a Suite, o PDF HOC Derma (Timbrador) e as Propostas HOC Derma. Ele não tem interface: só baixa, guarda e executa código.

```
Tampermonkey
 └─ core.user.js                       (instalado; @updateURL = core.meta.js)
     └─ VERIFICAR-DR-EXAMES.user.js    (Suite, baixada pelo Core)
         ├─ hoc-derma-stamping-tool.user.js   (se "PDF HOC Derma" estiver ON)
         └─ hoc-derma-propostas.user.js       (se "Imprimir HOC Derma" estiver ON)

```

## Onde roda

- Core e Suite: `@match https://*.feegow.com/*/*` (ex.: `app.feegow.com/main/...`). Não rodam em `feegow.com.br`.
- Timbrador e Propostas, quando instalados avulsos, aceitam também `feegow.com.br`.

## Como cada nível carrega o próximo

O mesmo algoritmo é usado pelo Core (para a Suite) e pela Suite (para o Timbrador e as Propostas):

1. Lê do armazenamento do Tampermonkey (`GM_getValue`) o código guardado e o horário do último download.
2. **Cache válido** (menos de 60 minutos): executa o código guardado com `eval`, sem rede.
3. **Cache vencido ou vazio**: baixa o `.user.js` de `raw.githubusercontent.com/Nicker2/Feegow-Enhanced-Suite/main/` com `GM_xmlhttpRequest` (o Core acrescenta `?nocache=<horário>` para furar o cache do GitHub; tempo limite de 30 s).
4. A resposta só é aceita com **HTTP 200** e cabeçalho `// ==UserScript==`. Uma página de erro do GitHub nunca vai para o cache.
5. O código novo é executado; o Core só grava no cache a versão que **iniciou sem erro**.
6. **Falha** (sem rede, timeout, GitHub fora, resposta inválida, versão nova quebrada): executa a cópia guardada, **mesmo vencida**. Só não há saída quando o cache está vazio (primeira execução sem internet).

O Timbrador e as Propostas só são baixados se o item correspondente estiver ON na engrenagem. Se o Timbrador estiver ON mas ainda não tiver carregado, o clique no botão vermelho **PDF HOC Derma** baixa na hora e abre a janela em seguida (nunca redireciona para a página de instalação).

## Chaves no armazenamento do Tampermonkey

Na cascata, a Suite roda **dentro** do Core, então todas as chaves abaixo aparecem no armazenamento do **Core**. Com a Suite instalada avulsa, aparecem no armazenamento dela.

| Chave | Quem grava | Conteúdo |
| :--- | :--- | :--- |
| `cached_script` / `last_fetch_time` | Core | Código da Suite e horário do download |
| `hoc_derma_codigo` / `hoc_derma_fetch_time` / `hoc_derma_versao` | Suite | Código, horário e `@version` do Timbrador |
| `hoc_propostas_codigo` / `hoc_propostas_fetch_time` / `hoc_propostas_versao` | Suite | Código, horário e `@version` das Propostas |
| `dr_exames_status`, `remove_alert_warning`, `remove_pnotify`, `remove_dp_spaces`, `remove_ai_assistant`, `remove_beamer`, `remove_beamer_push`, `pdf_hoc_derma`, `propostas_hoc_derma` | Suite | Itens da engrenagem (true/false) |

As Propostas também guardam ali as próprias preferências (ver [hoc-derma-propostas.md](hoc-derma-propostas.md)).

## Forçar o download de uma versão nova

1. Tampermonkey → Painel → **Configurações** → *Modo de configuração*: **Avançado**.
2. Abra o script **Core** (ou a Suite, se estiver avulsa) → aba **Armazenamento**.
3. Apague a chave de horário do módulo e salve:
   - Suite: `last_fetch_time`
   - Timbrador: `hoc_derma_fetch_time`
   - Propostas: `hoc_propostas_fetch_time`
4. Recarregue o Feegow. No console (F12) aparece de onde o código foi executado, por exemplo `[Core Injector] Suite executada a partir de GitHub (versão nova).`

Apagar a chave de **código** (`cached_script`, etc.) também força o download, mas perde a reserva para uso sem internet até o próximo download dar certo.

## Atualização do próprio Core

O Core tem `@updateURL` apontando para `core.meta.js`. O Tampermonkey verifica periodicamente; para forçar, use **Verificar atualizações** no painel. O mesmo vale para qualquer script instalado avulso.

## Permissões

| Script | `@grant` | `@connect` |
| :--- | :--- | :--- |
| Core | `GM_xmlhttpRequest`, `GM_setValue`, `GM_getValue` | `raw.githubusercontent.com` |
| Suite | `GM_getValue`, `GM_setValue`, `GM_xmlhttpRequest` | `raw.githubusercontent.com` |
| Timbrador | `none` | — |
| Propostas | `GM_getValue`, `GM_setValue`, `GM_registerMenuCommand` | — |

Código executado pela cascata herda as permissões do Core. Por isso o menu do Tampermonkey das Propostas (`GM_registerMenuCommand`) só existe quando elas estão instaladas avulsas; na cascata, as configurações ficam acessíveis pela própria interface do módulo.
