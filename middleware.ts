import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
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
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/admin/login")) {
          return true;
        }

        if (!token) {
          return false;
        }
        if (token.role !== "ADMIN") {
          return false;
        }
        if (typeof token.adminExpiresAt === "number") {
          return token.adminExpiresAt > Math.floor(Date.now() / 1000);
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*"],
};
