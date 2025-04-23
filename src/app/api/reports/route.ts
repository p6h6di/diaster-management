import { NextResponse } from "next/server";
import { ReportStatus, ReportType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ReportStatus | null;
    const type = searchParams.get("type") as ReportType | null;

    const where = {
      ...(status && { status }),
      ...(type && { type }),
    };

    const reports = await Promise.race([
      prisma.report.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          reportId: true,
          type: true,
          title: true,
          description: true,
          location: true,
          latitude: true,
          longitude: true,
          image: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout")), 15000)
      ),
    ]);

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("Failed to fetch reports:", error);

    if (error.code === "P1001") {
      return NextResponse.json(
        { error: "Cannot connect to database. Please try again later." },
        { status: 503 }
      );
    }

    if (error.code === "P2024") {
      return NextResponse.json(
        { error: "Database connection timeout. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  } finally {
    if (process.env.VERCEL) {
      await prisma.$disconnect();
    }
  }
}
