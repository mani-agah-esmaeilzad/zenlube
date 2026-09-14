import { Prisma, PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

type CategorySeed = {
  title: string;
  slug: string;
  description: string;
  sortOrder: number;
};

type FaqItem = {
  question: string;
  answer: string;
};

type PostSeed = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  readMinutes: number;
  categorySlug: string;
  seoTitle: string;
  seoDescription: string;
  faqItems: FaqItem[];
  relatedProductSlugs: string[];
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: Date;
};

const categories: CategorySeed[] = [
  {
    title: "راهنمای روغن موتور",
    slug: "engine-oil-guides",
    description: "راهنمای انتخاب گرانروی، سطح کیفی و حجم مناسب روغن موتور برای خودروهای مختلف.",
    sortOrder: 10,
  },
  {
    title: "راهنمای خودروهای MG",
    slug: "mg-car-guides",
    description: "راهنمای سرویس، روغن موتور و محصولات مصرفی مناسب خودروهای ام‌جی براساس دفترچه و داده فنی.",
    sortOrder: 20,
  },
  {
    title: "اکتان بوستر و مکمل سوخت",
    slug: "octane-boosters",
    description: "راهنمای انتخاب و استفاده از اکتان بوستر، مکمل سوخت و بنزین مسابقه‌ای.",
    sortOrder: 30,
  },
  {
    title: "نگهداری خودرو",
    slug: "maintenance-guides",
    description: "نکته‌های کاربردی برای سرویس دوره‌ای و نگهداری بهتر خودرو.",
    sortOrder: 40,
  },
];

const publishedAt = new Date("2026-09-14T09:00:00.000+03:30");

