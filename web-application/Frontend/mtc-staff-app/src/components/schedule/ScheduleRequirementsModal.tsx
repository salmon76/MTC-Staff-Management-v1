"use client";

import React from "react";

interface ScheduleRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleRequirementsModal({
  isOpen,
  onClose,
}: ScheduleRequirementsModalProps) {
  if (!isOpen) return null;

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
          maxWidth: "680px",
          maxHeight: "90vh",
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
                color: "#38bdf8",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Requirements & Scheduling Engine Rules
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>
              เงื่อนไขและกฎ 4 ข้อในการจัดตารางรับใช้
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
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            fontSize: "13px",
            color: "#334155",
            lineHeight: 1.6,
          }}
        >
          {/* 4 Core Rules */}
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              กฎและเงื่อนไขการคำนวณ (4 Conditional Arrangement Rules)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #0284c7" }}>
                <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>
                  1. Main Logic 1: วันพิเศษตรงฝ่าย (Department Mapping)
                </div>
                <div>
                  กำหนดให้มัคนายกประจำฝ่ายเป็นผู้นำนมัสการในวันสำคัญประจำปีของฝ่ายตนเอง เช่น วันอนุชนมอบหมายมัคนายกฝ่ายอนุชน, วันสตรีมอบหมายมัคนายกฝ่ายสตรี
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #16a34a" }}>
                <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>
                  2. Main Logic 2: ลำดับความสำคัญของสถานที่ (Location Priority Order)
                </div>
                <div>
                  จัดสรรความสำคัญของสถานที่: <strong>Priority 1</strong> (โบสถ์บน/ล่าง) ➔ <strong>Priority 2</strong> (ประตูทางเข้าใหญ่) ➔ <strong>Priority 3</strong> (ห้องอนุชน ทิโมธี)
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #d97706" }}>
                <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>
                  3. Main Logic 3: โควตาการรับใช้ (Quota Rule)
                </div>
                <div>
                  จำกัดความถี่ในการรับใช้<strong>ไม่เกิน 2 สัปดาห์ต่อเดือนต่อท่าน</strong> เพื่อป้องกันภาระงานที่หนักเกินไปและกระจายการมีส่วนร่วมให้ทั่วถึง
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #dc2626" }}>
                <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>
                  4. Minor Logic: หลีกเลี่ยงตารางชนและวันลา (Conflict Prevention)
                </div>
                <div>
                  ตรวจสอบวันลาที่ได้รับอนุมัติในระบบ และป้องกันการจัดเวรซ้ำซ้อนในวันเดียวกัน หรือมัคนายกที่ระบุว่าไม่สะดวก
                </div>
              </div>
            </div>
          </div>

          {/* Department Mapping Table */}
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              ตารางจับคู่วันสำคัญกับฝ่าย (Special Day Mapping Matrix)
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", border: "1px solid #e2e8f0" }}>วันสำคัญ / อีเวนต์</th>
                    <th style={{ padding: "8px 12px", border: "1px solid #e2e8f0" }}>ฝ่ายที่รับผิดชอบ</th>
                    <th style={{ padding: "8px 12px", border: "1px solid #e2e8f0" }}>บทบาทหลัก</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { event: "วันปีใหม่", dept: "ฝ่ายประธาน", role: "มน.ประธาน นำนมัสการ" },
                    { event: "วันถวายบุตร / วันรวี", dept: "ฝ่ายคริสเตียนศึกษา", role: "มน.คริสเตียนศึกษา นำนมัสการ" },
                    { event: "วันสตรี", dept: "ฝ่ายสตรี", role: "มน.สตรี นำนมัสการ" },
                    { event: "วันอนุชน / ค่ายเยาวชน", dept: "ฝ่ายอนุชน/เยาวชน", role: "มน.อนุชน นำนมัสการ" },
                    { event: "วันดนตรีและนมัสการ", dept: "ฝ่ายดนตรี", role: "มน.ดนตรี นำนมัสการ" },
                    { event: "วันคริสตจักรบริการ / สังคมสงเคราะห์", dept: "ฝ่ายสงเคราะห์", role: "มน.สงเคราะห์ นำนมัสการ" },
                    { event: "วันต้อนรับ / ครอบครัวไมตรีจิต", dept: "ฝ่ายต้อนรับ & ปฏิคม", role: "มน.ต้อนรับ ประจำจุด" },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <td style={{ padding: "8px 12px", border: "1px solid #e2e8f0", fontWeight: 700 }}>{row.event}</td>
                      <td style={{ padding: "8px 12px", border: "1px solid #e2e8f0", color: "#0284c7", fontWeight: 600 }}>{row.dept}</td>
                      <td style={{ padding: "8px 12px", border: "1px solid #e2e8f0" }}>{row.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4-Stage Reminders */}
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              ระบบการแจ้งเตือนอัตโนมัติ 4 ระยะ (Timeline Reminders)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div style={{ background: "#f0f9ff", padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                <span style={{ fontWeight: 800, color: "#0284c7" }}>T-14 วัน (2 สัปดาห์ก่อน): </span>
                <span>ส่งข้อความเตือนให้จัดสรรเวลาและเตรียมจิตใจ</span>
              </div>
              <div style={{ background: "#fefce8", padding: "10px", borderRadius: "8px", border: "1px solid #fef08a" }}>
                <span style={{ fontWeight: 800, color: "#ca8a04" }}>T-7 วัน (1 สัปดาห์ก่อน): </span>
                <span>ส่งข้อความเตือนให้ส่งหัวข้อและข้อมูลจัดทำสูจิบัตร</span>
              </div>
              <div style={{ background: "#f0fdf4", padding: "10px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <span style={{ fontWeight: 800, color: "#16a34a" }}>T-1 วัน (1 วันก่อนหน้า): </span>
                <span>ส่งข้อความเตือนนัดหมายพร้อมกันเวลา 08:30 น.</span>
              </div>
              <div style={{ background: "#faf5ff", padding: "10px", borderRadius: "8px", border: "1px solid #e9d5ff" }}>
                <span style={{ fontWeight: 800, color: "#7e22ce" }}>T+0 (คืนวันอาทิตย์): </span>
                <span>ส่งข้อความขอบคุณและขอพระเจ้าเสริมกำลัง</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
            background: "#f8fafc",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            เข้าใจแล้ว / ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
