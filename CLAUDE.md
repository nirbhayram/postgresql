# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint (eslint-config-next/core-web-vitals)
npx tsc --noEmit # type-check without building
```

There are no tests in this project.

## Architecture

This is a **single-page PostgreSQL reference handbook** — one route, no API, no database. The entire app is a client-side section switcher rendered as a static page.

### Data flow

```
app/page.tsx  (force-static, server component)
  └─ HandbookClient  (client component — owns all state)
       ├─ activeSection: number  →  controls which section is visible
       ├─ progress: number       →  scroll progress bar (0-100)
       └─ current.Component()   →  renders one section at a time
```

`app/page.tsx` exports `dynamic = "force-static"`, so the whole page is pre-rendered at build time and shipped as static HTML.

### Section content pipeline

Section content lives as raw HTML strings. The pipeline is:

1. **`app/components/sections/section-NN-<name>.tsx`** — each file exports a default component holding one `const html = "..."` string and returning `<SectionMarkup html={html} />`.
2. **`app/components/sections/section-markup.tsx`** — `SectionMarkup` injects the string via `dangerouslySetInnerHTML`. Also exports the `HandbookSection` type.
3. **`app/components/handbook-sections.tsx`** — imports all 14 section components, re-exports `HandbookSection`, and exports the `HANDBOOK_SECTIONS` array consumed by `HandbookClient`.
4. **`app/globals.css`** — all visual styling for rendered content lives here under the `.handbook-content` namespace (code blocks, syntax highlight classes `.kw`/`.fn`/`.str`/`.cm`/`.num`, tables, adv-boxes, diff-grids, info-boxes).

### Navigation

`HandbookClient` maintains two parallel navigation structures over the same 14 sections:
- `TOP_NAV` — horizontal scrollable tab bar (short labels)
- `SIDE_GROUPS` — sticky sidebar grouped into Foundations / Data Operations / Structure & Integrity / Advanced

Both call `setActiveSection(idx)`. Clicking any nav item swaps the rendered section without any routing.

Copy-to-clipboard for code blocks is handled by a single delegated `click` listener attached to `document` inside `HandbookClient` — it looks for `.code-copy` buttons and reads text from the nearest `pre.code`.

### Adding a new section

1. Create `app/components/sections/section-NN-<slug>.tsx` following the existing pattern.
2. Import it in `app/components/handbook-sections.tsx` and add an entry to `HANDBOOK_SECTIONS`.
3. Add a short label to `TOP_NAV` and an entry to the appropriate `SIDE_GROUPS` group in `handbook-client.tsx`.

### Styling

Tailwind v4 is used — `globals.css` opens with `@import "tailwindcss"` (not the v3 `@tailwind` directives). Custom theme tokens are set via `@theme inline`. Utility classes are used directly in JSX; content-specific styles (everything under `.handbook-content`) are written as component-scoped CSS in `globals.css`.

Path alias `@/*` resolves to the project root (e.g. `@/app/...`).
