import bcrypt from "bcrypt";

import prisma from "@/lib/prisma";
import { normalizeIranPhone } from "@/lib/phone";

const OTP_EXPIRATION_MINUTES = 5;
const OTP_RESEND_WINDOW_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

export type OtpPurpose = "checkout" | "account";

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class OtpRequestWindowError extends Error {
  constructor(message = "برای ارسال مجدد کد، لطفاً یک دقیقه صبر کنید.") {
    super(message);
    this.name = "OtpRequestWindowError";
  }
}

type OtpWindowOptions = {
  normalizedPhone: string;
  purpose: OtpPurpose;
  currentTime: Date;
};

async function ensureOtpWindowAvailable({ normalizedPhone, purpose, currentTime }: OtpWindowOptions) {
  const windowStart = new Date(currentTime.getTime() - OTP_RESEND_WINDOW_SECONDS * 1000);
  const recentRequest = await prisma.otpRequest.findFirst({
    where: {
      phone: normalizedPhone,
      purpose,
      createdAt: { gte: windowStart },
      consumedAt: null,
    },
    select: { id: true },
  });

  if (recentRequest) {
    throw new OtpRequestWindowError();
  }
}

export async function assertOtpWindowAvailability(
  normalizedPhone: string,
  purpose: OtpPurpose,
  currentTime: Date = new Date(),
) {
  await ensureOtpWindowAvailable({ normalizedPhone, purpose, currentTime });
  return currentTime;
}

type CreateOtpRequestOptions = {
  skipWindowCheck?: boolean;
  currentTime?: Date;
  normalizedPhoneOverride?: string;
};

export async function createOtpRequest(
  phone: string,
  purpose: OtpPurpose = "checkout",
  options?: CreateOtpRequestOptions,
) {
  const normalizedPhone = options?.normalizedPhoneOverride ?? normalizeIranPhone(phone);
  const now = options?.currentTime ?? new Date();

  if (!options?.skipWindowCheck) {
    await ensureOtpWindowAvailable({ normalizedPhone, purpose, currentTime: now });
  }

  const activeRequest = await prisma.otpRequest.findFirst({
    where: {
      phone: normalizedPhone,
      purpose,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  if (activeRequest) {
    await prisma.otpRequest.update({
      where: { id: activeRequest.id },
      data: {
        codeHash,
        expiresAt,
        attempts: 0,
        createdAt: now,
      },
    });
  } else {
    await prisma.otpRequest.create({
      data: {
        phone: normalizedPhone,
        purpose,
        codeHash,
        expiresAt,
      },
    });
  }

  return { code, expiresAt, phone: normalizedPhone, purpose } as const;
}

export async function verifyOtpCode(phone: string, code: string, purpose: OtpPurpose = "checkout") {
  const normalizedPhone = normalizeIranPhone(phone);
  const request = await prisma.otpRequest.findFirst({
    where: {
      phone: normalizedPhone,
      purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!request) {
    throw new Error("کد تایید درخواست نشده است.");
  }

  if (request.expiresAt < new Date()) {
    throw new Error("کد تایید منقضی شده است.");
  }

  if (request.attempts >= OTP_MAX_ATTEMPTS) {
    throw new Error("تعداد تلاش‌های ناموفق بیش از حد مجاز است.");
  }

  const isMatch = await bcrypt.compare(code, request.codeHash);

  if (!isMatch) {
    await prisma.otpRequest.update({
      where: { id: request.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("کد تایید نادرست است.");
  }

  await prisma.otpRequest.update({
    where: { id: request.id },
    data: { consumedAt: new Date() },
  });

  return { success: true, phone: normalizedPhone } as const;
}
