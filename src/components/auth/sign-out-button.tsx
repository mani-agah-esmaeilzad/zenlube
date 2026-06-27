"use client";

import { signOut } from "next-auth/react";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => signOut({ callbackUrl: "/" }))}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-bold text-[#111827] shadow-sm transition hover:border-red-200 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-100 disabled:opacity-60",
        className,
      )}
      disabled={isPending}
    >
      {isPending ? "در حال خروج..." : "خروج"}
    </button>
  );
}
