import { z } from "zod";

import {
  MANUAL_MAHEX_SHIPPING_OPTION_ID,
  MANUAL_PICKUP_SHIPPING_OPTION_ID,
} from "@/lib/shipping/manual-options";
import { validateIranPhone } from "@/lib/phone";

function emptyToUndefined(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return value;
}

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalImageUrl = z.preprocess(
  emptyToUndefined,
  z
    .union([
      z.string().url(),
      z
        .string()
        .regex(
          /^\/(?!\/)(?!.*(?:\.\.|\\))[A-Za-z0-9_\-./%]+$/,
          "آدرس تصویر باید یک URL معتبر یا مسیر امن داخل سایت باشد.",
        ),
    ])
    .optional(),
);
const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null) {
    return undefined;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number().optional());

const slugSchema = z
  .string()
  .min(2, "اسلاگ معتبر نیست.")
  .regex(/^[a-z0-9-]+$/, "اسلاگ فقط می‌تواند شامل حروف کوچک، عدد و خط تیره باشد.");

const phoneSchema = z
  .string()
  .trim()
  .min(10, "شماره موبایل معتبر نیست.")
  .refine((value) => validateIranPhone(value), "شماره موبایل معتبر نیست.");

const categoryFields = {
  name: z.string().trim().min(2, "نام دسته باید حداقل دو کاراکتر باشد."),
  slug: slugSchema,
  description: optionalString,
  imageUrl: optionalImageUrl,
};

export const categorySchema = z.object(categoryFields);

export const categoryUpdateSchema = z.object({
  id: z.string().cuid(),
  ...categoryFields,
});

const brandFields = {
  name: z.string().trim().min(2, "نام برند باید حداقل دو کاراکتر باشد."),
  slug: slugSchema,
  description: optionalString,
  imageUrl: optionalImageUrl,
  website: optionalUrl,
};

export const brandSchema = z.object(brandFields);

export const brandUpdateSchema = z.object({
  id: z.string().cuid(),
  ...brandFields,
});

const carFields = {
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "اسلاگ معتبر نیست."),
  manufacturer: z.string().trim().min(2, "نام سازنده باید حداقل ۲ کاراکتر باشد."),
  model: z.string().trim().min(1, "مدل خودرو الزامی است."),
  isActive: z.boolean(),
  generation: optionalString,
  engineCode: optionalString,
  engineType: optionalString,
  yearFrom: z.number().int().min(1950).max(2100).optional(),
  yearTo: z.number().int().min(1950).max(2100).optional(),
  oilCapacityLit: z.number().min(0).optional(),
  viscosity: optionalString,
  specification: optionalString,
  imageUrl: optionalImageUrl,
  overviewDetails: optionalString,
  engineDetails: optionalString,
  gearboxDetails: optionalString,
  maintenanceInfo: optionalString,
};

export const carSchema = z.object(carFields);

export const carUpdateSchema = z.object({
  id: z.string().cuid(),
  ...carFields,
});

