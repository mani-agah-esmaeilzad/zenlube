import type { AdminOrderSmsFeedback } from "./types";

const smsStatusLabels: Record<AdminOrderSmsFeedback["status"], string> = {
  sent: "پذیرفته‌شده توسط سرویس پیامک",
  failed: "ارسال ناموفق",
  disabled: "ارسال پیامک غیرفعال است",
  sending: "در حال ارسال؛ نتیجه هنوز ثبت نشده",
  uncertain: "نتیجه ارسال نامشخص؛ نیازمند بررسی پنل پیامک",
  sandbox: "آزمایشی؛ پیامکی ارسال نشده",
  absent: "ارسالی ثبت نشده",
  unknown: "وضعیت نامشخص؛ نیازمند بررسی پنل پیامک",
};

/** Never expose raw provider errors, which can contain credentials or request data. */
function safeSmsErrorSummary(message?: string | null): string {
  if (/شماره موبایل معتبر نیست|invalid (?:phone|mobile)/i.test(message ?? "")) {
    return "شماره موبایل گیرنده نیازمند اصلاح است.";
  }
  if (/تنظیمات|قالب پیامک|api.?key|unauthori[sz]ed|authentication/i.test(message ?? "")) {
    return "تنظیمات یا دسترسی سرویس پیامک را بررسی کنید.";
  }
  if (/اعتبار|موجودی|balance|credit/i.test(message ?? "")) {
    return "اعتبار حساب پیامک را بررسی کنید.";
  }
  return "ارسال پذیرفته نشد؛ جزئیات را در پنل سرویس پیامک بررسی کنید.";
}

export function mapOrderSmsFeedback(
  log?: { status: string; errorMessage?: string | null } | null,
): AdminOrderSmsFeedback {
  const status: AdminOrderSmsFeedback["status"] = !log
    ? "absent"
    : Object.hasOwn(smsStatusLabels, log.status)
      ? log.status as AdminOrderSmsFeedback["status"]
      : "unknown";

  return {
    status,
    label: smsStatusLabels[status],
    ...(status === "failed" ? { errorSummary: safeSmsErrorSummary(log?.errorMessage) } : {}),
  };
}
