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
        "rounded-full border border-purple-400/40 bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-purple-500/30 transition hover:border-purple-300 hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300",
        className,
      )}
    >
      {"ورود / ثبت‌نام"}
    </Link>
  );
}
