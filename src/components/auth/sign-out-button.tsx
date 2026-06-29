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
        "inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#E7E8EE] bg-white px-4 text-sm font-bold text-[#171B23] shadow-sm transition hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE7B0] disabled:opacity-60",
        className,
      )}
      disabled={isPending}
    >
      {isPending ? "در حال خروج..." : "خروج"}
    </button>
  );
}
