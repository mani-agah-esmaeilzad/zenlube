import { redirect } from "next/navigation";
import { getAppSession } from "./session";

export class AuthorizationError extends Error {
  constructor(message = "دسترسی مجاز نیست.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export type AppSession = Awaited<ReturnType<typeof getAppSession>>;

export const backofficeRoles = new Set(["ADMIN", "OPERATIONS_MANAGER", "CONTENT_MANAGER", "SUPPORT"]);

function extractRole(session: AppSession) {
  return (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
}

function extractUserId(session: AppSession) {
  return (session as { user?: { id?: string | null } } | null)?.user?.id ?? null;
}

export async function requireAdminUser({ redirectTo = "/sign-in?callbackUrl=/admin" } = {}) {
  const session = await getAppSession();
  const role = extractRole(session);

  if (!role || !backofficeRoles.has(role)) {
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

  if (!role || !backofficeRoles.has(role)) {
    throw new AuthorizationError();
  }

  return {
    session,
    userId: extractUserId(session),
  } as const;
}

export function ensureRoleAccess(
  role: string | null | undefined,
  allowedRoles: string[],
  message = "دسترسی این بخش برای نقش فعلی مجاز نیست.",
) {
  if (!role || !allowedRoles.includes(role)) {
    throw new AuthorizationError(message);
  }
}

export function ensureNotSelf(targetUserId: string, sessionUserId: string | null | undefined) {
  if (!targetUserId) {
    throw new AuthorizationError("شناسه کاربر نامعتبر است.");
  }

  if (sessionUserId && sessionUserId === targetUserId) {
    throw new AuthorizationError("نمی‌توانید نقش خود را تغییر دهید.");
  }
}
