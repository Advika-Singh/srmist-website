"""WCAG 2.x contrast ratios for the colour pairs used in the stylesheet."""
import sys

def parse(c):
    c = c.lstrip('#')
    if len(c) == 3: c = ''.join(ch * 2 for ch in c)
    r, g, b = (int(c[i:i + 2], 16) for i in (0, 2, 4))
    a = int(c[6:8], 16) / 255 if len(c) == 8 else 1.0
    return r, g, b, a

def over(fg, bg):
    r, g, b, a = parse(fg); br, bgc, bb, _ = parse(bg)
    return (r * a + br * (1 - a), g * a + bgc * (1 - a), b * a + bb * (1 - a))

def lum(rgb):
    def f(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def ratio(fg, bg):
    l1, l2 = lum(over(fg, bg)), lum(parse(bg)[:3])
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)

PAPER, WHITE, BLUE, INK, LAV, LIME, GOLD = '#f3f1e9', '#ffffff', '#084b9b', '#171814', '#dcd5ff', '#d8f14c', '#f2c84b'
pairs = [
    # (label, fg, bg)
    ('muted text #777971 on paper', '#777971', PAPER),
    ('muted text #777971 on white', '#777971', WHITE),
    ('placeholder #92928c on paper', '#92928c', PAPER),
    ('index numbers #96968f on paper', '#96968f', PAPER),
    ('body grey #61625e on paper', '#61625e', PAPER),
    ('body grey #696a65 on white', '#696a65', WHITE),
    ('body grey #676862 on paper', '#676862', PAPER),
    ('body grey #686963 on paper', '#686963', PAPER),
    ('body grey #666762 on white', '#666762', WHITE),
    ('#555650 on paper', '#555650', PAPER),
    ('#5b5966 on lavender', '#5b5966', LAV),
    ('#6f6b82 on lavender', '#6f6b82', LAV),
    ('#92938e on paper (progress, disclaimer)', '#92938e', PAPER),
    ('#767772 on white', '#767772', WHITE),
    ('#777872 on white', '#777872', WHITE),
    ('white 72% on blue', '#ffffffb8', BLUE),
    ('white 62% on blue', '#ffffff9e', BLUE),
    ('white 65% on blue', '#ffffffa6', BLUE),
    ('white 55% on blue (opacity .55)', '#ffffff8c', BLUE),
    ('white 45% on ink', '#ffffff73', INK),
    ('white 50% on ink', '#ffffff80', INK),
    ('white 72% on ink', '#ffffffb8', INK),
    ('gold on blue', GOLD, BLUE),
    ('blue on paper', BLUE, PAPER),
    ('blue on lime', BLUE, LIME),
    ('ink on gold', INK, GOLD),
    ('white on blue', WHITE, BLUE),
    ('#d1dcf0 on ink (old strip)', '#ffffffd9', INK),
    ('#ffffff70 text on blue-dark', '#ffffff70', BLUE),
]
fails = 0
for label, fg, bg in pairs:
    r = ratio(fg, bg)
    flag = 'ok ' if r >= 4.5 else 'FAIL'
    fails += r < 4.5
    print(f'{flag}  {r:5.2f}:1  {label}')
print('\nfailing pairs:', fails)

# candidate replacements
print('\nCandidates:')
for c, bg in [('#5d5e57', PAPER), ('#5d5e57', WHITE), ('#5d5e57', LAV), ('#6a6b65', PAPER), ('#55565a', LAV)]:
    print(f'  {c} on {bg}: {ratio(c, bg):.2f}:1')
for a in ['d9', 'e0', 'cc', 'bf', 'c7', 'd1']:
    print(f'  white {a} on blue: {ratio("#ffffff" + a, BLUE):.2f}:1')
