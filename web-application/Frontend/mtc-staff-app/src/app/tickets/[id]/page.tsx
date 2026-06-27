"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface TicketDetail {
  id: string;
  description: string;
  priority: string;
  status: string;
  slaDeadline: string;
  slaStatus: "ok" | "near" | "overdue";
  respondedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  pictureBefore: string | null;
  pictureAfter: string | null;
  createdAt: string;
  responseTimeMin: number | null;
  resolutionTimeMin: number | null;
  Equipment: { id: string; name: string; type: string; location: string | null; qrCode: string };
  Reporter: { id: string; name: string; role: string; phone: string | null };
  Assignee?: { id: string; name: string; role: string; phone: string | null } | null;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "ด่วนที่สุด", color: "#B71C1C", bg: "#FFEBEE" },
  high: { label: "ด่วน", color: "#C62828", bg: "#FFEBEE" },
  medium: { label: "ปกติ", color: "#E65100", bg: "#FFF3E0" },
  low: { label: "ต่ำ", color: "#2E7D32", bg: "#E8F5E9" },
};

const STATUS_FLOW = ["pending", "in_progress", "resolved", "closed"];
const STATUS_LABELS: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังซ่อม",
  resolved: "ซ่อมเสร็จ",
  closed: "ปิดงาน",
};

function formatMinutes(min: number | null) {
  if (min === null) return "—";
  if (min < 60) return `${min} นาที`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
}

