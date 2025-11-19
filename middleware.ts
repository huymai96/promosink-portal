import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Protect routes that require authentication
  const pathname = request.nextUrl.pathname;
  
  if (
    (pathname.startsWith("/orders") || 
     pathname.startsWith("/cart") || 
     pathname.startsWith("/checkout") ||
     pathname.startsWith("/app")) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/orders/:path*", "/cart", "/checkout"],
};
