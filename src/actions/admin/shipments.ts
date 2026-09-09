"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { appendOrderStatusEvent } from "@/lib/commerce";
import { createAuditLog } from "@/lib/admin-audit";
import { ensureAdminAction, ensureRoleAccess } from "@/lib/auth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { notifyCustomerOfTrackingCode } from "@/lib/sms/order-notifications";
import { smsOrderNumber } from "@/lib/sms/service";
import { resolveShippingLocation } from "@/lib/shipping/locations";
import { getShippingProvider, ShippingProviderError } from "@/lib/shipping/providers";
import { resolveAmadastPackageType } from "@/lib/shipping/providers/amadast";
import {
  canClaimShipmentCreation,
  canReconcileShipmentTracking,
  shipmentCreateFailureStatus,
  TRACKING_SYNC_PROMOTABLE_SHIPMENT_STATUSES,
} from "@/lib/shipping/shipment-state";

const orderSchema = z.object({ orderId: z.string().cuid() });

async function requireOperationsUser() {
  const auth = await ensureAdminAction();
  const role = (auth.session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "OPERATIONS_MANAGER"]);
  return auth;
}

function positiveInteger(value: string | null | undefined, label: string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`${label} در تنظیمات ارسال کامل نشده است.`);
  return parsed;
}

