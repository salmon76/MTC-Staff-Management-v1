"use client";

import React, { useState } from "react";
import { DEACONS_LIST } from "@/data/mockScheduleData";

interface SwapRequestItem {
  id: string;
  requesterName: string;
  requesterDepartment: string;
  dateStr: string;
  dayDisplay: string;
  dutyRole: string;
  reason: string;
  status: "pending" | "approved" | "completed";
  substituteName?: string;
  createdAt: string;
}

const INITIAL_SWAP_REQUESTS: SwapRequestItem[] = [
  {
    id: "swap-1",
    requesterName: "มน.ธนากร",
    requesterDepartment: "งานอนุชน",
    dateStr: "2026-08-16",
    dayDisplay: "16 ส.ค. 2569",
    dutyRole: "ผู้นำนมัสการ (วันอนุชน)",
    reason: "ติดภารกิจเทศนาค่ายเยาวชนต่างจังหวัด",
    status: "approved",
    substituteName: "มน.สมศักดิ์ (งานสงเคราะห์)",
    createdAt: "10 ส.ค. 2569",
  },
  {
    id: "swap-2",
    requesterName: "มน.ชูเกียรติ",
    requesterDepartment: "งานยานพาหนะ",
    dateStr: "2026-07-12",
    dayDisplay: "12 ก.ค. 2569",
    dutyRole: "มน.ประจำจุด ห้องล่าง/ชั้น4",
    reason: "ติดขับรถรับส่งวิทยากรต่างประเทศ",
    status: "pending",
    createdAt: "5 ก.ค. 2569",
  },
  {
    id: "swap-3",
    requesterName: "มน.วรกร",
    requesterDepartment: "งานโสตทัศนูปกรณ์",
    dateStr: "2026-06-28",
    dayDisplay: "28 มิ.ย. 2569",
    dutyRole: "มน.ถือกองถวายล่าง ตำแหน่งที่ 2",
    reason: "ติดเวรควบคุมระบบถ่ายทอดสดงานครบรอบคริสตจักร",
    status: "pending",
    createdAt: "20 มิ.ย. 2569",
  },
];

