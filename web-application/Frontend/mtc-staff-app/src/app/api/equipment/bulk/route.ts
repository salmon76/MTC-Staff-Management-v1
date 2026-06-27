import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipments } = body;

    if (!Array.isArray(equipments) || equipments.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลที่ต้องการบันทึก" },
        { status: 400 }
      );
    }

    // ทำความสะอาดและเช็คข้อมูลเบื้องต้น
    const validEquipments = equipments.map((eq: any) => {
      // Mapping ภาษาไทยเป็นอังกฤษ (กรณีที่ Client ไม่ได้ทำมา)
      return {
        name: eq.name || eq["ชื่ออุปกรณ์"],
        type: eq.type || eq["ประเภท"] || "Other",
        qrCode: eq.qrCode || eq["รหัส QR"] || String(Date.now()), // สำรองถ้าไม่มี
        serialNumber: eq.serialNumber || eq["ซีเรียลนัมเบอร์"] || null,
        location: eq.location || eq["สถานที่เก็บ"] || null,
        status: eq.status || eq["สถานะ"] || "available",
        notes: eq.notes || eq["หมายเหตุ"] || null,
      };
    }).filter((eq) => eq.name && eq.qrCode); // ต้องมีชื่อและ QR Code

    if (validEquipments.length === 0) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ถูกต้อง (ต้องมีชื่ออุปกรณ์และรหัส QR)" },
        { status: 400 }
      );
    }

    // บันทึกข้อมูลแบบ bulk และข้ามหากมี QR Code ซ้ำ (เฉพาะฐานข้อมูลที่รองรับ skipDuplicates)
    // สำหรับ PostgreSQL Prisma รองรับ skipDuplicates ใน createMany
    const result = await prisma.equipment.createMany({
      data: validEquipments,
      skipDuplicates: true, // ข้ามรายการที่มี qrCode หรือ id ซ้ำ
    });

    return NextResponse.json({
      success: true,
      message: `นำเข้าอุปกรณ์สำเร็จ ${result.count} รายการ (ข้ามรายการที่ซ้ำ)`,
      count: result.count,
    });
  } catch (error) {
    console.error("POST /api/equipment/bulk error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลแบบกลุ่ม" },
      { status: 500 }
    );
  }
}
