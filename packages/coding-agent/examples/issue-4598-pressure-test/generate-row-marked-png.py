from pathlib import Path
import struct
import zlib

WIDTH = 390
HEIGHT = 2400
STEP = 100
OUT = Path(__file__).with_name("tall-390x2400.png")

FONT = {
    "0": ["111","101","101","101","111"],
    "1": ["010","110","010","010","111"],
    "2": ["111","001","111","100","111"],
    "3": ["111","001","111","001","111"],
    "4": ["101","101","111","001","001"],
    "5": ["111","100","111","001","111"],
    "6": ["111","100","111","101","111"],
    "7": ["111","001","001","001","001"],
    "8": ["111","101","111","101","111"],
    "9": ["111","101","111","001","111"],
    "p": ["110","101","110","100","100"],
    "x": ["101","101","010","101","101"],
    "y": ["101","101","111","001","111"],
    "=": ["000","111","000","111","000"],
    "-": ["000","000","111","000","000"],
    " ": ["000","000","000","000","000"],
}

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (235, 235, 235)
RED = (220, 40, 40)
BLUE = (40, 90, 220)
GREEN = (20, 140, 70)

pixels = [[WHITE for _ in range(WIDTH)] for _ in range(HEIGHT)]


def set_px(x: int, y: int, color):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        pixels[y][x] = color


def fill_rect(x0: int, y0: int, w: int, h: int, color):
    for y in range(y0, min(y0 + h, HEIGHT)):
        row = pixels[y]
        for x in range(x0, min(x0 + w, WIDTH)):
            row[x] = color


def draw_char(ch: str, x: int, y: int, scale: int = 4, color=BLACK):
    pattern = FONT[ch]
    for py, row in enumerate(pattern):
        for px, bit in enumerate(row):
            if bit == "1":
                fill_rect(x + px * scale, y + py * scale, scale, scale, color)


def draw_text(text: str, x: int, y: int, scale: int = 4, color=BLACK):
    cursor = x
    for ch in text:
        draw_char(ch, cursor, y, scale, color)
        cursor += (4 if ch == " " else 4) * scale


for y in range(0, HEIGHT, STEP):
    band_color = GRAY if (y // STEP) % 2 == 0 else WHITE
    fill_rect(0, y, WIDTH, STEP, band_color)
    for x in range(WIDTH):
        set_px(x, y, BLACK)
    label = f"y={y}px"
    draw_text(label, 14, y + 12, scale=5, color=BLUE)
    draw_text(label, 14, y + 52, scale=5, color=GREEN)
    fill_rect(0, y + STEP - 6, WIDTH, 6, RED)

fill_rect(0, HEIGHT - 8, WIDTH, 8, BLACK)
draw_text(f"y={HEIGHT}px", 14, HEIGHT - 42, scale=5, color=RED)

raw = bytearray()
for row in pixels:
    raw.append(0)
    for r, g, b in row:
        raw.extend((r, g, b))


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

png = bytearray(b"\x89PNG\r\n\x1a\n")
png.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", WIDTH, HEIGHT, 8, 2, 0, 0, 0)))
png.extend(chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
png.extend(chunk(b"IEND", b""))
OUT.write_bytes(png)
print(OUT)
