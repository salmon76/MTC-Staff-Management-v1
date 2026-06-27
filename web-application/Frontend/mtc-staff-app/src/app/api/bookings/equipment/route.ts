import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// GET /api/bookings/equipment — รายการการจองอุปกรณ์
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const equipmentId = searchParams.get("equipmentId");
    const status = searchParams.get("status");

    const bookings = await prisma.equipment_Booking.findMany({
      where: {
        ...(staffId && { staffId }),
        ...(equipmentId && { equipmentId }),
        ...(status && { status }),
      },
      include: {
        Staff: { select: { id: true, name: true, role: true, avatarUrl: true } },
        Equipment: { select: { id: true, name: true, type: true, qrCode: true, imageUrl: true } },
      },
      orderBy: { borrowDate: "asc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("GET /api/bookings/equipment error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถดึงรายการจองได้" }, { status: 500 });
  }
}

// POST /api/bookings/equipment — สร้างรายการจองใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffId, equipmentId, equipmentName, quantity, purpose, borrowDate, returnDate } = body;

    if (!staffId || !purpose || !borrowDate || !returnDate) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลที่จำเป็น (staffId, purpose, borrowDate, returnDate)" },
        { status: 400 }
      );
    }

    // ตรวจสอบการซ้ำซ้อนอีกครั้งก่อนสร้าง (Double-check)
    if (equipmentId) {
      const start = new Date(borrowDate);
      const end = new Date(returnDate);

      const conflict = await prisma.equipment_Booking.findFirst({
        where: {
          equipmentId,
          status: { in: ["pending_handover", "borrowed"] },
          borrowDate: { lt: end },
          returnDate: { gt: start },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { success: false, error: "อุปกรณ์ถูกจองในช่วงเวลาดังกล่าวแล้ว" },
          { status: 409 }
        );
      }
    }

    // ดึงชื่ออุปกรณ์จากตาราง Equipment ถ้าไม่ได้ระบุมา
    let resolvedName = equipmentName || "ไม่ระบุชื่ออุปกรณ์";
    if (equipmentId && !equipmentName) {
      const eq = await prisma.equipment.findUnique({ where: { id: equipmentId } });
      if (eq) resolvedName = eq.name;
    }

    const booking = await prisma.equipment_Booking.create({
      data: {
        id: randomUUID(),
        staffId,
        equipmentId: equipmentId || null,
        equipmentName: resolvedName,
        quantity: quantity ?? 1,
        purpose,
        borrowDate: new Date(borrowDate),
        returnDate: new Date(returnDate),
        status: "pending_handover",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookings/equipment error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถสร้างรายการจองได้" }, { status: 500 });
  }
}
