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
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1 text-[11px] font-bold text-text-muted transition hover:border-[rgba(217,119,6,0.28)] hover:text-primary-accent-strong"
      onClick={handleCopy}
      type="button"
    >
      <span className="font-medium text-text-soft">SKU</span>
      <span className="font-mono text-text-strong">{sku}</span>
      <span className="text-text-soft">{copied ? "کپی شد" : "کپی"}</span>
    </button>
  );
}
