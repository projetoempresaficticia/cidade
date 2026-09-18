#!/usr/bin/env python3
"""Desenha o glifo da Cidade (uma casinha isométrica simples, telhado em
telha sobre parede caiada) e exporta os tamanhos de favicon/apple-touch-
icon. Desenho original, na mesma paleta dos sprites recoloridos do mapa
(ver README) — não depende de nenhum ficheiro externo.

Uso:
    python ferramentas/gerar_icones.py
"""

import pathlib
from PIL import Image, ImageDraw

RAIZ = pathlib.Path(__file__).resolve().parent.parent

TELHA = (198, 94, 54, 255)
PAREDE = (251, 246, 236, 255)
TINTA = (27, 36, 48, 255)


def desenhar(tam: int) -> Image.Image:
    escala = 8
    S = tam * escala
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    margem = S * 0.12
    largura = S - 2 * margem
    topo_parede = S * 0.46
    base = S - margem

    # parede
    d.rounded_rectangle([margem, topo_parede, S - margem, base], radius=S * 0.05, fill=PAREDE, outline=TINTA, width=int(S * 0.035))
    # telhado (triângulo)
    beiral = S * 0.06
    d.polygon(
        [(margem - beiral, topo_parede), (S / 2, S * 0.10), (S - margem + beiral, topo_parede)],
        fill=TELHA, outline=TINTA, width=0,
    )
    d.line([(margem - beiral, topo_parede), (S / 2, S * 0.10)], fill=TINTA, width=int(S * 0.035), joint='curve')
    d.line([(S / 2, S * 0.10), (S - margem + beiral, topo_parede)], fill=TINTA, width=int(S * 0.035), joint='curve')
    # porta
    pw = largura * 0.22
    d.rounded_rectangle([S / 2 - pw / 2, base - largura * 0.42, S / 2 + pw / 2, base], radius=S * 0.03, fill=TINTA)

    return img.resize((tam, tam), Image.LANCZOS)


def main() -> None:
    desenhar(32).save(RAIZ / 'favicon-32.png')
    desenhar(180).save(RAIZ / 'apple-touch-icon.png')
    desenhar(48).save(RAIZ / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print('Ícones gerados: favicon-32.png, apple-touch-icon.png, favicon.ico')


if __name__ == '__main__':
    main()
