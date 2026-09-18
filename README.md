# Cidade

A **Cidade clicável** do ecossistema
[Prepara Portugal](https://github.com/projetoempresaficticia) — item 3
do PRD-08. Inspirado no
[Campus Virtual SEI-SICITE 2021](https://github.com/andresjesse/prototipo-campus-virtual)
da UTFPR: uma cena com pontos clicáveis que abrem informação — só que
aqui a cena é montada por **tiles isométricos**, não uma ilustração
única, para poder crescer lote a lote conforme nascem empresas reais.

- **Aplicação:** https://projetoempresaficticia.github.io/cidade/

## Dois tipos de lote

1. **Os 13 apps do ecossistema** (ClassCard, Prepacoin, ...) — a "baixa
   institucional", duas fileiras fixas em `app.js` (nome, cor de marca
   e link verdadeiros, mas não vêm de `empresas` — são os apps em si,
   não empresas simuladas).
2. **Empresas reais** — um bairro novo (fileira mais a sul), onde
   qualquer empresa com sessão de gerente reclama um lote livre,
   escolhe o tipo/cor do prédio, e define foto, link, rede social. O
   e-mail mostrado vem de `empresas.email_empresa`, já existente — não
   é um campo novo. Guardado em `cidade_lotes` (`sql/001_lotes.sql`),
   um lote por empresa (`unique(empresa_cedula)`), um lote por posição
   (`unique(linha,coluna)`).

## A quadra institucional agora é uma grelha a sério

Pedido do Germano, com uma imagem de referência (cidade isométrica
densa, ruas a cruzar-se em quadras): a "baixa" deixou de ser um bloco
único e virou duas quadras (7 apps a poente, 6 a nascente) separadas
por uma **rua vertical de verdade** na coluna 9, com cruzamento
(`tile_road_xsing`) nos dois pontos onde cruza as ruas horizontais.
Também ganhou: pracinha com canteiro de flores em frente à igreja,
árvores/candeeiros mais densos, carros e pessoas a passear
(`Characters/` do kit, nunca usada até agora).

**Lição real ao colocar as pessoas:** uma torre de ~220px de altura
tem a caixa (bounding box) alta o suficiente para cobrir umas 5 linhas
da grelha PARA CIMA da sua própria linha — uma torre na linha 6
alcança visualmente quase até à linha 1. Isto significa que nenhuma
das fileiras-tampão perto do núcleo (3, 5) está livre do alcance de
alguma torre vizinha (nem sempre a mais óbvia — apanhei pessoas
"penduradas no telhado" de prédios que, pela conta ingénua de
linha+coluna, pareciam estar longe). Regra que ficou provada por
testar (`document.elementFromPoint` a perguntar o que está por baixo
de cada decoração, não a olhar só para o screenshot): uma torre só
alcança PARA CIMA da sua própria linha, nunca para baixo — por isso a
linha imediatamente a SUL de uma fileira de prédios está sempre livre,
e é aí que fica toda a decoração nova.

## O que já dá para fazer

- **Arrastar** o mapa (clicar e segurar, ou toque no telemóvel) —
  `pointerdown`/`pointermove`/`pointerup` em `.cena`, sem biblioteca
  nenhuma. Um limiar de 6px distingue arrastar de clique, para não
  abrir um cartão por engano a meio do gesto.
- **Entrar** (mesma sessão de sempre no ecossistema) e **Adicionar o
  meu prédio**: escolhe o tipo numa paleta de 8 cores genéricas
  (`ferramentas/gerar_paleta.py`), sobe uma foto (bucket `cidade`,
  mesmo desenho do bucket `avatares` do ClassCard, mas com a pasta
  pela cédula da empresa em vez do `auth.uid()` da pessoa), e clica
  num lote livre no mapa (a piscar) para escolher onde fica.
  - **Nota de UX:** o `<dialog>` do formulário é modal — bloqueia
    cliques no que está por baixo. Por isso a escolha da posição
    acontece *antes* de o formulário abrir (o botão só ativa o modo
    de escolha no mapa; clicar numa marca livre é que abre o
    formulário, já com a posição definida). Editar um lote existente
    salta direto para o formulário, porque a posição não muda.
- **Cartão popup em dois formatos** — apps do ecossistema (nome,
  descrição, cor, link) e empresas reais (foto, e-mail com nota "via
  AeroMail", link, rede social, botão "Editar" só para o dono).

## A costa

Tentativa anterior tinha uma borda reta porque a orientação N/S/E/W
dos tiles de transição do kit não bateu com a nossa convenção de
grelha. Desta vez testámos isolado antes de integrar (água numa
fileira/coluna INTEIRA, não só 1 vizinho — um teste com 1 vizinho só
dá um resultado ambíguo, foi o que enganou da primeira vez): mapeámos
os 4 lados retos e os 4 cantos diagonais comparando visualmente qual
liga sem falha com a água fixa. Mapeamento confirmado:

| direção nossa | ficheiro do kit |
|---|---|
| N (linha -1) | `wateredge_E` |
| S (linha +1) | `wateredge_W` |
| W (coluna -1) | `wateredge_S` |
| E (coluna +1) | `wateredge_N` |
| canto NW | `water_SE` |
| canto NE | `water_NE` |
| canto SE | `water_NW` |
| canto SW | `water_SW` |

Os 4 cantos: só o NW foi testado a sério (água a -linha e -coluna ao
mesmo tempo); os outros três saíram por reflexão do padrão confirmado
nos lados retos (dá para conferir/corrigir visualmente se algum
canto não ficar bem, é uma troca de um nome de ficheiro).

## Os assets

Dois kits isométricos, ambos gratuitos, indicados pelo Germano:

- **Isometric City** (2D, usado aqui) — sprites PNG prontos, chão em
  losango 128×64. As torres partem de `bld_apartments_brickwhite_*` e
  `bld_apartments_brickbrown_*` e são recoloridas por **faixa de
  matiz** — qualquer pixel de tijolo (matiz ~8-58°, alguma saturação)
  passa a usar a matiz/saturação da cor alvo, preservando a
  luminosidade original do pixel (mantém sombras e relevo). Scripts:
  `ferramentas/gerar_torres.py` (13 apps) e `gerar_paleta.py` (8 cores
  genéricas para as empresas escolherem).
- **KayKit City Builder Bits** (3D, CC0, `.gltf` pronto para Three.js)
  — ainda não entrou em nenhuma versão. Fica reservado para se a
  direção 3D de verdade vier a fazer sentido (câmara que roda, etc.).

## Como está montado

| pasta | o que lá está |
|---|---|
| `app.js` | grelha isométrica, os 13 lotes fixos, os lotes de empresas, arrastar, login, formulário, cartão popup |
| `web/biblioteca/cidade.css` | tokens de desenho e componentes |
| `web/mapa/` | os sprites de chão/edifícios (recoloridos) |
| `web/atualizar.js` | recarrega a página quando há versão nova |
| `sql/001_lotes.sql` | tabela `cidade_lotes`, RPCs, bucket `cidade` |
| `ferramentas/gerar_icones.py` | desenha o favicon (casinha, telha+cal) |
| `ferramentas/gerar_torres.py` | recolore as 12 torres institucionais |
| `ferramentas/gerar_paleta.py` | recolore as 8 torres genéricas da paleta |
| `ferramentas/versoes.py` | carimba os `?v=` de cada ficheiro local |

## Por decidir/fazer a seguir

- Hoje o bairro novo tem 7 lotes reserváveis (fileira única). Dá para
  esticar facilmente (`RESERVAVEIS` em `app.js`), mas a decisão maior
  do PRD-08 continua em aberto: crescer o array à mão, ou ler
  `empresas` e criar um lote automático para cada empresa nova?
- Sem paginação/zoom — para ~200 empresas a grelha vai ficar grande;
  arrastar ajuda mas não resolve sozinho.
- Painel do Docente/Auditoria e Mapa da Cidade completo (compra/
  arrendamento de verdade) são os itens 2 e 3 do PRD-08 que ainda não
  começaram.

## Publicar as versões

```
python ferramentas/versoes.py
```
