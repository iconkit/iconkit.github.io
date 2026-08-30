# CLAUDE.md

Marketing landing for IconKit (`https://iconkit.github.io/`). `README.md` is the product fact
sheet (verified against `../tauri-app` and `../figma-plugin` code) plus the
section plan; read it before changing copy, and do not claim anything it lists
under "Do not claim".

## Run

```bash
npm run dev     # serves site/ at http://127.0.0.1:3100 (steps up if taken)
```

No framework, no build. `site/` is the deployable document root. `server.js`
only serves files; it checks both IP stacks before binding because the IconKit
sidecar squats on `[::]:3000`.

## Deploy

This repo exists to be the org GitHub Pages site. Because it is named
`iconkit.github.io`, Pages serves it at the **root** `https://iconkit.github.io/`,
not under a project path. GitHub Pages builds `site/` via
`.github/workflows/pages.yml` on every push to `main`. `site/.nojekyll` keeps
Jekyll off the font filenames.

Every path in the HTML and CSS is root-absolute (`/assets/...`, `/styles.css`,
`/pro`), so the site only works when served from a domain root. That is exactly
why the landing lives here and not in `iconkit/IconKit`, where it would sit
under `/IconKit/` and every asset would 404.

There is **no custom domain and no `site/CNAME`**. `iconkit.app` is owned by
someone else and already serves an unrelated product, so it must never be set
as the custom domain. A `CNAME` file placed in `site/` would be re-applied as
the custom domain by the Pages deploy on every run, so do not add one.

The landing was copied from the `iconkit/web-landing` repo, which is archived,
by way of `iconkit/IconKit`, which keeps only the release-hosting role.

## Rules

- No em dashes or spaced en dashes anywhere (copy, comments, README).
- Colors come from the app's tokens (`:root` in `site/styles.css`, brand
  `#009bff`). Reuse the exact product strings in README's "Exact copy" table.
- Icons in `site/assets/icons/` are real glyphs from `../Library Files/svg`
  (1024 viewBox, `fill: currentColor`). The list rendered is `ICONS` in
  `site/main.js`; add the file and the name together.
- Hero assets (sky background, AsideDisplay font, Geist woff2s, banner) are
  verbatim copies from `../../web-landings/aside-com`. Pooya asked for exactly
  those; do not replace them with approximations or Google Fonts.
- The app icon is `../tauri-app/src-tauri/icons/icon.png`. Never use
  `../tauri-app/build/app-icon.png` (old design).
- `/pro` must keep existing. The desktop app's Get Pro button still opens
  `https://iconkit.app/pro`, which is not our domain, so that button points at
  a stranger's site until the app is changed to open
  `https://iconkit.github.io/pro` or a domain we actually own.
- Verify visually: `npm run dev`, then headless Chrome
  `--screenshot --window-size=1440,5200` on the printed URL.
