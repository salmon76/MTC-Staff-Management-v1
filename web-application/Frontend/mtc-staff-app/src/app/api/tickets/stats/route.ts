import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tickets/stats — สถิติสรุปสำหรับ SLA Dashboard
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const slaNearThreshold = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // ดึงข้อมูลทั้งหมดในครั้งเดียว
    const allActiveTickets = await prisma.repair_Ticket.findMany({
      where: { status: { in: ["pending", "in_progress"] } },
    });

    const resolvedThisMonth = await prisma.repair_Ticket.findMany({
      where: {
        status: { in: ["resolved", "closed"] },
        resolvedAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    });

    const overdue = allActiveTickets.filter((t) => t.slaDeadline < now);
    const nearDeadline = allActiveTickets.filter(
      (t) => t.slaDeadline >= now && t.slaDeadline <= slaNearThreshold
    );

    // คำนวณเวลาตอบสนองและปิดงานเฉลี่ย
    const withResponseTime = resolvedThisMonth.filter((t) => t.respondedAt);
    const avgResponseMin =
      withResponseTime.length > 0
        ? Math.round(
            withResponseTime.reduce(
              (sum, t) => sum + (t.respondedAt!.getTime() - t.createdAt.getTime()),
              0
            ) /
              withResponseTime.length /
              60000
          )
        : null;

    const withResolutionTime = resolvedThisMonth.filter((t) => t.resolvedAt);
    const avgResolutionMin =
      withResolutionTime.length > 0
        ? Math.round(
            withResolutionTime.reduce(
              (sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()),
              0
            ) /
              withResolutionTime.length /
              60000
          )
        : null;

    return NextResponse.json({
      success: true,
      data: {
        totalActive: allActiveTickets.length,
        overdueCount: overdue.length,
        nearDeadlineCount: nearDeadline.length,
        resolvedThisMonth: resolvedThisMonth.length,
        avgResponseMin,
        avgResolutionMin,
        byPriority: {
          critical: allActiveTickets.filter((t) => t.priority === "critical").length,
          high: allActiveTickets.filter((t) => t.priority === "high").length,
          medium: allActiveTickets.filter((t) => t.priority === "medium").length,
          low: allActiveTickets.filter((t) => t.priority === "low").length,
        },
        byStatus: {
          pending: allActiveTickets.filter((t) => t.status === "pending").length,
          in_progress: allActiveTickets.filter((t) => t.status === "in_progress").length,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/tickets/stats error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถดึงสถิติได้" }, { status: 500 });
  }
}
