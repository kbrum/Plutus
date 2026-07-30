# Plutus Token Spine

## Direction

Ledger contemporâneo claro: papel marfim, tinta grafite e verde pinho. Instrument Serif marca títulos curtos; Manrope sustenta leitura operacional. Movimento é mínimo e funcional.

## Color

- Canvas: `oklch(0.965 0.012 92)`
- Raised surface: `oklch(0.985 0.008 92)`
- Overlay: `oklch(0.995 0.004 92)`
- Ink: `oklch(0.23 0.018 155)`
- Secondary ink: `oklch(0.46 0.018 155)`
- Forest accent: `oklch(0.42 0.105 155)`
- Forest hover: `oklch(0.35 0.095 155)`
- Border: `oklch(0.84 0.014 92)`
- Risk: `oklch(0.52 0.14 30)`

### Dark mode

- Canvas: `oklch(0.16 0.014 155)`
- Raised surface: `oklch(0.19 0.016 155)`
- Overlay: `oklch(0.22 0.018 155)`
- Primary text: `oklch(0.94 0.012 92)`
- Secondary text: `oklch(0.68 0.014 105)`
- Forest accent: `oklch(0.68 0.09 155)`
- Border: `oklch(0.31 0.018 155)`

Dark mode uses tonal separation and edge highlights rather than black shadows. The selected theme is stored under `plutus-theme` in local storage.

Tailwind color utilities resolve through dynamic `--palette-*` variables. This is required so `text-slate-*`, `border-slate-*`, and status colors remap when `.dark` changes; literal theme values must not be placed directly in `@theme inline`.

Color budget: neutral base above 90%; forest for primary actions, focus and active navigation; terracotta only for overdue, rejection and destructive states.

## Type

- Display: Instrument Serif, Georgia, serif
- UI/body: Manrope, system sans-serif
- Numbers: Manrope with `tabular-nums`
- Page title: 36-44px desktop, 32px mobile, normal weight, tight tracking
- Body: 14-16px, line-height 1.5-1.7

## Spacing

4/8px base. Page gutters: 20px mobile, 32px tablet, 40px desktop. Standard content width: 1280px; dashboard may reach 1440px when the data benefits.

## Radius

- Inputs/buttons: 8px
- Repeated cards: 10px
- Major panels: 14px
- Dialogs: 16px
- Pills/avatars: full only when semantics require it

## Shadow

Surfaces rely on hairline borders. Overlays use two-layer warm shadows; cards use no shadow or a 1px direct shadow.

## Motion

- Hover/focus: 120-160ms
- Dialogs: 200ms
- No decorative entrances
- Respect `prefers-reduced-motion`

## Z-index

- Dropdown: 10
- Sticky navigation: 20
- Modal backdrop: 30
- Modal: 40
- Toast: 50
- Tooltip: 60

## Signature

Active navigation uses a short forest rule rather than a filled pill. Financial values use tabular figures and carry hierarchy without colored containers.
