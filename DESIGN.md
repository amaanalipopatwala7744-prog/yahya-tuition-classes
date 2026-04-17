# Design Brief

## Direction

Professional Trust — A modern, premium educational platform that builds confidence through clean blue and white design with warm accents, positioned as a trustworthy tuition partner for students and parents in Vadodara.

## Tone

Refined professional minimalism: confident without corporate coldness. Educational warmth through blue primary (trust, learning) and amber accents (engagement, motivation), curated shadows and card-forward layouts that feel approachable yet premium.

## Differentiation

Blue + warm amber accent system combined with geometric sans-serif typography and card-based layout creates a distinctive educational platform that stands apart from generic tutoring websites—modern SaaS polish applied to tuition class context.

## Color Palette

| Token      | OKLCH          | Role                           |
| ---------- | -------------- | ------------------------------ |
| background | 0.99 0.005 260 | Light neutral base, clean slate|
| foreground | 0.15 0.01 260  | Primary text, deep blue-grey   |
| card       | 1.0 0.0 0      | Card surfaces, pure white      |
| primary    | 0.45 0.2 265   | Deep indigo blue, CTAs, badges |
| accent     | 0.65 0.15 55   | Warm amber, engagement buttons |
| muted      | 0.95 0.01 260  | Secondary surfaces, subtle     |
| border     | 0.9 0.01 260   | Borders, subtle dividers       |

## Typography

- Display: Space Grotesk — geometric, modern, tech-forward sans for hero and section headings
- Body: DM Sans — clean, friendly, highly readable sans for paragraphs, UI labels, body text
- Scale: hero `text-6xl md:text-7xl font-bold tracking-tight`, h2 `text-4xl md:text-5xl font-bold`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Three-tier shadow hierarchy (subtle, card, elevated) plus color layering creates depth—cards float on muted backgrounds, primary buttons use amber accent to pop, borders define boundaries without harsh lines.

## Structural Zones

| Zone    | Background      | Border           | Notes                                    |
| ------- | --------------- | ---------------- | ---------------------------------------- |
| Header  | `bg-card`       | `border-b`       | Sticky nav, subtle divider, white base   |
| Hero    | `bg-background` | —                | Full-width section, centered card overlay|
| Content | `bg-background` | —                | Main zones alternate with `bg-muted/5`   |
| Sidebar | `bg-card`       | `border-r`       | Dashboard sidebar, white elevated base   |
| Footer  | `bg-muted/10`   | `border-t`       | Grounded, muted, clear separation        |

## Spacing & Rhythm

Section gaps 4-6rem vertical, content padding 2rem on mobile / 4rem on desktop, card internal padding 1.5–2rem. Micro-spacing uses 0.5rem and 1rem for component internals—creates visual breathing room without fragmentation.

## Component Patterns

- Buttons: primary (blue bg, white text, full-width mobile, hover darken) | secondary (white bg, blue text, border) | accent (amber bg, white text, reserved for main CTA)
- Cards: 8px rounded corners, white background, soft-subtle shadow, 1px border in border-color for definition
- Badges: small rounded (6px), blue background, white text, used for attendance %, course tags

## Motion

- Entrance: smooth fade-in (0.3s) on page load and section reveals
- Hover: subtle lift on cards (2px translate-y + shadow-elevated, 0.2s) and button color shift (0.2s)
- Decorative: floating pulse on WhatsApp button (1.5s cycle), none elsewhere to maintain professional tone

## Constraints

- No gradients or decorative overlays—solid colors and shadows only
- Icons required for feature lists, course cards, and dashboard metrics
- Floating WhatsApp button (green) and AI chatbot widget always visible—positioned sticky bottom-right
- Mobile-first: all components functional and visible at 320px+ screens
- Light mode only (dark mode scope pending user request)

## Signature Detail

The dual-accent system (blue primary + amber accent) applied consistently across CTAs, badges, and interactive states creates visual cohesion and energy while maintaining professional restraint—distinctly tuition-platform specific, not generic SaaS.
