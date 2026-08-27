# Extractable Components

## SiteHeader
- Source: `src/components/layout/site-header.tsx`
- Category: layout
- Description: Sticky responsive storefront header with real Oilbar logo, search, menu, account, and cart.
- Extractable props: none; session and categories are server-resolved.
- Hardcoded: header structure, logo asset, nav labels, icon SVGs, responsive classes.

## MobileNav
- Source: `src/components/layout/mobile-nav.tsx`
- Category: layout
- Description: Accessible mobile drawer plus four-item fixed bottom navigation.
- Extractable props: active route, accountHref, isAuthenticated, category/link collections.
- Hardcoded: bottom-nav labels and icon SVGs.

## SiteFooter
- Source: `src/components/layout/site-footer.tsx`
- Category: layout
- Description: Storefront trust, navigation, support, and legal footer.
- Extractable props: none.
- Hardcoded: trust/support/navigation copy and brand assets.

## HeroVehicleFinder
- Source: `src/components/layout/hero-vehicle-finder.tsx`
- Category: basic
- Description: Vehicle compatibility selector for manufacturer, model, year, and engine.
- Extractable props: cars, variant.
- Hardcoded: Persian labels and submission route behavior.

## ProductCard
- Source: `src/components/product/product-card.tsx`
- Category: basic
- Description: Reusable commerce card with product image, metadata, stock, price, wishlist, and quick add.
- Extractable props: product.
- Hardcoded: card anatomy and interaction controls.

## SectionHeader
- Source: `src/components/ui/section-header.tsx`
- Category: basic
- Description: Shared section title, optional subtitle, and view-all link.
- Extractable props: title, subtitle, href, actionLabel.
- Hardcoded: typography and spacing classes.

## MobileSheet
- Source: `src/components/ui/mobile-sheet.tsx`
- Category: basic
- Description: Accessible right/left/bottom mobile drawer with focus management.
- Extractable props: open, side, title, onClose.
- Hardcoded: overlay, focus behavior, close icon and transitions.
