import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(request) {
    const role = request.nextauth?.token?.role;

    if (role !== "ADMIN") {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  },
);

export const config = {
  matcher: ["/admin/:path*"],
};
