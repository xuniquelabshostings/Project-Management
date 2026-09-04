# Design System: Claude-Inspired Theme (Light & Dark Mode)

## Design Philosophy
Warm, calm, and understated rather than corporate-cold or neon-tech. The interface should feel quiet and legible — generous whitespace, soft contrast, restrained use of color reserved for meaningful actions and states (primary buttons, status badges, alerts). Avoid harsh pure-black/pure-white, heavy drop shadows, or saturated "tech dashboard" blues. The overall impression should be closer to a well-designed reading/writing tool than a data-dense enterprise dashboard, even though it holds a lot of data.

## Color Palette

### Light Mode
- **Background (primary)**: warm off-white / cream — not pure white (e.g. `#FAF9F5` range)
- **Background (surface/cards)**: slightly lighter or same warm white with a subtle 1px warm-gray border, not a heavy shadow
- **Text (primary)**: warm near-black / dark charcoal — not pure `#000000` (e.g. `#1F1B16` range)
- **Text (secondary/muted)**: warm mid-gray (e.g. `#6B6459` range)
- **Accent / primary action color**: warm terracotta / burnt orange (Claude's signature accent, e.g. `#CC785C` range) — used for primary buttons, active states, links, focus rings
- **Borders/dividers**: soft warm gray, low contrast, barely visible except to separate sections

### Dark Mode
- **Background (primary)**: warm dark charcoal — not pure black (e.g. `#1A1815` range)
- **Background (surface/cards)**: slightly lighter warm charcoal than the base background, to create gentle depth without shadows (e.g. `#232019` range)
- **Text (primary)**: warm off-white (e.g. `#F2EFE9` range)
- **Text (secondary/muted)**: warm mid-gray, lighter than light-mode muted text for legibility on dark backgrounds
- **Accent / primary action color**: same terracotta family, slightly brightened/desaturated for dark backgrounds so it doesn't vibrate against the dark surface
- **Borders/dividers**: subtle warm gray at low opacity, visible but not stark

### Status / Semantic Colors (both modes)
Keep these muted and desaturated rather than pure saturated red/green/yellow, consistent with the warm, low-contrast palette:
- **Success / Paid / Active**: muted sage green
- **Warning / Pending / On Hold**: muted amber/gold
- **Danger / Overdue / Churned**: muted brick red (not a bright alert red)
- **Info / Lead / Draft**: muted warm blue-gray, kept subtle so it doesn't clash with the terracotta accent

## Typography
- **Headings**: a serif or slab-serif face for a warm, editorial feel (pairing a serif for headings with a clean sans-serif for body text mirrors Claude's own literary, human tone)
- **Body text**: a clean, highly legible sans-serif for UI text, tables, and forms
- **Monospace**: a simple monospace font for anything code- or ID-related (invoice numbers, technical fields)
- **Hierarchy**: rely on size and weight more than color to establish hierarchy; keep body text weight regular, headings medium/semibold rather than heavy black weights
- **Line height**: generous (1.5–1.6 for body text) to support the calm, readable feel

## Layout & Spacing
- Generous padding within cards and between sections — avoid cramped, dense enterprise-dashboard spacing
- Consistent spacing scale (e.g. 4px base unit: 4/8/12/16/24/32/48px) applied uniformly across components
- Soft rounded corners on cards, buttons, and inputs (moderate radius — rounded but not pill-shaped/bubbly)
- Avoid heavy box-shadows; prefer subtle borders or very soft, low-opacity shadows for elevation

## Components

### Buttons
- **Primary**: solid terracotta background, warm off-white text, soft rounded corners
- **Secondary**: outlined or subtle warm-gray background, primary text color
- **Destructive**: muted brick-red background, used sparingly (delete/archive actions only)
- Hover/active states: slight darken/lighten of the base color, not a color hue shift

### Cards (clients, projects, invoices)
- Warm surface background per mode, thin border, generous internal padding
- Status shown as a small muted-color badge/pill rather than colored card backgrounds

### Kanban Board
- Columns on warm surface background, subtle divider between columns
- Task cards: compact, rounded, showing title, assignee avatar, due date, priority indicator as a small colored dot (using the muted semantic colors)

### Tables (invoices, financial views)
- Minimal gridlines — rely on row spacing and subtle alternating row tint rather than heavy borders
- Right-align numeric/currency columns
- Status column uses the same muted badge style as cards

### Forms & Inputs
- Warm-gray bordered inputs, terracotta focus ring on active/focused fields
- Labels above fields, muted helper text below when needed

### Navigation
- Sidebar or top nav on warm surface background, current section indicated with a subtle terracotta accent (left border, underline, or text color) rather than a bold background fill

## Dark/Light Mode Toggle
- User-toggleable, persisted per user (stored in their profile or local preference)
- Respect system preference (`prefers-color-scheme`) as the default on first load, with manual override available
- Transition between modes should be instant or a very short fade — no jarring flash of unstyled/wrong-theme content

## Iconography & Imagery
- Simple, single-weight line icons (not filled/glyph-heavy) to match the understated tone
- Avoid stock-photo-style imagery; if illustration is used, keep it minimal and geometric rather than cartoonish

## Tone Summary
If it helps as a gut check: the interface should feel like a warm, well-organized notebook or workspace — not a flashy SaaS dashboard, not a cold enterprise tool. Calm colors, readable type, and enough whitespace to breathe, even when displaying dense client and financial data.
