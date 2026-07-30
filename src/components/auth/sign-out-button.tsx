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
        "btn-outline inline-flex min-h-11 rounded-2xl px-4 text-sm font-bold text-text-strong disabled:opacity-60",
        className,
      )}
      disabled={isPending}
    >
      {isPending ? "در حال خروج..." : "خروج"}
    </button>
  );
}
