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
        "inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#E7E8EE] bg-white px-4 text-sm font-bold text-[#171B23] shadow-sm transition hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE7B0]",
        className,
      )}
    >
      ورود / ثبت‌نام
    </Link>
  );
}
