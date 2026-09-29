"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ServiceDuty, DeaconInfo } from "@/data/mockScheduleData";

interface AdminAddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceDuty, monthKey: number, yearCe: number) => void;
  currentYearCe: number;
  currentMonthKey: number;
  deacons: DeaconInfo[];
}

const MONTH_NAMES = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

export default function AdminAddServiceModal({
  isOpen,
  onClose,
  onSave,
  currentYearCe,
  currentMonthKey,
  deacons,
}: AdminAddServiceModalProps) {
  // Helper to compute initial date synchronized in real-time
  const computeInitialDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [dateStr, setDateStr] = useState<string>(computeInitialDate);
  const [yearCe, setYearCe] = useState<number>(() => new Date().getFullYear());
  const [monthKey, setMonthKey] = useState<number>(() => new Date().getMonth() + 1);
  const [dayNumber, setDayNumber] = useState<string>(() => String(new Date().getDate()));
  const [dayOfWeek, setDayOfWeek] = useState<string>(() => THAI_DAYS[new Date().getDay()]);

  const [specialEvent, setSpecialEvent] = useState<string>("");
  const [specialEventType, setSpecialEventType] = useState<
    "normal" | "communion" | "holy-week" | "special-sunday" | "camp"
  >("normal");
  const [topic, setTopic] = useState<string>("");
  const [scripture, setScripture] = useState<string>("");
  const [preacher, setPreacher] = useState<string>("ศจ.บุญนาม");
  const [translator, setTranslator] = useState<string>("");
  const [worshipLeader, setWorshipLeader] = useState<string>("");
  const [worshipTranslator, setWorshipTranslator] = useState<string>("");
  const [servingUpperRoom, setServingUpperRoom] = useState<string>("1");
  const [servingLowerRoom, setServingLowerRoom] = useState<string>("2");
  const [servingMainGate, setServingMainGate] = useState<string>("3");
  const [unavailableNotes, setUnavailableNotes] = useState<string>("");

  // Sync date when opening or year/month changes
  useEffect(() => {
    if (isOpen) {
      const initial = computeInitialDate();
      setDateStr(initial);
      applyDateString(initial);

      // Default worship leader to first deacon if available
      if (deacons.length > 0 && !worshipLeader) {
        setWorshipLeader(deacons[0].name);
      }
      if (deacons.length >= 3) {
        setServingUpperRoom(deacons[0].id.toString());
        setServingLowerRoom(deacons[1].id.toString());
        setServingMainGate(deacons[2].id.toString());
      }
    }
  }, [isOpen, currentYearCe, currentMonthKey]);

  // Handler when calendar date changes
  const applyDateString = (val: string) => {
    if (!val) return;
    const parts = val.split("-").map(Number);
    if (parts.length === 3) {
      const [y, m, d] = parts;
      setYearCe(y);
      setMonthKey(m);
      setDayNumber(String(d));
      const dt = new Date(y, m - 1, d);
      const dayName = THAI_DAYS[dt.getDay()];
      setDayOfWeek(dayName);
    }
  };

  const handleDateChange = (val: string) => {
    setDateStr(val);
    applyDateString(val);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDay = dayNumber.padStart(2, "0");
    const formattedMonth = String(monthKey).padStart(2, "0");
    const finalDateStr = dateStr || `${yearCe}-${formattedMonth}-${formattedDay}`;

    const newService: ServiceDuty = {
      id: `${finalDateStr}-${Date.now()}`,
      dateStr: finalDateStr,
      dayDisplay: dayNumber,
      dayOfWeek,
      specialEvent: specialEvent.trim() || undefined,
      specialEventType: specialEvent.includes("มหาสนิท")
        ? "communion"
        : specialEventType,
      topic: topic.trim() || "นมัสการพระเจ้า",
      scripture: scripture.trim() || "มัทธิว 6.33",
      preacher: preacher.trim(),
      translator: translator.trim(),
      worshipLeader: worshipLeader.trim() || (deacons[0]?.name ?? "มน.ธัญวิชญ์"),
      worshipTranslator: worshipTranslator.trim(),
      offeringUpper: [1, 2, 3, 4, 5, 6, 7, 8],
      offeringLower: [9, 10, 11, 12],
      servingUpperRoom,
      servingLowerRoom,
      servingMainGate,
      unavailableNotes: unavailableNotes.trim() || undefined,
    };

    onSave(newService, monthKey, yearCe);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up"
        style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "92vh",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Admin Roster Planning
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>
              เพิ่มรายการ / วางแผนตาราง
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Calendar Date Picker Section */}
          <div
            style={{
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "14px",
              padding: "14px",
            }}
          >
            <label
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#0f172a",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📅</span>
                <span>เลือกวันที่จัดรอบนมัสการ (Calendar)</span>
              </span>
              <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: 700 }}>
                พ.ศ. {yearCe + 543} (ค.ศ. {yearCe})
              </span>
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr",
                gap: "10px",
                alignItems: "center",
              }}
            >
              {/* Native Calendar Input */}
              <div>
                <input
                  id="service-calendar-input"
                  type="date"
                  value={dateStr}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #0284c7",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0f172a",
                    background: "#ffffff",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(2,132,199,0.12)",
                  }}
                />
              </div>

              {/* Formatted Date Display Badge */}
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  color: "#334155",
                  lineHeight: 1.4,
                }}
              >
                <div style={{ fontWeight: 800, color: "var(--mtc-red)", fontSize: "13px" }}>
                  วัน{dayOfWeek}ที่ {dayNumber}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {MONTH_NAMES[monthKey - 1]} พ.ศ. {yearCe + 543}
                </div>
              </div>
            </div>
          </div>

          {/* Special Event & Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                วันพิเศษ / เทศกาล (ถ้ามี)
              </label>
              <input
                type="text"
                value={specialEvent}
                onChange={(e) => setSpecialEvent(e.target.value)}
                placeholder="เช่น พิธีมหาสนิท, วันแม่แห่งชาติ"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                ประเภทกิจกรรม
              </label>
              <select
                value={specialEventType}
                onChange={(e) => setSpecialEventType(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <option value="normal">รอบปกติ (Normal)</option>
                <option value="communion">พิธีมหาสนิท (Communion)</option>
                <option value="special-sunday">วันพิเศษ (Special Sunday)</option>
                <option value="holy-week">สัปดาห์ศักดิ์สิทธิ์ (Holy Week)</option>
                <option value="camp">ค่าย (Camp)</option>
              </select>
            </div>
          </div>

          {/* Topic & Scripture */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                เรื่อง / ประเด็นหลัก
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="เช่น ความรักของพระเจ้า"
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                ข้อพระธรรม
              </label>
              <input
                type="text"
                value={scripture}
                onChange={(e) => setScripture(e.target.value)}
                placeholder="เช่น 1 ยอห์น 4.7-21"
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          {/* Preacher & Translator */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                นมัสการใหญ่ (ผู้เทศนา)
              </label>
              <input
                type="text"
                value={preacher}
                onChange={(e) => setPreacher(e.target.value)}
                placeholder="เช่น ศจ.บุญนาม, อ.ปวีณา"
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                ผู้แปล (ถ้ามี)
              </label>
              <input
                type="text"
                value={translator}
                onChange={(e) => setTranslator(e.target.value)}
                placeholder="เช่น ดร.วิยะดา"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          {/* Worship Leader & Translator */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                ผู้นำนมัสการ (เลือกจากมัคนายก)
              </label>
              <select
                value={worshipLeader}
                onChange={(e) => setWorshipLeader(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                {deacons.map((d) => (
                  <option key={d.id} value={d.name}>
                    เลข {d.id}: {d.name} ({d.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                แปลนำนมัสการ
              </label>
              <input
                type="text"
                value={worshipTranslator}
                onChange={(e) => setWorshipTranslator(e.target.value)}
                placeholder="เช่น คุณศศิธร, คุณรัชดา"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          {/* Deacon Duty Stations */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
              มัคนายกประจำจุด
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "2px" }}>
                  ห้องบน
                </label>
                <select
                  value={servingUpperRoom}
                  onChange={(e) => setServingUpperRoom(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 6px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <option value="">— เลือก —</option>
                  {deacons.map((d) => (
                    <option key={d.id} value={d.id.toString()}>
                      เลข {d.id}: {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "2px" }}>
                  ห้องล่าง/ชั้น4
                </label>
                <select
                  value={servingLowerRoom}
                  onChange={(e) => setServingLowerRoom(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 6px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <option value="">— เลือก —</option>
                  {deacons.map((d) => (
                    <option key={d.id} value={d.id.toString()}>
                      เลข {d.id}: {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "2px" }}>
                  ประตูใหญ่
                </label>
                <select
                  value={servingMainGate}
                  onChange={(e) => setServingMainGate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 6px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <option value="">— เลือก —</option>
                  {deacons.map((d) => (
                    <option key={d.id} value={d.id.toString()}>
                      เลข {d.id}: {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Unavailable Notes */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
              หมายเหตุ / ผู้ที่ไม่สะดวก
            </label>
            <input
              type="text"
              value={unavailableNotes}
              onChange={(e) => setUnavailableNotes(e.target.value)}
              placeholder="เช่น เลข 5, 15 ไม่สะดวก หรือ ลา มน."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "12px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 22px",
                borderRadius: "8px",
                border: "none",
                background: "#16a34a",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
              }}
            >
              + บันทึกลงตาราง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
