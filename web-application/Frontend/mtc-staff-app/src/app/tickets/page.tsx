"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface TicketStats {
  totalActive: number;
  overdueCount: number;
  nearDeadlineCount: number;
  resolvedThisMonth: number;
  avgResponseMin: number | null;
  avgResolutionMin: number | null;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

interface Ticket {
  id: string;
  description: string;
  priority: string;
  status: string;
  slaDeadline: string;
  slaStatus: "ok" | "near" | "overdue";
  createdAt: string;
  responseTimeMin: number | null;
  resolutionTimeMin: number | null;
  Equipment: { name: string; type: string; location: string | null };
  Reporter: { name: string; role: string };
  Assignee?: { name: string; role: string } | null;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  critical: { label: "ด่วนที่สุด", color: "#B71C1C", bg: "#FFEBEE", icon: "🚨" },
  high: { label: "ด่วน", color: "#C62828", bg: "#FFEBEE", icon: "🔴" },
  medium: { label: "ปกติ", color: "#E65100", bg: "#FFF3E0", icon: "🟠" },
  low: { label: "ต่ำ", color: "#2E7D32", bg: "#E8F5E9", icon: "🟢" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "รอดำเนินการ", color: "#616161", bg: "#F5F5F5" },
  in_progress: { label: "กำลังซ่อม", color: "#1565C0", bg: "#E3F2FD" },
  resolved: { label: "ซ่อมเสร็จ", color: "#2E7D32", bg: "#E8F5E9" },
  closed: { label: "ปิดงาน", color: "#757575", bg: "#EEEEEE" },
};

function formatMinutes(min: number | null) {
  if (min === null) return "—";
  if (min < 60) return `${min} นาที`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
}

function SlaCountdown({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("เกินกำหนดแล้ว");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h} ชม. ${m} นาที`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [deadline]);
  return <span>{timeLeft}</span>;
}

export default function TicketsPage() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, ticketsRes] = await Promise.all([
        fetch("/api/tickets/stats"),
        fetch(`/api/tickets${filter !== "all" ? `?status=${filter}` : ""}`),
      ]);
      const [statsData, ticketsData] = await Promise.all([statsRes.json(), ticketsRes.json()]);
      if (statsData.success) setStats(statsData.data);
      if (ticketsData.success) setTickets(ticketsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--background)", paddingBottom: 90 }}>
      {/* Header */}
      <header className="page-header safe-area-top">
        <div className="page-header-inner">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--mtc-red)", letterSpacing: "-0.02em" }}>
              งานซ่อม & SLA
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>ติดตามและจัดการใบแจ้งซ่อม</p>
          </div>
          <Link
            href="/tickets/new"
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              background: "var(--mtc-red)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "var(--shadow-red-sm)",
            }}
          >
            + แจ้งซ่อม
          </Link>
        </div>
      </header>

      <main style={{ padding: "0 20px" }}>
        {/* SLA Stats Dashboard */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div
              className="mtc-card"
              style={{ background: stats.overdueCount > 0 ? "#FFEBEE" : "white", border: stats.overdueCount > 0 ? "1.5px solid #FFCDD2" : "none" }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: stats.overdueCount > 0 ? "#C62828" : "var(--text-primary)" }}>
                {stats.overdueCount}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>🚨 เกิน SLA</div>
            </div>
            <div
              className="mtc-card"
              style={{ background: stats.nearDeadlineCount > 0 ? "#FFF3E0" : "white", border: stats.nearDeadlineCount > 0 ? "1.5px solid #FFE0B2" : "none" }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: stats.nearDeadlineCount > 0 ? "#E65100" : "var(--text-primary)" }}>
                {stats.nearDeadlineCount}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>⚠️ ใกล้เกิน SLA</div>
            </div>
            <div className="mtc-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                {formatMinutes(stats.avgResponseMin)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>⚡ เวลาตอบสนองเฉลี่ย</div>
            </div>
            <div className="mtc-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                {formatMinutes(stats.avgResolutionMin)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>✅ เวลาปิดงานเฉลี่ย</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 12 }}>
          {(["all", "pending", "in_progress", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                border: "none",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                background: filter === f ? "var(--mtc-red)" : "var(--surface)",
                color: filter === f ? "white" : "var(--text-secondary)",
                boxShadow: filter === f ? "var(--shadow-red-sm)" : "var(--shadow-sm)",
              }}
            >
              {f === "all" ? "ทั้งหมด" : STATUS_CONFIG[f]?.label ?? f}
            </button>
          ))}
        </div>

        {/* Ticket List */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-tertiary)" }}>กำลังโหลด...</div>
        )}
        {!loading && tickets.length === 0 && (
          <div className="mtc-card" style={{ textAlign: "center", padding: 40, color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
            <p>ไม่มีใบแจ้งซ่อมในขณะนี้</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tickets.map((ticket) => {
            const p = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
            const s = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.pending;
            const slaColor =
              ticket.slaStatus === "overdue"
                ? "#C62828"
                : ticket.slaStatus === "near"
                ? "#E65100"
                : "#2E7D32";

            return (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} style={{ textDecoration: "none" }}>
                <div
                  className="mtc-card"
                  style={{
                    borderLeft: `4px solid ${p.color}`,
                    borderRadius: "0 14px 14px 0",
                    transition: "transform 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 3 }}>
                        {p.icon} {ticket.Equipment.name}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {ticket.description.slice(0, 60)}{ticket.description.length > 60 ? "..." : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        background: s.bg,
                        color: s.color,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      📍 {ticket.Equipment.location ?? "ไม่ระบุ"} · โดย {ticket.Reporter.name}
                    </div>
                    {ticket.status !== "closed" && ticket.status !== "resolved" && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: slaColor }}>
                        ⏱ <SlaCountdown deadline={ticket.slaDeadline} />
                      </div>
                    )}
                  </div>

                  {ticket.Assignee && (
                    <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-tertiary)" }}>
                      👤 ผู้รับผิดชอบ: {ticket.Assignee.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
