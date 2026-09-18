#!/usr/bin/env python3
"""Gera a paleta genérica de torres que as empresas escolhem ao
reclamar um lote — mesma técnica de faixa de matiz do gerar_torres.py,
mas com cores neutras (não ligadas a nenhum app do ecossistema).

Uso:
    python ferramentas/gerar_paleta.py
    (precisa do kit original em C:\\Users\\devel\\Downloads\\Cidades\\Isometric City)
"""
import colorsys
import pathlib
from PIL import Image

SRC = pathlib.Path(r"C:\Users\devel\Downloads\Cidades\Isometric City\Buildings")
OUT = pathlib.Path(__file__).resolve().parent.parent / "web" / "mapa"

FAIXA_MATIZ = (8 / 360, 58 / 360)
SATURACAO_MIN = 0.04

# chave -> (ficheiro base do kit, cor)
PALETA = {
    "coral":    ("bld_apartments_brickwhite_a.png", "#FF6B6B"),
    "turquesa": ("bld_apartments_brickwhite_b.png", "#14B8A6"),
    "violeta":  ("bld_apartments_brickbrown_a.png", "#8B5CF6"),
    "dourado":  ("bld_apartments_brickbrown_b.png", "#D4A017"),
    "verde":    ("bld_apartments_brickwhite_a.png", "#22C55E"),
    "azul":     ("bld_apartments_brickwhite_b.png", "#3B82F6"),
    "rosa":     ("bld_apartments_brickbrown_a.png", "#EC4899"),
    "grafite":  ("bld_apartments_brickbrown_b.png", "#64748B"),
}


def hex_para_hs(hexcor: str):
    hexcor = hexcor.lstrip("#")
    r, g, b = (int(hexcor[i:i + 2], 16) / 255 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h, min(1.0, s * 1.08 + 0.06)


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
    for chave, (base, cor) in PALETA.items():
        destino = OUT / f"bld_torre_paleta_{chave}.png"
        recolorir(base, cor, destino)
        print("recolorido", destino.name)


if __name__ == "__main__":
    main()
