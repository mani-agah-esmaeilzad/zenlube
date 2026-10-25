"use client";

import { useActionState } from "react";

import { saveProductPurchaseCostAction } from "@/actions/admin/profit";
import type { ActionResult } from "@/actions/admin/types";

const initialState: ActionResult = { success: false };

export function ProductPurchaseCostForm({ productId, purchaseCost }: { productId: string; purchaseCost: number | null }) {
  const [state, action, pending] = useActionState(saveProductPurchaseCostAction, initialState);
  return (
    <form action={action} className="flex min-w-[220px] flex-wrap items-center gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input
        aria-label="قیمت خرید به ریال"
        className="input-zen min-w-0 flex-1 !mt-0 !min-h-10 !rounded-xl !px-3 !py-2 text-xs"
        defaultValue={purchaseCost ?? ""}
        disabled={pending}
        min="0"
        name="purchaseCost"
        placeholder="قیمت خرید (ریال)"
        step="1"
        type="number"
      />
      <button className="btn-secondary min-h-10 px-3 text-xs" disabled={pending} type="submit">
        {pending ? "..." : "ذخیره"}
      </button>
      {state.message ? <span className={`basis-full text-[10px] font-bold ${state.success ? "text-[#027A48]" : "text-[#B42318]"}`} aria-live="polite">{state.message}</span> : null}
    </form>
  );
}
