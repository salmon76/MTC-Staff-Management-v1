import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// SLA Deadlines ตามระดับความสำคัญ (หน่วย: ชั่วโมง)
const SLA_HOURS: Record<string, number> = {
  critical: 4,
  high: 24,
  medium: 72,   // 3 วัน
  low: 168,     // 7 วัน
};

// GET /api/tickets — รายการใบแจ้งซ่อมพร้อม SLA Status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedToId = searchParams.get("assignedToId");
    const reporterId = searchParams.get("reporterId");
    const slaNear = searchParams.get("slaNear"); // ถ้า "true" แสดงเฉพาะงานที่ใกล้เกิน SLA

    const now = new Date();
    const slaNearThreshold = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 ชั่วโมงข้างหน้า

    const tickets = await prisma.repair_Ticket.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedToId && { assignedToId }),
        ...(reporterId && { reporterId }),
        ...(slaNear === "true" && {
          status: { in: ["pending", "in_progress"] },
          slaDeadline: { lte: slaNearThreshold },
        }),
      },
      include: {
        Equipment: { select: { id: true, name: true, type: true, location: true, qrCode: true } },
        Reporter: { select: { id: true, name: true, role: true, avatarUrl: true } },
        Assignee: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: [{ priority: "desc" }, { slaDeadline: "asc" }],
    });

    // เพิ่ม computed fields สำหรับ SLA
    const ticketsWithSla = tickets.map((t) => {
      const isOverdue = t.status !== "closed" && t.status !== "resolved" && t.slaDeadline < now;
      const isNearDeadline =
        !isOverdue &&
        t.status !== "closed" &&
        t.status !== "resolved" &&
        t.slaDeadline <= slaNearThreshold;

      const responseTimeMin = t.respondedAt
        ? Math.round((t.respondedAt.getTime() - t.createdAt.getTime()) / 60000)
        : null;

      const resolutionTimeMin = t.resolvedAt
        ? Math.round((t.resolvedAt.getTime() - t.createdAt.getTime()) / 60000)
        : null;

      return {
        ...t,
        slaStatus: isOverdue ? "overdue" : isNearDeadline ? "near" : "ok",
        responseTimeMin,
        resolutionTimeMin,
      };
    });

    return NextResponse.json({ success: true, data: ticketsWithSla });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถดึงรายการใบแจ้งซ่อมได้" }, { status: 500 });
  }
}

// POST /api/tickets — สร้างใบแจ้งซ่อมใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipmentId, reporterId, description, priority, pictureBefore } = body;

    if (!equipmentId || !reporterId || !description) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลที่จำเป็น (equipmentId, reporterId, description)" },
        { status: 400 }
      );
    }

    const resolvedPriority = priority || "medium";
    const slaHours = SLA_HOURS[resolvedPriority] ?? 72;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const ticket = await prisma.repair_Ticket.create({
      data: {
        id: randomUUID(),
        equipmentId,
        reporterId,
        description,
        priority: resolvedPriority,
        status: "pending",
        slaDeadline,
        pictureBefore: pictureBefore || null,
      },
      include: {
        Equipment: { select: { name: true, type: true } },
        Reporter: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: ticket,
      meta: {
        slaDeadline,
        slaHours,
        message: `สร้างใบแจ้งซ่อมสำเร็จ — กำหนดปิดงานภายใน ${slaHours} ชั่วโมง`,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถสร้างใบแจ้งซ่อมได้" }, { status: 500 });
  }
}
