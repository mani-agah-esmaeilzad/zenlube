"use client";

import { useState } from "react";

import { useToast } from "@/components/ui/toast-provider";

type CopySkuButtonProps = {
  sku: string;
};

export function CopySkuButton({ sku }: CopySkuButtonProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sku);
      setCopied(true);
      showToast("کد کالا کپی شد", "success");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("کپی کد کالا انجام نشد", "error");
    }
  };

  return (
    <button
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-surface-secondary px-2.5 py-1 text-[11px] font-bold text-text-muted transition hover:bg-surface-tint hover:text-primary-accent-strong md:min-h-9"
      onClick={handleCopy}
      type="button"
    >
      <span className="font-medium text-text-soft">SKU</span>
      <span className="font-mono text-text-strong">{sku}</span>
      <span className="text-text-soft">{copied ? "کپی شد" : "کپی"}</span>
    </button>
  );
}
