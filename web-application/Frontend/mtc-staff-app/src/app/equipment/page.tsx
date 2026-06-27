"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import SignaturePad from "@/components/SignaturePad";
import * as XLSX from "xlsx";

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string | null;
  status: string;
  qrCode: string;
  imageUrl: string | null;
}

interface Booking {
  id: string;
  staffId: string;
  equipmentId: string | null;
  equipmentName: string;
  purpose: string;
  borrowDate: string;
  returnDate: string;
  status: string;
  handoverAt: string | null;
  handoverSignerName: string | null;
  returnAt: string | null;
  returnSignerName: string | null;
  Staff?: { name: string; role: string };
  Equipment?: { name: string; type: string };
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending_handover: { label: "รอส่งมอบ", color: "#E65100", bg: "#FFF3E0" },
  borrowed: { label: "กำลังยืม", color: "#1565C0", bg: "#E3F2FD" },
  returned: { label: "คืนแล้ว", color: "#2E7D32", bg: "#E8F5E9" },
  cancelled: { label: "ยกเลิก", color: "#616161", bg: "#F5F5F5" },
};

const TYPE_ICONS: Record<string, string> = {
  Projector: "📽️",
  Microphone: "🎤",
  Camera: "📷",
  SoundSystem: "🔊",
  Other: "📦",
};

// Mock staff id — ใน production ดึงจาก LINE LIFF profile
const MOCK_STAFF_ID = "staff-1";