const posts: PostSeed[] = [
  {
    title: "روغن موتور مناسب MG 6 چیست؟",
    slug: "mg6-engine-oil-guide",
    excerpt:
      "برای MG 6 قدیم و نیوفیس، انتخاب روغن باید براساس نسل موتور، شرایط کارکرد و استاندارد دفترچه انجام شود؛ این راهنما انتخاب‌های امن‌تر 5W-30 و 5W-40 را توضیح می‌دهد.",
    coverImage: "/blog/covers/mg6-engine-oil-guide.png",
    tags: ["ام جی", "MG 6", "روغن موتور", "5W-30", "5W-40", "توربو"],
    readMinutes: 5,
    categorySlug: "mg-car-guides",
    seoTitle: "روغن موتور مناسب MG 6 | راهنمای 5W-30 و 5W-40",
    seoDescription:
      "راهنمای انتخاب روغن موتور مناسب MG 6 قدیم و نیوفیس براساس گرانروی، سطح کیفی، حجم سرویس و شرایط استفاده در ایران.",
    faqItems: [
      {
        question: "برای MG 6 روغن 5W-30 بهتر است یا 5W-40؟",
        answer:
          "در داده فنی اویل‌بار برای MG 6 هر دو گرانروی 5W-30 و 5W-40 دیده می‌شود. انتخاب نهایی به نسل خودرو، دمای محیط، کارکرد موتور و سابقه سرویس بستگی دارد.",
      },
      {
        question: "حجم روغن MG 6 چقدر است؟",
        answer:
          "برای MG 6 مدل 2010 تا 2014 حدود ۵.۱ لیتر و برای MG 6 نیوفیس حدود ۴.۹ لیتر در داده فنی اویل‌بار ثبت شده است؛ هنگام سرویس سطح نهایی با گیج کنترل شود.",
      },
      {
        question: "آیا روغن 10W-40 برای MG 6 پیشنهاد می‌شود؟",
        answer:
          "برای MG 6های توربو بهتر است اولویت با روغن تمام‌سنتتیک و سطح کیفی جدید باشد. اگر خودرو کارکرد بالا دارد، قبل از تغییر گرید با کارشناس فنی مشورت کنید.",
      },
    ],
    relatedProductSlugs: [
      "aidlube-master-tech-5w30-sn-c3-5l",
      "aidlube-master-tech-5w30-sn-c3-4l",
      "aidlube-master-select-5w40-sn-a3-b4-4l",
      "zic-x9-5w30-4l",
      "zic-x9-5w40-4l",
    ],
    isFeatured: true,
    sortOrder: 10,
    publishedAt,
    content: `### خلاصه سریع انتخاب روغن MG 6
اگر MG 6 شما از نسل 2010 تا 2014 یا نیوفیس 2015 تا 2017 است، در دیتای فنی اویل‌بار گریدهای 5W-30، 5W-40 و در بعضی نسخه‌ها 0W-30 دیده می‌شود. برای استفاده روزمره در ایران، انتخاب بین 5W-30 و 5W-40 باید با توجه به سلامت موتور، دمای محیط و سابقه سرویس انجام شود.

### چرا برای MG 6 حساسیت بیشتری لازم است؟
MG 6 معمولاً با موتور توربو شناخته می‌شود و موتورهای توربو به کیفیت روغن، پایداری حرارتی و تعویض به‌موقع حساس‌ترند. روغن ضعیف یا دیر تعویض‌شده می‌تواند روی صدای موتور، افت شتاب، مصرف سوخت و سلامت توربو اثر بگذارد.

### انتخاب پیشنهادی براساس وضعیت خودرو
- اگر موتور سالم، کم‌کارکرد و سرویس‌منظم است، 5W-30 با سطح کیفی جدید گزینه اقتصادی و منطقی‌تری است.
- اگر خودرو در ترافیک سنگین، هوای گرم یا رانندگی پرفشار کار می‌کند، 5W-40 با کیفیت مناسب می‌تواند فیلم روغن مقاوم‌تری بدهد.
- اگر خودرو نشتی، روغن‌سوزی یا صدای غیرعادی دارد، قبل از خرید روغن گران‌تر اول عیب فنی را بررسی کنید.

### حجم سرویس را اشتباه نگیرید
برای MG 6 مدل 2010 تا 2014 حجم سرویس حدود ۵.۱ لیتر و برای MG 6 نیوفیس حدود ۴.۹ لیتر ثبت شده است. یعنی یک ظرف ۴ لیتری به‌تنهایی معمولاً برای سرویس کامل کافی نیست و باید مقدار تکمیلی هم‌مشخصات داشته باشید.

### جمع‌بندی اویل‌بار
برای MG 6، روغن را فقط با اسم برند انتخاب نکنید. گرانروی، سطح کیفی، اصل بودن محصول و حجم کافی برای سرویس کامل مهم‌ترند. اگر بین دو گزینه مردد هستید، از مشاوره فنی اویل‌بار کمک بگیرید تا براساس مدل دقیق خودرو انتخاب کنیم.`,
  },
  {
    title: "روغن موتور مناسب MG 5 مدل 2023 و 2024",
    slug: "mg5-engine-oil-guide",
    excerpt:
      "MG 5 جدید با موتور 1.5L CVT در دیتای فنی اویل‌بار با روغن 0W-20 ثبت شده و نباید با نسخه‌های قدیمی‌تر MG اشتباه گرفته شود.",
    coverImage: "/blog/covers/mg5-engine-oil-guide.png",
    tags: ["ام جی", "MG 5", "0W-20", "روغن موتور", "CVT"],
    readMinutes: 4,
    categorySlug: "mg-car-guides",
    seoTitle: "روغن موتور مناسب MG 5 مدل 2023-2024",
    seoDescription:
      "راهنمای روغن موتور MG 5 مدل 2023 و 2024 با موتور 1.5L CVT؛ نکات انتخاب 0W-20 و اشتباهات رایج هنگام خرید.",
    faqItems: [
      {
        question: "برای MG 5 جدید چه گرانروی ثبت شده است؟",
        answer:
          "در دیتای فنی اویل‌بار برای MG 5 مدل 2023 تا 2024 با موتور 1.5L CVT، گرانروی 0W-20 ثبت شده است.",
      },
      {
        question: "آیا می‌توان برای MG 5 جدید روغن 5W-30 ریخت؟",
        answer:
          "بدون بررسی دفترچه و شرایط دقیق خودرو توصیه نمی‌شود. وقتی سازنده گرید کم‌ویسکوزیته مثل 0W-20 را مشخص کرده، تغییر گرید باید با احتیاط و مشورت فنی انجام شود.",
      },
      {
        question: "MG 5 با MG 6 از نظر روغن یکی است؟",
        answer:
          "خیر. MG 5 جدید و MG 6های قدیمی/توربو در دیتای فنی اویل‌بار یکسان نیستند و نباید نسخه روغن آن‌ها را جای هم استفاده کرد.",
      },
    ],
    relatedProductSlugs: ["aidlube-eco-advance-0w20-sn-gf5-4l", "zic-x9-zero-0w20-4l", "zic-x9-zero-0w20-1l"],
    isFeatured: true,
    sortOrder: 20,
    publishedAt,
    content: `### نکته اصلی برای MG 5
MG 5 جدید را نباید با MGهای قدیمی‌تر یکی در نظر گرفت. در دیتای فنی اویل‌بار برای MG 5 مدل 2023 تا 2024 با موتور 1.5L CVT، گرانروی 0W-20 ثبت شده است.

### چرا 0W-20 مهم است؟
روغن 0W-20 برای کاهش اصطکاک، روانکاری سریع‌تر در استارت سرد و هماهنگی با طراحی موتورهای جدید استفاده می‌شود. اگر به‌جای آن گرید غلیظ‌تر انتخاب شود، ممکن است مصرف سوخت و رفتار موتور تغییر کند.

### چه زمانی باید بیشتر دقت کرد؟
- اگر خودرو گارانتی دارد، حتماً با دفترچه و شرایط گارانتی هماهنگ بمانید.
- اگر ماشین تازه وارد کشور شده یا سابقه سرویس آن مشخص نیست، اول مدل دقیق موتور را کنترل کنید.
- اگر در سایت محصول 0W-20 ناموجود بود، عجله نکنید و جایگزین را با مشاوره انتخاب کنید.

### جمع‌بندی اویل‌بار
برای MG 5 جدید، اولویت با روغن 0W-20 و سطح کیفی معتبر است. اگر بین محصولات موجود و ناموجود مردد هستید، بهتر است مدل دقیق خودرو و شرایط کارکرد را بگویید تا انتخاب اشتباه انجام نشود.`,
  },
  {
    title: "5W-30 یا 5W-40؛ کدام روغن موتور را انتخاب کنیم؟",
    slug: "5w30-vs-5w40-engine-oil",
    excerpt:
      "تفاوت 5W-30 و 5W-40 فقط یک عدد نیست؛ این انتخاب روی روانکاری، مصرف سوخت، عملکرد در گرما و محافظت موتور اثر می‌گذارد.",
    coverImage: "/blog/covers/5w30-vs-5w40-engine-oil.png",
    tags: ["روغن موتور", "5W-30", "5W-40", "راهنمای خرید"],
    readMinutes: 6,
    categorySlug: "engine-oil-guides",
    seoTitle: "تفاوت روغن موتور 5W-30 و 5W-40 | راهنمای انتخاب",
    seoDescription:
      "مقایسه کاربردی روغن موتور 5W-30 و 5W-40 برای انتخاب بهتر براساس دفترچه خودرو، کارکرد موتور، آب‌وهوا و نوع رانندگی.",
    faqItems: [
      {
        question: "آیا 5W-40 همیشه بهتر از 5W-30 است؟",
        answer:
          "خیر. 5W-40 در دمای کاری غلیظ‌تر است، اما اگر دفترچه خودرو 5W-30 را الزام کرده باشد، انتخاب غلیظ‌تر همیشه تصمیم بهتری نیست.",
      },
      {
        question: "برای هوای گرم کدام بهتر است؟",
        answer:
          "در بعضی خودروها 5W-40 برای گرما و رانندگی سنگین مناسب‌تر است، اما باید با گریدهای مجاز دفترچه خودرو هماهنگ باشد.",
      },
      {
        question: "آیا می‌توان هر بار گرید روغن را تغییر داد؟",
        answer:
          "بهتر است گرید روغن را بی‌دلیل تغییر ندهید. تغییر باید براساس دفترچه، وضعیت موتور و نظر سرویس‌کار انجام شود.",
      },
    ],
    relatedProductSlugs: [
      "aidlube-master-tech-5w30-sn-c3-4l",
      "aidlube-master-select-5w40-sn-a3-b4-4l",
      "bareliz-bz1-5w30-sn-c3-4l",
      "bareliz-bz1-5w40-sn-a3b4-4l",
      "zic-x9-5w30-4l",
      "zic-x9-5w40-4l",
    ],
    isFeatured: false,
    sortOrder: 30,
    publishedAt,
    content: `### معنی عددها چیست؟
در 5W-30 و 5W-40، بخش 5W رفتار روغن در سرما را نشان می‌دهد و عدد دوم رفتار روغن در دمای کاری موتور را. بنابراین هر دو در استارت سرد نزدیک به هم‌اند، اما 5W-40 در دمای کاری غلیظ‌تر از 5W-30 است.

### چه زمانی 5W-30 انتخاب بهتری است؟
- وقتی دفترچه خودرو 5W-30 را به‌عنوان گرید اصلی معرفی کرده باشد.
- وقتی موتور سالم و کم‌کارکرد است و هدف کاهش مصرف سوخت و روانکاری سریع‌تر است.
- وقتی سطح کیفی مناسب مثل API SN، SP یا استاندارد ACEA موردنیاز خودرو روی محصول وجود دارد.

### چه زمانی 5W-40 منطقی‌تر می‌شود؟
- وقتی دفترچه خودرو 5W-40 را جزو گریدهای مجاز گذاشته باشد.
- وقتی خودرو در گرما، ترافیک سنگین یا رانندگی پرفشار استفاده می‌شود.
- وقتی موتور کارکرد بالاتر دارد و هنوز از نظر فنی سالم است.

### اشتباه رایج
بعضی‌ها فکر می‌کنند هرچه روغن غلیظ‌تر باشد بهتر است. این نگاه دقیق نیست. روغن باید به طراحی موتور برسد، نه اینکه فقط عدد بالاتری داشته باشد.

### جمع‌بندی اویل‌بار
اول دفترچه خودرو، بعد سطح کیفی، بعد برند. اگر هر دو گرید برای خودروی شما مجاز است، شرایط رانندگی و سلامت موتور تعیین می‌کند کدام انتخاب بهتر است.`,
  },
  {
    title: "اکتان بوستر چیست و چه زمانی واقعاً لازم می‌شود؟",
    slug: "what-is-octane-booster",
    excerpt:
      "اکتان بوستر برای هر خودرو معجزه نمی‌کند، اما در موتورهای حساس‌تر، توربو یا خودروهایی که با بنزین معمولی ناک می‌زنند می‌تواند مفید باشد.",
    coverImage: "/blog/covers/what-is-octane-booster.png",
    tags: ["اکتان بوستر", "مکمل سوخت", "بنزین", "ناک موتور"],
    readMinutes: 5,
    categorySlug: "octane-boosters",
    seoTitle: "اکتان بوستر چیست؟ راهنمای استفاده و خرید",
    seoDescription:
      "راهنمای ساده و کاربردی اکتان بوستر؛ چه زمانی لازم است، برای چه خودروهایی مفید است و هنگام خرید به چه نکاتی توجه کنیم.",
    faqItems: [
      {
        question: "اکتان بوستر قدرت موتور را زیاد می‌کند؟",
        answer:
          "اگر موتور به اکتان بالاتر نیاز داشته باشد یا دچار ناک شود، اکتان بوستر می‌تواند عملکرد را پایدارتر کند. اما روی همه خودروها افزایش محسوس قدرت ایجاد نمی‌کند.",
      },
      {
        question: "هر بار بنزین زدن باید اکتان بوستر استفاده کنم؟",
        answer:
          "نه لزوماً. استفاده به کیفیت بنزین، نوع موتور، شرایط رانندگی و توصیه سازنده بستگی دارد.",
      },
      {
        question: "اکتان بوستر جای تعمیر موتور را می‌گیرد؟",
        answer:
          "خیر. اگر ناک، بدسوزی یا افت شتاب به دلیل خرابی شمع، کویل، انژکتور یا سنسورها باشد، اول باید عیب فنی رفع شود.",
      },
    ],
    relatedProductSlugs: [
      "persia-sign-up-to-5-octane-booster-450ml",
      "unium-octane-booster-ba29ex-355ml",
      "xado-verylube-octane-booster-250ml",
      "xado-octane-booster-f8-250ml",
    ],
    isFeatured: false,
    sortOrder: 40,
    publishedAt,
    content: `### اکتان بوستر دقیقاً چه کار می‌کند؟
اکتان بوستر افزودنی سوخت است که برای بالا بردن مقاومت بنزین در برابر خودسوزی یا ناک استفاده می‌شود. وقتی موتور به بنزین با اکتان بالاتر نیاز دارد، کیفیت پایین سوخت می‌تواند باعث صدای ناک، افت کشش و عملکرد ناپایدار شود.

### برای چه خودروهایی بیشتر کاربرد دارد؟
- خودروهای توربو یا موتورهای پرفشار
- خودروهایی که سازنده بنزین سوپر یا اکتان بالاتر پیشنهاد کرده
- ماشین‌هایی که در سربالایی، گرما یا فشار بالا ناک می‌زنند
- خودروهایی که کیفیت بنزین منطقه برایشان کافی نیست

### چه انتظاری نباید داشته باشیم؟
اکتان بوستر قرار نیست موتور خراب را تعمیر کند. اگر ایراد از شمع، کویل، انژکتور، سنسور اکسیژن یا کیفیت سرویس باشد، افزودنی فقط مشکل را پنهان می‌کند یا اثر کمی دارد.

### چطور استفاده کنیم؟
مقدار مصرف هر برند متفاوت است. معمولاً باید قبل یا هنگام بنزین زدن داخل باک ریخته شود تا بهتر با سوخت مخلوط شود. همیشه نسبت مصرف محصول را از توضیحات همان کالا بخوانید.

### جمع‌بندی اویل‌بار
اگر خودروی شما به اکتان حساس است، اکتان بوستر خوب می‌تواند انتخاب مفیدی باشد. اما اگر خودرو عادی و بدون ناک کار می‌کند، استفاده دائمی ضرورتی ندارد.`,
  },
  {
    title: "بهترین اکتان بوستر برای خودروهای توربو؛ چطور انتخاب کنیم؟",
    slug: "best-octane-booster-for-turbo-cars",
    excerpt:
      "خودروهای توربو به کیفیت بنزین حساس‌ترند. در این راهنما می‌گوییم هنگام انتخاب اکتان بوستر برای موتور توربو به چه چیزهایی توجه کنید.",
    coverImage: "/blog/covers/best-octane-booster-for-turbo-cars.png",
    tags: ["اکتان بوستر", "توربو", "موتور توربو", "مکمل سوخت"],
    readMinutes: 5,
    categorySlug: "octane-boosters",
    seoTitle: "بهترین اکتان بوستر برای خودروهای توربو | راهنمای خرید",
    seoDescription:
      "راهنمای انتخاب اکتان بوستر مناسب خودروهای توربو؛ نکات مهم درباره ناک، کیفیت بنزین، مقدار مصرف و محصولات پیشنهادی اویل‌بار.",
    faqItems: [
      {
        question: "خودروی توربو همیشه به اکتان بوستر نیاز دارد؟",
        answer:
          "همیشه نه. اگر کیفیت سوخت مناسب باشد و موتور ناک نزند، استفاده دائمی ضروری نیست. اما برای بنزین ضعیف یا رانندگی پرفشار می‌تواند کمک‌کننده باشد.",
      },
      {
        question: "برای توربو، اکتان بوستر ارزان کافی است؟",
        answer:
          "برای موتورهای حساس بهتر است محصول معتبر و اصل انتخاب شود؛ چون کیفیت افزودنی و مقدار مصرف اهمیت زیادی دارد.",
      },
      {
        question: "اگر با اکتان بوستر هم ناک ادامه داشت چه کار کنم؟",
        answer:
          "در این حالت باید سیستم جرقه، انژکتورها، سنسورها، کیفیت روغن و سلامت موتور بررسی شود.",
      },
    ],
    relatedProductSlugs: [
      "unium-octane-booster-ba29ex-355ml",
      "persia-sign-up-to-5-octane-booster-450ml",
      "xado-octane-booster-f8-250ml",
      "xado-verylube-octane-booster-250ml",
      "persia-sign-up-to-5-octane-booster-450ml-pack-2",
      "persia-sign-up-to-5-octane-booster-450ml-pack-3",
    ],
    isFeatured: false,
    sortOrder: 50,
    publishedAt,
    content: `### چرا موتور توربو حساس‌تر است؟
در موتور توربو، هوای بیشتری وارد سیلندر می‌شود و فشار احتراق بالاتر می‌رود. همین موضوع باعث می‌شود کیفیت بنزین و عدد اکتان اهمیت بیشتری پیدا کند. اگر سوخت مناسب نباشد، احتمال ناک و افت عملکرد بیشتر می‌شود.

### معیارهای انتخاب اکتان بوستر
- برند معتبر و محصول اصل
- حجم و نسبت مصرف مناسب با حجم باک
- مناسب بودن برای استفاده شهری یا رانندگی پرفشار
- توضیحات شفاف درباره نوع افزودنی و روش مصرف

### کدام محصول را انتخاب کنیم؟
اگر مصرف گاه‌به‌گاه دارید، یک بطری اکتان بوستر معتبر کافی است. اگر خودرو توربو دارید و مرتب از مکمل استفاده می‌کنید، پک‌های چندتایی پرشیا ساین می‌تواند اقتصادی‌تر باشد. برای انتخاب دقیق‌تر، حجم باک، نوع خودرو و کیفیت بنزین مصرفی را در نظر بگیرید.

### استفاده درست مهم‌تر از خرید گران است
حتی بهترین اکتان بوستر هم اگر با نسبت اشتباه مصرف شود یا بعد از پر شدن کامل باک به‌خوبی مخلوط نشود، اثر مطلوبی ندارد. محصول را طبق راهنمای همان برند استفاده کنید.

### جمع‌بندی اویل‌بار
برای خودروی توربو، اکتان بوستر خوب یک ابزار کمکی است، نه جایگزین سرویس. اگر خودرو ناک می‌زند یا در شتاب‌گیری افت دارد، هم سوخت را بررسی کنید هم وضعیت فنی موتور را.`,
  },
];

