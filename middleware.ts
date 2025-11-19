import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add tenant resolution logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect /app routes
        if (req.nextUrl.pathname.startsWith("/app")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/app/:path*", "/orders/:path*", "/cart", "/checkout"],
};

