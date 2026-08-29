"use client";

import { useActionState } from "react";

import { createReturnRequestAction } from "@/actions/account";

type ReturnRequestFormProps = {
  orderId: string;
};

type FormState = Awaited<ReturnType<typeof createReturnRequestAction>>;

const initialState: FormState = { success: false };

export function ReturnRequestForm({ orderId }: ReturnRequestFormProps) {
  const [state, formAction] = useActionState(createReturnRequestAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      <label className="block text-xs font-bold text-[#374151]">
        دلیل مرجوعی
        <input
          name="reason"
          className="input-zen mt-2"
          placeholder="مثلاً نشتی بسته‌بندی یا مغایرت کالا"
          required
        />
        {state?.errors?.reason?.map((error) => (
          <span key={error} className="mt-1 block text-[11px] text-[#DC2626]">
            {error}
          </span>
        ))}
      </label>

      <label className="block text-xs font-bold text-[#374151]">
        توضیحات تکمیلی
        <textarea
          name="details"
          rows={4}
          className="input-zen mt-2 resize-none"
          placeholder="شرح دقیق مشکل، وضعیت بسته و هر جزئیات لازم برای بررسی سریع‌تر"
        />
        {state?.errors?.details?.map((error) => (
          <span key={error} className="mt-1 block text-[11px] text-[#DC2626]">
            {error}
          </span>
        ))}
      </label>

      {state?.message ? (
        <p className={`border-r-2 px-3 py-2 text-xs font-bold leading-6 ${state.success ? "border-green-500 text-[#16A34A]" : "border-red-400 text-[#DC2626]"}`}>
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="btn-primary !min-h-11 w-full sm:w-auto sm:min-w-44">
        ثبت درخواست مرجوعی
      </button>
    </form>
  );
}
