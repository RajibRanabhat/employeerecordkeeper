import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("session")?.value;
  const session = token ? verifyToken(token) : null;

  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // No valid session at all -> bounce to login for any protected route
  if ((isAdminRoute || isDashboardRoute) && !session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Valid session, but wrong role for the section they're trying to reach
  if (isAdminRoute && session?.role !== "ADMIN") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isDashboardRoute && session?.role !== "EMPLOYEE") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};