import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/bookings/equipment/validate — ตรวจสอบความพร้อมใช้งานของอุปกรณ์ (ป้องกันการจองซ้ำ)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipmentId, borrowDate, returnDate, excludeBookingId } = body;

    if (!equipmentId || !borrowDate || !returnDate) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ equipmentId, borrowDate และ returnDate" },
        { status: 400 }
      );
    }

    const start = new Date(borrowDate);
    const end = new Date(returnDate);

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: "วันเริ่มต้นต้องน้อยกว่าวันสิ้นสุด" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าอุปกรณ์อยู่ในสถานะ available หรือไม่
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      return NextResponse.json({ success: false, error: "ไม่พบอุปกรณ์" }, { status: 404 });
    }

    if (equipment.status !== "available") {
      return NextResponse.json({
        success: true,
        available: false,
        reason: `อุปกรณ์อยู่ในสถานะ "${equipment.status}" ไม่สามารถจองได้`,
      });
    }

    // ตรวจสอบการจองซ้ำซ้อนในช่วงเวลาดังกล่าว
    const conflictBooking = await prisma.equipment_Booking.findFirst({
      where: {
        equipmentId,
        status: { in: ["pending_handover", "borrowed"] },
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        // ตรวจสอบ overlap: ถ้า borrowDate ของการจองใหม่ < returnDate ของที่จองแล้ว
        // AND returnDate ของการจองใหม่ > borrowDate ของที่จองแล้ว
        borrowDate: { lt: end },
        returnDate: { gt: start },
      },
      include: {
        Staff: { select: { name: true } },
      },
    });

    if (conflictBooking) {
      return NextResponse.json({
        success: true,
        available: false,
        reason: "อุปกรณ์ถูกจองในช่วงเวลาดังกล่าวแล้ว",
        conflict: {
          bookingId: conflictBooking.id,
          staffName: conflictBooking.Staff?.name,
          borrowDate: conflictBooking.borrowDate,
          returnDate: conflictBooking.returnDate,
        },
      });
    }

    return NextResponse.json({ success: true, available: true });
  } catch (error) {
    console.error("POST /api/bookings/equipment/validate error:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบ" }, { status: 500 });
  }
}