export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [tab, setTab] = useState<"catalog" | "mybookings">("catalog");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSignature, setShowSignature] = useState<{ mode: "handover" | "return"; bookingId: string } | null>(null);
  const [availability, setAvailability] = useState<{ available: boolean; reason?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [purpose, setPurpose] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [signerName, setSignerName] = useState("");

  const loadEquipment = useCallback(async () => {
    try {
      const res = await fetch("/api/equipment");
      const data = await res.json();
      if (data.success) setEquipmentList(data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/equipment?staffId=${MOCK_STAFF_ID}`);
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipment();
    loadBookings();
  }, [loadEquipment, loadBookings]);

  const checkAvailability = async () => {
    if (!selectedEquipment || !borrowDate || !returnDate) return;
    setAvailability(null);
    const res = await fetch("/api/bookings/equipment/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipmentId: selectedEquipment.id, borrowDate, returnDate }),
    });
    const data = await res.json();
    setAvailability(data);
  };

  const submitBooking = async () => {
    if (!selectedEquipment || !purpose || !borrowDate || !returnDate) return;
    setFormLoading(true);
    try {
      const res = await fetch("/api/bookings/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: MOCK_STAFF_ID,
          equipmentId: selectedEquipment.id,
          equipmentName: selectedEquipment.name,
          purpose,
          borrowDate,
          returnDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowBookingForm(false);
        setPurpose("");
        setBorrowDate("");
        setReturnDate("");
        setAvailability(null);
        setSelectedEquipment(null);
        loadBookings();
        setTab("mybookings");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignatureSave = async (base64: string) => {
    if (!showSignature || !signerName) return;
    const endpoint =
      showSignature.mode === "handover"
        ? "/api/bookings/equipment/handover"
        : "/api/bookings/equipment/return";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: showSignature.bookingId, signerName, signatureBase64: base64 }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSignature(null);
        setSignerName("");
        loadBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          alert("ไม่พบข้อมูลในไฟล์ Excel");
          setIsImporting(false);
          return;
        }

        const res = await fetch("/api/equipment/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ equipments: json }),
        });
        const result = await res.json();

        if (result.success) {
          alert(result.message);
          loadEquipment(); // Refresh list
        } else {
          alert(`เกิดข้อผิดพลาด: ${result.error}`);
        }
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถอ่านไฟล์ได้");
      setIsImporting(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--background)", paddingBottom: 90 }}>
      {/* Header */}
      <header className="page-header safe-area-top">
        <div className="page-header-inner">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--mtc-red)", letterSpacing: "-0.02em" }}>
              จองอุปกรณ์
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>ระบบจองและติดตามอุปกรณ์</p>
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

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 20px 16px", gap: 8 }}>
        {(["catalog", "mybookings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "9px 20px",
              borderRadius: "var(--radius-full)",
              border: "none",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              background: tab === t ? "var(--mtc-red)" : "var(--surface)",
              color: tab === t ? "white" : "var(--text-secondary)",
              boxShadow: tab === t ? "var(--shadow-red-sm)" : "var(--shadow-sm)",
            }}
          >
            {t === "catalog" ? "📦 คลังอุปกรณ์" : "📋 การจองของฉัน"}
          </button>
        ))}
      </div>

      <main style={{ padding: "0 20px" }}>
        {/* ─── TAB: CATALOG ─── */}
        {tab === "catalog" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>รายการอุปกรณ์ทั้งหมด ({equipmentList.length})</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                style={{
                  background: "white",
                  border: "1.5px solid var(--border)",
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isImporting ? "wait" : "pointer",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                {isImporting ? "กำลังนำเข้า..." : "📥 นำเข้า Excel"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
              />
            </div>

            {equipmentList.length === 0 && (
              <div className="mtc-card" style={{ textAlign: "center", padding: 40, color: "var(--text-tertiary)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <p>ยังไม่มีอุปกรณ์ในระบบ</p>
              </div>
            )}
            {equipmentList.map((eq) => (
              <div
                key={eq.id}
                className="mtc-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                  border: selectedEquipment?.id === eq.id ? "2px solid var(--mtc-red)" : "2px solid transparent",
                  transition: "border 0.2s",
                }}
                onClick={() => setSelectedEquipment(eq)}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "var(--mtc-red-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  {TYPE_ICONS[eq.type] ?? "📦"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{eq.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    {eq.location ?? "ไม่ระบุตำแหน่ง"} · รหัส {eq.qrCode}
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    background: eq.status === "available" ? "#E8F5E9" : "#FFEBEE",
                    color: eq.status === "available" ? "#2E7D32" : "#C62828",
                    flexShrink: 0,
                  }}
                >
                  {eq.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                </span>
              </div>
            ))}

            {selectedEquipment && (
              <button
                onClick={() => setShowBookingForm(true)}
                style={{
                  padding: "15px",
                  background: "var(--mtc-red)",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "var(--shadow-red-sm)",
                  marginTop: 4,
                }}
              >
                🗓️ จองอุปกรณ์ที่เลือก: {selectedEquipment.name}
              </button>
            )}
          </div>
        )}

        {/* ─── TAB: MY BOOKINGS ─── */}
        {tab === "mybookings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {loading && (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-tertiary)" }}>กำลังโหลด...</div>
            )}
            {!loading && bookings.length === 0 && (
              <div className="mtc-card" style={{ textAlign: "center", padding: 40, color: "var(--text-tertiary)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p>ยังไม่มีรายการจอง</p>
              </div>
            )}
            {bookings.map((b) => {
              const s = STATUS_LABELS[b.status] ?? { label: b.status, color: "#333", bg: "#f5f5f5" };
              return (
                <div key={b.id} className="mtc-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                        {b.Equipment?.name ?? b.equipmentName}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
                        วัตถุประสงค์: {b.purpose}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        background: s.bg,
                        color: s.color,
                        flexShrink: 0,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
                    📅 {new Date(b.borrowDate).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })} —{" "}
                    {new Date(b.returnDate).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                  </div>

                  {/* Signature info */}
                  {b.handoverAt && (
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>
                      ✅ รับมอบ: {b.handoverSignerName} — {new Date(b.handoverAt).toLocaleString("th-TH")}
                    </div>
                  )}
                  {b.returnAt && (
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
                      ✅ คืนแล้ว: {b.returnSignerName} — {new Date(b.returnAt).toLocaleString("th-TH")}
                    </div>
                  )}

                  {/* Action buttons */}
                  {b.status === "pending_handover" && (
                    <div>
                      <input
                        placeholder="ชื่อผู้ลงนาม..."
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        className="mtc-input"
                        style={{ fontSize: 13, marginBottom: 8 }}
                      />
                      <button
                        onClick={() => setShowSignature({ mode: "handover", bookingId: b.id })}
                        style={{
                          width: "100%",
                          padding: "11px",
                          background: "#1565C0",
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✍️ ลงลายเซ็นรับมอบอุปกรณ์
                      </button>
                    </div>
                  )}

                  {b.status === "borrowed" && (
                    <div>
                      <input
                        placeholder="ชื่อผู้ลงนามคืน..."
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        className="mtc-input"
                        style={{ fontSize: 13, marginBottom: 8 }}
                      />
                      <button
                        onClick={() => setShowSignature({ mode: "return", bookingId: b.id })}
                        style={{
                          width: "100%",
                          padding: "11px",
                          background: "#2E7D32",
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✍️ ลงลายเซ็นคืนอุปกรณ์
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── BOOKING FORM MODAL ─── */}
      {showBookingForm && selectedEquipment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 500,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "white",
              borderRadius: "24px 24px 0 0",
              padding: "24px 20px 48px",
              maxWidth: 480,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                {TYPE_ICONS[selectedEquipment.type]} จอง {selectedEquipment.name}
              </h2>
              <button onClick={() => setShowBookingForm(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>
                  วัตถุประสงค์การใช้งาน *
                </label>
                <input
                  className="mtc-input"
                  placeholder="เช่น ใช้สำหรับนมัสการวันอาทิตย์"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>
                    วันเริ่มยืม *
                  </label>
                  <input
                    type="datetime-local"
                    className="mtc-input"
                    value={borrowDate}
                    onChange={(e) => { setBorrowDate(e.target.value); setAvailability(null); }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>
                    วันคืน *
                  </label>
                  <input
                    type="datetime-local"
                    className="mtc-input"
                    value={returnDate}
                    onChange={(e) => { setReturnDate(e.target.value); setAvailability(null); }}
                  />
                </div>
              </div>

              {/* Availability check */}
              <button
                onClick={checkAvailability}
                disabled={!borrowDate || !returnDate}
                style={{
                  padding: "10px",
                  border: "1.5px solid var(--mtc-red)",
                  borderRadius: 10,
                  background: "white",
                  color: "var(--mtc-red)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: !borrowDate || !returnDate ? "not-allowed" : "pointer",
                }}
              >
                🔍 ตรวจสอบความพร้อมใช้งาน
              </button>

              {availability && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: availability.available ? "#E8F5E9" : "#FFEBEE",
                    color: availability.available ? "#2E7D32" : "#C62828",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {availability.available ? "✅ อุปกรณ์ว่างใช้งานในช่วงเวลาดังกล่าว" : `❌ ${availability.reason}`}
                </div>
              )}

              <button
                onClick={submitBooking}
                disabled={!availability?.available || formLoading}
                style={{
                  padding: "15px",
                  background: !availability?.available ? "#e9ecef" : "var(--mtc-red)",
                  color: !availability?.available ? "#adb5bd" : "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: !availability?.available ? "not-allowed" : "pointer",
                  boxShadow: !availability?.available ? "none" : "var(--shadow-red-sm)",
                }}
              >
                {formLoading ? "กำลังบันทึก..." : "✅ ยืนยันการจอง"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SIGNATURE PAD ─── */}
      {showSignature && (
        <SignaturePad
          title={showSignature.mode === "handover" ? "✍️ ลงลายเซ็นรับมอบอุปกรณ์" : "✍️ ลงลายเซ็นคืนอุปกรณ์"}
          onSave={handleSignatureSave}
          onCancel={() => setShowSignature(null)}
        />
      )}
    </div>
  );
}