export const maintenanceTaskSchema = z.object({
  carId: z.string().cuid(),
  title: z.string().trim().min(3, "عنوان باید حداقل ۳ کاراکتر باشد."),
  description: optionalString,
  intervalKm: optionalNumber.pipe(
    z.number().int().positive().optional(),
  ),
  intervalMonths: optionalNumber.pipe(
    z.number().int().positive().optional(),
  ),
  priority: optionalNumber
    .pipe(z.number().int().min(1).max(5).optional())
    .transform((value) => value ?? 1),
  recommendedProductSlugs: z
    .preprocess((value) => {
      if (typeof value === "string") {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
      if (Array.isArray(value)) {
        return value
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
      }
      return [];
    }, z.array(z.string()).optional())
    .transform((value) => value ?? []),
});

const productFields = {
  name: z.string().trim().min(2),
  slug: slugSchema,
  sku: optionalString,
  description: optionalString,
  price: z.number().min(0),
  stock: z.number().int().min(0),
  viscosity: optionalString,
  oilType: optionalString,
  imageUrl: optionalImageUrl,
  isFeatured: z.boolean().optional(),
  categoryId: z.string().cuid(),
  brandId: z.string().cuid(),
  carIds: z.array(z.string().cuid()).optional(),
  requiresShipping: z.boolean(),
  shippingWeightGrams: optionalNumber.pipe(z.number().int().positive("وزن باید بیشتر از صفر باشد.").optional()),
  shippingDimensionsMode: z.enum(["DEFAULT", "CUSTOM"]),
  shippingLengthCm: optionalNumber.pipe(z.number().int().positive("طول باید بیشتر از صفر باشد.").optional()),
  shippingWidthCm: optionalNumber.pipe(z.number().int().positive("عرض باید بیشتر از صفر باشد.").optional()),
  shippingHeightCm: optionalNumber.pipe(z.number().int().positive("ارتفاع باید بیشتر از صفر باشد.").optional()),
  shippingRestrictedCarriers: z.array(z.enum(["POST", "TIPAX"])).optional(),
  shippingIsLiquid: z.boolean(),
};

function validateProductShipping(
  data: {
    requiresShipping: boolean;
    shippingWeightGrams?: number;
    shippingDimensionsMode: "DEFAULT" | "CUSTOM";
    shippingLengthCm?: number;
    shippingWidthCm?: number;
    shippingHeightCm?: number;
  },
  context: z.RefinementCtx,
  requireWeight: boolean,
) {
  if (data.requiresShipping && requireWeight && !data.shippingWeightGrams) {
    context.addIssue({ code: "custom", path: ["shippingWeightGrams"], message: "وزن ارسال برای محصول فیزیکی الزامی است." });
  }
  if (data.requiresShipping && data.shippingDimensionsMode === "CUSTOM") {
    for (const field of ["shippingLengthCm", "shippingWidthCm", "shippingHeightCm"] as const) {
      if (!data[field]) context.addIssue({ code: "custom", path: [field], message: "هر سه بُعد سفارشی را وارد کنید." });
    }
  }
}

export const productCreateSchema = z.object(productFields)
  .superRefine((data, context) => validateProductShipping(data, context, true));

export const productUpdateSchema = z.object({
  id: z.string().cuid(),
  ...productFields,
}).superRefine((data, context) => validateProductShipping(data, context, false));

export const productPromotionSchema = z.object({
  productId: z.string().min(1, "انتخاب محصول الزامی است."),
  kind: z.enum(["SALE", "OCTANE", "RACING_FUEL"]),
  label: z.preprocess(emptyToUndefined, z.string().trim().max(60, "برچسب حداکثر ۶۰ کاراکتر است.").optional()),
  specialPrice: optionalNumber.pipe(z.number().positive("قیمت ویژه باید بیشتر از صفر باشد.").optional()),
  startsAt: optionalString,
  endsAt: optionalString,
  sortOrder: optionalNumber.pipe(z.number().int().min(0).max(999).optional()).transform((value) => value ?? 0),
  isActive: z.boolean(),
});

export const productCommerceSchema = z.object({
  productId: z.string().min(1, "شناسه محصول معتبر نیست."),
  price: z.number().min(0, "قیمت نمی‌تواند منفی باشد."),
  stock: z.number().int().min(0, "موجودی نمی‌تواند منفی باشد."),
});

export const answerQuestionSchema = z.object({
  questionId: z.string().cuid(),
  answer: z
    .string()
    .trim()
    .min(5, "پاسخ باید حداقل ۵ کاراکتر باشد.")
    .max(1200, "پاسخ نمی‌تواند بیش از ۱۲۰۰ کاراکتر باشد."),
  type: z.enum(["product", "car"]),
  markAnswered: z.preprocess(
    (value) => value === "on" || value === true || value === "true",
    z.boolean(),
  ),
});

export const publicQuestionPayloadSchema = z.object({
  type: z.enum(["product", "car"]),
  slug: z.string().min(2, "شناسه هدف معتبر نیست."),
  authorName: z
    .string()
    .trim()
    .min(2, "نام باید حداقل دو کاراکتر باشد.")
    .max(60, "نام نمی‌تواند بیش از ۶۰ کاراکتر باشد."),
  question: z
    .string()
    .trim()
    .min(5, "سوال باید حداقل ۵ کاراکتر باشد.")
    .max(800, "سوال نمی‌تواند بیش از ۸۰۰ کاراکتر باشد."),
  captchaToken: optionalString,
});

export const engagementEventSchema = z.object({
  entityType: z.enum(["car", "product", "page"]),
  entityId: z.string().min(1, "شناسه موجودیت نامعتبر است."),
  eventType: z.string().trim().min(2, "نوع رویداد معتبر نیست.").max(64),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1),
});

