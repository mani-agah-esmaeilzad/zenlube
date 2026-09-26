"use client";

import { useEffect } from "react";

import { markCartActivityAction } from "@/actions/cart";

type CartActivityTrackerProps = {
  stage: "cart" | "checkout";
};

const HEARTBEAT_INTERVAL_MS = 60_000;

export function CartActivityTracker({ stage }: CartActivityTrackerProps) {
  useEffect(() => {
    let disposed = false;

    const reportActivity = () => {
      if (disposed || document.visibilityState !== "visible") return;
      void markCartActivityAction(stage);
    };

    reportActivity();
    const intervalId = window.setInterval(reportActivity, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", reportActivity);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", reportActivity);
    };
  }, [stage]);

  return null;
}
