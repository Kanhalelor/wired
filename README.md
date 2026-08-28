# SignSight Pitch Deck (Prezi-style, Wired Technologies)

A self-contained, zoomable/pannable HTML presentation — 8 slides, no
build tools, no dependencies. Pure CSS transform "zoom toward a point"
engine in `script.js`.

## Files
```
pitch-presentation/
├── index.html   (8 slides: Intro, Problem, Solution, Market,
│                 Challenge/Impact, Competitive Advantage, Team, Ask)
├── style.css
├── script.js    (zoom/pan + keyboard/click/swipe navigation)
└── README.md
```

## Before you present
Search `index.html` for `[ ... ]` placeholders and fill them in:
- Your name / team role (Slide 1)
- Prototype URL or QR code (Slide 3)
- Team member names/roles (Slide 7)
- Contact email/handle (Slide 8)

## Run locally
This one has no ES modules, so you can just double-click `index.html`,
or serve it the same way as the prototype:
```bash
cd pitch-presentation
python3 -m http.server 5501
```
Open http://localhost:5501

## Controls
- → / space / Page Down: next slide
- ← / Page Up: previous slide
- Click left half of screen: previous · right half: next
- Swipe left/right on touch devices
- Home / End: jump to first / last slide

## Deploy free on Netlify
1. https://app.netlify.com/drop
2. Drag the `pitch-presentation` folder in — live instantly.

## Deploy free on Vercel
```bash
npm i -g vercel
cd pitch-presentation
vercel --prod
```

## Presenting tip
Press F11 (or your browser's fullscreen shortcut) before you start —
the zoom transitions read much better full-bleed than in a browser
window with visible chrome.
