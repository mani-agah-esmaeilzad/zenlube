export type EditorialGuideLink = {
  href: string;
  title: string;
  description: string;
};

const fuelSystemGuideSlugs = new Set([
  "fuel-system-revival-guide",
  "xado-atomex-energy-drive-guide",
  "octane-booster-vs-fuel-system-cleaner",
  "what-is-octane-booster",
  "best-octane-booster-for-turbo-cars",
  "persia-sign-octane-booster-pack-buying-guide",
]);

const fuelSystemGuides: Array<EditorialGuideLink & { slug?: string }> = [
  {
    href: "/fuel-system-revival",
    title: "مرکز راهنمای احیای سیستم سوخت",
    description: "از نشانه‌های ناک و افت شتاب تا انتخاب درست مکمل، اکتان یا شوینده",
  },
  {
    slug: "xado-atomex-energy-drive-guide",
    href: "/blog/xado-atomex-energy-drive-guide",
    title: "Energy Drive زادو چیست؟",
    description: "کاربرد، روش مصرف و تفاوت آن با اکتان بوستر و انژکتورشوی",
  },
  {
    slug: "octane-booster-vs-fuel-system-cleaner",
    href: "/blog/octane-booster-vs-fuel-system-cleaner",
    title: "اکتان بوستر یا انژکتورشوی؟",
    description: "انتخاب مکمل براساس نشانه و نیاز واقعی خودرو",
  },
  {
    slug: "fuel-system-revival-guide",
    href: "/blog/fuel-system-revival-guide",
    title: "راهنمای کامل احیای سیستم سوخت",
    description: "مسیر مرحله‌به‌مرحله از تشخیص اولیه تا سرویس اصولی",
  },
  {
    slug: "best-octane-booster-for-turbo-cars",
    href: "/blog/best-octane-booster-for-turbo-cars",
    title: "اکتان مناسب خودروهای توربو",
    description: "نکات انتخاب برای موتورهای حساس به کیفیت بنزین",
  },
];

export function getEditorialGuideLinks(slug: string): EditorialGuideLink[] {
  if (!fuelSystemGuideSlugs.has(slug)) return [];

  return fuelSystemGuides
    .filter((guide) => guide.slug !== slug)
    .slice(0, 4)
    .map(({ href, title, description }) => ({ href, title, description }));
}
