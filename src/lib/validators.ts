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
