# PDF HOC Derma (Timbrador)

[Voltar ao README](../README.md)

Arquivo: `hoc-derma-stamping-tool.user.js` (versão 3.1.0). Normalmente é carregado pela Suite quando o item **PDF HOC Derma (v3)** está ON na engrenagem; também funciona instalado avulso.

Serve para pegar **qualquer PDF** (laudo, receita, relatório gerado fora do papel timbrado) e aplicar o **cabeçalho e o rodapé oficiais HOC Derma**, ajustando o conteúdo para caber entre eles, e então exportar ou imprimir. Tudo é feito no navegador: o PDF não sai do computador.

## Abrir

- Pílula vermelha **PDF HOC Derma** na barra superior, à esquerda da engrenagem.
- Mesmo botão no cabeçalho do painel **Arquivos do Paciente**, no prontuário.
- Atalho **`Ctrl + Shift + H`** (abre e fecha). `Esc` fecha.

Se o Timbrador ainda não tinha sido baixado, o botão baixa na hora e abre a janela em seguida. Instalado avulso (sem a Suite), ele cria a própria pílula na barra superior; com a Suite presente, não duplica.

## Usar

1. **Carregar o PDF:** escolha o arquivo ou arraste para a janela.
2. **AUTO:** com **Aplicar AUTO ao abrir cada PDF** marcado (padrão), o Timbrador mede onde há conteúdo impresso e ajusta deslocamento e escala para o texto caber exatamente entre a borda de baixo do cabeçalho e a de cima do rodapé. O botão **AUTO** recalcula a qualquer momento.
3. **Conferir a prévia** (folha A4 com os timbres).
4. **Exportar PDF nativo** ou **Imprimir**.

## Ajuste manual

Qualquer ajuste manual desliga o AUTO para aquele arquivo.

- **Mover o conteúdo:** arraste a folha ou use as setas ▲/▼ (ou as setas do teclado). Passo de 1, 5 ou 10 px; `Shift` = 10 px.
- **Topo e Base:** esticam ou encolhem separadamente a metade de cima e a de baixo do conteúdo (0,5 mm por clique; `Shift` = 5 mm). As alças **TOPO** e **BASE** desenhadas na folha fazem o mesmo arrastando.
- **Cabeçalho / Rodapé:** caixas para ligar ou desligar cada timbre.
- **Por documento | Por página:** em *Por documento* (padrão) um único ajuste vale para o arquivo inteiro. Em *Por página*, cada folha tem o seu (o AUTO também encaixa página a página). Troque de página com ◀/▶, `Alt + ↑/↓` ou rolando a prévia.

Os ajustes ficam salvos no `localStorage` do navegador, **por arquivo** (e por página, no modo *Por página*). Reabrir o mesmo PDF traz o ajuste de volta.

## Exportar e imprimir

- **Exportar PDF nativo:** baixa `<nome>_timbrado.pdf`. O PDF é montado com pdf-lib: cada página original entra como objeto vetorial (*Form XObject*) com os timbres desenhados por cima, então o **texto continua selecionável** e a qualidade é a do original.
- **Imprimir:** usa o mesmo PDF nativo. Se isso falhar (PDF protegido por senha, pop-up bloqueado), cai para a impressão rasterizada antiga.
- **Menu ⋯:**
  - **Modo de impressão:** *Automático (recomendado)*, *Sempre nesta janela* ou *Sempre em nova aba*. Use *Sempre nesta janela* se o navegador bloquear pop-ups.
  - **Imprimir em nova aba**.
  - **Diagnóstico:** testa pdf.js, worker, pdf-lib, impressão e pop-up e mostra o que falha (detalhes no console).
  - **Recarregar PDF**.

## Detalhes técnicos

- A interface roda num `<iframe>` da mesma origem; no documento do Feegow só é criado o contêiner `#hocderma-root`. O CSS é aplicado por `adoptedStyleSheets`, sem `<style>` solto na página.
- **Sem dependência de rede:** pdf.js 2.16.105 (e o worker) e pdf-lib 1.17.1 vão embutidos em gzip + base64 e são descompactados com `DecompressionStream`. Só em navegador muito antigo (sem `DecompressionStream`) ou com CSP que proíba workers `blob:` as mesmas versões são baixadas de `cdnjs.cloudflare.com` / `unpkg.com`, sem cookies. Por isso o arquivo tem cerca de 1,3 MB e não usa `@require`.
- A prévia é rasterizada (pdf.js + canvas); a exportação aplica a mesma transformação da prévia no PDF vetorial.
- Chaves no `localStorage`: `hocderma:v3:cfg` (preferências), `hocderma:v3:offsets` (ajustes por arquivo/página) e `hocderma:v3:ui`.
- API de console: `window.HOC_DERMA` (`abrir`, `fechar`, `alternar`, `imprimir`, `diagnostico`, `recarregar`, `auto`, `modoAjuste`, `pagina`, `exportar`, `montarPdf`, `config`, `estado`, entre outros).
- `@grant none`: o script não usa nenhuma permissão especial do Tampermonkey.

## Problemas comuns

- **Pop-up bloqueado ao imprimir:** libere pop-ups para o Feegow ou escolha *Sempre nesta janela* no menu ⋯.
- **O navegador imprimiu a página do Feegow em vez do PDF:** use *⋯ → Imprimir em nova aba*.
- **Conteúdo cortado ou sobre o timbre:** clique em **AUTO**; se o PDF tiver margens irregulares, use *Por página*.
- **PDF com senha:** a exportação nativa não funciona; a impressão usa o modo rasterizado.
