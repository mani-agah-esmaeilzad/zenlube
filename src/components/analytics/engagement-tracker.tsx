"use client";

import { useEffect, useRef } from "react";

type EngagementTrackerProps = {
  entityType: "car" | "product" | "page";
  entityId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
};

export function EngagementTracker({ entityType, entityId, eventType, metadata }: EngagementTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) {
      return;
    }
    sentRef.current = true;

    const controller = new AbortController();

    void fetch("/api/engagement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, entityId, eventType, metadata }),
      signal: controller.signal,
    }).catch(() => {
      // در صورت خطا چیزی لاگ نمی‌کنیم تا تجربه کاربر تحت تاثیر قرار نگیرد.
    });

    return () => {
      controller.abort();
    };
  }, [entityType, entityId, eventType, metadata]);

  return null;
}
