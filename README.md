# Cidade

Protótipo da **Cidade clicável** do ecossistema
[Prepara Portugal](https://github.com/projetoempresaficticia) — item 3
do PRD-08. Inspirado no
[Campus Virtual SEI-SICITE 2021](https://github.com/andresjesse/prototipo-campus-virtual)
da UTFPR: uma cena com pontos clicáveis que abrem informação — só que
aqui a cena é montada por **tiles isométricos**, não uma ilustração
única, para poder crescer lote a lote conforme nascem empresas reais.

- **Aplicação:** https://projetoempresaficticia.github.io/cidade/

## Estado: protótipo de estilo (18 de setembro de 2026)

Isto é um teste da direção visual, a pedido do Germano — ainda **não**
lê a base de dados. Os 8 lotes estão ligados a 8 apps reais do
ecossistema (nome, cor de marca e link verdadeiros), mas escolhidos à
mão em `app.js`, não vindos de `empresas`. Sem RLS, sem RPC, sem
Supabase — HTML/CSS/JS puro, mesmo em produção.

**Por decidir antes da versão a sério:** se cada uma das ~200 empresas
vira um lote automaticamente (mapa que cresce sozinho, lendo
`empresas`) ou se fica um mapa fixo tipo campus (um edifício por
serviço, como o SEI-SICITE). O PRD-08 pede "comprar/arrendar lotes",
que só faz sentido no primeiro caminho.

**Fica limpo para a próxima passagem:**
- A linha de costa é uma borda direta relva/água. O kit tem tiles de
  transição (cantos e arestas curvas), mas a orientação N/S/E/W deles
  não bateu com a nossa grelha na primeira tentativa — a costa comia
  terra a mais. Descartado por agora; afinar isto é só desenho, não
  muda a arquitetura.
- Só 8 lotes, todos fixos. Nada de scroll/zoom/arrastar (a "dica" no
  ecrã é só atmosfera, ainda não é real).

## Os assets

Dois kits isométricos, ambos gratuitos, indicados pelo Germano:

- **Isometric City** (2D, usado aqui) — sprites PNG prontos, chão em
  losango 128×64. Os telhados cinza-ardósia foram recoloridos para
  telha terracota com uma troca de cor exata (não é um filtro de
  matiz — preserva paredes/janelas como estavam), script em
  `ferramentas/` do protótipo original (não incluído neste repo; os
  ficheiros já processados vivem em `web/mapa/`). Duas paredes já
  claras (branco/creme) ficaram como estavam — o kit já dava o tom
  certo. `bld_house_small_brickred_a` manteve o telhado cinza de
  propósito (telhado + parede as duas terracota ficava sem contraste).
- **KayKit City Builder Bits** (3D, CC0, `.gltf` pronto para Three.js)
  — ainda não entrou em nenhuma versão. Fica reservado para se a
  direção 3D de verdade vier a fazer sentido (câmara que roda, etc.).

## Como está montado

| pasta | o que lá está |
|---|---|
| `app.js` | grelha isométrica, os 8 lotes, o cartão popup |
| `web/biblioteca/cidade.css` | tokens de desenho e componentes |
| `web/mapa/` | os sprites de chão/edifícios (recoloridos) |
| `web/atualizar.js` | recarrega a página quando há versão nova |
| `ferramentas/gerar_icones.py` | desenha o favicon (casinha, telha+cal) |
| `ferramentas/versoes.py` | carimba os `?v=` de cada ficheiro local |

Sem `sql/`, sem chamada nenhuma ao Supabase nesta versão.

## Publicar as versões

```
python ferramentas/versoes.py
```
