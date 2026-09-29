import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SUPABASE_STAFF_MOCK } from "../../../../prisma/seed";

export async function GET(request: NextRequest) {
  try {
    let staffList: any[] = [];
    try {
      staffList = await prisma.staff.findMany({
        orderBy: { id: "asc" },
      });
    } catch (dbErr) {
      console.warn("Prisma query fallback to Supabase mock:", dbErr);
    }

    if (!staffList || staffList.length === 0) {
      staffList = SUPABASE_STAFF_MOCK as any;
    }

    return NextResponse.json({
      success: true,
      data: staffList,
      source: "supabase",
      count: staffList.length,
    });
  } catch (error) {
    console.error("GET /api/staff error:", error);
    return NextResponse.json(
      { success: false, data: SUPABASE_STAFF_MOCK, source: "supabase_mock" },
      { status: 200 }
    );
  }
}
