import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  //
  const adminToken = request.cookies.get("admin_access_token")?.value;

  /*
   * ============================================================
   * 1. ADMIN LOGIN
   * ============================================================
   */
  if (pathname === "/admin/login") {
    if (adminToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  /*
   * ============================================================
   * 2. PROTECT ALL ADMIN ROUTES (/admin, /admin/products, ...)
   * ============================================================
   */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!adminToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  /*
   * ============================================================
   * 3. ALLOW REQUEST
   * ============================================================
   */
  return NextResponse.next();
}

/*
 * ==============================================================
 * 4. MIDDLEWARE MATCHER
 * ==============================================================
 */
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
