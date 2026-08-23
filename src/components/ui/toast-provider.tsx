"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div
              aria-atomic="true"
              aria-live="polite"
              className="pointer-events-none fixed inset-x-0 top-4 z-[220] flex flex-col items-center gap-2 px-4"
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`w-full max-w-sm rounded-xl border px-4 py-3 text-sm font-bold shadow-[0_16px_36px_rgba(17,24,39,0.12)] ${
                    item.tone === "success"
                      ? "border-emerald-200 bg-[#ECFDF3] text-emerald-700"
                      : item.tone === "error"
                        ? "border-red-200 bg-[#FEF3F2] text-red-700"
                        : "border-[rgba(217,119,6,0.22)] bg-white text-text-strong"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        item.tone === "success" ? "bg-emerald-500" : item.tone === "error" ? "bg-red-500" : "bg-primary-accent"
                      }`}
                    />
                    <span>{item.message}</span>
                  </div>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
