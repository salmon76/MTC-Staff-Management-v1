import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/bookings/equipment/return — บันทึกลายเซ็นดิจิทัลตอนคืนอุปกรณ์
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

    const booking = await prisma.equipment_Booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "ไม่พบรายการจอง" }, { status: 404 });
    }

    if (booking.status !== "borrowed") {
      return NextResponse.json(
        { success: false, error: `ไม่สามารถรับคืนได้ สถานะปัจจุบัน: "${booking.status}"` },
        { status: 409 }
      );
    }

    const updated = await prisma.equipment_Booking.update({
      where: { id: bookingId },
      data: {
        returnSignature: signatureBase64,
        returnSignerName: signerName,
        returnAt: new Date(),
        status: "returned",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("POST /api/bookings/equipment/return error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถบันทึกลายเซ็นคืนอุปกรณ์ได้" }, { status: 500 });
  }
}
