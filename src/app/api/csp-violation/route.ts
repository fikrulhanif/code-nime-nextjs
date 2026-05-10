import { NextRequest, NextResponse } from "next/server";

/**
 * CSP Violation Reporting Endpoint
 * Requirement 21.10: Log CSP violations for security monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log CSP violation
    console.error("[CSP Violation]", {
      timestamp: new Date().toISOString(),
      violation: body["csp-report"],
      userAgent: request.headers.get("user-agent"),
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip"),
    });

    // In production, you might want to send this to a monitoring service
    // Example: await sendToMonitoringService(body);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[CSP Violation Handler Error]", error);
    return NextResponse.json(
      { error: "Failed to process report" },
      { status: 500 },
    );
  }
}
