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
      className="relative flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
    >
      <span>سبد خرید</span>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
        {totalItems}
      </span>
    </Link>
  );
}
