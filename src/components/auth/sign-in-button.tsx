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
        "btn-ghost inline-flex !min-h-11 !rounded-lg px-3 text-[13px] font-bold text-text-strong md:!min-h-10",
        className,
      )}
    >
      ورود / ثبت‌نام
    </Link>
  );
}
