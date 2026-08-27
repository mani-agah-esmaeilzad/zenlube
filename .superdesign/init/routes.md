# Routes

Next.js 15 App Router with a root RTL layout. Storefront routes use `src/app/(storefront)/layout.tsx`; admin routes use `src/app/(admin)/layout.tsx`.

- `/` → `src/app/(storefront)/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/account` → `src/app/(storefront)/account/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/admin` → `src/app/(admin)/admin/page.tsx` (layout: `src/app/(admin)/layout.tsx`)
- `/admin/login` → `src/app/(admin)/admin/login/page.tsx` (layout: `src/app/(admin)/layout.tsx`)
- `/blog` → `src/app/(storefront)/blog/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/blog/[slug]` → `src/app/(storefront)/blog/[slug]/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/brands` → `src/app/(storefront)/brands/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/cars` → `src/app/(storefront)/cars/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/cars/[slug]` → `src/app/(storefront)/cars/[slug]/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/cart` → `src/app/(storefront)/cart/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/cart/checkout` → `src/app/(storefront)/cart/checkout/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/cart/checkout/failure` → `src/app/(storefront)/cart/checkout/failure/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/cart/checkout/success` → `src/app/(storefront)/cart/checkout/success/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/categories` → `src/app/(storefront)/categories/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/categories/[slug]` → `src/app/(storefront)/categories/[slug]/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/checkout/failed` → `src/app/(storefront)/checkout/failed/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/checkout/success` → `src/app/(storefront)/checkout/success/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/policy` → `src/app/(storefront)/policy/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/products` → `src/app/(storefront)/products/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/products/[slug]` → `src/app/(storefront)/products/[slug]/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/products/compare` → `src/app/(storefront)/products/compare/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/sign-in` → `src/app/(storefront)/sign-in/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/sign-up` → `src/app/(storefront)/sign-up/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/support` → `src/app/(storefront)/support/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)
- `/terms` → `src/app/(storefront)/terms/page.tsx` (layout: `src/app/(storefront)/layout.tsx`)

## Key surfaces

- `/`: mobile-first commerce home with hero, vehicle finder, categories, products, brands, trust, guidance, and optional articles.
- `/products`: filterable and sortable catalog.
- `/products/[slug]`: product detail, purchase controls, technical information, reviews, and questions.
- `/cars`: vehicle-based discovery and maintenance/manual content.
- `/cart`: cart and checkout entry.
- `/admin`: internal administration workspace.
