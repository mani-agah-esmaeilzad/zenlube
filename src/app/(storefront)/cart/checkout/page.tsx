import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/cart/checkout-form";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
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

  const [cart, defaultAddress, addresses] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
    }),
    prisma.userAddress.findFirst({ where: { userId: user.id, isDefault: true } }),
    prisma.userAddress.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
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
    <div className="container-zen space-y-5 py-5 sm:space-y-6 sm:py-6 md:py-8">
      <StorefrontPageIntro
        compact
        description="اطلاعات ارسال را تکمیل و خلاصهٔ سفارش را بررسی کنید؛ سپس به درگاه پرداخت منتقل می‌شوید."
        meta={`جمع سبد خرید: ${formatPrice(subtotal)}`}
        title="تأیید و پرداخت سفارش"
        tone="dark"
      />

      <CheckoutForm
        items={items}
        defaults={defaults}
        addresses={addresses.map((address) => ({
          id: address.id,
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          isDefault: address.isDefault,
        }))}
      />
    </div>
  );
}
