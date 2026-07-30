# PROJECT_DESIGN

## Product Context

Plutus is a private credit ledger for people who lend to and borrow from one another. The primary job is to understand obligations and make evidence-backed decisions quickly across dashboard, loans, installments and payments.

## Existing UI Read

The existing product has strong task coverage, useful empty/loading states and clear financial vocabulary. Its main weakness is a dark cockpit vocabulary implemented through hardcoded colors, many competing accents and a desktop sidebar that consumes mobile width. Preserve workflows, Lucide icons and numeric hierarchy; replace decorative glow, duplicated dark surfaces and route-level styling drift.

## Taste Direction

Contemporary ledger: institutional trust with human warmth. A light paper-like workspace, graphite ink, forest interaction color and restrained editorial headings make contracts and evidence feel legible rather than technical. Avoid a bank dashboard clone, glassmorphism and warm-luxury ornament.

## Visual Theme

The interface should feel like a well-kept shared ledger. Content and dividers form structure. Titled surfaces are calm; decisions and overdue states carry stronger contrast. The memorable element is the short active-navigation rule paired with serif page titles.

## Color And Typography

Use the token contract in `.ui-craft/tokens.md`. Instrument Serif is restricted to page-level titles and key empty/error statements. Manrope handles controls and body copy. Financial values always use tabular figures. Forest is the only brand accent; semantic success, warning and danger remain subordinate.

## Component Styling

Buttons and fields are at least 44px on touch surfaces, with 8px corners and explicit focus rings. Repeated cards have 10px corners and hairline borders. Major panels use 14px corners. Dialogs are white overlays with a warm shadow. Status indicators retain icon or text, never color alone.

## Layout Principles

Use a consistent page shell and 4/8px spacing rhythm. Desktop keeps a tinted sidebar. Mobile uses a compact top identity bar and labeled bottom navigation, with content insets for both. Cards are reserved for repeated records and decision panels; spacing and rules group ordinary content.

## Motion And Interaction

Only state transitions animate, between 120ms and 200ms. No glow, floating shapes, bounce or large entrance choreography. Hover never changes layout. Focus remains visible and all critical actions work by keyboard and touch.

## Implementation Mapping

Primary files: `src/styles.css`, root/authenticated routes, navigation shell, UI primitives, auth pages, dashboard, loans, installments, payments, members, profile and system states. Existing data and business logic remain intact except proof visibility and authorization fixes.

## Evaluation Plan

Run Biome, TypeScript and production build. Verify authenticated desktop and mobile navigation manually, proof visibility before lender action, dialogs, 375px layout, keyboard focus and reduced-motion behavior. Compare each surface against token and generic-UI regressions.
