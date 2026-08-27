# Oilbar Mobile Storefront Design System

## Product and audience
Oilbar is a Persian RTL specialty automotive consumables storefront. It helps Iranian drivers choose authentic motor oil, gearbox oil, filters, and maintenance products. The product's strongest differentiator is compatibility-led discovery by vehicle (manufacturer → model → year → engine), supported by technical specifications and authenticity assurance.

## Design direction
Keep the existing technical charcoal-and-amber Oilbar identity, but make the mobile experience calmer, warmer, and more alive through stronger visual rhythm rather than extra decoration. Use a true-white editorial commerce canvas, one decisive charcoal vehicle-finder band, amber for active/primary states, and product imagery as the main visual signal. Density should be low-to-medium, with generous breathing room and clear progressive disclosure.

## Visual tokens
- Background: true white `#FFFFFF`; soft gray `#F7F8FA`; alternate gray `#F3F4F7`.
- Dark band: charcoal `#171B23` with muted charcoal `#202734`.
- Text: ink `#111827`; body `#1F2937`; muted `#667085`; soft `#98A2B3`.
- Brand accent: amber `#F59E0B`; primary amber `#D97706`; hover/deep amber `#B45309`.
- Border: `#E6E8EE`; strong border `#D5D9E2`.
- Semantic green only for real availability/success; never as decoration.
- Radius: 12px controls, 16px surfaces, 20px only for signature panels; compact circular category/image frames are allowed. Avoid pill spam.
- Shadow: restrained and functional; use borders by default, soft 8–24px shadows only for sticky/floating states.

## Typography
Use Vazirmatn only (400–900) with Persian-appropriate line height. Mobile H1: 32–38px/1.25/900 with at most three lines. Section heading: 20–24px/1.45/800. Body: 14–16px/1.9/400–500. UI controls: 14px/800; captions 12px/700. All control typography must be explicit.

## Mobile shell
- The entire storefront is true RTL, not merely right-aligned copy: DOM reading order, flex/grid order, icon placement, chevrons, carousels, breadcrumbs, form labels, drawers, and motion origins all follow Persian RTL conventions.
- Mobile header order begins at the right edge with the hamburger/menu control; the drawer opens from the right. The real Oilbar logo follows it, while search/cart utilities occupy the left side according to available space.
- Directional arrows and slide/translate animations must be mirrored for RTL. Horizontal rails start from the right and advance leftward; select indicators and input affordances remain optically correct for Persian.
- Compact single-row sticky header: menu, real Oilbar logo, search affordance, and cart. Do not show a permanently open second search row.
- Preserve the four-item bottom navigation: خانه، فروشگاه، سبد خرید، حساب. Active state uses amber line/icon/tint, not a large filled card.
- Exactly one cart entry point in the persistent chrome should dominate; avoid visually duplicating cart in both header and bottom nav.
- Content gutter: 16px; edge-to-edge horizontal rails may bleed to the viewport edge with internal padding.

## Homepage information architecture
1. Compact hero: offer, short supporting sentence, one primary CTA, product render. No eyebrow pill, duplicate CTA, or three stacked trust bullets.
2. Vehicle finder as signature dark band using progressive disclosure. Start with manufacturer/model or vehicle type; reveal year/engine after the first choice. Preserve the real compatibility workflow.
3. Category shortcuts as an open horizontal rail; prioritize categories with products and keep a view-all link.
4. Featured products as a horizontal rail on mobile with a simplified card; retain image, title, price, stock and wishlist. Product cards never contain an add-to-cart button; purchasing starts only on the product detail page.
5. Brands as compact horizontal logo/text rail, de-emphasizing brands with no products.
6. Merge authenticity/shipping/technical guidance into one compact editorial trust section; do not repeat trust claims in hero, middle, and footer.
7. Blog content appears only when real posts exist, as one feature plus a rail.
8. Mobile footer is concise: contact, collapsible navigation, legal; it respects bottom-nav safe area.

## Component rules
- Primary button: amber or charcoal, 48–52px high, 12–16px radius, full-width only when the action is truly dominant.
- Secondary action: text link or quiet outline; do not stack two equally heavy full-width CTAs.
- Category shortcut: icon/image in a circular frame with a text label; open rail, not a bordered card grid.
- Product card: one badge maximum; hide low-priority specs/ratings on narrow home rails; never let wishlist/badge collide; render exactly one full-width card per row on phones and never include an add-to-cart button inside the card.
- Internal page intro: use one compact 16–20px-radius band with a slim amber rule, clear H1, short description and at most one secondary action. Dark charcoal is reserved for vehicle, account, checkout and support contexts.
- Catalog directory rows: categories, brands and vehicles use compact summary rows/cards. Put available inventory first and move zero-count entries into a separate, visually quieter section.
- Section header: title and “مشاهده همه” share one row; mobile subtitle is hidden or one short line.
- Vehicle controls: 44–48px minimum tap target; staged/progressive UI rather than four selects plus CTA.
- Icon system: 1.8–2px charcoal outline SVG, amber only for active state.

## Motion and accessibility
Use 160–220ms ease-out transitions for drawer, selected state, and rail feedback. Respect reduced motion. Ensure 44px minimum tap targets, visible focus, semantic headings, contrast AA, no horizontal overflow, and safe-area padding above the fixed bottom navigation.

## Copy lock and constraints
Preserve real product and navigation meaning. Approved hero copy direction: “روغن مناسب خودروی شما، دقیق و مطمئن”. Primary CTA: “مشاهده همه محصولات”. Vehicle heading: “خودروی شما چیست؟” and action “انتخاب خودرو”. Trust strings: “ضمانت اصالت” and “ارسال سراسری”. Do not invent products, metrics, claims, testimonials, or populated states. Empty/zero-value content should be hidden or visually de-emphasized.

## Avoid
No purple, neon, glassmorphism, glow, decorative gradients, fake dashboards, excessive pills/badges, default bento grids, repeated card stacks, lifestyle stock illustrations, unreadable Persian, duplicated discovery routes, or a hero pretitle/eyebrow pill.