export async function createShipmentAction(formData: FormData): Promise<void> {
  const { userId } = await requireOperationsUser();
  const parsed = orderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("شناسه سفارش معتبر نیست.");

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { items: { include: { product: { select: { shippingIsLiquid: true } } } }, shipment: true },
    }),
    prisma.shippingSettings.findUnique({ where: { id: "default" } }),
  ]);
  if (!order) throw new Error("سفارش پیدا نشد.");
  if (order.status !== "PAID") throw new Error("ثبت مرسوله فقط برای سفارش پرداخت‌شده مجاز است.");
  if (!settings?.enabled) throw new Error("ارسال آنلاین در تنظیمات فعال نیست.");
  if (!order.shippingProviderKey || !order.shippingCarrierCode || order.shippingCarrierCode === "MANUAL") {
    throw new Error("این سفارش روش ارسال قابل ثبت در آمادست ندارد.");
  }
  if (!order.cityCode || !order.provinceCode || !order.shippingPackageWeightGrams) {
    throw new Error("اطلاعات مقصد یا بسته این سفارش کامل نیست.");
  }

  const provider = getShippingProvider();
  if (provider.key !== order.shippingProviderKey || provider.key !== settings.providerKey) {
    throw new Error("سرویس فعال با سرویس ثبت‌شده روی سفارش یکسان نیست.");
  }
  if (!provider.capabilities.createShipment) throw new Error("سرویس فعال امکان ثبت مرسوله را ارائه نکرده است.");

  const destination = await resolveShippingLocation({
    provinceCode: order.provinceCode,
    cityCode: order.cityCode,
    providerKey: provider.key,
  });
  if (!destination) throw new Error("شناسه شهر مقصد برای سرویس ارسال پیدا نشد.");

  const storeId = positiveInteger(settings.providerStoreId, "شناسه فروشگاه آمادست");
  const productType = positiveInteger(settings.providerProductTypeCode, "نوع محصول آمادست");
  if (!settings.senderName || !settings.senderMobile) throw new Error("نام و موبایل فرستنده در تنظیمات کامل نشده است.");

  const shipment = await prisma.$transaction(async (tx) => {
    const record = await tx.shipment.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        providerKey: provider.key,
        carrierCode: order.shippingCarrierCode!,
        operationKey: `shipment:${order.id}`,
        status: "READY_TO_SHIP",
      },
    });
    if (record.externalShipmentId || ["SUBMITTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"].includes(record.status)) {
      return { record, claimed: false };
    }
    if (!canClaimShipmentCreation(record)) return { record, claimed: false };

    const claim = await tx.shipment.updateMany({
      where: { id: record.id, externalShipmentId: null, status: { in: ["PENDING", "READY_TO_SHIP", "FAILED"] } },
      data: {
        status: "SUBMITTING",
        attemptCount: { increment: 1 },
        lastErrorCode: null,
        lastErrorMessage: null,
      },
    });
    const fresh = claim.count === 1 ? await tx.shipment.findUniqueOrThrow({ where: { id: record.id } }) : record;
    return { record: fresh, claimed: claim.count === 1 };
  });

  if (!shipment.claimed) {
    if (shipment.record.externalShipmentId || ["SUBMITTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"].includes(shipment.record.status)) return;
    if (shipment.record.status === "UNKNOWN") throw new Error("نتیجه تلاش قبلی نامشخص است؛ ابتدا رهگیری را از آمادست به‌روزرسانی کنید.");
    throw new Error("ثبت این مرسوله هم‌اکنون در حال انجام است.");
  }

  let providerAccepted = false;
  try {
    try {
      const packageType = order.shippingPackageTypeCode
        ? positiveInteger(order.shippingPackageTypeCode, "نوع بسته")
        : resolveAmadastPackageType({
            lengthCm: order.shippingPackageLengthCm ?? 1,
            widthCm: order.shippingPackageWidthCm ?? 1,
            heightCm: order.shippingPackageHeightCm ?? 1,
          });
      const declaredValue = Math.max(10_000, order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) - Number(order.discountAmount));
      const result = await provider.createShipment({
        storeId,
        externalOrderNumber: shipment.record.externalOrderNumber,
        recipientName: order.fullName,
        senderName: settings.senderName,
        recipientMobile: order.phone,
        senderMobile: settings.senderMobile,
        recipientExternalCityId: destination.cityExternalId,
        recipientAddress: `${order.address1}${order.address2 ? `، ${order.address2}` : ""}`,
        recipientPostalCode: order.postalCode,
        weightGrams: order.shippingPackageWeightGrams,
        declaredValueRials: Math.round(declaredValue),
        productType,
        packageType,
        isLiquid: order.shippingIsLiquid ?? order.items.some((item) => item.product.shippingIsLiquid),
        description: `سفارش ${order.id.slice(0, 10).toUpperCase()}`,
      }, settings.providerTimeoutMs);
      providerAccepted = true;

      await prisma.$transaction(async (tx) => {
        await tx.shipment.update({
          where: { id: shipment.record.id },
          data: {
            status: "SUBMITTED",
            externalShipmentId: result.externalShipmentId,
            externalStatus: result.externalStatus,
            submittedAt: new Date(),
          },
        });
        await tx.order.update({ where: { id: order.id }, data: { shippingExternalStatus: result.externalStatus ?? "SUBMITTED" } });
        await appendOrderStatusEvent(tx, {
          orderId: order.id,
          status: "SHIPMENT_SUBMITTED",
          title: "مرسوله در سرویس ارسال ثبت شد",
          detail: `${order.shippingServiceLabel ?? order.shippingCarrierLabel ?? "روش ارسال"} برای پردازش تحویل ثبت شد.`,
        });
      });
    } catch (error) {
      const providerError = error instanceof ShippingProviderError ? error : null;
      const failureStatus = shipmentCreateFailureStatus({
        providerAccepted,
        outcomeUnknown: providerError?.outcomeUnknown === true,
      });
      const ambiguous = failureStatus === "UNKNOWN";
      const message = error instanceof Error ? error.message : "ثبت مرسوله ناموفق بود.";
      const errorCode = providerAccepted && !providerError
        ? "PERSISTENCE_AFTER_PROVIDER_ACCEPTANCE"
        : providerError?.code ?? "UNKNOWN";
      try {
        await prisma.shipment.updateMany({
          where: { id: shipment.record.id, status: "SUBMITTING" },
          data: {
            status: failureStatus,
            lastErrorCode: errorCode,
            lastErrorMessage: message.slice(0, 500),
          },
        });
      } catch (persistenceError) {
        // Leaving the record as SUBMITTING is still safe: it remains
        // non-retryable and can be reconciled by external order number.
        logger.error("Shipment failure state could not be persisted", {
          orderId: order.id,
          provider: provider.key,
          error: persistenceError instanceof Error ? persistenceError.message : "unknown",
        });
      }
      logger.error("Shipment creation failed", { orderId: order.id, provider: provider.key, code: errorCode, ambiguous });
      throw new Error(ambiguous ? "پاسخ ثبت مرسوله نامشخص است؛ برای جلوگیری از ثبت تکراری، ابتدا رهگیری را بررسی کنید." : message);
    }

    try {
      await createAuditLog({
        actorUserId: userId,
        targetType: "shipment",
        targetId: shipment.record.id,
        action: "create",
        summary: `مرسوله سفارش ${order.id} در ${provider.key} ثبت شد.`,
        metadata: { orderId: order.id, carrierCode: order.shippingCarrierCode },
      });
    } catch (error) {
      // Audit availability must not rewrite an already-persisted provider success.
      logger.warn("Shipment creation audit log failed", {
        orderId: order.id,
        provider: provider.key,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  } finally {
    revalidatePath("/admin");
    revalidatePath("/account");
  }
}

export async function syncShipmentTrackingAction(formData: FormData): Promise<void> {
  const { userId } = await requireOperationsUser();
  const parsed = orderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("شناسه سفارش معتبر نیست.");

  const shipment = await prisma.shipment.findUnique({ where: { orderId: parsed.data.orderId }, include: { order: true } });
  if (!shipment) throw new Error("برای این سفارش هنوز مرسوله‌ای ثبت نشده است.");
  if (!canReconcileShipmentTracking(shipment.status)) throw new Error("این مرسوله در وضعیت قابل رهگیری قرار ندارد.");
  const provider = getShippingProvider();
  if (provider.key !== shipment.providerKey || !provider.capabilities.trackingLookup) throw new Error("رهگیری خودکار برای سرویس این مرسوله در دسترس نیست.");
  const settings = await prisma.shippingSettings.findUnique({ where: { id: "default" }, select: { providerTimeoutMs: true } });

  try {
    const results = await provider.lookupTracking(shipment.order.phone, settings?.providerTimeoutMs ?? 6000);
    const match = results.find((item) => item.externalOrderNumber === shipment.externalOrderNumber);
    if (!match) {
      if (shipment.status === "SUBMITTING") {
        await prisma.shipment.updateMany({
          where: { id: shipment.id, status: "SUBMITTING" },
          data: {
            status: "UNKNOWN",
            lastErrorCode: "RECONCILIATION_NOT_FOUND",
            lastErrorMessage: "در بررسی فعلی، هنوز مرسوله متناظر در آمادست پیدا نشد؛ ثبت دوباره انجام نشود.",
          },
        });
      }
      throw new Error("هنوز اطلاعات رهگیری این مرسوله از آمادست دریافت نشده است؛ ثبت دوباره انجام ندهید و کمی بعد دوباره بررسی کنید.");
    }
    const trackingCode = match.carrierTrackingCode || match.amadastTrackingCode;
    await prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id: shipment.id },
        data: { trackingCode, lastErrorCode: null, lastErrorMessage: null },
      });
      const promoted = await tx.shipment.updateMany({
        where: { id: shipment.id, status: { in: [...TRACKING_SYNC_PROMOTABLE_SHIPMENT_STATUSES] } },
        data: {
          status: "SUBMITTED",
          externalStatus: "TRACKING_AVAILABLE",
          submittedAt: shipment.submittedAt ?? new Date(),
        },
      });
      const trackingUpdate = await tx.order.updateMany({
        where: {
          id: shipment.orderId,
          OR: [
            { shippingTrackingCode: null },
            { shippingTrackingCode: { not: trackingCode } },
          ],
        },
        data: {
          shippingTrackingCode: trackingCode,
        },
      });
      if (promoted.count === 1) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { shippingExternalStatus: "TRACKING_AVAILABLE" },
        });
      }
      if (trackingUpdate.count === 1) {
        await appendOrderStatusEvent(tx, {
          orderId: shipment.orderId,
          status: "TRACKING_UPDATED",
          title: "کد رهگیری دریافت شد",
          detail: `کد رهگیری ${trackingCode} از سرویس ارسال دریافت شد.`,
        });
      }
      return { trackingChanged: trackingUpdate.count === 1 };
    });
    if (trackingCode) {
      await notifyCustomerOfTrackingCode(shipment.order.phone, {
        orderId: shipment.orderId,
        orderNumber: smsOrderNumber(shipment.orderId),
        previousTrackingCode: shipment.order.shippingTrackingCode,
        nextTrackingCode: trackingCode,
        retryUndelivered: true,
      }).catch((error) => {
        logger.warn("Shipment tracking SMS could not be sent", {
          orderId: shipment.orderId,
          provider: shipment.providerKey,
          error: error instanceof Error ? error.message : "unknown",
        });
      });
    }
    try {
      await createAuditLog({ actorUserId: userId, targetType: "shipment", targetId: shipment.id, action: "tracking_sync", summary: `رهگیری سفارش ${shipment.orderId} به‌روزرسانی شد.` });
    } catch (error) {
      // Tracking is already saved; an audit outage must not make the operator
      // repeat a successful external sync.
      logger.warn("Shipment tracking audit log failed", {
        orderId: shipment.orderId,
        provider: shipment.providerKey,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  } catch (error) {
    logger.warn("Shipment tracking sync failed", { orderId: shipment.orderId, provider: shipment.providerKey, error: error instanceof Error ? error.message : "unknown" });
    throw error;
  } finally {
    revalidatePath("/admin");
    revalidatePath("/account");
  }
}
