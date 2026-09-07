# POPCAST — Product Context

## Register

`product` — App UI for popup discovery, registration, and curation. Editorial brand tone (Seongsu agency) applied within product surfaces.

## Users

| Segment | Goal |
|---------|------|
| **Explorer** (primary) | Find ongoing/upcoming pop-ups by area, category, timeline |
| **CREATOR** | Register and manage own pop-up posts |
| **ADMIN** | KV banner, comment moderation |

## Product Purpose

POPCAST is a Korean popup store curation platform. Users browse a magazine-style feed, filter by status/area/category, bookmark favorites, and read detail pages with comments. Creators publish pop-ups; admins curate main KV banners and moderate comments.

## Brand Personality

- **Name:** POPCAST (uppercase logotype)
- **Tone:** Seongsu editorial agency — playful, confident, typographic
- **Mood:** Clear Mindmarket full-palette — cream paper canvas (`#F7F4EB` / `#f5f1e4`), warm near-black ink, grass brand accent, plus deliberate solid accents (coral, yellow, blue, lavender) on role-mapped UI (CTAs, badges, timeline dots). Opaque bordered paper, flat (no shadows, no gradients). Chromatic after the fold like Mindmarket section CTAs, not quiet grass-only, not butter+hot-coral kitsch muddy base, not glass/iridescent.
- **Voice:** Clear Korean UI copy; minimal English labels only where editorial (e.g. section labels)

## Anti-References

Do **not** emulate:

- Generic purple-on-white SaaS dashboard kitsch (Inter + violet CTAs + metric strips)
- Iridescent periwinkle→cyan active fills, pearlescent glints, multi-stop sky/lavender atmosphere
- Heavy frosted glassmorphism on nested shells
- Butter-yellow + hot-coral “colorblind candy” / muddy page base with random rainbow buttons
- Hero metric blocks (big number + small label)
- Generic identical icon+heading+text card grids without editorial rhythm
- Harsh pure-black UI, muddy terracotta/brick-red, heavy black shadows
- Side-stripe accent borders on list items
- Muddy desaturated pastels / calm spa cream + sage
- Quiet grass-only mono-accent that reads incomplete vs Mindmarket after-fold energy

## Strategic Design Principles

1. **BEM + CSS tokens** — No Tailwind. Use `globals.css` variables and block files (`home.css`, `detail.css`, `forms.css`, `shell.css`).
2. **Container 1200px** — All pages use `.page-shell` + `.container` for aligned left edge.
3. **Underline inputs** — Auth and forms use bottom-border fields, not gray boxes.
4. **Icon chips** — Lucide icons in `.icon-wrapper` circle chips (stroke 1.5).
5. **Logic preservation** — UI passes must not alter auth, RBAC, API, or business flows.
6. **Mobile adapt** — Touch 44px, iOS 16px inputs, timeline horizontal scroll on narrow viewports.
7. **Accent roles** — Grass = brand/active selection; coral = bookmark + body CTAs; yellow = closing/attention; blue/lavender = info chips + timeline variety. Never paint every button a different color.

## Information Architecture

| Route | Role |
|-------|------|
| `/` | **Curation home** — KV (feature + posts), 이번 주 팝업, 개인화 추천, Editor's Pick teaser. No status/area filters. |
| `/explore` | **Discovery list** — PostFilterBar + timeline + paginated grid (`?status=ONGOING` etc.) |
| `/editors-pick` · `/editors-pick/[slug]` | Magazine-style editorial index & detail (mock until CMS) |

## Primary User Journey

1. Land on home → KV → 이번 주 → 추천 → Editor's Pick → (optional) explore for filters
2. `/explore` → filter by status/area/category → timeline + card grid
3. Open detail → bookmark, copy address, comments
4. Creator: write/edit with role guard
5. Auth: login, register (email verify), forgot password (3-step)
