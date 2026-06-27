"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string | null;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "🟢 ต่ำ — ซ่อมได้ภายใน 7 วัน" },
  { value: "medium", label: "🟠 ปกติ — ซ่อมได้ภายใน 3 วัน" },
  { value: "high", label: "🔴 ด่วน — ซ่อมภายใน 24 ชั่วโมง" },
  { value: "critical", label: "🚨 ด่วนที่สุด — ซ่อมภายใน 4 ชั่วโมง" },
];

const TYPE_ICONS: Record<string, string> = {
  Projector: "📽️",
  Microphone: "🎤",
  Camera: "📷",
  SoundSystem: "🔊",
  Other: "📦",
};

// Mock staff id
const MOCK_STAFF_ID = "staff-1";

function NewTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetEquipmentId = searchParams.get("equipmentId");

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(presetEquipmentId ?? "");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [pictureBeforePreview, setPictureBeforePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ ticketId: string; slaDeadline: string; slaHours: number } | null>(null);

  useEffect(() => {
    fetch("/api/equipment")
      .then((r) => r.json())
      .then((d) => { if (d.success) setEquipmentList(d.data); })
      .catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPictureBeforePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedEquipmentId || !description) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: selectedEquipmentId,
          reporterId: MOCK_STAFF_ID,
          description,
          priority,
          pictureBefore: pictureBeforePreview,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted({
          ticketId: data.data.id,
          slaDeadline: data.meta.slaDeadline,
          slaHours: data.meta.slaHours,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--background)", gap: 16, textAlign: "center" }}>
        <div style={{ fontSize: 60 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>ส่งใบแจ้งซ่อมแล้ว!</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          กำหนดปิดงานภายใน <strong>{submitted.slaHours} ชั่วโมง</strong>
        </p>
        <p style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
          SLA Deadline: {new Date(submitted.slaDeadline).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button
            onClick={() => router.push(`/tickets/${submitted.ticketId}`)}
            style={{ padding: "14px", background: "var(--mtc-red)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-red-sm)" }}
          >
            ดูรายละเอียดใบแจ้งซ่อม
          </button>
          <button
            onClick={() => router.push("/tickets")}
            style={{ padding: "14px", background: "white", border: "1.5px solid var(--border)", color: "var(--text-secondary)", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            กลับสู่รายการงานซ่อม
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--background)", paddingBottom: 40 }}>
      {/* Header */}
      <header className="page-header safe-area-top">
        <div className="page-header-inner">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--mtc-red)", letterSpacing: "-0.02em" }}>
              แจ้งซ่อมอุปกรณ์
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>กรอกรายละเอียดเพื่อเปิดใบแจ้งซ่อม</p>
          </div>
          <button
            onClick={() => router.back()}
            style={{ background: "none", border: "1.5px solid var(--border)", padding: "8px 16px", borderRadius: "var(--radius-full)", fontSize: 13, cursor: "pointer", color: "var(--text-secondary)", fontWeight: 600 }}
          >
            ยกเลิก
          </button>
        </div>
      </header>

      <main style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Select Equipment */}
          <div className="mtc-card">
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 10, textTransform: "uppercase" }}>
              อุปกรณ์ที่เสีย *
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {equipmentList.map((eq) => (
                <button
                  key={eq.id}
                  onClick={() => setSelectedEquipmentId(eq.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    borderRadius: 12,
                    border: `2px solid ${selectedEquipmentId === eq.id ? "var(--mtc-red)" : "var(--border-light)"}`,
                    background: selectedEquipmentId === eq.id ? "var(--mtc-red-bg)" : "var(--surface)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{TYPE_ICONS[eq.type] ?? "📦"}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: selectedEquipmentId === eq.id ? "var(--mtc-red)" : "var(--text-primary)" }}>
                      {eq.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{eq.location ?? "ไม่ระบุตำแหน่ง"}</div>
                  </div>
                </button>
              ))}
              {equipmentList.length === 0 && (
                <p style={{ color: "var(--text-tertiary)", fontSize: 13, textAlign: "center", padding: 20 }}>ยังไม่มีอุปกรณ์ในระบบ</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mtc-card">
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>
              รายละเอียดอาการเสีย *
            </label>
            <textarea
              className="mtc-input"
              rows={4}
              placeholder="อธิบายอาการที่พบ เช่น 'ไม่มีเสียงออก', 'แบตหมดเร็ว', 'ไฟล์เปิดไม่ได้'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "vertical", minHeight: 100 }}
            />
          </div>

          {/* Priority */}
          <div className="mtc-card">
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 10, textTransform: "uppercase" }}>
              ระดับความสำคัญ *
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  style={{
                    padding: "11px 16px",
                    borderRadius: 10,
                    border: `2px solid ${priority === opt.value ? "var(--mtc-red)" : "var(--border-light)"}`,
                    background: priority === opt.value ? "var(--mtc-red-bg)" : "var(--surface)",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: priority === opt.value ? 700 : 500,
                    color: priority === opt.value ? "var(--mtc-red)" : "var(--text-primary)",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Before Photo (Optional) */}
          <div className="mtc-card">
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>
              ภาพก่อนซ่อม (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}
            />
            {pictureBeforePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pictureBeforePreview}
                alt="ตัวอย่างก่อนซ่อม"
                style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }}
              />
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!selectedEquipmentId || !description || loading}
            style={{
              padding: "16px",
              background: !selectedEquipmentId || !description ? "#e9ecef" : "var(--mtc-red)",
              color: !selectedEquipmentId || !description ? "#adb5bd" : "white",
              border: "none",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              cursor: !selectedEquipmentId || !description ? "not-allowed" : "pointer",
              boxShadow: !selectedEquipmentId || !description ? "none" : "var(--shadow-red-sm)",
            }}
          >
            {loading ? "กำลังส่งใบแจ้งซ่อม..." : "🔧 ส่งใบแจ้งซ่อม"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>กำลังโหลด...</div>}>
      <NewTicketForm />
    </Suspense>
  );
}
