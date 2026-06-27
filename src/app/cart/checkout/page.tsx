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
    <div className="container-zen space-y-6 py-6 md:py-8">
      <header className="rounded-3xl border border-[#E5E7EB] bg-white p-6">
        <p className="text-sm font-bold text-red-600">مرحله پایانی خرید</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[#111827] md:text-3xl">تایید و پرداخت سفارش</h1>
        <p className="mt-2 text-sm leading-7 text-[#6B7280]">جمع جزء سبد خرید شما {formatPrice(subtotal)} است. لطفاً اطلاعات ارسال و پرداخت را تکمیل کنید.</p>
      </header>

      <CheckoutForm items={items} defaults={defaults} />
    </div>
  );
}
