# Roman Numerals

React (JSX) SPA for Roman numeral conversion and practice. Entry UI: `src/components/RomanNumerals.jsx`.

**Live site:** [https://content-interactives.github.io/roman_numerals/](https://content-interactives.github.io/roman_numerals/)

`package.json` may set `homepage` to a fork; asset URLs follow `base` in Vite config.

---

## Stack

| Layer | Notes |
|--------|--------|
| Build | Vite 4, `@vitejs/plugin-react` |
| UI | React 18 |
| Styling | Tailwind CSS 3 |
| Icons | `lucide-react` |
| Deploy | `gh-pages -d dist` (`predeploy` → `vite build`) |

---

## Layout

```
vite.config.js          # base: '/roman_numerals/'
src/
  main.jsx → App.jsx → components/RomanNumerals.jsx
  components/ui/...
```

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview `dist/` |
| `npm run lint` | ESLint |
| `npm run deploy` | Build + publish to GitHub Pages |

---

## Configuration

Keep `base` in `vite.config.js` aligned with the GitHub Pages path you deploy under (`/roman_numerals/` for the Content-Interactives org layout).
