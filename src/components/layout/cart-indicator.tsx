import type { SVGProps } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getAppSession } from "@/lib/session";
import { cn } from "@/lib/utils";

type CartIndicatorProps = {
  compact?: boolean;
  className?: string;
};

export async function CartIndicator({ compact = false, className }: CartIndicatorProps) {
  const rawSession = await getAppSession();
  const userId = (rawSession as { user?: { id?: string } } | null)?.user?.id;

  let totalItems = 0;

  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { items: { select: { quantity: true } } },
    });
    totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  }

  return (
    <Link
      href="/cart"
      className={cn(
        "btn-outline relative inline-flex h-11 items-center rounded-xl text-sm font-bold text-text-strong",
        compact ? "w-11 justify-center px-0" : "gap-2 px-3",
        className,
      )}
      aria-label={`سبد خرید با ${totalItems.toLocaleString("fa-IR")} کالا`}
    >
      <CartIcon className="h-5 w-5" />
      {!compact ? <span className="hidden sm:inline">سبد خرید</span> : null}
      {totalItems > 0 ? (
        <span
          className={cn(
            "absolute inline-flex min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-bold text-white",
            compact ? "-left-1 -top-1 h-5" : "-left-2 -top-2 h-6",
          )}
        >
          {totalItems.toLocaleString("fa-IR")}
        </span>
      ) : null}
    </Link>
  );
}

function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx={9} cy={20} r={1} />
      <circle cx={17} cy={20} r={1} />
      <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 8H7" />
    </svg>
  );
}
