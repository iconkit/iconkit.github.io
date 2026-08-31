# IconKit: Landing

This repo holds the **marketing landing page** for IconKit (`iconkit.app`). The
first half of this README is the consolidated, code-verified picture of the
whole product (macOS desktop app + Figma plugin) so the landing is built on
accurate facts. The second half is the landing itself: stack, structure, copy
and how to run it.

Source repos (siblings of this folder inside `iconkit-app/`):

| Half | Path | Docs worth reading |
|---|---|---|
| Desktop app (Tauri) | [`../tauri-app`](../tauri-app) | `readme.md`, `CLAUDE.md`, `CHANGELOG.md`, `src/renderer/STYLING_GUIDELINES.md` |
| Figma plugin | [`../figma-plugin`](../figma-plugin) | `readme.md`, `BUILD.md`, `CLAUDE.md` |
| Sample library | [`../Library Files`](../Library%20Files) | a real 648-icon `icons.json` with generated `iconfont/`, `svg/`, `sprite/` |
| Release artifacts | [`../app-builds`](../app-builds) | `IconKit.app.tar.gz`, `latest.json` |

Verified against the code on 2026-08-30. App version **1.0.1** (`tauri.conf.json`,
`package.json`, `Cargo.toml`). Everything under `[Unreleased]` in the app's
`CHANGELOG.md` (the whole Free/Pro paywall, Show Dock Icon, tray Check for
Update) is built but not yet cut as a release. The landing should be written
for the next release, which will include it.

---

## What IconKit is

**IconKit turns Figma components into production icon assets (icon fonts, SVG
files, SVG spritesheets) entirely on your own machine.**

Two halves working as one:

1. **A Figma plugin** (design side). Select an icon component, hit **Add**. It
   extracts the real vector paths, preserves fill rules, and pushes them to your
   icon library. It shows the live library inside Figma with the same grid,
   search and detail sheet as the app.
2. **A macOS desktop app** (build side). Owns the library (`icons.json`),
   normalizes geometry, classifies color, and generates **icon fonts** (with
   COLR/CPAL for multicolor), **per-icon SVGs** and **SVG spritesheets**, each
   with CSS and a demo page. It also manages multiple projects, keeps a
   changelog with a contributions heatmap, publishes to your own server, and
   updates itself.

The two talk over `localhost`. **No cloud, no account, no upload of your artwork
to anyone's server.** The plugin is a thin client; the app does the heavy
lifting. If the app is not running, the plugin shows a "not running" state and
reconnects by itself when it comes back.

### One-sentence pitch

> Design icons in Figma, click Add, and get clean, versioned, export-ready icon
> fonts and spritesheets. Generated locally. Published to your own server.

### Tagline candidates

- From Figma to icon fonts, locally.
- Your icon pipeline, without the pipeline.
- Select. Add. Shipped.
- Icons out of Figma, into production, in one click.

---

## The problem it solves

The usual path from "icon drawn in Figma" to "icon usable in code" is a chore:
export SVGs by hand, run them through IcoMoon or a CLI, fix fill-rule holes,
assign unicodes, write the CSS, redo it all every time an icon changes, and
hope nobody forgets a step. IconKit collapses that loop into one button.

- **Add in Figma, already in the library.** No manual SVG export/import.
- **Geometry is fixed for you.** Paths normalized to a 1024 em box using the
  IcoMoon rule (scale the canvas, never crop the artwork, so designer padding
  survives), `evenodd` holes baked into nonzero winding so rings and cylinders
  survive the icon-font pipeline, non-square glyphs handled proportionally.
- **Glyph identity is automatic.** Unicode / order / id auto-incremented.
  Replacing an icon keeps its codepoint, so consumers never break.
- **Everything regenerates.** Change an icon and the font, SVG and sprite
  outputs rebuild, incrementally and debounced.
- **Local-first.** Your library and artwork stay on your machine; publishing is
  opt-in and points at *your* endpoint.
- **Honest about what it cannot do.** Gradients, masks, clip paths, images,
  filters, live text, non-path shapes and un-outlined strokes are refused with a
  message naming exactly what to flatten or outline, instead of being imported
  mangled.