export const registerUserSchema = z.object({
  name: z.string().min(2, "نام باید حداقل دو کاراکتر باشد."),
  email: z.string().email("ایمیل معتبر نیست."),
  phone: phoneSchema,
  otpCode: z
    .string()
    .trim()
    .min(4, "کد تایید باید حداقل ۴ رقم باشد.")
    .max(6, "کد تایید باید حداکثر ۶ رقم باشد."),
});

export const checkoutOrderSchema = z.object({
  fullName: z.string().trim().min(3, "نام را به‌درستی وارد کنید."),
  email: z.string().email("ایمیل معتبر نیست."),
  phone: phoneSchema,
  address1: z.string().trim().min(5, "آدرس باید حداقل ۵ کاراکتر باشد."),
  address2: optionalString,
  cityCode: z.string().trim().min(2, "شهر را انتخاب کنید.").max(80),
  provinceCode: z.string().trim().min(2, "استان را انتخاب کنید.").max(80),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9۰-۹٠-٩\s-]{10,16}$/, "کد پستی باید ۱۰ رقم باشد."),
  shippingOptionId: z.union([
    z.string().cuid("روش ارسال معتبر نیست."),
    z.enum([MANUAL_MAHEX_SHIPPING_OPTION_ID, MANUAL_PICKUP_SHIPPING_OPTION_ID]),
  ], { message: "روش ارسال معتبر نیست." }),
  checkoutIdempotencyKey: z.string().uuid("شناسه ثبت سفارش معتبر نیست."),
  couponCode: z.preprocess(emptyToUndefined, z.string().trim().max(32, "کد تخفیف معتبر نیست.").optional()),
  notes: optionalString,
  saveAddress: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean().optional(),
  ).transform((value) => value ?? false),
});

export const shippingQuoteSchema = z.object({
  provinceCode: z.string().trim().min(2, "استان را انتخاب کنید.").max(80),
  cityCode: z.string().trim().min(2, "شهر را انتخاب کنید.").max(80),
  postalCode: z.string().trim().regex(/^[0-9۰-۹٠-٩\s-]{10,16}$/, "کد پستی باید ۱۰ رقم باشد."),
  address1: z.string().trim().min(5, "آدرس را کامل‌تر وارد کنید.").max(500),
  address2: optionalString,
  couponCode: z.preprocess(emptyToUndefined, z.string().trim().max(32, "کد تخفیف معتبر نیست.").optional()),
});

export const productReviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.coerce.number().int().min(1, "حداقل امتیاز ۱ است.").max(5, "حداکثر امتیاز ۵ است."),
  title: optionalString,
  comment: z.preprocess(emptyToUndefined, z.string().trim().min(10, "متن نظر باید حداقل ۱۰ کاراکتر باشد.").max(1200, "نظر نمی‌تواند بیشتر از ۱۲۰۰ کاراکتر باشد.").optional()),
});

export const marketingBannerSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(2, "عنوان بنر الزامی است."),
  subtitle: optionalString,
  ctaLabel: optionalString,
  ctaLink: optionalUrl,
  imageUrl: optionalImageUrl,
  position: z.string().trim().min(2, "جایگاه بنر معتبر نیست."),
  isActive: z.boolean().optional(),
});

