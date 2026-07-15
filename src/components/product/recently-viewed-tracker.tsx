"use client";

import { useEffect } from "react";

import { recordRecentlyViewedAction } from "@/actions/catalog";

type RecentlyViewedTrackerProps = {
  productId: string;
};

export function RecentlyViewedTracker({ productId }: RecentlyViewedTrackerProps) {
  useEffect(() => {
    const storageKey = "oilbar:recently-viewed";
    try {
      const current = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
      const next = [productId, ...current.filter((item: string) => item !== productId)].slice(0, 12);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      window.localStorage.setItem(storageKey, JSON.stringify([productId]));
    }

    void recordRecentlyViewedAction(productId);
  }, [productId]);

  return null;
}