---

## How a single icon flows through it

```
   Figma component               Figma plugin                    Desktop app (sidecar)
   (child layer "Shape")  ──▶  exportAsync(SVG)            ──▶  POST /simplify-svg  (normalize to 1024 box,
                               scrape <path> + fill rules        classify color, allocate codepoints)
                               report fills / opacities         POST /add-icons      (one write per batch)
                                                                     │
                                                                icons.json + changelog.json updated
                                                                     │  auto-regenerate
                                                                iconfont/  fonts/{eot,svg,ttf,woff,woff2} + style.css + index.html
                                                                svg/       one .svg per icon
                                                                sprite/    sprite.svg + sprite.html
                                                                     │  optional, manual
                                                                Publish FAB → zip → POST to your server
```

1. **Design** an icon as a Figma **component** with a direct child layer named
   `Shape` (a vector, group, frame or boolean operation). Put comma-separated
   search tags in the component's *Description*. The component name becomes
   the icon name.
2. **Select** one or more components. The **Add** FAB appears with a count badge.
3. **Click Add.** Names that already exist trigger a **Replace / Skip** sheet.
   Replace keeps the existing unicode, order and id.
4. The app **normalizes** the geometry, **classifies** color, writes the batch in
   one go, **regenerates** the outputs, and logs the change. Both the app grid
   and the plugin grid show a "being written" sweep on the affected cells.
5. Optionally **publish** the project with one click.

---

## Feature inventory (for the landing)

Grouped by the angle each one sells. Every item below exists in code today.

### Design to asset, in one click
- Add icons straight from a Figma selection; the FAB shows how many.
- Real vector path extraction with fill-rule preservation, not raster.
- Batch adds: one library write, one changelog write, one generation pass.
- Auto unicode / order / id; tags pulled from the component description.
- **Replace / Skip** conflict handling; replace keeps codepoints stable.
- Unsupported constructs refused with a fix-it message.
- Live, in-Figma library browser: grid, search (`⌘F`), detail sheet with
  Copy Icon Name and Delete, project switcher, project settings.
- Live sync over WebSocket: adding from Figma updates the app instantly and
  vice versa.

### Real export formats
- **Icon fonts:** EOT, SVG, TTF, WOFF, WOFF2, with `style.css` and a demo
  `index.html`.
- **Multicolor icons:** COLRv0 + CPAL tables so a color icon renders in full
  color from a single codepoint, plus an IcoMoon-style stacked `-layers` class
  as a fallback. Layer codepoints live in the Private Use Area and are never
  reassigned. Monochrome icons are untouched (byte-identical output).
- **Per-icon SVG files**, non-square widths respected.
- **SVG spritesheet:** `sprite.svg` + demo.
- **Per-project export toggles** (Font / SVG / SVG Sprite). Turning one off
  removes its output so nothing goes stale.
- **Embedded font metadata:** name, designer, manufacturer, URL, copyright,
  version, class prefix, description; em height, baseline %, whitespace %.
- One-click **font kit zip** download.
- SVGO optimization and path simplification on the way in.

### Built for real icon work
- **Multiple projects.** A project is any folder with an `icons.json`. Create,
  open, switch, move, delete (to Trash, recoverable). Missing-folder recovery
  with Remove / Locate.
- **Drag-and-drop SVG import** into the app, with the same Replace / Skip flow.
- **Changelog + contributions heatmap.** Every add / update / delete is logged
  per project; a GitHub-style 53-week heatmap and a version/date grouped
  Added / Updated / Deleted list.
- **Publish to your own server.** Zips the project and POSTs it to your
  endpoint with a bearer token. Content-hash detection shows the Publish FAB
  only when something changed. Manual, never automatic. Desktop notification
  on success or failure.
- Animated project status line: `664 Icons • 2 days ago`, `Adding icons…`,
  `Generating assets…`, `Publishing…`, `Published`.

### Local-first and native
- **No cloud, no account.** Runs on your machine. Publishing targets your
  server. Licensing is offline too (see Pro).
