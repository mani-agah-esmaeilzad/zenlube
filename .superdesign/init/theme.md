# Theme

## Compact token summary

- Direction/language: Persian RTL (`dir=rtl`, `lang=fa`).
- Framework: Tailwind CSS 4 via `@import "tailwindcss"`; global CSS custom properties.
- Font: Vazirmatn 400–900, then IRANSans/Yekan Bakh/Tahoma/Arial fallbacks.
- Brand palette: true white `#ffffff`; soft gray `#f7f8fa`; charcoal `#171b23`; ink `#111827`; amber `#f59e0b`; amber dark `#d97706`; amber deep `#b45309`; muted text `#667085`; pale border `#e6e8ee`.
- Semantic colors: success `#16a34a`, warning `#d97706`, error `#d92d20`, info `#2563eb`.
- Radius: 8, 12, 16, 20px plus full pills only for compact chips/navigation.
- Shadow: restrained 1–2px or soft 8–40px shadows; most storefront surfaces use borders rather than elevation.
- Containers: max 1280px; current mobile gutter is 10px per edge at <768px.
- Type: display 1.7–3.1rem/900; H1 1.4–2rem/800; section titles 1.15–1.5rem/800; body 0.925rem with generous RTL line height.
- Breakpoints: Tailwind defaults; explicit mobile rules at 639px and 767px, desktop header at lg.
- Motion: 160ms color/border transitions; reduced-motion disables animations.

## Raw source

### `src/app/globals.css`

