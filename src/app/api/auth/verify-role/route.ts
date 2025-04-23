import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get("session");

    console.log("Received cookie in API:", sessionCookie?.value);

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("Session:", session);

    if (!session) {
      console.error("Session is null. Cookie present:", !!sessionCookie);
    }

    const authorized =
      session?.user?.role === "admin" || session?.user?.role === "moderator";

    console.log("User role:", session?.user?.role);
    console.log("Authorized:", authorized);

    return new Response(JSON.stringify({ authorized }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return new Response(
      JSON.stringify({
        authorized: false,
        error: "Unauthorized",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
