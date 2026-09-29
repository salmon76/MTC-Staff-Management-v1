"use client";

import React from "react";
import { MonthSchedule, ServiceDuty } from "@/data/mockScheduleData";

interface ScheduleMonthCalendarViewProps {
  monthData: MonthSchedule;
  onSelectService: (service: ServiceDuty) => void;
  selectedDeaconId?: number | null;
}

export default function ScheduleMonthCalendarView({
  monthData,
  onSelectService,
  selectedDeaconId,
}: ScheduleMonthCalendarViewProps) {
  const daysInMonth = new Date(monthData.yearCe, monthData.monthKey, 0).getDate();
  const firstDayIndex = new Date(monthData.yearCe, monthData.monthKey - 1, 1).getDay(); // 0 is Sunday

  // Map services by day number for fast lookup
  const serviceByDayMap: Record<number, ServiceDuty[]> = {};
  monthData.services.forEach((s) => {
    const d = new Date(s.dateStr).getDate();
    if (!serviceByDayMap[d]) serviceByDayMap[d] = [];
    serviceByDayMap[d].push(s);
  });

  const dayHeaders = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  return (
    <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      {/* Calendar Header Day Names */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "8px", textAlign: "center" }}>
        {dayHeaders.map((day, idx) => (
          <div
            key={day}
            style={{
              padding: "8px 4px",
              fontSize: "13px",
              fontWeight: 800,
              color: idx === 0 ? "var(--mtc-red)" : "#64748b",
              background: idx === 0 ? "#fef2f2" : "#f8fafc",
              borderRadius: "8px",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Cells Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
        {/* Leading Empty Slots */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              minHeight: "85px",
              background: "#fafafa",
              borderRadius: "10px",
              opacity: 0.4,
              border: "1px dashed #e2e8f0",
            }}
          />
        ))}

        {/* Days of Month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayDate = new Date(monthData.yearCe, monthData.monthKey - 1, dayNum);
          const isSunday = dayDate.getDay() === 0;
          const services = serviceByDayMap[dayNum] || [];
          const hasService = services.length > 0;

          const today = new Date();
          const isToday =
            today.getFullYear() === monthData.yearCe &&
            today.getMonth() + 1 === monthData.monthKey &&
            today.getDate() === dayNum;

          const isDeaconDutyDay = selectedDeaconId
            ? services.some(
                (s) =>
                  s.offeringUpper.includes(selectedDeaconId) ||
                  s.offeringLower.includes(selectedDeaconId) ||
                  s.servingUpperRoom?.includes(selectedDeaconId.toString()) ||
                  s.servingLowerRoom?.includes(selectedDeaconId.toString()) ||
                  s.servingMainGate?.includes(selectedDeaconId.toString())
              )
            : false;

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => {
                if (hasService) onSelectService(services[0]);
              }}
              style={{
                minHeight: "100px",
                padding: "6px",
                borderRadius: "12px",
                border: isToday
                  ? "2px solid #0284c7"
                  : isDeaconDutyDay
                  ? "2px solid #0284c7"
                  : hasService
                  ? "1.5px solid #cbd5e1"
                  : "1px solid #f1f5f9",
                background: isToday
                  ? "#eff6ff"
                  : isDeaconDutyDay
                  ? "#f0f9ff"
                  : hasService
                  ? isSunday
                    ? "#ffffff"
                    : "#f8fafc"
                  : "#ffffff",
                cursor: hasService ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.15s ease",
                boxShadow: isToday
                  ? "0 4px 12px rgba(2,132,199,0.15)"
                  : hasService
                  ? "0 2px 8px rgba(0,0,0,0.03)"
                  : "none",
              }}
            >
              {/* Day Number & Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: isToday ? 900 : isSunday ? 800 : 600,
                    color: isToday ? "#ffffff" : isSunday ? "var(--mtc-red)" : "#334155",
                    background: isToday ? "#0284c7" : isSunday ? "#fee2e2" : "transparent",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                  }}
                >
                  {dayNum}
                </span>

                <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                  {isToday && (
                    <span style={{ fontSize: "10px", background: "#0284c7", color: "#fff", padding: "1px 6px", borderRadius: "6px", fontWeight: 800 }}>
                      วันนี้
                    </span>
                  )}
                  {isDeaconDutyDay && (
                    <span style={{ fontSize: "10px", background: "#0284c7", color: "#fff", padding: "1px 5px", borderRadius: "6px", fontWeight: 700 }}>
                      เวรคุณ
                    </span>
                  )}
                </div>
              </div>

              {/* Service Details inside Day Cell */}
              {hasService && (
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "4px" }}>
                  {services.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        fontSize: "11px",
                        lineHeight: 1.2,
                        padding: "4px",
                        borderRadius: "6px",
                        background:
                          s.specialEventType === "communion"
                            ? "#dcfce7"
                            : s.specialEvent
                            ? "#fef3c7"
                            : "#f1f5f9",
                        border:
                          s.specialEventType === "communion"
                            ? "1px solid #86efac"
                            : s.specialEvent
                            ? "1px solid #fde047"
                            : "1px solid #e2e8f0",
                      }}
                    >
                      {s.specialEvent && (
                        <div style={{ fontWeight: 800, color: "#92400e", marginBottom: "1px" }}>
                          {s.specialEvent}
                        </div>
                      )}
                      <div style={{ fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        ผู้เทศนา: {s.preacher}
                      </div>
                      <div style={{ color: "#475569", fontSize: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        ผู้นำ: {s.worshipLeader}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty placeholder for non-service days */}
              {!hasService && <div style={{ flex: 1 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
