import { randomInt } from "node:crypto";
import bcrypt from "bcrypt";

import type { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { normalizeIranPhone, normalizeOtpCode } from "@/lib/phone";

const OTP_EXPIRATION_MINUTES = 5;
const OTP_RESEND_WINDOW_SECONDS = Number(process.env.OTP_RESEND_WINDOW_SECONDS ?? 20);
const OTP_MAX_ATTEMPTS = 5;

export type OtpPurpose = "checkout" | "account";

function generateOtpCode() {
  return randomInt(100000, 1000000).toString();
}

export class OtpVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OtpVerificationError";
  }
}

export class OtpRequestWindowError extends Error {
  constructor(message = "برای ارسال مجدد کد، لطفا چند ثانیه صبر کنید.") {
    super(message);
    this.name = "OtpRequestWindowError";
  }
}

async function ensureOtpWindowAvailable(normalizedPhone: string, purpose: OtpPurpose, currentTime: Date) {
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

  if (recentRequest) throw new OtpRequestWindowError();
}

export async function assertOtpWindowAvailability(normalizedPhone: string, purpose: OtpPurpose, currentTime: Date = new Date()) {
  await ensureOtpWindowAvailable(normalizedPhone, purpose, currentTime);
  return currentTime;
}

type CreateOtpRequestOptions = {
  skipWindowCheck?: boolean;
  currentTime?: Date;
  normalizedPhoneOverride?: string;
};

export async function createOtpRequest(phone: string, purpose: OtpPurpose = "checkout", options?: CreateOtpRequestOptions) {
  const normalizedPhone = options?.normalizedPhoneOverride ?? normalizeIranPhone(phone);
  const now = options?.currentTime ?? new Date();

  if (!options?.skipWindowCheck) {
    await ensureOtpWindowAvailable(normalizedPhone, purpose, now);
  }

  const activeRequest = await prisma.otpRequest.findFirst({
    where: {
      phone: normalizedPhone,
      purpose,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  let requestId: string | null = null;

  if (activeRequest) {
    const updated = await prisma.otpRequest.updateMany({
      where: {
        id: activeRequest.id,
        codeHash: activeRequest.codeHash,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      data: { codeHash, expiresAt, attempts: 0, createdAt: now },
    });
    if (updated.count === 1) {
      requestId = activeRequest.id;
    }
  }

  if (!requestId) {
    const request = await prisma.otpRequest.create({
      data: { phone: normalizedPhone, purpose, codeHash, expiresAt },
    });
    requestId = request.id;
  }

  return { id: requestId, code, expiresAt, phone: normalizedPhone, purpose } as const;
}

export async function discardOtpRequest(id: string) {
  await prisma.otpRequest.delete({ where: { id } }).catch(() => undefined);
}

type OtpTransaction = Prisma.TransactionClient;

export async function verifyOtpCodeAndRun<T>(
  phone: string,
  code: string,
  purpose: OtpPurpose,
  onVerified: (transaction: OtpTransaction, normalizedPhone: string) => Promise<T>,
) {
  const normalizedPhone = normalizeIranPhone(phone);
  const normalizedCode = normalizeOtpCode(code);

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new OtpVerificationError("کد تایید باید ۶ رقم باشد.");
  }

  const result = await prisma.$transaction(async (transaction) => {
    const request = await transaction.otpRequest.findFirst({
      where: { phone: normalizedPhone, purpose },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    if (!request) {
      return { ok: false as const, message: "کد تایید درخواست نشده است." };
    }
    if (request.consumedAt) {
      return { ok: false as const, message: "این کد تایید قبلاً استفاده شده است." };
    }

    const now = new Date();
    if (request.expiresAt <= now) {
      return { ok: false as const, message: "کد تایید منقضی شده است." };
    }
    if (request.attempts >= OTP_MAX_ATTEMPTS) {
      return { ok: false as const, message: "تعداد تلاش‌های ناموفق بیش از حد مجاز است." };
    }

    const isMatch = await bcrypt.compare(normalizedCode, request.codeHash);
    if (!isMatch) {
      const failedAttempt = await transaction.otpRequest.updateMany({
        where: {
          id: request.id,
          codeHash: request.codeHash,
          consumedAt: null,
          attempts: { lt: OTP_MAX_ATTEMPTS },
          expiresAt: { gt: now },
        },
        data: { attempts: { increment: 1 } },
      });
      if (failedAttempt.count !== 1) {
        return { ok: false as const, message: "کد تایید تغییر کرده یا دیگر معتبر نیست." };
      }
      return { ok: false as const, message: "کد تایید نادرست است." };
    }

    const consumed = await transaction.otpRequest.updateMany({
      where: {
        id: request.id,
        phone: normalizedPhone,
        purpose,
        codeHash: request.codeHash,
        consumedAt: null,
        attempts: { lt: OTP_MAX_ATTEMPTS },
        expiresAt: { gt: now },
      },
      data: { consumedAt: now },
    });

    if (consumed.count !== 1) {
      throw new OtpVerificationError("این کد تایید قبلاً استفاده شده است.");
    }

    const value = await onVerified(transaction, normalizedPhone);
    return { ok: true as const, value };
  });

  if (!result.ok) {
    throw new OtpVerificationError(result.message);
  }

  return result.value;
}

export async function verifyOtpCode(phone: string, code: string, purpose: OtpPurpose = "checkout") {
  return verifyOtpCodeAndRun(phone, code, purpose, async (_transaction, normalizedPhone) => ({
    success: true,
    phone: normalizedPhone,
  } as const));
}