```css
@import url("https://fonts.bunny.net/css?family=vazirmatn:400,500,600,700,800,900&display=swap");
@import "tailwindcss";

:root {
  --zen-bg: #ffffff;
  --zen-bg-soft: #f7f8fa;
  --zen-bg-muted: #f3f4f7;
  --zen-surface: #ffffff;
  --zen-surface-muted: #f7f8fa;
  --zen-surface-alt: #f3f4f7;
  --zen-surface-tint: #fff7eb;
  --zen-surface-tint-strong: #ffefd4;
  --zen-surface-dark: #171b23;
  --zen-surface-dark-muted: #202734;
  --zen-charcoal: #171b23;
  --zen-charcoal-soft: #252c39;
  --zen-orange: #f59e0b;
  --zen-orange-dark: #d97706;
  --zen-orange-deep: #b45309;
  --zen-text: #1f2937;
  --zen-text-strong: #111827;
  --zen-muted: #667085;
  --zen-muted-soft: #98a2b3;
  --zen-border: #e6e8ee;
  --zen-border-strong: #d5d9e2;
  --zen-success: #16a34a;
  --zen-success-soft: #ecfdf3;
  --zen-warning: #d97706;
  --zen-warning-soft: #fff8e8;
  --zen-error: #d92d20;
  --zen-error-soft: #fef3f2;
  --zen-info: #2563eb;
  --zen-focus: rgba(217, 119, 6, 0.28);
  --zen-radius-sm: 8px;
  --zen-radius: 12px;
  --zen-radius-lg: 16px;
  --zen-radius-xl: 20px;
  --zen-shadow-xs: 0 1px 2px rgba(17, 24, 39, 0.04);
  --zen-shadow-sm: 0 8px 24px rgba(17, 24, 39, 0.05);
  --zen-shadow: 0 16px 40px rgba(17, 24, 39, 0.08);
  --zen-shadow-hover: 0 18px 44px rgba(17, 24, 39, 0.1);
  --background: var(--zen-bg);
  --surface: var(--zen-surface);
  --surface-secondary: var(--zen-surface-alt);
  --foreground: var(--zen-text-strong);
  --muted: var(--zen-muted);
  --border: var(--zen-border);
  --primary: var(--zen-charcoal);
  --primary-hover: var(--zen-charcoal-soft);
  --accent: var(--zen-orange-dark);
  --accent-hover: var(--zen-orange-deep);
  --success: var(--zen-success);
  --warning: var(--zen-warning);
  --error: var(--zen-error);
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-soft: var(--zen-bg-soft);
  --color-surface-secondary: var(--surface-secondary);
  --color-surface-elevated: var(--zen-surface-muted);
  --color-surface-muted: var(--zen-surface-muted);
  --color-surface-tint: var(--zen-surface-tint);
  --color-surface-dark: var(--zen-surface-dark);
  --color-card: var(--zen-surface);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-soft: #fff5de;
  --color-primary-accent: var(--zen-orange);
  --color-primary-accent-strong: var(--zen-orange-dark);
  --color-text: var(--zen-text);
  --color-text-strong: var(--zen-text-strong);
  --color-text-muted: var(--zen-muted);
  --color-text-soft: var(--zen-muted-soft);
  --color-text-subtle: var(--zen-muted-soft);
  --color-text-body: var(--zen-text);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --color-border-strong: var(--zen-border-strong);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--error);
  --color-error: var(--error);
  --font-sans: Vazirmatn, IRANSans, "Yekan Bakh", Tahoma, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  background: var(--background);
  color: var(--zen-text);
  font-family: Vazirmatn, IRANSans, "Yekan Bakh", Tahoma, Arial, sans-serif;
  font-feature-settings: "ss01" on, "ss02" on;
  text-rendering: optimizeLegibility;
}

img,
svg,
video,
canvas {
  max-width: 100%;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

a {
  color: inherit;
  text-decoration: none;
}

::selection {
  background-color: rgba(245, 158, 11, 0.2);
  color: var(--zen-charcoal);
}

:focus-visible {
  outline: 2px solid var(--zen-orange-dark);
  outline-offset: 3px;
}

.container-zen {
  width: min(100% - clamp(20px, 5vw, 40px), 1280px);
  margin-inline: auto;
}

.site-shell {
  position: relative;
  background: var(--background);
}

.card-zen,
.panel-zen,
.panel-zen-muted,
.panel-zen-tint,
.panel-zen-dark,
.metric-zen {
  position: relative;
  overflow: hidden;
  border-radius: var(--zen-radius-lg);
  border: 1px solid var(--zen-border);
}

.card-zen,
.panel-zen {
  background: var(--zen-surface);
}

.panel-zen-muted,
.metric-zen {
  background: var(--zen-surface-muted);
}

.panel-zen-tint {
  border-color: rgba(217, 119, 6, 0.16);
  background: var(--zen-surface-tint);
}

.panel-zen-dark {
  border-color: rgba(255, 255, 255, 0.06);
  background: var(--zen-surface-dark);
  color: #ffffff;
}

.metric-zen {
  padding: 1rem 1rem 0.95rem;
}

.section-band {
  position: relative;
  padding-block: clamp(1rem, 1vw + 0.65rem, 1.35rem);
}

.interactive-lift {
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.interactive-lift:hover {
  border-color: rgba(217, 119, 6, 0.28);
}

.icon-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(217, 119, 6, 0.14);
  background: var(--zen-surface-tint);
  color: var(--zen-orange-dark);
}

.chip-zen,
.chip-zen-muted,
.chip-zen-warning,
.chip-zen-success,
.chip-zen-dark {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 1.75rem;
  border-radius: 999px;
  padding-inline: 0.7rem;
  font-size: 0.72rem;
  font-weight: 700;
}

.chip-zen {
  border: 1px solid rgba(217, 119, 6, 0.16);
  background: var(--zen-surface-tint);
  color: var(--zen-orange-dark);
}

.chip-zen-muted {
  border: 1px solid var(--zen-border);
  background: var(--zen-surface-alt);
  color: var(--zen-muted);
}

.chip-zen-warning {
  border: 1px solid rgba(217, 119, 6, 0.18);
  background: var(--zen-warning-soft);
  color: var(--zen-orange-dark);
}

.chip-zen-success {
  border: 1px solid rgba(22, 163, 74, 0.14);
  background: var(--zen-success-soft);
  color: var(--zen-success);
}

.chip-zen-dark {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--zen-charcoal);
  color: #ffffff;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
}

.section-title {
  color: var(--zen-text-strong);
  font-size: clamp(1.15rem, 1vw + 0.9rem, 1.5rem);
  font-weight: 800;
  line-height: 1.5;
  letter-spacing: -0.02em;
}

.section-subtitle {
  margin-top: 0.35rem;
  max-width: 42rem;
  color: var(--zen-muted);
  font-size: 0.875rem;
  line-height: 1.85;
}

.t-display {
  color: var(--zen-text-strong);
  font-size: clamp(1.7rem, 2.4vw + 1rem, 3.1rem);
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.04em;
}

.t-h1 {
  color: var(--zen-text-strong);
  font-size: clamp(1.4rem, 1.3vw + 1rem, 2rem);
  font-weight: 800;
  line-height: 1.45;
  letter-spacing: -0.03em;
}

.t-h2 {
  color: var(--zen-text-strong);
  font-size: clamp(1.15rem, 0.8vw + 0.95rem, 1.5rem);
  font-weight: 800;
  line-height: 1.5;
}

.t-h3 {
  color: var(--zen-text-strong);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.6;
}

.t-body {
  color: var(--zen-text);
  font-size: 0.925rem;
  line-height: 1.9;
}

.t-small {
  color: var(--zen-muted);
  font-size: 0.8125rem;
  line-height: 1.8;
}

.t-caption {
  color: var(--zen-muted-soft);
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.7;
}

.t-price {
  color: var(--zen-text-strong);
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.t-meta {
  color: var(--zen-muted);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.7;
}

.btn-primary,
.btn-secondary,
.btn-outline,
.btn-ghost {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--zen-radius);
  padding: 0.75rem 1.1rem;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    opacity 160ms ease;
}

.btn-primary {
  border: 1px solid var(--zen-orange-dark);
  background: var(--zen-orange-dark);
  color: #fff;
}

.btn-primary:hover {
  border-color: var(--zen-orange-deep);
  background: var(--zen-orange-deep);
}

.btn-primary:focus-visible,
.btn-secondary:focus-visible,
.btn-outline:focus-visible,
.btn-ghost:focus-visible {
  outline: 2px solid var(--zen-focus);
  outline-offset: 2px;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  border-color: var(--zen-border-strong);
  background: #eef0f4;
  color: var(--zen-muted-soft);
}

.btn-secondary {
  border: 1px solid var(--zen-charcoal);
  background: var(--zen-charcoal);
  color: #fff;
}

.btn-secondary:hover {
  background: var(--zen-charcoal-soft);
}

.btn-outline {
  border: 1px solid var(--zen-border);
  background: #fff;
  color: var(--zen-text);
}

.btn-outline:hover {
  border-color: rgba(217, 119, 6, 0.28);
  background: var(--zen-surface-tint);
  color: var(--zen-orange-dark);
}

.btn-ghost {
  border: 1px solid transparent;
  background: transparent;
  color: var(--zen-muted);
}

.btn-ghost:hover {
  background: var(--zen-surface-alt);
  color: var(--zen-charcoal);
}

.input-zen {
  width: 100%;
  min-height: 46px;
  border-radius: var(--zen-radius);
  border: 1px solid var(--zen-border);
  background: #fff;
  padding: 0.75rem 0.9rem;
  color: var(--zen-text);
  font-size: 16px;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.input-zen::placeholder {
  color: #98a2b3;
}

.input-zen:focus {
  border-color: rgba(217, 119, 6, 0.55);
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.08);
}

textarea.input-zen {
  min-height: 120px;
  resize: vertical;
}

.text-link-zen {
  color: var(--zen-orange-dark);
  transition: color 160ms ease;
}

.text-link-zen:hover {
  color: var(--zen-orange-deep);
}

.divider-zen {
  border-color: rgba(230, 232, 238, 0.9);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-none {
  scrollbar-width: none;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.mobile-bottom-safe {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);
}

.mobile-floating-offset {
  bottom: calc(env(safe-area-inset-bottom, 0px) + 5.5rem);
}

.notebook-perspective {
  perspective: 2000px;
}

.notebook-sheet,
.notebook-page-layer {
  transform-style: preserve-3d;
  backface-visibility: hidden;
  border-radius: 16px;
}

.admin-app-bg {
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.12), transparent 28%),
    radial-gradient(circle at top left, rgba(17, 24, 39, 0.05), transparent 20%),
    linear-gradient(180deg, #f5f7fb 0%, #eef2f8 100%);
}

.admin-panel {
  border: 1px solid #e6eaf2;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 20px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.07);
}

@media (min-width: 768px) {
  .btn-primary,
  .btn-secondary,
  .btn-outline,
  .btn-ghost {
    min-height: 44px;
    font-size: 0.9rem;
  }

  .input-zen {
    min-height: 44px;
    font-size: 0.9rem;
  }
}

@media (max-width: 639px) {
  .section-heading {
    align-items: start;
    flex-direction: column;
  }

  .section-heading > * {
    min-width: 0;
  }
}

.admin-panel-muted {
  border: 1px solid #e6eaf2;
  background: linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%);
  border-radius: 20px;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.05);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.admin-chip,
.admin-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  border-radius: 999px;
  border: 1px solid #e6eaf2;
  background: rgba(255, 255, 255, 0.88);
  padding: 0 14px;
  color: #475467;
}

.admin-chip-active,
.admin-tab-chip-active {
  border-color: rgba(245, 158, 11, 0.18);
  background: #111827;
  color: #fff;
  box-shadow: 0 12px 24px rgba(17, 24, 39, 0.12);
}

.admin-sidebar {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.18), transparent 32%),
    linear-gradient(180deg, #111827 0%, #0f172a 100%);
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.18);
}

.admin-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  border-radius: 14px;
  padding: 0 14px;
  color: rgba(255, 255, 255, 0.68);
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.admin-nav-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.admin-nav-link-active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  box-shadow: inset 4px 0 0 0 var(--zen-orange);
}

.admin-kpi {
  border: 1px solid #e6eaf2;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 18px;
  padding: 20px;
}

.admin-kpi-label {
  color: #667085;
  font-size: 0.8rem;
  font-weight: 700;
}

.admin-kpi-value {
  margin-top: 14px;
  color: #111827;
  font-size: clamp(1.4rem, 1.2vw + 1rem, 2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
}

.admin-kpi-helper {
  margin-top: 6px;
  color: #98a2b3;
  font-size: 0.74rem;
  line-height: 1.9;
}

.admin-workspace :where(input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), select, textarea) {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e6eaf2;
  background: #fff;
  color: #111827;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.admin-workspace :where(input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), select) {
  min-height: 46px;
  padding: 0.8rem 0.95rem;
}

.admin-workspace textarea {
  min-height: 110px;
  padding: 0.9rem 0.95rem;
  resize: vertical;
}

.admin-workspace :where(input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), select, textarea):focus {
  border-color: rgba(245, 158, 11, 0.55);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.08);
}

.admin-workspace table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.admin-workspace thead th {
  background: #f8fafc;
  color: #98a2b3;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.admin-workspace tbody tr {
  background: rgba(255, 255, 255, 0.9);
}

.admin-workspace tbody td {
  vertical-align: top;
}

.admin-workspace details summary::-webkit-details-marker {
  display: none;
}

@media (max-width: 767px) {
  .section-heading {
    align-items: start;
    flex-direction: column;
  }

  .container-zen {
    width: min(100% - 20px, 1280px);
  }
}

```

### `postcss.config.mjs`

```mjs
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;

```

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "aidlube.ir",
      },
      {
        protocol: "https",
        hostname: "www.aidlube.ir",
      },
      {
        protocol: "https",
        hostname: "cdn-sth1.bama.ir",
      },
    ],
  },
};

export default nextConfig;

```