export default function TicketDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pictureAfterPreview, setPictureAfterPreview] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      const data = await res.json();
      if (data.success) setTicket(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const body: Record<string, string> = { status: newStatus };
      if (newStatus === "resolved" && pictureAfterPreview) {
        body.pictureAfter = pictureAfterPreview;
      }
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        await load();
        setPictureAfterPreview(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPictureAfterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <p>ไม่พบใบแจ้งซ่อม</p>
        <button onClick={() => router.back()} className="mtc-btn-primary" style={{ width: "auto" }}>ย้อนกลับ</button>
      </div>
    );
  }

  const p = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
  const currentStatusIndex = STATUS_FLOW.indexOf(ticket.status);
  const canAdvance = currentStatusIndex < STATUS_FLOW.length - 1;
  const nextStatus = canAdvance ? STATUS_FLOW[currentStatusIndex + 1] : null;

  const slaColor = ticket.slaStatus === "overdue" ? "#C62828" : ticket.slaStatus === "near" ? "#E65100" : "#2E7D32";

  return (
    <div style={{ minHeight: "100dvh", background: "var(--background)", paddingBottom: 40 }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${p.color} 0%, #880E4F 100%)`, padding: "56px 24px 28px", color: "white", position: "relative" }}>
        <button
          onClick={() => router.back()}
          style={{ position: "absolute", top: 16, left: 20, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, color: "white", padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          ‹ ย้อนกลับ
        </button>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "3px 12px", borderRadius: 20 }}>
            {p.label} · #{ticket.id.slice(0, 8).toUpperCase()}
          </span>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginTop: 10, marginBottom: 6 }}>🔧 {ticket.Equipment.name}</h1>
          <p style={{ fontSize: 13, opacity: 0.85 }}>{ticket.Equipment.location ?? "ไม่ระบุตำแหน่ง"}</p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Status Progress */}
        <div className="mtc-card" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 14, textTransform: "uppercase" }}>ความคืบหน้า</p>
          <div style={{ display: "flex", gap: 4 }}>
            {STATUS_FLOW.map((s, i) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: i <= currentStatusIndex ? "var(--mtc-red)" : "#e9ecef",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {STATUS_FLOW.map((s, i) => (
              <span key={s} style={{ fontSize: 10, color: i <= currentStatusIndex ? "var(--mtc-red)" : "var(--text-tertiary)", fontWeight: i === currentStatusIndex ? 700 : 400 }}>
                {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
        </div>

        {/* SLA Info */}
        <div
          className="mtc-card"
          style={{
            marginBottom: 16,
            background: ticket.slaStatus === "overdue" ? "#FFEBEE" : ticket.slaStatus === "near" ? "#FFF3E0" : "white",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 4 }}>กำหนด SLA</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: slaColor }}>
                {new Date(ticket.slaDeadline).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 4 }}>สถานะ SLA</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: slaColor }}>
                {ticket.slaStatus === "overdue" ? "🚨 เกินกำหนด" : ticket.slaStatus === "near" ? "⚠️ ใกล้เกิน" : "✅ ปกติ"}
              </p>
            </div>
          </div>
        </div>

        {/* Time Metrics */}
        {(ticket.responseTimeMin !== null || ticket.resolutionTimeMin !== null) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div className="mtc-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatMinutes(ticket.responseTimeMin)}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>⚡ เวลาตอบสนอง</div>
            </div>
            <div className="mtc-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatMinutes(ticket.resolutionTimeMin)}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>✅ เวลาซ่อมเสร็จ</div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mtc-card" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 8, textTransform: "uppercase" }}>รายละเอียดอาการ</p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{ticket.description}</p>
        </div>

        {/* People */}
        <div className="mtc-card" style={{ marginBottom: 16, padding: "0 20px" }}>
          <div style={{ padding: "14px 0", borderBottom: "1px solid var(--border-light)" }}>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 2 }}>ผู้แจ้งซ่อม</p>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{ticket.Reporter.name} <span style={{ fontWeight: 400, color: "var(--text-tertiary)" }}>({ticket.Reporter.role})</span></p>
          </div>
          <div style={{ padding: "14px 0" }}>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 2 }}>ผู้รับผิดชอบ</p>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{ticket.Assignee ? `${ticket.Assignee.name} (${ticket.Assignee.role})` : "ยังไม่มีผู้รับงาน"}</p>
          </div>
        </div>

        {/* Before/After Photos */}
        {(ticket.pictureBefore || ticket.pictureAfter) && (
          <div className="mtc-card" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 12, textTransform: "uppercase" }}>หลักฐานรูปภาพ</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {ticket.pictureBefore && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: "var(--text-tertiary)" }}>ก่อนซ่อม</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ticket.pictureBefore} alt="ก่อนซ่อม" style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 150 }} />
                </div>
              )}
              {ticket.pictureAfter && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: "var(--text-tertiary)" }}>หลังซ่อม</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ticket.pictureAfter} alt="หลังซ่อม" style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 150 }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {canAdvance && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {nextStatus === "resolved" && (
              <div className="mtc-card">
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 8 }}>
                  แนบภาพหลังซ่อม (Optional)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  style={{ fontSize: 13, color: "var(--text-secondary)" }}
                />
                {pictureAfterPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pictureAfterPreview} alt="ตัวอย่าง" style={{ width: "100%", borderRadius: 10, marginTop: 10, maxHeight: 160, objectFit: "cover" }} />
                )}
              </div>
            )}
            <button
              onClick={() => updateStatus(nextStatus!)}
              disabled={updating}
              style={{
                padding: "15px",
                background: updating ? "#e9ecef" : "var(--mtc-red)",
                color: updating ? "#adb5bd" : "white",
                border: "none",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                cursor: updating ? "not-allowed" : "pointer",
                boxShadow: updating ? "none" : "var(--shadow-red-sm)",
              }}
            >
              {updating ? "กำลังอัปเดต..." : `➡ เปลี่ยนเป็น "${STATUS_LABELS[nextStatus!]}"`}
            </button>
          </div>
        )}

        {ticket.status === "closed" && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <p style={{ fontWeight: 700 }}>งานซ่อมนี้ปิดเรียบร้อยแล้ว</p>
            {ticket.closedAt && (
              <p style={{ fontSize: 12, marginTop: 4 }}>
                ปิดเมื่อ {new Date(ticket.closedAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
