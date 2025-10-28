import { z } from "zod";

function emptyToUndefined(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return value;
}

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
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

export const categorySchema = z.object({
  name: z.string().trim().min(2, "نام دسته باید حداقل دو کاراکتر باشد."),
  slug: z
    .string()
    .min(2, "اسلاگ معتبر نیست.")
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط می‌تواند شامل حروف کوچک، عدد و خط تیره باشد."),
  description: optionalString,
  imageUrl: optionalUrl,
});

export const brandSchema = z.object({
  name: z.string().trim().min(2, "نام برند باید حداقل دو کاراکتر باشد."),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "اسلاگ معتبر نیست."),
  description: optionalString,
  imageUrl: optionalUrl,
  website: optionalUrl,
});

export const carSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "اسلاگ معتبر نیست."),
  manufacturer: z.string().min(2),
  model: z.string().min(1),
  generation: optionalString,
  engineCode: optionalString,
  engineType: optionalString,
  yearFrom: z.number().int().min(1950).max(2100).optional(),
  yearTo: z.number().int().min(1950).max(2100).optional(),
  oilCapacityLit: z.number().min(0).optional(),
  viscosity: optionalString,
  specification: optionalString,
  imageUrl: optionalUrl,
  overviewDetails: optionalString,
  engineDetails: optionalString,
  gearboxDetails: optionalString,
  maintenanceInfo: optionalString,
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

export const productUpsertSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "اسلاگ معتبر نیست."),
  sku: optionalString,
  description: optionalString,
  price: z.number().min(0),
  stock: z.number().int().min(0),
  viscosity: optionalString,
  oilType: optionalString,
  imageUrl: optionalUrl,
  isFeatured: z.boolean().optional(),
  categoryId: z.string().cuid(),
  brandId: z.string().cuid(),
  carIds: z.array(z.string().cuid()).optional(),
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

export const registerUserSchema = z
  .object({
    name: z.string().min(2, "نام باید حداقل دو کاراکتر باشد."),
    email: z.string().email("ایمیل معتبر نیست."),
    password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد."),
    confirmPassword: z.string().min(8, "تکرار رمز عبور باید حداقل ۸ کاراکتر باشد."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیست.",
    path: ["confirmPassword"],
  });
