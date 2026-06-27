import type { SVGProps } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getAppSession } from "@/lib/session";

export async function CartIndicator() {
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
      className="relative inline-flex h-11 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-3 text-sm font-bold text-[#111827] shadow-sm transition hover:border-red-200 hover:text-red-600"
      aria-label={`سبد خرید با ${totalItems.toLocaleString("fa-IR")} کالا`}
    >
      <CartIcon className="h-5 w-5" />
      <span className="hidden sm:inline">سبد خرید</span>
      <span className="absolute -left-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#EF394E] px-1.5 text-[11px] font-bold text-white">
        {totalItems.toLocaleString("fa-IR")}
      </span>
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
