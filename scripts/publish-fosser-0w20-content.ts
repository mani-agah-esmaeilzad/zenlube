import { writeFile } from "node:fs/promises";
import { Prisma, PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();
const categorySlug = "engine-oil-guides";
const publishedAt = new Date("2026-09-29T12:00:00.000+03:30");

const posts = [
  {
    slug: "0w20-engine-oil-guide-for-modern-cars",
    title: "روغن 0W-20 برای چه خودروهایی مناسب است؟",
    excerpt:
      "روغن 0W-20 برای هر خودرویی مناسب نیست. مشخصات FOSSER Premium GM، استانداردهای اعلام‌شده و روش تطبیق با دفترچه خودرو را بخوانید.",
    seoTitle: "روغن فوسر 0W-20؛ مشخصات و راهنمای انتخاب خودرو",
    seoDescription:
      "مشخصات فوسر Premium GM 0W-20، استانداردهای اعلام‌شده سازنده و نکات انتخاب خودرو براساس دفترچه؛ تفاوت گرانروی SAE با سطح کیفی API و ILSAC.",
    tags: ["روغن موتور", "0W-20", "فوسر", "FOSSER", "Premium GM", "API SQ", "ILSAC GF-7A", "راهنمای خرید"],
    readMinutes: 6,
    faqItems: [
      {
        question: "آیا روغن 0W-20 برای هر خودرویی مناسب است؟",
        answer:
          "خیر. 0W-20 فقط زمانی انتخاب درستی است که دفترچه یا داده فنی معتبر، همین گرید و سطح کیفی را برای کد دقیق موتور مجاز بداند.",
      },
      {
        question: "روغن FOSSER Premium GM 0W-20 چه مشخصاتی دارد؟",
        answer:
          "در صفحه فنی فعلی FOSSER، مشخصات API SQ (RC)، API SP (RC)، ILSAC GF-7A و GF-5/GF-6A درج شده است. برچسب ظرف و برگه فنی همان سری را نیز بررسی کنید.",
      },
      {
        question: "آیا Premium GM 0W-20 برای موتور دیزل مناسب است؟",
        answer:
          "طبق معرفی سازنده، این محصول برای موتورهای دیزل مناسب نیست. برای موتور دیزل باید الزام دفترچه و مشخصات محصول متناسب با آن موتور را بررسی کرد.",
      },
      {
        question: "در هوای گرم ایران باید 0W-20 را با روغن غلیظ‌تر عوض کرد؟",
        answer:
          "گرم‌بودن هوا به‌تنهایی دلیل کافی برای تغییر گرید نیست. دفترچه، کد دقیق موتور و شرایط کارکرد خودرو را ملاک قرار دهید.",
      },
    ],
    content: `### 0W-20 نام گرید است، نه تضمین سازگاری
0W-20 رده گرانروی SAE است؛ به‌تنهایی استاندارد کیفیت یا مجوز استفاده برای همه خودروها نیست. برای انتخاب باید گرید، سطح کیفی و هر تأییدیه‌ای را که خودروساز الزام کرده با دفترچه همان موتور تطبیق دهید.

### مشخصات FOSSER Premium GM 0W-20
در صفحه فنی رسمی فعلی فوسر، Premium GM 0W-20 برای موتورهای بنزینی مدرن که سازنده‌شان گرانروی پایین را تجویز می‌کند معرفی شده و برای موتور دیزل مناسب اعلام نشده است. مشخصات درج‌شده شامل API SQ (RC)، API SP (RC)، ILSAC GF-7A و GF-5/GF-6A است.

فوسر برای این محصول تعدادی «توصیه» مربوط به الزامات خودروسازان را نیز ذکر می‌کند. توصیه‌ی سازنده روغن را با تأییدیه رسمی یا الزام دفترچه خودرو یکی نگیرید. نوشته روی ظرف و برگه فنی همان سری کالایی را که می‌خرید هم کنترل کنید؛ فرمول یا برچسب بازارهای مختلف ممکن است تفاوت داشته باشد. نام GM نیز به معنی سازگاری با تمام خودروهای GM نیست.

### چطور مناسب‌بودن را بررسی کنیم؟
- مدل، سال، تیپ و کد موتور را دقیق مشخص کنید؛ نام تجاری خودرو کافی نیست.
- گرید SAE و سطح کیفی موردنیاز را از دفترچه یا منبع فنی معتبر همان موتور بخوانید.
- اگر دفترچه کد تأییدیه خاصی خواسته، همان کد باید روی برچسب یا برگه فنی روغن پیدا شود.
- برای موتور دیزل، فیلتر DPF یا خودروی گارانتی‌دار، فقط مشخصات اختصاصی همان خودرو را ملاک بگیرید.

### مقایسه با 5W-30
عددهای 20 و 30 گرانروی روغن در دمای کاری را در دو رده SAE نشان می‌دهند؛ پایین‌تر بودن عدد به معنی «بهتر بودن» برای هر موتوری نیست. اگر دفترچه 5W-30 یا سطح کیفی دیگری را خواسته، جایگزینی با 0W-20 را بدون مجوز سازنده انجام ندهید.

### جمع‌بندی
ابتدا الزام دفترچه و کد موتور، سپس مشخصات روی محصول را بررسی کنید. FOSSER Premium GM 0W-20 مشخصات فنی اعلام‌شده‌ای دارد، اما سازگاری نهایی فقط با تطبیق آن مشخصات با نیاز خودروی شما معلوم می‌شود. روغن‌سوزی، نشتی یا صدای غیرعادی نیز با تغییر گرید به‌تنهایی برطرف نمی‌شود.`,
    relatedProductSlugs: [
      "fosser-premium-gm-0w20-4l",
      "fosser-premium-gm-0w20-1l",
      "aidlube-eco-advance-0w20-sn-gf5-4l",
      "zic-x9-zero-0w20-4l",
    ],
    isFeatured: true,
    sortOrder: 5,
  },
  {
    slug: "understanding-0w20-api-ilsac-specs",
    title: "تفاوت SAE، API و ILSAC در روغن موتور 0W-20 چیست؟",
    excerpt:
      "0W-20 گرید گرانروی است؛ API و ILSAC سطح‌های عملکردی را مشخص می‌کنند. یاد بگیرید برچسب روغن را با نیاز موتور تطبیق دهید، نه فقط با یک عدد.",
    seoTitle: "تفاوت SAE، API و ILSAC در روغن 0W-20",
    seoDescription:
      "راهنمای خواندن مشخصات روغن 0W-20: تفاوت گرید SAE با دسته‌های API و ILSAC، معنی مشخصات FOSSER Premium GM و روش بررسی دفترچه خودرو.",
    tags: ["روغن موتور", "0W-20", "فوسر", "FOSSER", "API", "ILSAC", "SAE", "استاندارد روغن"],
    readMinutes: 5,
    faqItems: [
      {
        question: "آیا 0W-20 یک استاندارد کیفیت روغن است؟",
        answer:
          "خیر. 0W-20 گرید گرانروی SAE است. برای کیفیت و سازگاری باید دسته‌های عملکردی و الزامات خودروساز را هم بررسی کرد.",
      },
      {
        question: "API SQ یا SP بهتر بودن برای همه خودروها را ثابت می‌کند؟",
        answer:
          "این نمادها دسته مشخصات عملکردی را نشان می‌دهند، اما به‌تنهایی سازگاری با هر موتور را ثابت نمی‌کنند. الزام دفترچه، گرید و کدهای موردنیاز خودرو را نیز تطبیق دهید.",
      },
      {
        question: "ILSAC GF-7A در کنار API چه چیزی را نشان می‌دهد؟",
        answer:
          "این دو نام‌گذاری به نظام‌های مشخصات متفاوت تعلق دارند و می‌توانند هم‌زمان روی محصول درج شوند. هر دو را با الزام خودروساز بررسی کنید و یکی را جایگزین کد خاص دفترچه نکنید.",
      },
    ],
    content: `### سه نوشته متفاوت روی قوطی روغن
روی روغن موتور ممکن است هم‌زمان SAE 0W-20، یک دسته API و یک مشخصه ILSAC ببینید. این عبارت‌ها یک معنی ندارند: SAE درباره گرانروی است، درحالی‌که API و ILSAC دسته‌های عملکردی و آزمون‌های روغن را مشخص می‌کنند.

### SAE 0W-20 چه می‌گوید؟
SAE 0W-20 رده گرانروی روغن را توصیف می‌کند. 0W رفتار روغن را در آزمون‌های دمای پایین و 20 رده گرانروی در دمای کاری را مشخص می‌کند. این عبارت به‌تنهایی نمی‌گوید روغن چه سطح عملکردی دارد یا برای کدام خودرو مجاز است.

### API و ILSAC را چطور بخوانیم؟
API و ILSAC سیستم‌های مشخصات عملکردی‌اند. برای نمونه، صفحه فنی فعلی سازنده برای FOSSER Premium GM 0W-20 عبارت‌های API SQ (RC)، API SP (RC)، ILSAC GF-7A و GF-5/GF-6A را درج می‌کند. این نمونه فقط مشخصات همین محصول است؛ مشخصات را از روی برند یا گرید به محصول دیگری تعمیم ندهید.

### آیا رده جدیدتر همیشه برای هر خودرو مناسب است؟
نه لزوماً. جدیدتر بودن نام یک دسته یا یکسان‌بودن گرید SAE، نیازهای ویژه یک موتور را کنار نمی‌زند. دفترچه ممکن است علاوه بر API یا ILSAC، استاندارد ACEA یا کد تأییدیه اختصاصی خودروساز را لازم بداند. همان الزام دقیق را بررسی کنید.

### روش کوتاه انتخاب
- ابتدا گرید SAE مجاز را از دفترچه موتور پیدا کنید.
- سپس دسته API یا ILSAC و هر تأییدیه اختصاصی خواسته‌شده را تطبیق دهید.
- کاربرد محصول را کنترل کنید؛ برای مثال، FOSSER Premium GM 0W-20 طبق معرفی فوسر برای موتورهای بنزینی است و برای دیزل مناسب نیست.
- در صورت اختلاف دفترچه با توصیه عمومی فروشنده یا نوشته تبلیغاتی، دفترچه و مستند سازنده خودرو اولویت دارد.

### جمع‌بندی
در انتخاب روغن، «0W-20» فقط بخشی از پاسخ است. گرید، سطح عملکرد، تأییدیه و نوع موتور باید کنار هم و بر اساس دفترچه بررسی شوند. از روی عدد گرانروی یا عنوان بازاری محصول، سازگاری قطعی نتیجه نگیرید.`,
    relatedProductSlugs: [
      "fosser-premium-gm-0w20-4l",
      "aidlube-eco-advance-0w20-sn-gf5-4l",
      "zic-x9-zero-0w20-4l",
    ],
    isFeatured: false,
    sortOrder: 31,
  },
];

async function main() {
  const category = await prisma.blogCategory.findUnique({ where: { slug: categorySlug } });
  if (!category) throw new Error(`Magazine category not found: ${categorySlug}`);

  const existingPosts = await prisma.blogPost.findMany({
    where: { slug: { in: posts.map((post) => post.slug) } },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      tags: true,
      authorName: true,
      readMinutes: true,
      status: true,
      seoTitle: true,
      seoDescription: true,
      faqItems: true,
      relatedProductSlugs: true,
      isFeatured: true,
      sortOrder: true,
      publishedAt: true,
      categoryId: true,
    },
  });
  if (existingPosts.length) {
    const backupPath = `/tmp/oilbar-fosser-0w20-articles-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    await writeFile(backupPath, JSON.stringify(existingPosts, null, 2), { mode: 0o600, flag: "wx" });
    console.log(`Saved rollback copy of ${existingPosts.length} existing article(s): ${backupPath}`);
  }

  const requestedProducts = [...new Set(posts.flatMap((post) => post.relatedProductSlugs))];
  const products = await prisma.product.findMany({
    where: { slug: { in: requestedProducts } },
    select: { slug: true },
  });
  const productSlugs = new Set(products.map((product) => product.slug));

  for (const post of posts) {
    const payload = {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: "/blog/covers/0w20-engine-oil-guide-for-modern-cars.png",
      tags: post.tags,
      authorName: "تیم تحریریه Oilbar",
      readMinutes: post.readMinutes,
      status: "PUBLISHED" as const,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      faqItems: post.faqItems as Prisma.InputJsonValue,
      relatedProductSlugs: post.relatedProductSlugs.filter((slug) => productSlugs.has(slug)),
      isFeatured: post.isFeatured,
      sortOrder: post.sortOrder,
      categoryId: category.id,
    };

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: payload,
      create: { slug: post.slug, ...payload, publishedAt },
    });
    console.log(`Published blog article: ${post.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
