import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/cron/sla-check — เรียกใช้โดย Vercel Cron ทุก 1 ชั่วโมง
// ตรวจสอบงานซ่อมที่ใกล้เกินกำหนด SLA และส่งแจ้งเตือนทาง LINE
export async function POST(request: NextRequest) {
  // ตรวจสอบ Authorization header สำหรับ Cron Job (ใช้ CRON_SECRET)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const alert80Threshold = new Date(); // คำนวณ threshold 80% ใน loop
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // ดึงงานที่ active และใกล้เกินกำหนด (ภายใน 2 ชั่วโมง)
    const nearingTickets = await prisma.repair_Ticket.findMany({
      where: {
        status: { in: ["pending", "in_progress"] },
        slaDeadline: {
          gte: now,
          lte: twoHoursLater,
        },
      },
      include: {
        Equipment: { select: { name: true, location: true } },
        Reporter: { select: { lineId: true, name: true } },
        Assignee: { select: { lineId: true, name: true } },
      },
    });

    // ดึงงานที่เกิน SLA แล้ว (deadline ผ่านมาแล้วแต่ยังไม่ปิด)
    const overdueTickets = await prisma.repair_Ticket.findMany({
      where: {
        status: { in: ["pending", "in_progress"] },
        slaDeadline: { lt: now },
      },
      include: {
        Equipment: { select: { name: true } },
        Assignee: { select: { lineId: true, name: true } },
        Reporter: { select: { lineId: true, name: true } },
      },
    });

    const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const notificationsSent: string[] = [];

    // ส่ง LINE Push Message แจ้งเตือนงานใกล้เกิน SLA
    if (lineAccessToken) {
      for (const ticket of nearingTickets) {
        const targetLineId = ticket.Assignee?.lineId || ticket.Reporter?.lineId;
        if (!targetLineId) continue;

        const minutesLeft = Math.round((ticket.slaDeadline.getTime() - now.getTime()) / 60000);
        const message = `⚠️ ใกล้เกิน SLA!\n\nงานซ่อม: ${ticket.Equipment.name}\nลำดับความสำคัญ: ${ticket.priority.toUpperCase()}\nเหลือเวลา: ${minutesLeft} นาที\n\nกรุณาดำเนินการก่อนหมดเวลา`;

        try {
          await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lineAccessToken}`,
            },
            body: JSON.stringify({
              to: targetLineId,
              messages: [{ type: "text", text: message }],
            }),
          });
          notificationsSent.push(`near:${ticket.id}`);
        } catch (lineErr) {
          console.error("LINE push failed:", lineErr);
        }
      }

      // ส่ง LINE Push Message แจ้งเตือนงานที่เกิน SLA แล้ว
      for (const ticket of overdueTickets) {
        const targetLineId = ticket.Assignee?.lineId || ticket.Reporter?.lineId;
        if (!targetLineId) continue;

        const minutesOver = Math.round((now.getTime() - ticket.slaDeadline.getTime()) / 60000);
        const message = `🚨 เกินกำหนด SLA แล้ว!\n\nงานซ่อม: ${ticket.Equipment.name}\nเกิน: ${minutesOver} นาที\n\nกรุณาดำเนินการและปิดงานโดยเร่งด่วน`;

        try {
          await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lineAccessToken}`,
            },
            body: JSON.stringify({
              to: targetLineId,
              messages: [{ type: "text", text: message }],
            }),
          });
          notificationsSent.push(`overdue:${ticket.id}`);
        } catch (lineErr) {
          console.error("LINE push failed:", lineErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      checkedAt: now.toISOString(),
      nearingCount: nearingTickets.length,
      overdueCount: overdueTickets.length,
      notificationsSent: notificationsSent.length,
    });
  } catch (error) {
    console.error("POST /api/cron/sla-check error:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดใน SLA check" }, { status: 500 });
  }
}
