# UI Redesign Guide

How to migrate a page to the new dark design system. The
**Organization Dashboard** (`src/routes/OrganizationDashboard.tsx`) is the
reference implementation — read it alongside this doc, then apply the same
patterns to the page you're migrating.

Goal: keep the dark identity, but add **depth, hierarchy, and purposeful
accent** instead of flat white-on-gray. Same general look, less boring.

---

## 1. Token layer (the foundation)

All colors now come from CSS variables defined once in `index.html` (`:root`).
**Never hardcode `gray-*` / `white` again** — use tokens via Tailwind arbitrary
values (e.g. `text-[var(--text)]`). This is also what makes light mode possible
later (a second value set under a scope — see §7).

| Token | Use |
|-------|-----|
| `--bg` | Page background (deepest). Set on the app shell. |
| `--card` | Card / panel surface (via `.surface-card`). |
| `--card-2` | Inner wells, progress tracks, table row hover. |
| `--card-3` | Highest raised surface / muted fills. |
| `--border` | Default hairline border. |
| `--border-strong` | Emphasis / hover border. |
| `--text` | Primary text + titles. |
| `--text-muted` | Secondary text, body copy. |
| `--text-faint` | Labels, captions, hints, empty states. |
| `--accent` | Theme accent (follows `--color-primary-*`). |
| `--accent-bright` | Accent text/icons on dark. |
| `--accent-soft` | Tinted accent fill (chips, pills, hover). |
| `--accent-line` | Tinted accent border. |
| `--ok` / `--ok-soft` | Success / ready (green). |
| `--warn` / `--warn-soft` | Caution / in-progress (amber). |
| `--bad` / `--bad-soft` | Risk / vacant (red). |
| `--info` / `--info-soft` | Informational / selected (blue). |

### Migration cheat sheet (find → replace)

| Old (hardcoded) | New (token) |
|-----------------|-------------|
| `bg-gray-900` (page) | `bg-[var(--bg)]` |
| `bg-gray-800/40` + `border border-gray-800` (card) | `.surface-card` class |
| `text-white` | `text-[var(--text)]` |
| `text-gray-300` | `text-[var(--text-muted)]` |
| `text-gray-400` / `text-gray-500` | `text-[var(--text-muted)]` or `text-[var(--text-faint)]` |
| `border-gray-800` | `border-[var(--border)]` |
| `bg-gray-800` (progress track) | `bg-[var(--card-2)]` |
| `text-green-400` / `text-red-400` | `text-[var(--ok)]` / `text-[var(--bad)]` |

---

## 2. Cards: `.surface-card`

Every panel uses the `.surface-card` class (defined in `index.html`): token
fill + hairline border + subtle top highlight + depth shadow. Pair it with
token utilities for padding/text. Don't reinvent card chrome inline.

```tsx
<div className="surface-card p-5"> … </div>
```

---

## 3. Reusable building blocks

These live at the top of `OrganizationDashboard.tsx`. When a second page needs
them, **lift them into `src/ui/`** (e.g. `src/ui/Chip.tsx`, `Pill.tsx`,
`SectionLabel.tsx`) and import — don't copy-paste. Until then, mirror the same
shape.

- **`Tone`** = `'accent' | 'ok' | 'warn' | 'bad' | 'info'`. The single source of
  semantic color. Two maps (`toneText`, `toneFill`) turn a tone into classes.
  Always go through a tone — never write `text-green-400` directly.
- **`Chip`** — icon in a tinted rounded square. Forces a uniform 18px icon via
  `[&_svg]:!h-[18px] [&_svg]:!w-[18px]`, so icons with hardcoded sizes still
  line up.
- **`Pill`** — tinted status badge (`جاهز`, `قيد التنفيذ`, `شاغرة`). Tinted bg +
  bright text reads as real UI; plain colored text does not.
- **`SectionLabel`** — accent tick + title (+ optional hint). Use it to break a
  long page into rhythm sections.
- **`StatCard`**, **`ReadinessRing`**, **`InsightCard`** — page-level
  compositions; copy the structure, swap the data.

---

## 4. Icons (no emojis)

Use the SVG components in `components/icons/` (imported via the `@` alias, which
points at the **repo root** — `@/components/icons/...`). Never use emoji in the
frontend.

- Some icons accept `className`, some have hardcoded sizes and **no props**.
  Don't pass `className` to the no-prop ones (it's a `tsc` build error). Instead
  size icons from the parent with the `[&_svg]:!h-… [&_svg]:!w-…` trick (see
  `Chip`).

---

## 5. Text & i18n

- All copy goes through `t('key')`. **No hardcoded strings.** If you need a new
  label, add it to **both** the `en` and `ar` maps in `src/lib/i18n.tsx`.
- Reuse existing keys before inventing new ones (e.g. `fnStatus.ready`,
  `priority.high`). Grep first.
- Avoid duplicate labels: a section title shouldn't repeat the page title or a
  card title. (We added `org.dashboard.overview` / `.insights` for exactly this.)

---

## 6. RTL (the app defaults to Arabic)

- Use **logical** utilities: `gap`, `ms-*`/`me-*`, `ps-*`/`pe-*`,
  `start`/`end`, `border-s`/`border-e`. Avoid `left`/`right`.
- Remember grid/flex order visually flips: the first column renders on the
  **right**. Verify layout in RTL, not just LTR.
- Test both languages with the globe toggle in the topbar.

---

## 7. Light mode (forward-compatible — don't build yet)

Because every surface is a token, light mode is later just an override of the
same names under a scope, e.g.:

```css
html.theme-light {
  --bg: #f6f7f9;
  --card: #ffffff;
  --text: #11151c;
  /* …same names, light values… */
}
```

So: **if you hardcode a gray, you break light mode.** Always use a token.

---

## 8. Verification (required before you call a page done)

1. Run the dev server (`.claude/launch.json` → `dev`), open the page.
2. Check the browser console for errors.
3. Screenshot in **both** RTL (Arabic) and LTR (English).
4. `npx tsc --noEmit` — your changed files must be clean (ignore the
   pre-existing errors in the legacy root `components/` dir).

---

## 9. Don'ts

- Don't hardcode `gray-*`, `white`, or hex colors in components.
- Don't restyle the shared shell (`Sidebar`, `Topbar`) per-page.
- Don't add emojis.
- Don't introduce new abstractions for a single use — copy the reference
  pattern; lift to `src/ui/` only when a second page reuses it.
- Don't change data/permission/logic while restyling — class changes only,
  unless the redesign genuinely needs new computed values (like the table
  status tone).
