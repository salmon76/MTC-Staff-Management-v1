"use client";

import React from "react";
import { MonthSchedule, ServiceDuty, DEACONS_LIST } from "@/data/mockScheduleData";

interface ScheduleListViewProps {
  monthData: MonthSchedule;
  onSelectService: (service: ServiceDuty) => void;
  selectedDeaconId?: number | null;
}

export default function ScheduleListView({
  monthData,
  onSelectService,
  selectedDeaconId,
}: ScheduleListViewProps) {
  const getDeaconName = (id: number | string) => {
    const num = typeof id === "string" ? parseInt(id, 10) : id;
    const found = DEACONS_LIST.find((d) => d.id === num);
    return found ? found.name : `มน. ${id}`;
  };

  const isDeaconActive = (duty: ServiceDuty, deaconId: number) => {
    const idStr = deaconId.toString();
    return (
      duty.offeringUpper.includes(deaconId) ||
      duty.offeringLower.includes(deaconId) ||
      duty.servingUpperRoom?.includes(idStr) ||
      duty.servingLowerRoom?.includes(idStr) ||
      duty.servingMainGate?.includes(idStr) ||
      duty.worshipLeader?.includes(idStr)
    );
  };

  if (monthData.services.length === 0) {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px dashed #cbd5e1",
          padding: "48px 24px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
          ยังไม่มีรายการรับใช้ในเดือน{monthData.monthNameTh}
        </div>
        <div style={{ fontSize: "13px" }}>
          เริ่มวางแผนโดยกดปุ่ม &quot;+ เพิ่มรายการ&quot; หรือสลับไปที่มุมมองตามรายชื่อเพื่อคำนวณอัตโนมัติ
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {monthData.services.map((service) => {
        const isDeaconDutyDay = selectedDeaconId ? isDeaconActive(service, selectedDeaconId) : false;

        return (
          <div
            key={service.id}
            onClick={() => onSelectService(service)}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: isDeaconDutyDay ? "2px solid #0284c7" : "1px solid #e2e8f0",
              padding: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            {/* Top Bar: Date & Badges */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    background: "var(--mtc-red)",
                    color: "#ffffff",
                    borderRadius: "10px",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{service.dayDisplay}</span>
                  <span style={{ fontSize: "10px", opacity: 0.9 }}>{monthData.monthShortTh}</span>
                </div>

                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    {new Date(service.dateStr).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--mtc-red)", fontWeight: 700 }}>
                    ข้อพระธรรม: {service.scripture || "ตามสูจิบัตร"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                {service.specialEvent && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "10px",
                      background: service.specialEventType === "communion" ? "#dcfce7" : "#fef3c7",
                      color: service.specialEventType === "communion" ? "#166534" : "#92400e",
                    }}
                  >
                    {service.specialEvent}
                  </span>
                )}
                {isDeaconDutyDay && (
                  <span style={{ fontSize: "10px", background: "#0284c7", color: "#fff", padding: "2px 6px", borderRadius: "6px", fontWeight: 700 }}>
                    มีเวรรับใช้ของคุณ
                  </span>
                )}
              </div>
            </div>

            {/* Sermon Topic */}
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b", marginBottom: "12px", lineHeight: 1.3 }}>
              {service.topic}
            </div>

            {/* Preacher & Worship Leader Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                background: "#f8fafc",
                borderRadius: "10px",
                padding: "10px 12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>ผู้เทศนา</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0369a1" }}>{service.preacher}</div>
                {service.translator && (
                  <div style={{ fontSize: "11px", color: "#475569" }}>แปล: {service.translator}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>ผู้นำนมัสการ</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>{service.worshipLeader}</div>
                {service.worshipTranslator && (
                  <div style={{ fontSize: "11px", color: "#475569" }}>แปลนำ: {service.worshipTranslator}</div>
                )}
              </div>
            </div>

            {/* Deacon Stations Summary */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>ประจำจุด:</span>
              <span style={{ fontSize: "11px", background: "#eff6ff", color: "#1e40af", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>
                ห้องบน: {getDeaconName(service.servingUpperRoom || "—")}
              </span>
              <span style={{ fontSize: "11px", background: "#fdf4ff", color: "#86198f", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>
                ห้องล่าง: {getDeaconName(service.servingLowerRoom || "—")}
              </span>
              <span style={{ fontSize: "11px", background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>
                ประตูใหญ่: {getDeaconName(service.servingMainGate || "—")}
              </span>
            </div>

            {/* Notes if any */}
            {service.unavailableNotes && (
              <div style={{ marginTop: "10px", fontSize: "11px", color: "#b91c1c", fontWeight: 700, background: "#fef2f2", padding: "6px 10px", borderRadius: "8px" }}>
                หมายเหตุ: {service.unavailableNotes}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
