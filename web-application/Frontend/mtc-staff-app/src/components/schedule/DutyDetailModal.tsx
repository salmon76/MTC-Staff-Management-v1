"use client";

import React, { useState } from "react";
import { ServiceDuty, DEACONS_LIST } from "@/data/mockScheduleData";

interface DutyDetailModalProps {
  service: ServiceDuty | null;
  onClose: () => void;
  onSwapRequest?: (service: ServiceDuty, reason: string) => void;
}

export default function DutyDetailModal({
  service,
  onClose,
  onSwapRequest,
}: DutyDetailModalProps) {
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapReason, setSwapReason] = useState("");
  const [swapSuccess, setSwapSuccess] = useState(false);

  if (!service) return null;

  const getDeaconName = (id: number | string) => {
    const num = typeof id === "string" ? parseInt(id, 10) : id;
    const found = DEACONS_LIST.find((d) => d.id === num);
    return found ? `${found.name} (${found.department})` : `มน. เบอร์ ${id}`;
  };

  const handleConfirmSwap = () => {
    if (!swapReason.trim()) {
      alert("กรุณาระบุเหตุผลการขอสลับเวร");
      return;
    }
    if (onSwapRequest) {
      onSwapRequest(service, swapReason);
    }
    setSwapSuccess(true);
    setTimeout(() => {
      setSwapSuccess(false);
      setIsSwapping(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in-scale"
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          padding: "24px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "12px",
                  background: service.specialEvent ? "#fef3c7" : "#f1f5f9",
                  color: service.specialEvent ? "#b45309" : "#475569",
                }}
              >
                {service.specialEvent || "วันนมัสการประจำสัปดาห์"}
              </span>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                {new Date(service.dateStr).toLocaleDateString("th-TH", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
              {service.topic || "นมัสการพระเจ้าวันอาทิตย์"}
            </h2>
            <div style={{ fontSize: 14, color: "var(--mtc-red)", fontWeight: 700, marginTop: 2 }}>
              ข้อพระธรรม: {service.scripture || "ตามสูจิบัตร"}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>

        {swapSuccess ? (
          <div style={{ padding: "30px 20px", textAlign: "center", background: "#f0fdf4", borderRadius: "16px", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#166534", marginBottom: 6 }}>
              ส่งคำขอสลับเวรเรียบร้อยแล้ว
            </h3>
            <p style={{ fontSize: 13, color: "#15803d" }}>
              ระบบส่งการแจ้งเตือนไปยังกลุ่มมัคนายกและหัวหน้าฝ่ายผ่าน LINE แล้ว
            </p>
          </div>
        ) : isSwapping ? (
          /* Swap Request Form */
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
              ขอสลับเวรรับใช้ (Swap Duty Request)
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
              กรุณาระบุเหตุผลที่ไม่สามารถมาปฏิบัติหน้าที่ในวันที่กำหนดได้:
            </p>
            <textarea
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              placeholder="เช่น ติดภารกิจต่างจังหวัด, ไม่สบาย, ติดอบรมพันธกิจ..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: 14,
                marginBottom: 16,
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsSwapping(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmSwap}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: "var(--mtc-red)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(198,40,40,0.3)",
                }}
              >
                ยืนยันขอสลับเวร
              </button>
            </div>
          </div>
        ) : (
          /* Service Duties Details */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Leadership Box */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>ผู้เทศนา (นมัสการใหญ่)</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{service.preacher || "—"}</div>
                {service.translator && (
                  <div style={{ fontSize: 12, color: "#475569" }}>ผู้แปล: {service.translator}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>ผู้นำนมัสการ</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{service.worshipLeader || "—"}</div>
                {service.worshipTranslator && (
                  <div style={{ fontSize: 12, color: "#475569" }}>แปลนำ: {service.worshipTranslator}</div>
                )}
              </div>
            </div>

            {/* Serving Stations */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px" }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                มัคนายกประจำจุดนมัสการ & รับใช้
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
                <div style={{ background: "#eff6ff", padding: "10px", borderRadius: "10px", border: "1px solid #dbeafe" }}>
                  <div style={{ fontSize: 11, color: "#1e40af", fontWeight: 600 }}>ห้องบน</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1e3a8a", marginTop: 2 }}>
                    {getDeaconName(service.servingUpperRoom || "—")}
                  </div>
                </div>
                <div style={{ background: "#fdf4ff", padding: "10px", borderRadius: "10px", border: "1px solid #fae8ff" }}>
                  <div style={{ fontSize: 11, color: "#86198f", fontWeight: 600 }}>ห้องล่าง/ชั้น4</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#701a75", marginTop: 2 }}>
                    {getDeaconName(service.servingLowerRoom || "—")}
                  </div>
                </div>
                <div style={{ background: "#f0fdf4", padding: "10px", borderRadius: "10px", border: "1px solid #dcfce7" }}>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: 600 }}>ประตูใหญ่</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#14532d", marginTop: 2 }}>
                    {getDeaconName(service.servingMainGate || "—")}
                  </div>
                </div>
              </div>
            </div>

            {/* Offering Teams */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px" }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                มัคนายกถือกองถวาย
              </h4>
              
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  กองถวายห้องบน (Upper Sanctuary)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {service.offeringUpper.map((id, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "4px 8px",
                        background: "#f1f5f9",
                        borderRadius: "8px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      {getDeaconName(id)}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  กองถวายห้องล่าง (Lower Sanctuary)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {service.offeringLower.map((id, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "4px 8px",
                        background: "#fff7ed",
                        borderRadius: "8px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#c2410c",
                        border: "1px solid #ffedd5",
                      }}
                    >
                      {getDeaconName(id)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            {service.unavailableNotes && (
              <div style={{ background: "#fff1f2", padding: "12px 16px", borderRadius: "12px", border: "1px solid #ffe4e6" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#be123c" }}>หมายเหตุ / ข้อจำกัด: </span>
                <span style={{ fontSize: 13, color: "#9f1239" }}>{service.unavailableNotes}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setIsSwapping(true)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                ขอสลับเวร (Swap)
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  background: "var(--mtc-red)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(198,40,40,0.3)",
                }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
