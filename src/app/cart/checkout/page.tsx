import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/cart/checkout-form";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getAppSession } from "@/lib/session";

export const revalidate = 0;

export default async function CheckoutPage() {
  const session = await getAppSession();
  const user = (session as { user?: { id?: string; email?: string | null; name?: string | null; phone?: string | null } } | null)?.user;

  if (!user?.id) {
    redirect("/sign-in?callbackUrl=/cart/checkout");
  }

  const [cart, defaultAddress] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    }),
    prisma.userAddress.findFirst({
      where: { userId: user.id, isDefault: true },
    }),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const defaults = {
    fullName: defaultAddress?.fullName ?? user.name ?? "",
    email: user.email ?? "",
    phone: defaultAddress?.phone ?? user.phone ?? "",
    address1: defaultAddress?.address1 ?? "",
    address2: defaultAddress?.address2 ?? "",
    city: defaultAddress?.city ?? "",
    province: defaultAddress?.province ?? "",
    postalCode: defaultAddress?.postalCode ?? "",
  };

  const items = cart.items.map((item) => ({
    id: item.id,
    name: item.product.name,
    quantity: item.quantity,
    price: Number(item.product.price),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
      <header className="space-y-2 text-white">
        <p className="text-sm text-white/60">مرحله پایانی خرید</p>
        <h1 className="text-3xl font-semibold">تایید و پرداخت سفارش</h1>
        <p className="text-sm text-white/60">جمع جزء سبد خرید شما {formatPrice(subtotal)} است. لطفاً اطلاعات ارسال و پرداخت را تکمیل کنید.</p>
      </header>

      <CheckoutForm items={items} defaults={defaults} />
    </div>
  );
}
