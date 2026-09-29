"use client";

import React from "react";
import { MonthSchedule, MOCK_YEAR_SCHEDULES } from "@/data/mockScheduleData";

interface ScheduleYearViewProps {
  onSelectMonth: (monthKey: number) => void;
  currentYearBe: number;
  schedules?: MonthSchedule[];
}

const ALL_MONTHS = [
  { key: 1, name: "มกราคม", short: "ม.ค." },
  { key: 2, name: "กุมภาพันธ์", short: "ก.พ." },
  { key: 3, name: "มีนาคม", short: "มี.ค." },
  { key: 4, name: "เมษายน", short: "เม.ย." },
  { key: 5, name: "พฤษภาคม", short: "พ.ค." },
  { key: 6, name: "มิถุนายน", short: "มิ.ย." },
  { key: 7, name: "กรกฎาคม", short: "ก.ค." },
  { key: 8, name: "สิงหาคม", short: "ส.ค." },
  { key: 9, name: "กันยายน", short: "ก.ย." },
  { key: 10, name: "ตุลาคม", short: "ต.ค." },
  { key: 11, name: "พฤศจิกายน", short: "พ.ย." },
  { key: 12, name: "ธันวาคม", short: "ธ.ค." },
];

export default function ScheduleYearView({
  onSelectMonth,
  currentYearBe,
  schedules,
}: ScheduleYearViewProps) {
  const activeSchedules = schedules || MOCK_YEAR_SCHEDULES;

  // Aggregate yearly stats
  const totalServices = activeSchedules.reduce((acc, m) => acc + m.services.length, 0);
  const totalCommunions = activeSchedules.reduce(
    (acc, m) => acc + m.services.filter((s) => s.specialEventType === "communion").length,
    0
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Yearly Summary Stats Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
          color: "#ffffff",
          borderRadius: "16px",
          padding: "20px 24px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
        }}
      >
        <div>
          <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            Yearly Overview {currentYearBe} (พ.ศ.)
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>
            ภาพรวมตารางรับใช้และพันธกิจประจำปี {currentYearBe}
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
            คริสตจักรไมตรีจิต 1837 — คณะมัคนายกและทีมศิษยาภิบาล
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "10px 16px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#38bdf8" }}>{totalServices}</div>
            <div style={{ fontSize: "11px", color: "#cbd5e1" }}>รอบนมัสการ</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "10px 16px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#4ade80" }}>{totalCommunions}</div>
            <div style={{ fontSize: "11px", color: "#cbd5e1" }}>พิธีมหาสนิท</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "10px 16px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#facc15" }}>15</div>
            <div style={{ fontSize: "11px", color: "#cbd5e1" }}>มัคนายก</div>
          </div>
        </div>
      </div>

      {/* 12 Months Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {ALL_MONTHS.map((m) => {
          const monthSchedule = activeSchedules.find((sch) => sch.monthKey === m.key);
          const hasData = !!monthSchedule && monthSchedule.services.length > 0;
          const serviceCount = monthSchedule?.services.length || 0;
          const specialEvents = monthSchedule?.services.filter((s) => !!s.specialEvent) || [];

          return (
            <div
              key={m.key}
              onClick={() => onSelectMonth(m.key)}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                border: hasData ? "1.5px solid #e2e8f0" : "1px dashed #cbd5e1",
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: hasData ? "0 4px 14px rgba(0,0,0,0.04)" : "none",
                opacity: hasData ? 1 : 0.75,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "180px",
              }}
            >
              <div>
                {/* Month Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        background: hasData ? "var(--mtc-red)" : "#94a3b8",
                        color: "#fff",
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 800,
                      }}
                    >
                      {m.key}
                    </span>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                      {m.name}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "10px",
                      background: hasData ? "#f0fdf4" : "#f1f5f9",
                      color: hasData ? "#166534" : "#64748b",
                    }}
                  >
                    {hasData ? `${serviceCount} สัปดาห์` : "แผนสำรอง"}
                  </span>
                </div>

                {/* Pastoral Theme / Highlights */}
                {monthSchedule?.themeBanner && (
                  <div style={{ fontSize: "11px", color: "#0369a1", fontWeight: 600, marginBottom: "8px" }}>
                    ทีมศิษยาภิบาล: {monthSchedule.themeBanner}
                  </div>
                )}

                {/* Special Events List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {specialEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: event.specialEventType === "communion" ? "#dcfce7" : "#fef3c7",
                        color: event.specialEventType === "communion" ? "#166534" : "#92400e",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {event.dayDisplay}: {event.specialEvent}
                    </div>
                  ))}
                  {specialEvents.length > 3 && (
                    <div style={{ fontSize: "10px", color: "#64748b", textAlign: "right" }}>
                      +{specialEvents.length - 3} รายการเพิ่มเติม
                    </div>
                  )}
                </div>
              </div>

              {/* Action Jump */}
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "8px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--mtc-red)",
                }}
              >
                <span>เปิดดูตารางเดือนนี้</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
