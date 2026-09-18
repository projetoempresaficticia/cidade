#!/usr/bin/env python3
"""Gera uma torre (estilo Prepacoin) por app, cada uma com a cor de
marca real do PreparaPortal.

Troca por FAIXA DE MATIZ, não por uma lista de tons conhecidos: uma
primeira versão trocava só os 2-3 tons de tijolo mais comuns e deixava
bocados por recolorir (o sprite tem mais variações de sombra do que as
amostradas). Aqui, qualquer pixel cuja matiz original caia na banda
"tijolo" (laranja/creme, ~8-58 graus) e tenha alguma saturação passa a
usar a matiz e saturação da cor da marca, mantendo a SUA luminosidade
original — preserva o relevo e as sombras do sprite pixel a pixel, sem
depender de uma lista.

Fonte: kit "Isometric City" (Buildings/bld_apartments_brickwhite_*.png
e bld_apartments_brickbrown_*.png), duas formas × duas variantes (a/b),
para dar alguma diferença de silhueta às 12 torres.

Uso:
    python ferramentas/gerar_torres.py
    (precisa do kit original em C:\\Users\\devel\\Downloads\\Cidades\\Isometric City —
    só é preciso correr de novo se mudar alguma cor de marca)
"""
import colorsys
import pathlib
from PIL import Image

SRC = pathlib.Path(r"C:\Users\devel\Downloads\Cidades\Isometric City\Buildings")
OUT = pathlib.Path(__file__).resolve().parent.parent / "web" / "mapa"

FAIXA_MATIZ = (8 / 360, 58 / 360)   # banda de tijolo/creme
SATURACAO_MIN = 0.04                 # abaixo disto é cinza/branco/preto -- não é tijolo

# (ficheiro base do kit, ficheiro de saída, cor de marca real)
APPS_TORRE = [
    ("bld_apartments_brickwhite_a.png", "bld_torre_subsight.png",  "#FF7F00"),
    ("bld_apartments_brickwhite_b.png", "bld_torre_prepacoin.png", "#C7D93E"),  # marca é #EBFF78, mas lavava a parede -- versão mais funda
    ("bld_apartments_brickbrown_a.png", "bld_torre_cartorio.png",  "#69B518"),
    ("bld_apartments_brickbrown_b.png", "bld_torre_at.png",        "#5B3F8C"),
    ("bld_apartments_brickwhite_a.png", "bld_torre_segsocial.png", "#F4B400"),
    ("bld_apartments_brickwhite_b.png", "bld_torre_dr.png",        "#69092D"),
    ("bld_apartments_brickbrown_a.png", "bld_torre_emdia.png",     "#536DFE"),
    ("bld_apartments_brickbrown_b.png", "bld_torre_openlab.png",   "#6C3BFF"),
    ("bld_apartments_brickwhite_a.png", "bld_torre_talentos.png",  "#B9433F"),
    ("bld_apartments_brickwhite_b.png", "bld_torre_clientify.png", "#E85002"),
    ("bld_apartments_brickbrown_a.png", "bld_torre_aeromail.png",  "#0F766E"),
    ("bld_apartments_brickbrown_b.png", "bld_torre_pulso.png",     "#1F2747"),
]


def hex_para_hs(hexcor: str):
    hexcor = hexcor.lstrip("#")
    r, g, b = (int(hexcor[i:i + 2], 16) / 255 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h, min(1.0, s * 1.08 + 0.06)  # um pouco mais saturado que a cor plana


def recolorir(ficheiro_base: str, cor: str, destino: pathlib.Path) -> None:
    alvo_h, alvo_s = hex_para_hs(cor)
    im = Image.open(SRC / ficheiro_base).convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if s < SATURACAO_MIN or not (FAIXA_MATIZ[0] <= h <= FAIXA_MATIZ[1]):
                continue
            nr, ng, nb = colorsys.hls_to_rgb(alvo_h, l, alvo_s)
            px[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255), a)
    im.save(destino)


def main() -> None:
    for base, saida, cor in APPS_TORRE:
        recolorir(base, cor, OUT / saida)
        print("recolorido", saida)


if __name__ == "__main__":
    main()
