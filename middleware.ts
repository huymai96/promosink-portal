import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Protect routes that require authentication
  const pathname = request.nextUrl.pathname;
  
  if (
    (pathname.startsWith("/orders") || 
     pathname.startsWith("/cart") || 
     pathname.startsWith("/checkout") ||
     pathname.startsWith("/app")) &&
    !session
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/orders/:path*", "/cart", "/checkout"],
};
