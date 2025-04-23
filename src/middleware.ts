import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  console.log("Session Cookie:", sessionCookie);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    try {
      const baseUrl = process.env.BETTER_AUTH_URL || request.nextUrl.origin;
      const verifyUrl = `${baseUrl}/api/auth/verify-role`;

      const response = await fetch(verifyUrl, {
        headers: {
          Cookie: request.headers.get("cookie") || `session=${sessionCookie}`,
          Host: request.headers.get("host") || "",
          "User-Agent": request.headers.get("user-agent") || "",
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Role verification failed with status:", response.status);
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      const data = await response.json();
      console.log("Verification response:", data);

      if (!data.authorized) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error) {
      console.error("Error verifying role:", error);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
