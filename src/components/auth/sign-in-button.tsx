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
        "inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-bold text-[#111827] shadow-sm transition hover:border-red-200 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-100",
        className,
      )}
    >
      ورود / ثبت‌نام
    </Link>
  );
}
