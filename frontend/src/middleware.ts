import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Explicitly protected routes where unauthenticated access is strictly forbidden
  const protectedPrefixes = [
    "/dashboard",
    "/vendors",
    "/verification",
    "/billing",
    "/customer",
    "/assistant",
    "/onboarding",
    "/admin",
  ];

  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));

  if (isProtected) {
    const authCookie = request.cookies.get("supplylens_auth")?.value;
    if (!authCookie || authCookie.trim() === "" || authCookie === "null" || authCookie === "undefined") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/vendors",
    "/vendors/:path*",
    "/verification",
    "/verification/:path*",
    "/billing",
    "/billing/:path*",
    "/customer",
    "/customer/:path*",
    "/assistant",
    "/assistant/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
