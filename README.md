# Portfolio

React + Three.js (via React Three Fiber) portfolio with a 3D card carousel.

```bash
npm install
npm run dev        # http://localhost:5173
npm run dev:phone  # same, but reachable from other devices on your network
npm run build      # outputs to dist/
```

## Deploying

Live at **https://sravankalle.github.io**. Every push to `main` builds and publishes
the site via `.github/workflows/deploy.yml` (repo Settings → Pages → Source must be
"GitHub Actions"). Check progress under the repo's **Actions** tab.

## Editing content

Everything lives in `src/data/portfolio.js` — name, tagline, links, and the
carousel items (projects, experience, education, stack), including each card's
`icon`. To add a résumé link, put the PDF at `public/resume.pdf` and uncomment the
Résumé entry in `profile.links`.

## Where things are

| File | What it does |
| --- | --- |
| `src/components/Carousel.jsx` | The 3D scene: ring layout, cards, drag, lighting, colours (`palettes`) |
| `src/components/Icons.jsx` | The 3D icon on each card (built from three.js primitives) |
| `src/components/DetailPanel.jsx` | Details panel (with the square-by-square build animation) shown when you click the front card |
| `src/App.jsx` | Page layout, filters, keyboard controls |
| `src/styles.css` | All styling; colour tokens at the top |

Controls: drag, ← / → keys, arrow buttons, or click a card (click the front card for details).
