#!/usr/bin/env python3
"""
Nodium — brand artwork generator
Generates the monochrome SVG cover art used for product/category imagery.
Run:  python3 tools/make_art.py   (outputs to assets/images/cat/*.svg)

These are pure-vector, on-brand (black & white) images so the catalog can grow
without any photo shoots. Each category gets 2 variants used alternately
as product covers.
"""
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "images", "cat")

W, H = 1200, 900

def svg_doc(body, seed=""):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-hidden="true">
  <defs>
    <radialGradient id="glow" cx="50%" cy="38%" r="70%">
      <stop offset="0%" stop-color="#1d1d1d"/>
      <stop offset="55%" stop-color="#101010"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </radialGradient>
    <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>
  {body}
  <rect width="{W}" height="{H}" fill="url(#vg)"/>
</svg>'''

def lines(x, y, n, w=170, gap=34, sw=3, c="#9c9c9c"):
    out = []
    for i in range(n):
        yy = y + i * gap
        out.append(f'<line x1="{x}" y1="{yy}" x2="{x + w}" y2="{yy}" stroke="{c}" stroke-width="{sw}" stroke-linecap="round"/>')
    return "\n  ".join(out)

def rrect(x, y, w, h, r=18, fill="#1a1a1a", stroke="#2e2e2e", sw=2, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'

# ---------------------------------------------------------------- ebook-1 : stacked pages
def ebook_1():
    b = []
    for i, (ox, oy, hh) in enumerate([(320, 300, 300), (380, 330, 300), (440, 360, 300)]):
        b.append(rrect(ox, oy, 440, hh, r=14, fill="#131313", stroke="#2e2e2e"))
    b.append(rrect(440, 360, 440, 300, r=14, fill="#171717", stroke="#e5e5e5", sw=3))
    b.append(lines(520, 430, 4, 220, 40, sw=5, c="#e5e5e5"))
    b.append(lines(520, 620, 3, 140, 34, sw=5, c="#4a4a4a"))
    # emblem diamond
    cx, cy = 850, 430
    b.append(f'<rect x="{cx-26}" y="{cy-26}" width="52" height="52" rx="8" transform="rotate(45 {cx} {cy})" fill="none" stroke="#ffffff" stroke-width="4"/>')
    b.append(f'<rect x="{cx-10}" y="{cy-10}" width="20" height="20" rx="4" transform="rotate(45 {cx} {cy})" fill="#ffffff"/>')
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- ebook-2 : open book
def ebook_2():
    b = []
    b.append('<polygon points="600,270 1050,380 1050,660 600,550" fill="#151515" stroke="#2e2e2e" stroke-width="3"/>')
    b.append('<polygon points="600,270 150,380 150,660 600,550" fill="#121212" stroke="#2e2e2e" stroke-width="3"/>')
    b.append('<line x1="600" y1="270" x2="600" y2="550" stroke="#e5e5e5" stroke-width="4"/>')
    # text lines right page
    for i in range(5):
        y = 420 + i * 42
        b.append(f'<line x1="660" y1="{y}" x2="990" y2="{y+44}" stroke="#9c9c9c" stroke-width="6" stroke-linecap="round"/>')
    # text lines left page
    for i in range(5):
        y = 420 + i * 42
        b.append(f'<line x1="540" y1="{y}" x2="210" y2="{y+44}" stroke="#6b6b6b" stroke-width="6" stroke-linecap="round"/>')
    # bookmark ribbon
    b.append('<rect x="586" y="258" width="12" height="150" fill="#ffffff"/>')
    b.append('<polygon points="586,408 592,388 598,408" fill="#ffffff"/>')
    # soft shadow under book
    b.append('<ellipse cx="600" cy="700" rx="430" ry="36" fill="#000000" opacity="0.55"/>')
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- spreadsheet-1 : data table
def spreadsheet_1():
    b = []
    x0, y0, w, h = 230, 210, 520, 480
    b.append(rrect(x0, y0, w, h, r=14, fill="#101010", stroke="#2e2e2e", sw=3))
    # header row
    b.append(f'<rect x="{x0}" y="{y0}" width="{w}" height="64" rx="14" fill="#1a1a1a"/>')
    b.append(f'<rect x="{x0}" y="{y0+56}" width="{w}" height="8" fill="#2e2e2e"/>')
    cols = 6
    for i in range(cols + 1):
        x = x0 + i * (w / cols)
        b.append(f'<line x1="{x:.0f}" y1="{y0+64}" x2="{x:.0f}" y2="{y0+h}" stroke="#1f1f1f" stroke-width="3"/>')
    for i in range(1, 7):
        y = y0 + 64 + i * (h - 64) / 7
        b.append(f'<line x1="{x0}" y1="{y:.0f}" x2="{x0+w}" y2="{y:.0f}" stroke="#1f1f1f" stroke-width="3"/>')
    # highlighted column
    cx = x0 + 3 * (w / cols)
    b.append(f'<rect x="{cx:.0f}" y="{y0+64}" width="{w/cols:.0f}" height="{h-64}" fill="#ffffff" opacity="0.05"/>')
    for i in range(7):
        y = y0 + 104 + i * (h - 104) / 6
        b.append(f'<line x1="{cx+22:.0f}" y1="{y:.0f}" x2="{cx+w/cols-22:.0f}" y2="{y:.0f}" stroke="#e5e5e5" stroke-width="5" stroke-linecap="round"/>')
    # bar chart card
    bx, by, bw, bh = 830, 330, 200, 300
    b.append(rrect(bx, by, bw, bh, r=14, fill="#141414", stroke="#2e2e2e"))
    b.append(lines(bx + 30, by + 40, 1, 120, 0, sw=8, c="#4a4a4a"))
    bars = [70, 130, 100, 170, 150, 210]
    for i, bhv in enumerate(bars):
        x = bx + 30 + i * 26
        b.append(f'<rect x="{x}" y="{by+bh-50-bhv}" width="14" height="{bhv}" rx="4" fill="{"#ffffff" if i == 3 else "#2e2e2e"}"/>')
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- spreadsheet-2 : analytics dashboard
def spreadsheet_2():
    b = []
    x0, y0, w, h = 230, 260, 560, 380
    b.append(rrect(x0, y0, w, h, r=16, fill="#101010", stroke="#2e2e2e", sw=3))
    b.append(lines(x0 + 40, y0 + 44, 1, 130, 0, sw=9, c="#4a4a4a"))
    pts = [(x0 + 50, y0 + 300), (x0 + 150, y0 + 240), (x0 + 250, y0 + 260),
           (x0 + 350, y0 + 170), (x0 + 450, y0 + 200), (x0 + 520, y0 + 90)]
    pol = " ".join(f"{px},{py}" for px, py in pts)
    b.append(f'<polyline points="{pol}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>')
    b.append(f'<polygon points="{x0+50},{y0+330} {pol} {x0+520},{y0+330}" fill="#ffffff" opacity="0.05"/>')
    for i, (px, py) in enumerate(pts):
        b.append(f'<circle cx="{px}" cy="{py}" r="{10 if i == len(pts)-1 else 7}" fill="{"#0a0a0a" if i < len(pts)-1 else "#0a0a0a"}" stroke="#ffffff" stroke-width="4"/>')
    # stat cards
    for i, (cx0, cy0) in enumerate([(840, 300), (840, 420), (840, 540)]):
        b.append(rrect(cx0, cy0, 200, 92, r=14, fill="#151515", stroke="#2e2e2e"))
        b.append(lines(cx0 + 24, cy0 + 30, 1, 90, 0, sw=8, c="#e5e5e5"))
        b.append(lines(cx0 + 24, cy0 + 60, 1, 60, 0, sw=6, c="#4a4a4a"))
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- ai-tools-1 : neural network
def ai_tools_1():
    b = []
    nodes = [(600, 350, 26), (400, 260, 14), (800, 250, 14), (330, 480, 14), (520, 560, 18),
             (760, 540, 14), (900, 430, 14), (620, 680, 14), (260, 360, 10), (980, 330, 10),
             (430, 160, 10), (820, 150, 10)]
    edges = [(0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (4, 7), (5, 7), (3, 8), (6, 9), (1, 10), (2, 11), (4, 10)]
    for a, c in edges:
        x1, y1 = nodes[a][0], nodes[a][1]
        x2, y2 = nodes[c][0], nodes[c][1]
        b.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#3a3a3a" stroke-width="3"/>')
    for x, y, r in nodes:
        b.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#1a1a1a" stroke="#9c9c9c" stroke-width="3"/>')
    cx, cy, r = nodes[0][0], nodes[0][1], nodes[0][2]
    for rr in (44, 66, 92):
        b.append(f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="none" stroke="#4a4a4a" stroke-width="2" stroke-dasharray="2 10"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="{r-8}" fill="#ffffff"/>')
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- ai-tools-2 : orbit / core
def ai_tools_2():
    b = []
    for i in range(0, 1100, 44):
        b.append(f'<line x1="{i}" y1="0" x2="{i}" y2="900" stroke="#ffffff" stroke-opacity="0.03" stroke-width="2"/>')
    for i in range(0, 900, 44):
        b.append(f'<line x1="0" y1="{i}" x2="1200" y2="{i}" stroke="#ffffff" stroke-opacity="0.03" stroke-width="2"/>')
    cx, cy = 600, 430
    b.append(f'<circle cx="{cx}" cy="{cy}" r="200" fill="none" stroke="#2e2e2e" stroke-width="3"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="120" fill="none" stroke="#3a3a3a" stroke-width="2" stroke-dasharray="4 12"/>')
    b.append(f'<ellipse cx="{cx}" cy="{cy}" rx="260" ry="90" fill="none" stroke="#9c9c9c" stroke-width="3" transform="rotate(-24 {cx} {cy})"/>')
    b.append(f'<circle cx="{cx+238}" cy="{cy-95}" r="16" fill="#0a0a0a" stroke="#e5e5e5" stroke-width="4"/>')
    b.append(f'<circle cx="{cx-238}" cy="{cy+95}" r="12" fill="#0a0a0a" stroke="#9c9c9c" stroke-width="3"/>')
    b.append(f'<rect x="{cx-46}" y="{cy-46}" width="92" height="92" rx="18" transform="rotate(45 {cx} {cy})" fill="#ffffff"/>')
    b.append(f'<rect x="{cx-16}" y="{cy-16}" width="32" height="32" rx="7" transform="rotate(45 {cx} {cy})" fill="#0a0a0a"/>')
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- n8n-1 : workflow nodes
def n8n_1():
    b = []
    ys = [300, 470, 640]
    for i, y in enumerate(ys):
        b.append(rrect(280, y, 260, 90, r=20, fill="#151515", stroke="#e5e5e5" if i == 0 else "#2e2e2e", sw=3 if i == 0 else 2))
        b.append(lines(320, y + 32, 2, 100, 24, sw=7, c="#9c9c9c" if i == 0 else "#4a4a4a"))
    # connectors
    b.append('<line x1="410" y1="390" x2="410" y2="470" stroke="#e5e5e5" stroke-width="4"/>')
    b.append('<polygon points="410,480 400,462 420,462" fill="#e5e5e5"/>')
    b.append('<line x1="410" y1="560" x2="410" y2="640" stroke="#4a4a4a" stroke-width="4"/>')
    b.append('<polygon points="410,650 400,632 420,632" fill="#4a4a4a"/>')
    # branch nodes right
    b.append(rrect(700, 330, 200, 70, r=16, fill="#121212", stroke="#2e2e2e"))
    b.append(rrect(700, 420, 200, 70, r=16, fill="#121212", stroke="#2e2e2e"))
    b.append('<line x1="540" y1="345" x2="700" y2="365" stroke="#4a4a4a" stroke-width="3"/>')
    b.append('<line x1="540" y1="345" x2="700" y2="455" stroke="#4a4a4a" stroke-width="3"/>')
    b.append(lines(730, 356, 1, 90, 0, sw=7, c="#6b6b6b"))
    b.append(lines(730, 446, 1, 90, 0, sw=7, c="#6b6b6b"))
    # end node
    b.append(rrect(960, 370, 60, 60, r=30, fill="#ffffff"))
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- n8n-2 : pipeline
def n8n_2():
    b = []
    xs = [340, 600, 860]
    for i, x in enumerate(xs):
        b.append(f'<circle cx="{x}" cy="{260 + i*70}" r="34" fill="#151515" stroke="{"#ffffff" if i == 2 else "#3a3a3a"}" stroke-width="4"/>')
        b.append(f'<circle cx="{x}" cy="{260 + i*70}" r="12" fill="{"#ffffff" if i == 2 else "#2e2e2e"}"/>')
    b.append('<line x1="374" y1="330" x2="566" y2="400" stroke="#4a4a4a" stroke-width="4"/>')
    b.append('<line x1="634" y1="400" x2="826" y2="330" stroke="#4a4a4a" stroke-width="4"/>')
    # vertical spine
    b.append('<line x1="600" y1="170" x2="600" y2="690" stroke="#2e2e2e" stroke-width="3" stroke-dasharray="2 14"/>')
    b.append(f'<circle cx="600" cy="170" r="14" fill="none" stroke="#9c9c9c" stroke-width="3"/>')
    b.append(f'<circle cx="600" cy="690" r="14" fill="none" stroke="#9c9c9c" stroke-width="3"/>')
    # side cards
    b.append(rrect(180, 520, 220, 90, r=16, fill="#121212", stroke="#2e2e2e"))
    b.append(rrect(800, 520, 220, 90, r=16, fill="#121212", stroke="#2e2e2e"))
    b.append('<line x1="400" y1="560" x2="560" y2="600" stroke="#4a4a4a" stroke-width="3"/>')
    b.append('<line x1="800" y1="560" x2="640" y2="600" stroke="#4a4a4a" stroke-width="3"/>')
    b.append(lines(210, 548, 1, 100, 0, sw=7, c="#6b6b6b"))
    b.append(lines(830, 548, 1, 100, 0, sw=7, c="#6b6b6b"))
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- prompts-1 : terminal
def prompts_1():
    b = []
    x, y, w, h = 300, 240, 600, 420
    b.append(rrect(x, y, w, h, r=18, fill="#0e0e0e", stroke="#2e2e2e", sw=3))
    b.append(f'<rect x="{x}" y="{y}" width="{w}" height="58" rx="18" fill="#161616"/>')
    b.append(f'<rect x="{x}" y="{y+44}" width="{w}" height="14" fill="#161616"/>')
    for i, dx in enumerate((10, 10, 10)):
        b.append(f'<circle cx="{x + 30 + i*30}" cy="{y + 29}" r="7" fill="#2e2e2e"/>')
    b.append(f'<rect x="{x + w - 70}" y="{y + 20}" width="40" height="18" rx="4" fill="#1a1a1a"/>')
    prompts = [
        (70, "#e5e5e5", 300), (70, "#e5e5e5", 220), (70, "#9c9c9c", 340),
        (70, "#9c9c9c", 150), (70, "#e5e5e5", 280), (70, "#4a4a4a", 400),
    ]
    for i, (px, c, wl) in enumerate(prompts):
        yy = y + 110 + i * 46
        b.append(f'<text x="{x+px}" y="{yy}" font-family="monospace" font-size="30" fill="#ffffff">$</text>')
        b.append(f'<line x1="{x+px+26}" y1="{yy}" x2="{x+px+26+wl}" y2="{yy}" stroke="{c}" stroke-width="7" stroke-linecap="round"/>')
    b.append(f'<rect x="{x+96}" y="{y+110+5*46-16}" width="16" height="34" fill="#ffffff"/>')
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- prompts-2 : chat + prompt cards
def prompts_2():
    b = []
    # chat window
    b.append(rrect(300, 220, 600, 300, r=20, fill="#101010", stroke="#2e2e2e", sw=3))
    b.append(f'<rect x="300" y="220" width="600" height="58" rx="20" fill="#161616"/>')
    b.append(f'<rect x="300" y="262" width="600" height="16" fill="#161616"/>')
    b.append(f'<circle cx="330" cy="249" r="9" fill="#e5e5e5"/>')
    b.append(lines(356, 240, 1, 130, 0, sw=8, c="#4a4a4a"))
    # outgoing bubble
    b.append(rrect(600, 310, 250, 84, r=16, fill="#ffffff"))
    b.append(lines(624, 334, 2, 150, 26, sw=6, c="#0a0a0a"))
    # incoming bubble
    b.append(rrect(350, 430, 260, 70, r=16, fill="#1a1a1a", stroke="#2e2e2e"))
    b.append(lines(374, 452, 2, 170, 24, sw=6, c="#e5e5e5"))
    # input bar
    b.append(rrect(300, 560, 600, 64, r=16, fill="#0e0e0e", stroke="#2e2e2e"))
    b.append(f'<circle cx="870" cy="592" r="18" fill="#ffffff"/>')
    b.append(f'<polygon points="870,582 882,592 870,602" fill="#0a0a0a"/>')
    # prompt pack cards
    for i, (cx0, cy0) in enumerate([(380, 680), (600, 680), (820, 680)]):
        b.append(rrect(cx0, cy0, 200, 64, r=14, fill="#141414", stroke="#2e2e2e"))
        b.append(f'<rect x="{cx0+18}" y="{cy0+18}" width="28" height="28" rx="6" fill="{"#ffffff" if i == 1 else "#2e2e2e"}"/>')
        b.append(lines(cx0 + 60, cy0 + 26, 1, 90, 0, sw=6, c="#9c9c9c"))
        b.append(lines(cx0 + 60, cy0 + 46, 1, 60, 0, sw=6, c="#4a4a4a"))
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- automation-1 : gears
def automation_1():
    b = []
    def gear(cx, cy, r, teeth, rot, sw=4, c="#9c9c9c"):
        out = []
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#141414" stroke="{c}" stroke-width="{sw}"/>')
        outer = r + teeth
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{outer}" fill="none" stroke="{c}" stroke-width="10" stroke-dasharray="10 14" transform="rotate({rot} {cx} {cy})"/>')
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.42}" fill="none" stroke="{c}" stroke-width="{sw}"/>')
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.18}" fill="{c}"/>')
        return out
    b += gear(430, 430, 110, 26, 12)
    b += gear(680, 560, 150, 32, 20, c="#e5e5e5")
    b += gear(880, 380, 80, 20, 30, c="#4a4a4a")
    # connector arms
    b.append('<line x1="540" y1="430" x2="620" y2="520" stroke="#3a3a3a" stroke-width="5"/>')
    b.append('<line x1="750" y1="610" x2="860" y2="460" stroke="#3a3a3a" stroke-width="5"/>')
    # small nodes
    b.append(f'<circle cx="240" cy="620" r="10" fill="#0a0a0a" stroke="#9c9c9c" stroke-width="3"/>')
    b.append(f'<circle cx="1000" cy="640" r="10" fill="#0a0a0a" stroke="#9c9c9c" stroke-width="3"/>')
    b.append('<line x1="240" y1="620" x2="430" y2="500" stroke="#3a3a3a" stroke-width="3"/>')
    return svg_doc("\n  ".join(b))

# ---------------------------------------------------------------- automation-2 : pipeline of cubes
def automation_2():
    b = []
    b.append(f'<rect x="120" y="520" width="960" height="8" rx="4" fill="#2e2e2e"/>')
    cubes = [220, 380, 540, 700, 860]
    for i, x in enumerate(cubes):
        b.append(f'<rect x="{x}" y="{460 if i % 2 == 0 else 440}" width="72" height="72" rx="12" fill="{"#ffffff" if i == 3 else "#1a1a1a"}" stroke="{"#ffffff" if i == 3 else "#4a4a4a"}" stroke-width="3"/>')
    # robot arm
    b.append(f'<rect x="980" y="260" width="120" height="120" rx="16" fill="#161616" stroke="#2e2e2e" stroke-width="3"/>')
    b.append(f'<circle cx="1040" cy="320" r="30" fill="#0a0a0a" stroke="#e5e5e5" stroke-width="4"/>')
    b.append('<line x1="1040" y1="350" x2="1040" y2="470" stroke="#e5e5e5" stroke-width="6"/>')
    b.append('<polygon points="1040,470 1028,500 1052,500" fill="#e5e5e5"/>')
    # arrows
    b.append('<polygon points="600,520 585,500 615,500" fill="#3a3a3a"/>')
    b.append('<polygon points="600,528 585,548 615,548" fill="#3a3a3a"/>')
    # status dots
    for i, x in enumerate([160, 1040]):
        b.append(f'<circle cx="{x}" cy="{430 if i == 0 else 200}" r="12" fill="none" stroke="#9c9c9c" stroke-width="3"/>')
    return svg_doc("\n  ".join(b))

ART = {
    "ebook-1": ebook_1, "ebook-2": ebook_2,
    "spreadsheets-1": spreadsheet_1, "spreadsheets-2": spreadsheet_2,
    "ai-tools-1": ai_tools_1, "ai-tools-2": ai_tools_2,
    "n8n-1": n8n_1, "n8n-2": n8n_2,
    "ai-prompt-packs-1": prompts_1, "ai-prompt-packs-2": prompts_2,
    "automation-kits-1": automation_1, "automation-kits-2": automation_2,
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in ART.items():
        path = os.path.join(OUT, f"{name}.svg")
        with open(path, "w") as f:
            f.write(fn())
        print("wrote", path)