export default function ScheduleWorkflowView() {
  const [swapRequests, setSwapRequests] = useState<SwapRequestItem[]>(INITIAL_SWAP_REQUESTS);
  const [selectedSubstitutes, setSelectedSubstitutes] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApproveSwap = (id: string) => {
    const chosenSubstitute = selectedSubstitutes[id] || "มน.วชิรวรรณ (รองประธาน)";
    setSwapRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "approved",
              substituteName: chosenSubstitute,
            }
          : req
      )
    );
    showToast(`อนุมัติให้ ${chosenSubstitute} ปฏิบัติหน้าที่แทนเรียบร้อยแล้ว`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast */}
      {toastMessage && (
        <div
          className="animate-fade-in-up"
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#166534",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "30px",
            fontSize: "13px",
            fontWeight: 700,
            zIndex: 100,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* 1. Header Banner */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "20px 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ fontSize: "12px", color: "var(--mtc-red)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "4px" }}>
          Ministry Serving Lifecycle
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
          กระบวนการจัดตาราง สลับเวร และการแจ้งเตือนอัตโนมัติ
        </h2>
        <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
          ระบบบริหารจัดการตารางผู้รับใช้คริสตจักรไมตรีจิต รองรับการคำนวณตามกฎ 4 ข้อ การตอบรับผ่านระบบ และการจัดหาผู้รับใช้ทดแทนอัตโนมัติ
        </p>
      </div>

      {/* 2. Step-by-Step Lifecycle Flow */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
          ขั้นตอนการทำงานของระบบ (Workflow Stages)
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              step: "ขั้นตอนที่ 1",
              title: "จัดตารางอัตโนมัติ",
              desc: "ระบบประมวลผลตารางรายปีตามกฎ 4 ข้อ (วันพิเศษฝ่าย, ลำดับสถานที่, โควตาไม่เกิน 2 ครั้ง/เดือน, หลีกเลี่ยงตารางชน)",
              badge: "จัดสรรอัตโนมัติ",
              badgeBg: "#eff6ff",
              badgeColor: "#1d4ed8",
            },
            {
              step: "ขั้นตอนที่ 2",
              title: "ส่งตาราง & ยืนยัน",
              desc: "ส่งตารางไปยังมัคนายกและทีมศิษยาภิบาลผ่าน LINE LIFF เพื่อให้ผู้รับใช้กดยืนยันหรือแจ้งขอสลับเวรล่วงหน้า",
              badge: "ยืนยันผ่านระบบ",
              badgeBg: "#f0fdf4",
              badgeColor: "#15803d",
            },
            {
              step: "ขั้นตอนที่ 3",
              title: "จัดหาผู้รับใช้แทน",
              desc: "เมื่อมีคำขอสลับเวร ระบบค้นหามัคนายกที่ว่างในวันดังกล่าวและส่งคำเชิญให้ผู้รับใช้แทนกดยืนยัน",
              badge: "จับคู่อัตโนมัติ",
              badgeBg: "#fef3c7",
              badgeColor: "#b45309",
            },
            {
              step: "ขั้นตอนที่ 4",
              title: "แจ้งเตือน 4 ระยะ",
              desc: "ส่งการแจ้งเตือนเตรียมตัว (2 สัปดาห์, 1 สัปดาห์, 1 วันก่อนหน้า, และคืนหลังเสร็จงาน) พร้อมอัปเดตข้อมูลลงสูจิบัตร",
              badge: "แจ้งเตือนอัตโนมัติ",
              badgeBg: "#faf5ff",
              badgeColor: "#7e22ce",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>{item.step}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "6px",
                      background: item.badgeBg,
                      color: item.badgeColor,
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Active Swap & Substitute Management */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
              รายการคำขอสลับเวร (Swap & Substitute Requests)
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b" }}>
              จัดการคำขอเปลี่ยนเวรและจัดหาผู้รับใช้ทดแทนประจำสัปดาห์
            </p>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "20px",
              background: "#fff7ed",
              color: "#c2410c",
              border: "1px solid #ffedd5",
            }}
          >
            รอดำเนินการ {swapRequests.filter((r) => r.status === "pending").length} รายการ
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {swapRequests.map((req) => {
            const isPending = req.status === "pending";

            return (
              <div
                key={req.id}
                style={{
                  border: isPending ? "1.5px solid #fed7aa" : "1px solid #e2e8f0",
                  background: isPending ? "#fffaf5" : "#f8fafc",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                        {req.requesterName} ({req.requesterDepartment})
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: isPending ? "#fed7aa" : "#dcfce7",
                          color: isPending ? "#9a3412" : "#166534",
                        }}
                      >
                        {isPending ? "รอจัดหาผู้แทน" : "อนุมัติผู้แทนแล้ว"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--mtc-red)", fontWeight: 700, marginTop: "2px" }}>
                      วันที่: {req.dayDisplay} — ตำแหน่ง: {req.dutyRole}
                    </div>
                  </div>

                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    ยื่นคำขอเมื่อ: {req.createdAt}
                  </span>
                </div>

                <div style={{ fontSize: "12px", background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#334155" }}>
                  <span style={{ fontWeight: 700, color: "#475569" }}>เหตุผล: </span>
                  {req.reason}
                </div>

                {isPending ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", paddingTop: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "220px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>เลือกผู้รับใช้แทน:</span>
                      <select
                        value={selectedSubstitutes[req.id] || ""}
                        onChange={(e) =>
                          setSelectedSubstitutes((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        <option value="">-- เลือกมัคนายกที่ว่าง --</option>
                        {DEACONS_LIST.slice(1, 8).map((d) => (
                          <option key={d.id} value={`${d.name} (${d.department})`}>
                            {d.name} ({d.department})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleApproveSwap(req.id)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: "var(--mtc-red)",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      อนุมัติผู้รับใช้แทน
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: "#166534", fontWeight: 700, background: "#f0fdf4", padding: "6px 10px", borderRadius: "8px" }}>
                    ผู้ปฏิบัติหน้าที่แทน: {req.substituteName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Automated Reminder Timeline */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
          ไทม์ไลน์การแจ้งเตือนอัตโนมัติ 4 ระยะ (Automated Reminder Timeline)
        </h3>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
          ส่งข้อความผ่านระบบแจ้งเตือนตามระยะเวลาที่กำหนด เพื่อให้การดำเนินพันธกิจเป็นไปอย่างราบรื่น
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          {[
            {
              timing: "2 สัปดาห์ก่อนหน้า (T-14)",
              label: "แจ้งเตือนเตรียมตัว",
              msg: "ขอแจ้งตารางรับใช้ล่วงหน้าเพื่อให้ท่านได้จัดสรรเวลาและเตรียมจิตใจในการปรนนิบัติ",
              color: "#0284c7",
              bg: "#f0f9ff",
            },
            {
              timing: "1 สัปดาห์ก่อนหน้า (T-7)",
              label: "แจ้งส่งข้อมูลสูจิบัตร",
              msg: "กรุณาส่งหัวข้อ ข้อพระธรรม หรือข้อมูลผู้ร่วมนำนมัสการให้ทีมธุรการจัดทำสูจิบัตร",
              color: "#ca8a04",
              bg: "#fefce8",
            },
            {
              timing: "1 วันก่อนหน้า (T-1)",
              label: "แจ้งยืนยันรอบพรุ่งนี้",
              msg: "พรุ่งนี้เราร่วมรับใช้ด้วยกันในพระนิเวศ นัดหมายพร้อมกันเวลา 08:30 น.",
              color: "#16a34a",
              bg: "#f0fdf4",
            },
            {
              timing: "คืนวันอาทิตย์ (T+0)",
              label: "ข้อความขอบคุณ",
              msg: "ขอพระเจ้าเสริมกำลังและอวยพระพรสำหรับการปรนนิบัติรับใช้ในวันนี้",
              color: "#7c3aed",
              bg: "#faf5ff",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: item.bg,
                border: `1px solid ${item.color}30`,
                borderRadius: "12px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 800, color: item.color }}>
                {item.timing}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.4 }}>
                &ldquo;{item.msg}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Core 4 Rules Reference */}
      <div
        style={{
          background: "#f8fafc",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "20px",
        }}
      >
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>
          เกณฑ์และกฎ 4 ข้อในการจัดตาราง (Scheduling Engine Rules)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
          <div style={{ background: "#ffffff", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontWeight: 800, color: "var(--mtc-red)" }}>กฎข้อที่ 1 (วันพิเศษตรงฝ่าย): </span>
            <span style={{ color: "#475569" }}>กำหนดให้มัคนายกประจำฝ่ายเป็นผู้นำนมัสการในวันสำคัญประจำปีของฝ่ายตนเอง (เช่น วันอนุชน, วันสตรี, วันคริสเตียนศึกษา)</span>
          </div>
          <div style={{ background: "#ffffff", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontWeight: 800, color: "var(--mtc-red)" }}>กฎข้อที่ 2 (ลำดับสถานที่): </span>
            <span style={{ color: "#475569" }}>จัดสรรความสำคัญสถานที่: โบสถ์บน/ล่าง (Priority 1) ➔ ประตูทางเข้า (Priority 2) ➔ ห้องทิโมธี (Priority 3)</span>
          </div>
          <div style={{ background: "#ffffff", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontWeight: 800, color: "var(--mtc-red)" }}>กฎข้อที่ 3 (โควตาความถี่): </span>
            <span style={{ color: "#475569" }}>จำกัดการรับใช้ไม่เกิน 2 สัปดาห์ต่อเดือนต่อท่าน เพื่อป้องกันภาระงานที่หนักเกินไป</span>
          </div>
          <div style={{ background: "#ffffff", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontWeight: 800, color: "var(--mtc-red)" }}>กฎข้อที่ 4 (ป้องกันตารางชน): </span>
            <span style={{ color: "#475569" }}>ตรวจสอบวันลาที่ได้รับอนุมัติ และป้องกันการจัดเวรซ้ำซ้อนในวันเดียวกัน</span>
          </div>
        </div>
      </div>
    </div>
  );
}
