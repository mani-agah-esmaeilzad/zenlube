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
        "rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        className,
      )}
      disabled={isPending}
    >
      {isPending ? "در حال خروج..." : "خروج"}
    </button>
  );
}
