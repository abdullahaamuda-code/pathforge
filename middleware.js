import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/onboarding", "/roadmap", "/opportunities", "/saved", "/mentor"];
const authRoutes = ["/login", "/signup"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  // Check for Firebase auth session cookie
  const session = request.cookies.get("__session")?.value;

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};