"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface EquipmentDetail {
  id: string;
  name: string;
  type: string;
  location: string | null;
  status: string;
  qrCode: string;
  imageUrl: string | null;
  notes: string | null;
  Bookings: Array<{
    id: string;
    borrowDate: string;
    returnDate: string;
    status: string;
    Staff?: { name: string; role: string };
  }>;
  Tickets: Array<{
    id: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
  }>;
}

const TYPE_ICONS: Record<string, string> = {
  Projector: "📽️",
  Microphone: "🎤",
  Camera: "📷",
  SoundSystem: "🔊",
  Other: "📦",
};

const PRIORITY_COLORS: Record<string, { color: string; bg: string }> = {
  critical: { color: "#B71C1C", bg: "#FFEBEE" },
  high: { color: "#C62828", bg: "#FFEBEE" },
  medium: { color: "#E65100", bg: "#FFF3E0" },
  low: { color: "#2E7D32", bg: "#E8F5E9" },
};

export default function EquipmentQRPage() {
  const { qrCode } = useParams() as { qrCode: string };
  const router = useRouter();
  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!qrCode) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/equipment/${encodeURIComponent(qrCode)}`);
        const data = await res.json();
        if (data.success) {
          setEquipment(data.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [qrCode]);

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p>กำลังโหลดข้อมูลอุปกรณ์...</p>
        </div>
      </div>
    );
  }

  if (notFound || !equipment) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--background)", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 56 }}>❓</div>
        <h2 style={{ fontWeight: 700, fontSize: 20 }}>ไม่พบอุปกรณ์</h2>
        <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>รหัส QR นี้ไม่ตรงกับอุปกรณ์ในระบบ</p>
        <button onClick={() => router.back()} className="mtc-btn-primary" style={{ width: "auto", paddingLeft: 24, paddingRight: 24 }}>
          ย้อนกลับ
        </button>
      </div>
    );
  }

  const isAvailable = equipment.status === "available";

  return (
    <div style={{ minHeight: "100dvh", background: "var(--background)", paddingBottom: 40 }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--mtc-red) 0%, #B71C1C 100%)",
          padding: "56px 24px 32px",
          color: "white",
          position: "relative",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            position: "absolute",
            top: 16,
            left: 20,
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: 10,
            color: "white",
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          ‹ ย้อนกลับ
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{TYPE_ICONS[equipment.type] ?? "📦"}</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{equipment.name}</h1>
          <p style={{ fontSize: 13, opacity: 0.85 }}>
            {equipment.location ?? "ไม่ระบุตำแหน่ง"} · {equipment.qrCode}
          </p>
          <div
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "5px 18px",
              borderRadius: 20,
              background: isAvailable ? "rgba(76,175,80,0.25)" : "rgba(244,67,54,0.25)",
              fontSize: 13,
              fontWeight: 700,
              border: `1px solid ${isAvailable ? "rgba(76,175,80,0.5)" : "rgba(244,67,54,0.5)"}`,
            }}
          >
            {isAvailable ? "● ว่างใช้งาน" : "● ไม่ว่างใช้งาน"}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <Link
            href={`/equipment?preselect=${equipment.id}`}
            style={{
              padding: "18px 16px",
              background: isAvailable ? "var(--mtc-red)" : "#e9ecef",
              color: isAvailable ? "white" : "#adb5bd",
              borderRadius: 16,
              textAlign: "center",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 15,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              pointerEvents: isAvailable ? "auto" : "none",
              boxShadow: isAvailable ? "var(--shadow-red-sm)" : "none",
            }}
          >
            <span style={{ fontSize: 28 }}>🗓️</span>
            <span>จองอุปกรณ์นี้</span>
          </Link>

          <Link
            href={`/tickets/new?equipmentId=${equipment.id}`}
            style={{
              padding: "18px 16px",
              background: "#FFF3E0",
              color: "#E65100",
              borderRadius: 16,
              textAlign: "center",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 15,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              border: "1.5px solid #FFE0B2",
            }}
          >
            <span style={{ fontSize: 28 }}>🔧</span>
            <span>แจ้งซ่อมทันที</span>
          </Link>
        </div>

        {/* Notes */}
        {equipment.notes && (
          <div className="mtc-card" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 6, textTransform: "uppercase" }}>
              หมายเหตุ
            </p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{equipment.notes}</p>
          </div>
        )}

        {/* Active Bookings */}
        {equipment.Bookings.length > 0 && (
          <div className="mtc-card" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 12, textTransform: "uppercase" }}>
              ตารางการจองที่กำลังใช้งาน
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {equipment.Bookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    padding: "10px 14px",
                    background: "var(--background)",
                    borderRadius: 10,
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 3 }}>{b.Staff?.name ?? "ไม่ระบุ"}</div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                    {new Date(b.borrowDate).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })} —{" "}
                    {new Date(b.returnDate).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Repair Tickets */}
        {equipment.Tickets.length > 0 && (
          <div className="mtc-card">
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 12, textTransform: "uppercase" }}>
              ใบแจ้งซ่อมที่เปิดอยู่
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {equipment.Tickets.map((t) => {
                const p = PRIORITY_COLORS[t.priority] ?? PRIORITY_COLORS.medium;
                return (
                  <Link
                    key={t.id}
                    href={`/tickets/${t.id}`}
                    style={{
                      padding: "10px 14px",
                      background: "var(--background)",
                      borderRadius: 10,
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        🔧 {t.description.slice(0, 40)}{t.description.length > 40 ? "..." : ""}
                      </span>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: p.bg,
                          color: p.color,
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
