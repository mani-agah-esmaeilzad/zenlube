# Oilbar – فروشگاه مینیمال روغن موتور

Oilbar یک فروشگاه کامل برای فروش آنلاین روغن موتور است که با تِم بنفش/سفید/مشکی و طراحی مینیمال پیاده‌سازی شده. این پروژه بر پایه **Next.js 15 (App Router)** ساخته شده و شامل فرانت‌اند، بک‌اند، سیستم احراز هویت، مدیریت سبد خرید، لیست خودروها با مشخصات فنی و **پنل ادمین کامل** برای مدیریت محصولات، دسته‌بندی‌ها، برندها و نگاشت محصولات به خودروها است.

## قابلیت‌ها

- 🎨 رابط کاربری مینیمال با تمرکز روی محصولات ویژه، دسته‌بندی‌ها و برندهای معتبر
- 🛒 سبد خرید متصل به دیتابیس با امکان افزایش/کاهش تعداد و خالی کردن
- 👤 صفحه حساب کاربری، نمایش سفارش‌ها و وضعیت ورود با NextAuth (استراتژی JWT)
- 🚗 لیست خودروها همراه با مشخصات فنی و محصولات توصیه‌شده برای هر خودرو
- 🛠️ پنل ادمین محافظت‌شده برای افزودن/ویرایش موجودی شامل:
  - دسته‌بندی‌ها و برندها
  - خودروها و مشخصات فنی آن‌ها
  - محصولات جدید و نگاشت به خودروهای سازگار
- 🗄️ اتصال به PostgreSQL با Prisma و اسکریپت Seed برای داده‌های نمونه (برندها، دسته‌بندی‌ها، خودروها، محصولات و کاربر ادمین)
- 🌐 آماده استقرار روی Vercel همراه با Postgres (Vercel Postgres یا Neon، Supabase و...)

## تکنولوژی‌ها

- Next.js 15 (App Router, Server/Client Components)
- TypeScript + Tailwind CSS v4
- Prisma ORM + PostgreSQL
- NextAuth (Credentials Provider)
- ESLint (Flat Config)

## راه‌اندازی محلی

1. پیش‌نیازها: Node.js 18+، PostgreSQL یا سرویس ابری معادل
2. پکیج‌ها را نصب کنید:

   ```bash
   npm install
   ```

3. فایل `.env` را مطابق نمونه زیر تنظیم کنید:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
   NEXTAUTH_SECRET="یک_رشته_تصادفی_طولانی"
   NEXTAUTH_URL="http://localhost:3000"
   ZARINPAL_MERCHANT_ID="کد مرچنت زرین‌پال"
   ZARINPAL_CALLBACK_URL="http://localhost:3000/api/payments/zarinpal/callback"
   MELIPAYAMAK_USERNAME="نام کاربری ملی پیامک"
   MELIPAYAMAK_PASSWORD="رمز عبور ملی پیامک"
   MELIPAYAMAK_ORIGINATOR="شماره ارسال‌کننده"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   STORAGE_DRIVER="local" # یا s3
   STORAGE_BUCKET="نام باکت در صورت استفاده از S3"
   AWS_ACCESS_KEY_ID="کلید دسترسی در صورت استفاده از S3"
   AWS_SECRET_ACCESS_KEY="کلید محرمانه در صورت استفاده از S3"
   AWS_REGION="منطقه AWS"
   CRON_SECRET="رمز تأیید برای Webhookهای زمان‌بندی"
   HCAPTCHA_SECRET="توکن سرور کپچا (اختیاری)"
   ```

4. دیتابیس را مهاجرت دهید و داده‌های اولیه را اعمال کنید:

   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

   > اسکریپت Seed یک ادمین نمونه با مشخصات زیر می‌سازد: `admin@oilbar.ir` با شماره `+989121111111` (ورود با کد تایید پیامکی)

### ورود به پنل ادمین

- صفحه‌ی اختصاصی ورود ادمین در `/admin/login` با ایمیل و رمز عبور در دسترس است. از حساب نمونه `admin@oilbar.ir / Admin@123` پس از اجرای Seed می‌توانید استفاده کنید.
- سایر کاربران همچنان از مسیر `/sign-in` و ورود OTP استفاده می‌کنند.

5. سرور توسعه را اجرا کنید:

   ```bash
   npm run dev
   ```

   سپس به آدرس [http://localhost:3000](http://localhost:3000) مراجعه کنید.

## استقرار روی Vercel

1. ریپازیتوری را به GitHub/GitLab منتقل و در Vercel ایمپورت کنید.
2. متغیرهای محیطی زیر را در Vercel تنظیم کنید:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (مثلاً `https://your-domain.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` (دامنه عمومی برای callback پرداخت)
   - `ZARINPAL_MERCHANT_ID`
   - `ZARINPAL_CALLBACK_URL`
   - `MELIPAYAMAK_USERNAME`
   - `MELIPAYAMAK_PASSWORD`
   - `MELIPAYAMAK_ORIGINATOR`
3. قبل از اولین استقرار، روی محیط production دستور زیر را اجرا کنید (از طریق Vercel CLI یا pipeline):

   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

   برای جلوگیری از اجرای مجدد Seed روی production، پس از ایجاد داده‌های اولیه می‌توانید اسکریپت را حذف یا شرطی کنید.

4. پس از استقرار، با کاربر ادمین وارد `/admin` شوید و محصولات/خودروهای جدید را مدیریت کنید.

## ساختار مسیرهای مهم

- `/` – صفحه اصلی با معرفی محصولات ویژه، دسته‌بندی‌ها، برندها و خودروهای محبوب
- `/products` – لیست محصولات با فیلتر جستجو، برند، دسته‌بندی و خودرو
- `/products/[slug]` – جزئیات محصول و خودروهای سازگار
- `/cars` – لیست خودروها با مشخصات فنی و محصولات توصیه‌شده
- `/cart` – سبد خرید کاربر (نیازمند ورود)
- `/account` – صفحه حساب کاربری و سفارش‌ها (نیازمند ورود)
- `/admin` – پنل ادمین (نیازمند نقش ADMIN)

## نکات تکمیلی

- استایل‌ها با Tailwind v4 و توکن‌های سفارشی برای رنگ‌ها (بنفش/سفید/مشکی) پیاده‌سازی شده‌اند.
- برای افزودن نقش‌ها یا متدهای احراز هویت بیشتر، می‌توانید تنظیمات `src/lib/auth.config.ts` را گسترش دهید.
- فایل‌های Seed در `prisma/seed.ts` قرار دارد؛ مطابق نیاز می‌توانید داده‌ها را تغییر دهید.
- برای به‌روزرسانی اسکیمای دیتابیس، پس از ویرایش `prisma/schema.prisma` دستور `npx prisma generate` و سپس `npx prisma migrate dev` را اجرا کنید.

موفق باشید و اگر نیاز به توسعه بیشتر داشتید (پرداخت آنلاین، سفارش‌گیری، گزارش‌گیری و ...)، ساختار پروژه آماده‌ی گسترش است. 🚀
