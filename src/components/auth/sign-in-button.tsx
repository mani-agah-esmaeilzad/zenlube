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
        "rounded-full border border-sky-200 bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-300/40 transition hover:border-sky-300 hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
        className,
      )}
    >
      {"ورود / ثبت‌نام"}
    </Link>
  );
}
