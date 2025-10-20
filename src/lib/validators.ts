import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "نام دسته باید حداقل دو کاراکتر باشد."),
  slug: z.string().min(2, "اسلاگ معتبر نیست.").regex(/^[a-z0-9-]+$/, "اسلاگ فقط می‌تواند شامل حروف کوچک، عدد و خط تیره باشد."),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const brandSchema = z.object({
  name: z.string().min(2, "نام برند باید حداقل دو کاراکتر باشد."),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "اسلاگ معتبر نیست."),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  website: z.string().url().optional(),
});

export const carSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "اسلاگ معتبر نیست."),
  manufacturer: z.string().min(2),
  model: z.string().min(1),
  generation: z.string().optional(),
  engineCode: z.string().optional(),
  engineType: z.string().optional(),
  yearFrom: z.number().int().min(1950).max(2100).optional(),
  yearTo: z.number().int().min(1950).max(2100).optional(),
  oilCapacityLit: z.number().min(0).optional(),
  viscosity: z.string().optional(),
  specification: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const productUpsertSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "اسلاگ معتبر نیست."),
  sku: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  viscosity: z.string().optional(),
  oilType: z.string().optional(),
  imageUrl: z.string().url().optional(),
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
