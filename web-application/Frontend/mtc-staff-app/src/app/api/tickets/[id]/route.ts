import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tickets/[id] — ดึงรายละเอียดใบแจ้งซ่อม
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ticket = await prisma.repair_Ticket.findUnique({
      where: { id },
      include: {
        Equipment: true,
        Reporter: { select: { id: true, name: true, role: true, phone: true, avatarUrl: true } },
        Assignee: { select: { id: true, name: true, role: true, phone: true, avatarUrl: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ success: false, error: "ไม่พบใบแจ้งซ่อม" }, { status: 404 });
    }

    const now = new Date();
    const isOverdue = ticket.status !== "closed" && ticket.status !== "resolved" && ticket.slaDeadline < now;

    return NextResponse.json({
      success: true,
      data: {
        ...ticket,
        slaStatus: isOverdue ? "overdue" : ticket.slaDeadline <= new Date(now.getTime() + 2 * 60 * 60 * 1000) ? "near" : "ok",
        responseTimeMin: ticket.respondedAt
          ? Math.round((ticket.respondedAt.getTime() - ticket.createdAt.getTime()) / 60000)
          : null,
        resolutionTimeMin: ticket.resolvedAt
          ? Math.round((ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / 60000)
          : null,
      },
    });
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

// PATCH /api/tickets/[id] — อัปเดตสถานะ/ข้อมูลใบแจ้งซ่อม
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignedToId, pictureAfter } = body;

    const ticket = await prisma.repair_Ticket.findUnique({ where: { id } });

    if (!ticket) {
      return NextResponse.json({ success: false, error: "ไม่พบใบแจ้งซ่อม" }, { status: 404 });
    }

    const now = new Date();

    // กำหนด timestamps ตามการเปลี่ยนสถานะ
    const updateData: Record<string, unknown> = { updatedAt: now };

    if (status) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (pictureAfter) updateData.pictureAfter = pictureAfter;

    // บันทึกเวลาตอบสนองเมื่อรับงาน
    if (status === "in_progress" && !ticket.respondedAt) {
      updateData.respondedAt = now;
    }

    // บันทึกเวลาซ่อมเสร็จ
    if (status === "resolved" && !ticket.resolvedAt) {
      updateData.resolvedAt = now;
    }

    // บันทึกเวลาปิดงาน
    if (status === "closed" && !ticket.closedAt) {
      updateData.closedAt = now;
    }

    const updated = await prisma.repair_Ticket.update({
      where: { id },
      data: updateData,
      include: {
        Equipment: { select: { name: true } },
        Assignee: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถอัปเดตใบแจ้งซ่อมได้" }, { status: 500 });
  }
}
