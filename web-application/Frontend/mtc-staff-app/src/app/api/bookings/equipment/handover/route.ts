import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/bookings/equipment/handover — บันทึกลายเซ็นดิจิทัลตอนส่งมอบอุปกรณ์
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, signerName, signatureBase64 } = body;

    if (!bookingId || !signerName || !signatureBase64) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ bookingId, signerName และ signatureBase64" },
        { status: 400 }
      );
    }

    // ตรวจสอบสถานะว่ายังรอส่งมอบอยู่
    const booking = await prisma.equipment_Booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "ไม่พบรายการจอง" }, { status: 404 });
    }

    if (booking.status !== "pending_handover") {
      return NextResponse.json(
        { success: false, error: `ไม่สามารถส่งมอบได้ สถานะปัจจุบัน: "${booking.status}"` },
        { status: 409 }
      );
    }

    const updated = await prisma.equipment_Booking.update({
      where: { id: bookingId },
      data: {
        handoverSignature: signatureBase64,
        handoverSignerName: signerName,
        handoverAt: new Date(),
        status: "borrowed",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("POST /api/bookings/equipment/handover error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถบันทึกลายเซ็นส่งมอบได้" }, { status: 500 });
  }
}
