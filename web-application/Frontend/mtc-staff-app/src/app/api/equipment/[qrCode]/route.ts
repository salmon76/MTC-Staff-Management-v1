import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/equipment/[qrCode] — ดึงข้อมูลอุปกรณ์ผ่าน QR Code (สำหรับสแกน)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const { qrCode } = await params;

    const equipment = await prisma.equipment.findUnique({
      where: { qrCode },
      include: {
        Bookings: {
          where: {
            status: { in: ["pending_handover", "borrowed"] },
          },
          include: {
            Staff: { select: { id: true, name: true, role: true } },
          },
          orderBy: { borrowDate: "asc" },
          take: 5,
        },
        Tickets: {
          where: {
            status: { in: ["pending", "in_progress"] },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ success: false, error: "ไม่พบอุปกรณ์" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: equipment });
  } catch (error) {
    console.error("GET /api/equipment/[qrCode] error:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}
