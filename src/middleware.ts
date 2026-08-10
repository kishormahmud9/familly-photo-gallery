import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "auth_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow login page access without redirection loops
  if (pathname === "/admin/login") {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        const secret = new TextEncoder().encode(
          process.env.AUTH_SECRET || "default-dev-secret-family-photo-gallery-auth-2026-key"
        );
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/admin", req.url));
      } catch (err) {
        // Token invalid, allow login page access
      }
    }
    return NextResponse.next();
  }

  // 2. Protect /admin sub-routes (excluding /admin/login)
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.AUTH_SECRET || "default-dev-secret-family-photo-gallery-auth-2026-key"
      );
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
