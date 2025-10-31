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
      select: {
        items: {
          select: { quantity: true },
        },
      },
    });

    totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  }

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-slate-900"
    >
      <span>سبد خرید</span>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
        {totalItems}
      </span>
    </Link>
  );
}
