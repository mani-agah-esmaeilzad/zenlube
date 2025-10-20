"use client";

import { signIn } from "next-auth/react";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

type SignInButtonProps = {
  className?: string;
};

export function SignInButton({ className }: SignInButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => signIn(undefined, { callbackUrl: "/account" }))}
      className={cn(
        "rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        className,
      )}
      disabled={isPending}
    >
      {isPending ? "در حال ورود..." : "ورود / ثبت‌نام"}
    </button>
  );
}
