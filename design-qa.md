# Approved product cards — September 12, 2026

## Visual truth and evidence

- User-approved reference: `/Users/maniagah/.codex/generated_images/01a03f9f-25e8-7832-97d6-83ab4287ece3/exec-c74117f2-bab5-42a3-b1a2-c1f113f39dca.png` (1536 × 1024).
- Permanent reference: https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/projects/4b1c805c-9e2e-4675-9cd6-cbfda32c8925/reference-assets/oilbar-product-card-review-toman/exec-c74117f2-bab5-42a3-b1a2-c1f113f39dca.png
- Browser-rendered implementation: `http://127.0.0.1:3000/` and `/products?brand=persia-sign`.
- Desktop capture: `/tmp/oilbar-product-card-desktop-1440-full.png` (1440 × 1000, CSS viewport 1440 × 1000).
- Mobile capture: `/tmp/oilbar-product-card-mobile-390-full.png` (390 × 844, CSS viewport 390 × 844).
- Combined desktop comparison: `/tmp/oilbar-product-card-desktop-comparison-final.png`.
- Combined mobile comparison: `/tmp/oilbar-product-card-comparison-final.png`.
- State: loaded, light theme, logged out, available Persia Sign Up to 5, real primary product photograph, 1,200,000 Toman. Unavailable cards were checked separately on the home page.

## Normalization and fidelity

The reference is a presentation canvas, not a browser viewport. Comparison excludes canvas padding and uses the complete individual card. Its 559 × 839 desktop region was downsampled to 308 px wide; its 734 × 407 mobile region was downsampled to 358 px wide. Implementation regions are 308 × 475 and 358 × 199 CSS/pixel units respectively, at 1× screenshot density. Each combined input contains the source on the left and browser implementation on the right; readable focused card comparisons supplement full-page inspection.

- Typography: existing Vazirmatn family retained; semibold 15/16 px title, muted 12 px brand, readable 13 px specifications, and 20/22 px extra-bold price. The generated reference's exact numeral glyphs are not a reusable font; existing Persian numeral shapes are an acceptable brand/font constraint.
- Layout: phone photograph on the right, one full-width card, separate specifications, subtle stock state, left-aligned price and quiet right-aligned link. Desktop uses vertical photographs and open grid spacing. The small equal-row height difference accommodates real titles and a 44 px link target.
- Tokens: existing white, charcoal, muted gray, thin divider and semantic stock colors reused. No gray image panel, nested frame, filled purchase button, rating or category pills.
- Imagery: genuine existing Persia Sign product photograph retained, not replaced by the mockup raster. Its existing white image margins are compensated with responsive CSS scale, without changing the source file or Torob output. Complete packaging remains visible. Source-photo sharpness is an existing asset constraint.
- Copy: title, model and exact volume remain visible; full original names remain the image alt text and link labels and on product details. Explicit 355 ml and 8 ml labels are preserved despite rounded database litre values.

## Comparison history

1. Initial responsive inspection found excessive white margins around the real Persia Sign photo [P2]. Responsive image scaling corrected it; the final combined inputs show complete, appropriately sized packaging.
2. Initial combined desktop/mobile comparison found an unnecessary desktop title minimum height and excessive footer padding [P2], making the card notably taller than the reference. Removed that minimum height, reduced footer padding while preserving a 44 px action target, and added 8 px mobile content top spacing. Final desktop height reduced from 517 to 475 px; mobile height reduced from 211 to 199 px. Revised browser captures were combined with the source again.
3. Final combined comparisons contain no actionable P0/P1/P2 findings. A trial numeral feature override did not improve the existing font's glyph shape and was removed. No further visual polish loop is required.

## Functional verification

- Checked 320, 390, 768 and 1440 px widths: no document or card horizontal overflow; mobile is a single horizontal card and tablet/desktop are vertical.
- Available-card price is on the left and converted from stored rials only for card presentation.
- Unavailable home card has “ناموجود”, no price, and no price-updating placeholder.
- No add-to-cart buttons in cards. Wishlist remains a separate compact control.
- Product link opened the correct original product details; detail/payment pricing remains unchanged.
- Product image loaded successfully. Browser console checked: no card errors; pre-existing Next.js smooth-scroll warning is outside this change.
- Lint, TypeScript and whitespace checks passed. All 158 automated tests passed, including six new card-content tests and identity preservation across all 123 catalog definitions.

## Findings and checklist

No remaining blocking findings. Main visual, responsive, availability and navigation checks are complete. Future higher-resolution manufacturer imagery is optional P3 follow-up, not a reason to replace genuine packaging or regenerate the approved design.

final result: passed