export const couponSchema = z.object({
  id: z.string().cuid().optional(),
  code: z.string().trim().min(3, "کد تخفیف باید حداقل ۳ کاراکتر باشد.").max(32, "کد تخفیف معتبر نیست."),
  title: z.string().trim().min(2, "عنوان کمپین الزامی است."),
  description: optionalString,
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  amount: z.number().positive("مقدار تخفیف باید بیشتر از صفر باشد."),
  minOrderAmount: optionalNumber.pipe(z.number().min(0).optional()),
  maxDiscountAmount: optionalNumber.pipe(z.number().min(0).optional()),
  usageLimit: optionalNumber.pipe(z.number().int().positive().optional()),
  startsAt: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  endsAt: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  isActive: z.boolean().optional(),
});

function splitTextList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === "string" ? item.split(/[\n,،]+/) : []))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split(/[\n,،]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFaqItems(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...answerParts] = line.split("|");
      return {
        question: question?.trim() ?? "",
        answer: answerParts.join("|").trim(),
      };
    })
    .filter((item) => item.question && item.answer);
}

export const blogCategorySchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(2, "عنوان دسته‌بندی الزامی است."),
  slug: slugSchema,
  description: optionalString,
  sortOrder: optionalNumber.pipe(z.number().int().min(0).max(999).optional()).transform((value) => value ?? 0),
  isActive: z.boolean().optional(),
});

export const blogPostSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(4, "عنوان مقاله باید حداقل ۴ کاراکتر باشد."),
  slug: slugSchema,
  excerpt: z.string().trim().min(20, "خلاصه مقاله را کامل‌تر بنویسید.").max(320, "خلاصه مقاله بیش از حد طولانی است."),
  content: z.string().trim().min(80, "متن مقاله باید حداقل ۸۰ کاراکتر باشد."),
  coverImage: optionalImageUrl,
  tags: z.preprocess(splitTextList, z.array(z.string().min(1).max(40)).max(12, "حداکثر ۱۲ تگ وارد کنید.")).transform((items) => Array.from(new Set(items))),
  authorName: z.preprocess(emptyToUndefined, z.string().trim().min(2).max(80).optional()).transform((value) => value ?? "تیم تحریریه Oilbar"),
  readMinutes: optionalNumber.pipe(z.number().int().min(1).max(90).optional()).transform((value) => value ?? 5),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: optionalString,
  seoDescription: optionalString,
  faqItems: z.preprocess(parseFaqItems, z.array(z.object({
    question: z.string().min(4).max(160),
    answer: z.string().min(4).max(700),
  })).max(12, "حداکثر ۱۲ FAQ وارد کنید.")),
  relatedProductSlugs: z.preprocess(splitTextList, z.array(slugSchema).max(16, "حداکثر ۱۶ محصول مرتبط وارد کنید.")).transform((items) => Array.from(new Set(items))),
  isFeatured: z.boolean().optional(),
  sortOrder: optionalNumber.pipe(z.number().int().min(0).max(999).optional()).transform((value) => value ?? 0),
  categoryId: z.preprocess(emptyToUndefined, z.string().cuid().optional()),
  publishedAt: z.preprocess(emptyToUndefined, z.coerce.date().optional()).transform((value) => value ?? new Date()),
});

export const returnRequestSchema = z.object({
  orderId: z.string().cuid(),
  reason: z.string().trim().min(5, "دلیل مرجوعی را دقیق‌تر بنویسید.").max(160, "دلیل مرجوعی بیش از حد طولانی است."),
  details: z.preprocess(emptyToUndefined, z.string().trim().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد.").max(1200, "توضیحات بیش از حد طولانی است.").optional()),
});

export const returnRequestAdminSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"]),
  adminNotes: optionalString,
  refundAmount: optionalNumber.pipe(z.number().min(0).optional()),
});
