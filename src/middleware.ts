import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";

import { config as appConfig } from "@/lib/config";
import {
  createTorobAttributionCookie,
  isValidTorobClickId,
  TOROB_ATTRIBUTION_COOKIE,
  TOROB_ATTRIBUTION_MAX_AGE_SECONDS,
} from "@/lib/torob-attribution";

const adminMiddleware = withAuth(
  function middleware(request) {
    if (request.nextUrl.pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }

    const role = request.nextauth?.token?.role;
    const adminExpiresAt = request.nextauth?.token?.adminExpiresAt;

    if (role === "ADMIN" && typeof adminExpiresAt === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (adminExpiresAt < now) {
        const expiredUrl = new URL("/sign-in", request.url);
        expiredUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        expiredUrl.searchParams.set("reason", "admin-session-expired");
        return NextResponse.redirect(expiredUrl);
      }
    }

    if (role !== "ADMIN") {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/sign-in" },
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/admin/login")) return true;
        if (!token || token.role !== "ADMIN") return false;
        if (typeof token.adminExpiresAt === "number") return token.adminExpiresAt > Math.floor(Date.now() / 1000);
        return true;
      },
    },
  },
);

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(request as NextRequestWithAuth, event);
  }

  const clickId = request.nextUrl.searchParams.get("torob_clid");
  if (!isValidTorobClickId(clickId)) return NextResponse.next();

  const signedCookie = await createTorobAttributionCookie(clickId, appConfig.NEXTAUTH_SECRET);
  const response = NextResponse.next();
  if (signedCookie) {
    response.cookies.set(TOROB_ATTRIBUTION_COOKIE, signedCookie, {
      httpOnly: true,
      secure: appConfig.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOROB_ATTRIBUTION_MAX_AGE_SECONDS,
    });
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/products/:path*"],
};
