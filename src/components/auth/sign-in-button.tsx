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
        "rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        className,
      )}
    >
      {"ورود / ثبت‌نام"}
    </Link>
  );
}
