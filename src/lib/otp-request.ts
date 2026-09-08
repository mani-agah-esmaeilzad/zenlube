import { z } from "zod";

export const otpRequestBodySchema = z.object({
  phone: z.string().min(10, "شماره موبایل را صحیح وارد کنید."),
  purpose: z.literal("account").default("account"),
});