- **Tauri app** (native macOS WebView + Rust shell). Migrated from Electron:
  about **148 MB** installed vs about 274 MB before, no bundled Chromium.
- **Menu-bar icon** with a live status dot for the Figma service; click toggles
  the window. Optional **Show Dock Icon** so it can live in the menu bar only.
- OS light/dark theme via shared design tokens; the plugin follows Figma's theme.
- **Figma Plugin Service** toggle to pause plugin sync without quitting
  (the plugin reads a 503 and shows the paused state).
- **Auto-update** via `tauri-plugin-updater`, signed payloads, one Software
  Update row in Settings (`Check` / `Update` / `Restart`).
- Keyboard-first grid: arrows, Home / End, Enter, Esc; `⌘F` for search.

### Free and Pro (shipping in the next release)
One binary for everyone, gated by an **offline, Ed25519-signed license key**.
No license server, no account.

| | Free | Pro |
|---|---|---|
| Icons per library | 12 | Unlimited |
| Projects | 1 | Unlimited |
| Export options | Font, SVG, Sprite | All export options |
| Changelog and version history | Locked | Included |
| Price | Free | **$19.99, one payment, no subscription** |

- Checkout URL baked into the app: `https://iconkit.app/pro` (placeholder until
  the payment provider is live). That is not our domain, and the landing does
  not serve a `/pro` route.
- Key format `IK1.<payload>.<signature>`, pasted into Settings → IconKit Pro →
  License Key → **Activate**. Verified offline against a public key baked into
  the app. Deactivate forgets the key on that Mac only; the key stays valid.
- Caps are on library **size**, so replacing or deleting at the cap always
  works. Partial batches land what fits and report the rest honestly.
- The Figma plugin cannot take payment; it shows the cap and points at the app.

---

## Exact copy already in the product (reuse, do not contradict)

| Where | String |
|---|---|
| Plugin FAB | `Add` (+ count badge) |
| Conflict sheet | `Replace 3 existing icons?` · `Skip` · `Replace` |
| Search placeholder | `Search icons by name, tags...` |
| Server down (plugin) | `IconKit app is not running.` / `or the Figma service is switched off.` · `Refresh` |
| Unsupported artwork | `Failed to process "name": unsupported: gradients or patterns, masks. Flatten or outline these in Figma first.` |
| Upgrade sheet | `IconKit Pro` · `One payment. No Subscription.` · `Get Pro $19.99` |
| Free cap notice | `You've used all 12 free icons.` `Upgrade for unlimited.` |
| Changelog wall | `Changelog and version history are part of IconKit Pro.` |
| Software Update | `Version X is the latest version` · `Version X is available` · `Downloading... N%` |
| Publish | `Publish succeeded` · `Publish failed` · `No publish endpoint configured` |
| Empty state | `Add more icons` / `Drag & drop or select files to upload` |
| Welcome | `Create or add a project` · `Open Project` · `Create New` |

---

## How the two halves connect (technical)

The app runs a local **HTTP + WebSocket server** on a **dynamic port**: it
prefers **3000** and walks up to **3019**. The plugin probes that range for
`GET /api/iconkit → { app: "iconkit" }`, caches the winner, and re-discovers
on failure. Library changes broadcast `refresh-icons`; project changes
broadcast `projects-changed`; license activation broadcasts `license-changed`,
so the app and the plugin unlock together without a reload.

```
┌── Figma ─────────────────────────┐        ┌── macOS desktop ─────────────────────┐
│  code.js (sandbox)               │  HTTP  │  Tauri (Rust host)                    │
│   • selection → Add FAB          │   +    │   • tray, theme, folder picker, Trash │
│   • exportAsync(SVG) → paths     │  WS    │   • updater, spawns the sidecar       │
│  ui.html (React, one file)       │ ◀────▶ │  Node sidecar (SEA binary)            │
│   • grid / search / settings     │ :3000  │   • Express + WebSocket               │
│   • figmaBridge (server fetch)   │ ..3019 │   • icons.json, normalize, classify   │
└──────────────────────────────────┘        │   • fonts (COLR), svg, sprite         │
                                             │   • projects, changelog, publish      │
                                             │   • licensing (Ed25519, offline)      │
                                             └───────────────────────────────────────┘
```

