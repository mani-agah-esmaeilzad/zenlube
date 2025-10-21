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
        "rounded-full border border-purple-400/40 bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-purple-500/30 transition hover:border-purple-300 hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300",
        className,
      )}
      disabled={isPending}
    >
      {isPending ? "در حال خروج..." : "خروج"}
    </button>
  );
}
