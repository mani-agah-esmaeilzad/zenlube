"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type SignInButtonProps = {
  className?: string;
};

export function SignInButton({ className }: SignInButtonProps) {
  return (
    <Link
      href="/sign-in"
      className={cn(
        "btn-outline inline-flex h-10 min-h-10 rounded-xl px-3.5 text-[13px] font-bold text-text-strong",
        className,
      )}
    >
      ورود / ثبت‌نام
    </Link>
  );
}