### Tech stack
- **Plugin UI and app renderer:** React 19 with a shared in-house component set
  (Button, IconButton, InputField, Switch, Menu, IconGrid, FloatingSheet,
  ProjectBar, Fab, Tag, StatusText) driven by shared **design tokens**
  (`design-tokens.json`). Brand blue `#009bff`, neutrals from `#fdfdfd` to
  `#0a0a0a`.
- **Plugin sandbox:** plain JS (`code.js`), UI built to a single `ui.html`
  (about 280 KB) with Webpack + Babel.
- **Desktop shell:** Tauri 2 (Rust). Node backend ships as a Single Executable
  Application sidecar (Node 24).
- **Generation libs:** `fantasticon`, `ttf2woff2`, `svg-sprite`,
  `@resvg/resvg-js`, `svgo`, `fonteditor-core`, `svg-path-bbox`, plus in-house
  `evenodd-to-nonzero.js`, `icon-layers.js`, `colr.js`.

### What a Figma component must look like
A selected node is accepted only when it is a **`COMPONENT`** with a **direct
child layer named `Shape`** of type `VECTOR`, `GROUP`, `FRAME` or
`BOOLEAN_OPERATION`. Component **name** → icon name. Component **description**
(comma-separated) → search tags. Anything else gets a precise rejection toast
and the batch is skipped.

---

## Key facts sheet (for copywriting)

| | |
|---|---|
| Product | **IconKit**: Figma plugin + macOS desktop app |
| Version | 1.0.1 shipped; Free/Pro and dock/tray additions in `[Unreleased]` |
| Core value | One-click Figma → versioned, export-ready icon fonts and spritesheets |
| Export formats | EOT, SVG, TTF, WOFF, WOFF2 fonts (COLR/CPAL color) · per-icon SVG · SVG sprite · CSS + demos · zip |
| Privacy stance | Local-first; no cloud, no account; publish only to your own server; license verified offline |
| Platform | macOS (Apple Silicon), about 148 MB `.app`, Tauri 2; Figma plugin (design files) |
| Pricing | Free (12 icons, 1 project) · Pro $19.99 one-time (unlimited, changelog) |
| Standout features | auto codepoints, fill-rule fix, multicolor COLR fonts, multi-project, changelog heatmap, live sync, replace/skip, self-hosted publish, auto-update |
| Audience | Figma designers, front-end developers, design-system and icon teams |
| Links | Releases `https://github.com/icon-kit/IconKit/releases` · Issues `https://github.com/icon-kit/IconKit/issues` · Checkout `https://iconkit.app/pro` |
| Do not claim | Windows/Linux builds · plugin-side generation · the `✨ Cleanup` command (stub) · color previews in the grids (they show silhouettes; exports are correct) |

---

## The landing page

### Reference and direction

Modeled on [`../../web-landings/aside-com`](../../web-landings/aside-com), a
verbatim mirror of aside.com. What we borrow is the **structure and rhythm**,
not the assets or copy:

- White page, one 1320px column with hairline vertical rules on both sides and
  hairline horizontal rules between sections.
- Sticky top nav: wordmark left, centered links, one pill CTA right.
- Hero: small pill badge, a two-line display headline, one primary CTA
  (`Download for macOS`), then a large product shot bleeding into the next
  section on a soft blue gradient.
- "Introducing" section: eyebrow link on the left, two short paragraphs on the
  right (problem, then product).
- Blue eyebrow labels with a chevron above each section headline.
- An icon-grid showcase (aside shows app logos; we show real icons from the
  sample library rendered as live inline SVG).
- Three-up feature cards with a bold lead-in and one sentence.
- A comparison bar chart (aside: benchmarks; us: download size Electron vs
  Tauri, or "steps to ship an icon" before vs after).
