"use client";

import { useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

const ADMIN_REFRESH_INTERVAL_MS = 20_000;

export function AdminLiveRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const initialRefresh = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refreshWhenVisible, ADMIN_REFRESH_INTERVAL_MS);

    window.addEventListener("focus", refreshWhenVisible);
    window.addEventListener("pageshow", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      window.removeEventListener("pageshow", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  return (
    <button className="btn-outline" disabled={isPending} onClick={refresh} type="button">
      {isPending ? "در حال تازه‌سازی..." : "تازه‌سازی زنده"}
    </button>
  );
}
