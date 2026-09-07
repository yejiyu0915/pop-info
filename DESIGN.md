# POPCAST Design System

## Direction

POPCAST uses a Weverse-inspired visual system: a gallery-white stage that lets popup imagery lead. The product is calm, flat, and photo-forward. UI chrome uses one action accent, teal, and relies on whitespace and hairlines rather than shadows.

## Foundations

### Color

| Role | Token | Value |
| --- | --- | --- |
| Canvas / surface | `--color-cream` | white-tinted `oklch(0.995 0.002 220)` |
| Reading ink | `--color-charcoal` | near-black `oklch(0.255 0.012 250)` |
| Secondary copy | `--color-muted` | `oklch(0.63 0.004 250)` |
| Hairline | `--color-border` | `oklch(0.908 0.002 220)` |
| Primary action | `--color-accent` | teal `oklch(0.75 0.13 200)` |
| Teal text / focus | `--color-brick` | `oklch(0.7 0.12 200)` |
| Success | `--color-deep-green` | `oklch(0.75 0.15 155)` |
| Attention | `--color-accent-yellow` | pink-red `oklch(0.68 0.18 5)` |
| Informational | `--color-accent-blue` | blue `oklch(0.64 0.14 270)` |

Teal is the only brand action color. Status colors are functional only and must not become decoration.

### Typography

Use Pretendard, then the platform system sans fallback, for every role. Hierarchy comes from weight, not a display face.

- Title: 26px / 700
- Section heading: 18px / 700
- Navigation: 15px / 500
- Body: 16px / 400
- Small body: 13px / 400
- Caption and compact controls: 12px / 700

### Geometry and depth

- Cards: 4px radius with a 1px hairline.
- Buttons and rows: 8px radius.
- Filters and carousel controls: 100px radius.
- No decorative shadows, gradients, glass, or colored side borders.
- Use whitespace and `--color-border` for separation.

### Motion

- Fast: 120ms
- Standard: 220ms
- Slow: 360ms
- Use `cubic-bezier(0.2, 0.6, 0.25, 1)` for entry and respect `prefers-reduced-motion`.

## Components

- Primary action: teal fill with light text.
- Secondary action: white surface, teal text, teal 1px outline.
- Active filter: near-black fill with light text.
- Inactive tabs: muted text. Active tabs: teal text.
- Content cards: white, hairline, 4px radius, no shadow.
- Errors: inline plain-language message with retry.
- Loading: final-dimension, flat white skeletons.
- Empty states: one calm explanation and one teal path forward.

## Responsive rules

- Mobile under 640px: one-column content, horizontally scrollable chips, 44px minimum touch targets.
- Tablet 640–1024px: 2–3 column content grids.
- Desktop: centered multi-column layouts.
- Inputs keep a 16px minimum font size on small screens.

## Product constraints

- Preserve API, authentication, RBAC, and all business logic during design work.
- Popup image content leads; chrome stays monochrome and quiet.
- Keep Korean copy clear and direct.
