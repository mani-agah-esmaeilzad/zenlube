"use client";

import { useActionState } from "react";

import {
  sendFeedbackInviteAction,
  type FeedbackInviteState,
} from "@/actions/admin/feedback";

const initialState: FeedbackInviteState = { success: false };

export function FeedbackInviteForm({ orderId, isResend = false }: { orderId: string; isResend?: boolean }) {
  const [state, action, pending] = useActionState(sendFeedbackInviteAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <button type="submit" disabled={pending} className="btn-primary min-h-10 w-full px-4 text-xs">
        {pending ? "در حال ارسال پیامک..." : isResend ? "ارسال دوباره لینک" : "ارسال لینک نظرسنجی"}
      </button>
      {state.message ? (
        <p className={`text-[11px] font-bold leading-5 ${state.success ? "text-[#027A48]" : "text-[#B42318]"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