- Deep-dive rows with a headline, a paragraph, a `Learn more` link and a visual.
- A closing two-line headline plus CTA, then a dense multi-column footer.
- Assets are taken **verbatim from the aside mirror** (Pooya's call): the
  hero sky `background.webp` (`site/assets/img/hero-bg.webp`), the closing
  `bg-banner.png`, all 12 woff2 files (`site/assets/fonts/`) and the 15
  `@font-face` blocks copied into `site/fonts.css` with paths rewritten.
  Headlines use `displayFont` (AsideDisplay Variable) at weight 450, tracking
  -0.01em, exactly as aside's `h1`; body is Geist, code is Geist Mono.
- Caveat before going public: AsideDisplay is aside.com's proprietary face and
  the sky imagery is theirs. Geist and Geist Mono are OFL. Swap the display
  font and background for licensed or original ones before launch.
- App icon is `../tauri-app/src-tauri/icons/icon.png` (the shipped one), not
  `../tauri-app/build/app-icon.png`, which is an old May design.

### Stack

No framework. Static files in `site/`, served by `server.js` in dev, deployable
to any static host (Vercel, Netlify, GitHub Pages).

```
web-landing/
  README.md          this file
  package.json       npm run dev
  server.js          static dev server with port fallback (3100+)
  site/
    index.html       the page (hero card with nav inside, then the ruled column)
    fonts.css        aside's @font-face blocks, verbatim, paths rewritten
    styles.css       tokens + layout + components
    main.js          nav state, icon grid, download button, small motion
    assets/
      fonts/         AsideDisplay Variable + Geist + Geist Mono woff2 (from aside)
      img/           app-icon.png (shipped icon), plugin-icon.png, plugin-screenshot.png,
                     hero-bg.webp and bg-banner.png (from aside)
      icons/         46 real icons from the sample library (1024 viewBox)
```

```bash
npm run dev     # serves site/ on http://127.0.0.1:3100 (steps to the next free port)
```

### Section plan and copy

1. **Nav**: IconKit · Features · How it works · Pricing · Changelog · `Download`.
2. **Hero**: badge `macOS · Figma plugin · v1.0.1`; headline *Icons out of
   Figma. Into production. One click.*; sub: *IconKit turns Figma components
   into icon fonts, SVGs and spritesheets, generated on your Mac and published
   to your own server.*; CTA `Download for macOS` + `Get the Figma plugin`;
   product shot: the plugin screenshot beside the app.
3. **Introducing**: the problem paragraph and the product paragraph from above.
4. **One click** (icon grid): *Select a component. Hit Add. Done.* Real icons
   from the sample library, then three cards: Real vectors / Automatic
   codepoints / Replace without breaking.
5. **Exports**: *Every format your codebase asks for.* Formats list, color
   fonts callout, per-project toggles, font kit zip.
6. **Chart**: install size, Electron 274 MB vs Tauri 148 MB.
7. **Workflow rows**: Multiple projects · Changelog and heatmap · Publish to
   your own server · Live sync between Figma and the app.
8. **Local-first**: four cards: No cloud, no account / Offline license /
   Your server, your token / Menu bar native.
9. **Pricing**: Free vs Pro table from this README; `Get Pro $19.99`.
10. **Closing**: *Built for designers and the developers who ship their icons.*
    CTA `Download for macOS`.
11. **Footer**: Product (Download, Figma plugin, Changelog, Releases) · Learn
    (How it works, Component rules, Exports) · Support (Report an issue,
    License key help) · Legal (Terms, Privacy) · © 2026 IconKit.

### Open items before publishing
- Real app screenshots (index page with project bar, changelog heatmap,
  settings with Pro row). Only the plugin screenshot exists today.
- Payment provider and a real checkout URL, then repoint the Get Pro button
  (it currently falls back to the releases page).
- Download link: currently the GitHub releases page; switch to a direct
  `IconKit.app.tar.gz` once notarized.
- Terms and Privacy pages.
- OG image and favicon set derived from `assets/img/app-icon.png`.

---

## Releases in this repo

This repository also hosts release builds and tags for the IconKit desktop app.
Each release corresponds to a tagged build of the main IconKit app; the packaged
`.app`/`.dmg` artifacts are attached to their GitHub Releases. Tags follow
`vMAJOR.MINOR.PATCH` and are published from the app build pipeline.
