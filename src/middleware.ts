import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for security and redirects
 * Requirement 21.5: Redirect HTTP to HTTPS in production
 */
export function middleware(request: NextRequest) {
  // Requirement 21.5: HTTPS redirect in production
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