async function main() {
  const categoryBySlug = new Map<string, { id: string }>();

  for (const category of categories) {
    const savedCategory = await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: {
        title: category.title,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        title: category.title,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      select: { id: true, slug: true },
    });

    categoryBySlug.set(savedCategory.slug, { id: savedCategory.id });
  }

  const allRelatedSlugs = [...new Set(posts.flatMap((post) => post.relatedProductSlugs))];
  const existingProducts = await prisma.product.findMany({
    where: { slug: { in: allRelatedSlugs } },
    select: { slug: true },
  });
  const existingProductSlugs = new Set(existingProducts.map((product) => product.slug));

  for (const post of posts) {
    const category = categoryBySlug.get(post.categorySlug);
    if (!category) throw new Error(`Missing blog category: ${post.categorySlug}`);

    const relatedProductSlugs = post.relatedProductSlugs.filter((slug) => existingProductSlugs.has(slug));
    const missingProductSlugs = post.relatedProductSlugs.filter((slug) => !existingProductSlugs.has(slug));

    if (missingProductSlugs.length) {
      console.warn(`Skipped missing related products for ${post.slug}: ${missingProductSlugs.join(", ")}`);
    }

    const payload = {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      tags: post.tags,
      authorName: "تیم تحریریه Oilbar",
      readMinutes: post.readMinutes,
      status: "PUBLISHED" as const,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      faqItems: post.faqItems as Prisma.InputJsonValue,
      relatedProductSlugs,
      isFeatured: post.isFeatured,
      sortOrder: post.sortOrder,
      publishedAt: post.publishedAt,
      categoryId: category.id,
    };

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: payload,
      create: {
        slug: post.slug,
        ...payload,
      },
    });
  }

  console.log(`Seeded ${categories.length} magazine categories and ${posts.length} published blog posts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
