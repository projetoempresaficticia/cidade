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
lê a base de dados. Os 13 lotes cobrem os 13 apps reais do ecossistema
(nome, cor de marca e link verdadeiros), escolhidos à mão em `app.js`,
não vindos de `empresas`. Sem RLS, sem RPC, sem Supabase — HTML/CSS/JS
puro, mesmo em produção.

Cada lote é uma **torre** (estilo do edifício do Prepacoin, não a
casinha pequena da primeira versão), numa cor derivada da cor de marca
real de cada app — ver `ferramentas/gerar_torres.py`. `#mapa` centra-se
sozinho pelo conteúdo real (regista a caixa mínima/máxima de tudo o
que coloca), não por uma percentagem fixa escolhida à mão — continua
correto mesmo que a cidade cresça e deixe de ser simétrica.

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
- As torres vizinhas sobrepõem-se um pouco nas bordas (dá um ar de
  quarteirão denso, mas não foi um efeito buscado de propósito — é
  consequência de as caixas delimitadoras dos sprites serem mais
  largas do que o passo da grelha). Se ficar a incomodar, é só afastar
  os `colocarPredio(...)` mais uns pixels.
- 13 lotes, todos fixos. Nada de scroll/zoom/arrastar (a "dica" no
  ecrã é só atmosfera, ainda não é real).

## Os assets

Dois kits isométricos, ambos gratuitos, indicados pelo Germano:

- **Isometric City** (2D, usado aqui) — sprites PNG prontos, chão em
  losango 128×64. As 12 torres (tudo menos a igreja, que fica como
  marco/landmark) partem de `bld_apartments_brickwhite_*` e
  `bld_apartments_brickbrown_*` e são recoloridas por **faixa de
  matiz** — qualquer pixel de tijolo (matiz ~8-58°, alguma saturação)
  passa a usar a matiz/saturação da cor de marca real do app,
  preservando a luminosidade original do pixel (mantém sombras e
  relevo). Script: `ferramentas/gerar_torres.py`. A primeira versão
  desta ideia recolorida trocava só 2-3 tons conhecidos e deixava
  bocados de tijolo por trocar — a faixa de matiz resolveu isso de
  vez, sem precisar de amostrar cada sombra à mão.
- **KayKit City Builder Bits** (3D, CC0, `.gltf` pronto para Three.js)
  — ainda não entrou em nenhuma versão. Fica reservado para se a
  direção 3D de verdade vier a fazer sentido (câmara que roda, etc.).

## Como está montado

| pasta | o que lá está |
|---|---|
| `app.js` | grelha isométrica, os 13 lotes, o cartão popup |
| `web/biblioteca/cidade.css` | tokens de desenho e componentes |
| `web/mapa/` | os sprites de chão/edifícios (recoloridos) |
| `web/atualizar.js` | recarrega a página quando há versão nova |
| `ferramentas/gerar_icones.py` | desenha o favicon (casinha, telha+cal) |
| `ferramentas/gerar_torres.py` | recolore as 12 torres para a cor de marca de cada app |
| `ferramentas/versoes.py` | carimba os `?v=` de cada ficheiro local |

Sem `sql/`, sem chamada nenhuma ao Supabase nesta versão.

## Publicar as versões

```
python ferramentas/versoes.py
```
