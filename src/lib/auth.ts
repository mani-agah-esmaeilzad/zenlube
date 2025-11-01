import { redirect } from "next/navigation";
import { getAppSession } from "./session";

export class AuthorizationError extends Error {
  constructor(message = "دسترسی مجاز نیست.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export type AppSession = Awaited<ReturnType<typeof getAppSession>>;

function extractRole(session: AppSession) {
  return (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
}

function extractUserId(session: AppSession) {
  return (session as { user?: { id?: string | null } } | null)?.user?.id ?? null;
}

export async function requireAdminUser({ redirectTo = "/sign-in?callbackUrl=/admin" } = {}) {
  const session = await getAppSession();
  const role = extractRole(session);

  if (role !== "ADMIN") {
    redirect(redirectTo);
  }

  const userId = extractUserId(session);

  return {
    session,
    userId,
    role,
  } as const;
}

export async function ensureAdminAction() {
  const session = await getAppSession();
  const role = extractRole(session);

  if (role !== "ADMIN") {
    throw new AuthorizationError();
  }

  return {
    session,
    userId: extractUserId(session),
  } as const;
}

export function ensureNotSelf(targetUserId: string, sessionUserId: string | null | undefined) {
  if (!targetUserId) {
    throw new AuthorizationError("شناسه کاربر نامعتبر است.");
  }

  if (sessionUserId && sessionUserId === targetUserId) {
    throw new AuthorizationError("نمی‌توانید نقش خود را تغییر دهید.");
  }
}
