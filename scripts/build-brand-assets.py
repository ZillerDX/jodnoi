"""
Builds brand assets from public/mascot.svg (the single source of truth for the mascot art):

  public/icon-any.svg        round badge with the full mascot holding her notepad ("any" icon, favicon, boot screen)
  public/avatar.svg          round badge, face + shoulders only (in-app header avatar)
  public/icon-maskable.svg   flat full-bleed background, artwork inside the Android safe zone ("maskable" icon, apple-touch)
  public/favicon.svg         copy of icon-any.svg
  src/components/mascotBust.ts   bust + mini poses used by <MiniMascot />

Then render PNGs (needs network the first time for npx):
  cd public
  npx --yes sharp-cli -i icon-any.svg -o icon-192.png resize 192 192
  npx --yes sharp-cli -i icon-any.svg -o icon-512.png resize 512 512
  npx --yes sharp-cli -i icon-maskable.svg -o icon-maskable-512.png resize 512 512
  npx --yes sharp-cli -i icon-maskable.svg -o icon-180.png resize 180 180

Run: python scripts/build-brand-assets.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')

src = open(os.path.join(PUB, 'mascot.svg'), encoding='utf-8').read()
# Bust = back hair .. gold hair clip (everything before the notice board group).
start = src.index('<path d="M108 195')
end = src.index('<g transform="rotate(-4')
bust = src[start:end].strip()

# ---------------------------------------------------------------- icons
GRADIENT = (
    '<radialGradient id="bg" cx="50%" cy="36%" r="78%">'
    '<stop offset="0" stop-color="#faf8ff"/><stop offset="1" stop-color="#d7cdf9"/></radialGradient>'
)


def star(cx, cy, r, fill='#fbd857'):
    k = r * 0.16
    return (
        f'<path d="M{cx} {cy - r} Q{cx + k} {cy - k} {cx + r} {cy} Q{cx + k} {cy + k} {cx} {cy + r} '
        f'Q{cx - k} {cy + k} {cx - r} {cy} Q{cx - k} {cy - k} {cx} {cy - r} Z" fill="{fill}"/>'
    )


# Full mascot (bust + notice board + pencil + hands) = everything after the circle/sparkles in mascot.svg.
rest = src[end:src.index('</svg>')].strip()
# The torso in mascot.svg stops at y=400; extend it so it bleeds off the bottom of the icon.
torso_extension = (
    '<rect x="96" y="396" width="188" height="150" fill="#6fa8dc"/>'
    '<path d="M96 396 V546 M284 396 V546" fill="none" stroke="#2a2147" stroke-width="3"/>'
)
full = bust + torso_extension + rest


def sparkles(positions):
    return ''.join(
        star(x, y, r) for x, y, r in positions
    ) + '<circle cx="92" cy="268" r="7" fill="#7fa8d9"/><circle cx="424" cy="226" r="7" fill="#dc5f6b"/>'


# App icon: the whole mascot holding her notepad. Scale 1.12 keeps head + board inside the
# Android maskable safe zone (circle of radius ~205 around the centre); torso bleeds off the bottom.
icon_art = (
    f'<g transform="translate(43.2 -9) scale(1.12)">{full}</g>'
    + sparkles([(98, 168, 20), (420, 138, 26)])
)
# Avatar (in-app header): face + shoulders only, bigger and crisper at small sizes.
avatar_art = (
    f'<g transform="translate(-38.5 -23.8) scale(1.55)">{bust}</g>'
    + sparkles([(112, 168, 22), (404, 138, 28)])
)

TITLE = '<title>Jodnoi</title>'
HEAD = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'


def round_badge(art):
    return (
        f'{HEAD}{TITLE}<defs>{GRADIENT}<clipPath id="c"><circle cx="256" cy="256" r="244"/></clipPath></defs>'
        f'<circle cx="256" cy="256" r="244" fill="url(#bg)"/><g clip-path="url(#c)">{art}</g></svg>\n'
    )


# Maskable: flat white, identical to manifest background_color. Android draws the launch splash itself
# (icon on a white square) and ignores our colours for that frame, so white makes it blend in.
maskable = f'{HEAD}{TITLE}<rect width="512" height="512" fill="#ffffff"/>{icon_art}</svg>\n'
any_icon = round_badge(icon_art)
avatar = round_badge(avatar_art)
for name, text in (
    ('icon-maskable.svg', maskable),
    ('icon-any.svg', any_icon),
    ('favicon.svg', any_icon),
    ('avatar.svg', avatar),
):
    open(os.path.join(PUB, name), 'w', encoding='utf-8').write(text)

# ---------------------------------------------------------------- mini poses (original mascot coordinates)
SKIN = '#ffe3d3'
OUT = '#2a2147'
SLEEVE = '#6fa8dc'


def arm(d, w=26):
    return (
        f'<path d="{d}" fill="none" stroke="{OUT}" stroke-width="{w}" stroke-linecap="round"/>'
        f'<path d="{d}" fill="none" stroke="{SLEEVE}" stroke-width="{w - 7}" stroke-linecap="round"/>'
    )


def hand(cx, cy, r=16):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{SKIN}" stroke="{OUT}" stroke-width="3"/>'


poses = {
    # fist in the air + lightning bolt: "fast"
    'fast': (
        arm('M270 356 Q316 322 312 262')
        + hand(312, 246, 18)
        + f'<path d="M80 124 L44 198 H70 L52 262 L102 174 H76 L96 124 Z" fill="#fbd857" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
    ),
    # holding a phone with a crossed-out wifi symbol: "offline"
    'offline': (
        f'<rect x="150" y="316" width="80" height="110" rx="13" fill="{OUT}"/>'
        '<rect x="158" y="326" width="64" height="88" rx="8" fill="#dfeaff"/>'
        f'<path d="M168 354 Q190 334 212 354" fill="none" stroke="{OUT}" stroke-width="5" stroke-linecap="round"/>'
        f'<path d="M176 367 Q190 355 204 367" fill="none" stroke="{OUT}" stroke-width="5" stroke-linecap="round"/>'
        f'<circle cx="190" cy="381" r="4.5" fill="{OUT}"/>'
        '<path d="M166 338 L212 396" stroke="#e8566b" stroke-width="7" stroke-linecap="round"/>'
        + hand(146, 376, 15)
        + hand(234, 376, 15)
    ),
    # arms crossed in an X: "no sign-up, no ads"
    'free': (
        arm('M112 336 L268 398', 28)
        + arm('M268 336 L112 398', 28)
    ),
}

ts = (
    '// GENERATED by scripts/build-brand-assets.py from public/mascot.svg. Do not edit by hand.\n'
    '// Original mascot coordinates (viewBox ~ 30 80 310 330 shows the bust + a pose).\n'
    f'export const BUST = `{bust}`\n\n'
    'export const POSES = {\n'
    + ''.join(f'  {name}: `{markup}`,\n' for name, markup in poses.items())
    + '} as const\n\nexport type Pose = keyof typeof POSES\n'
)
open(os.path.join(ROOT, 'src', 'components', 'mascotBust.ts'), 'w', encoding='utf-8').write(ts)

# preview sheet for eyeballing the three poses (not shipped)
preview_dir = os.environ.get('PREVIEW_DIR')
if preview_dir:
    cells = ''
    for i, name in enumerate(poses):
        cells += (
            f'<g transform="translate({i * 330} 0)"><rect x="0" y="0" width="320" height="330" rx="40" fill="#e8e4fb"/>'
            f'<svg x="0" y="0" width="320" height="330" viewBox="30 80 310 330">{bust}{poses[name]}</svg></g>'
        )
    sheet = f'<svg xmlns="http://www.w3.org/2000/svg" width="990" height="330" viewBox="0 0 990 330">{cells}</svg>'
    open(os.path.join(preview_dir, 'poses.svg'), 'w', encoding='utf-8').write(sheet)
print('assets written')
