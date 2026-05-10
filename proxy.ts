import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy for handling security and routing concerns
 * Requirement 21.5: Redirect HTTP to HTTPS in production
 */
export function proxy(request: NextRequest) {
  // Requirement 21.5: Redirect HTTP to HTTPS with 301 status in production
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, { status: 301 });
  }

  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
