"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import {
  DEACONS_LIST,
  MonthSchedule,
  ServiceDuty,
  DeaconInfo,
  getScheduleDataByYear,
  saveScheduleDataByYear,
  resetScheduleDataByYear,
  resetScheduleToZero,
  getStoredDeaconsList,
  saveStoredDeaconsList,
} from "@/data/mockScheduleData";

import ScheduleAsIsTableView from "@/components/schedule/ScheduleAsIsTableView";
import ScheduleMonthCalendarView from "@/components/schedule/ScheduleMonthCalendarView";
import ScheduleYearView from "@/components/schedule/ScheduleYearView";
import ScheduleListView from "@/components/schedule/ScheduleListView";
import DutyDetailModal from "@/components/schedule/DutyDetailModal";
import AdminAddServiceModal from "@/components/schedule/AdminAddServiceModal";
import ScheduleRequirementsModal from "@/components/schedule/ScheduleRequirementsModal";
import ManageDeaconsModal from "@/components/schedule/ManageDeaconsModal";

type ScheduleViewMode = "calendar" | "asis-matrix" | "yearly" | "list";

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("calendar");
  // Real-time current date initialization
  const [selectedYearCe, setSelectedYearCe] = useState<number>(() => new Date().getFullYear());
  const [yearSchedules, setYearSchedules] = useState<MonthSchedule[]>([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedDeaconId, setSelectedDeaconId] = useState<number | null>(null);
  const [activeDetailService, setActiveDetailService] = useState<ServiceDuty | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isManageDeaconsOpen, setIsManageDeaconsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deacons, setDeacons] = useState<DeaconInfo[]>(DEACONS_LIST);

  // Initialize deacons from storage on client
  useEffect(() => {
    const stored = getStoredDeaconsList();
    if (stored && stored.length > 0) {
      setDeacons(stored);
    }
  }, []);

  // Load schedule data when year changes
  useEffect(() => {
    const data = getScheduleDataByYear(selectedYearCe);
    setYearSchedules(data);
    if (data.length > 0) {
      // Set to first available month if current not found
      const hasCurrentMonth = data.some((m) => m.monthKey === selectedMonthKey);
      if (!hasCurrentMonth) {
        setSelectedMonthKey(data[0].monthKey);
      }
    }
  }, [selectedYearCe]);

  // Fetch mock staff from Supabase / API
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const res = await fetch("/api/staff");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((s: any, idx: number) => ({
            id: idx + 1,
            name: s.name.split(" ")[0] || s.name,
            department: s.deaconDepartment || s.department || "มัคนายก",
            role: s.role || "มัคนายก",
          }));
          setDeacons(mapped);
        }
      } catch (err) {
        console.warn("Using local fallback for deacons:", err);
      }
    }
    loadSupabaseData();
  }, []);

  // Save updated deacons list
  const handleSaveDeacons = (updatedDeacons: DeaconInfo[]) => {
    setDeacons(updatedDeacons);
    saveStoredDeaconsList(updatedDeacons);
    showToast(`บันทึกข้อมูลเลขประจำตัวมัคนายก (${updatedDeacons.length} ท่าน) สำเร็จแล้ว`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find active month schedule or fallback
  const currentMonthData: MonthSchedule =
    yearSchedules.find((m) => m.monthKey === selectedMonthKey) ||
    yearSchedules[0] || {
      monthKey: selectedMonthKey,
      monthNameTh: "เมษายน",
      monthShortTh: "เม.ย.",
      yearBe: selectedYearCe + 543,
      yearCe: selectedYearCe,
      services: [],
    };

  const handlePrevMonth = () => {
    const currentIndex = yearSchedules.findIndex((m) => m.monthKey === selectedMonthKey);
    if (currentIndex > 0) {
      setSelectedMonthKey(yearSchedules[currentIndex - 1].monthKey);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = yearSchedules.findIndex((m) => m.monthKey === selectedMonthKey);
    if (currentIndex < yearSchedules.length - 1) {
      setSelectedMonthKey(yearSchedules[currentIndex + 1].monthKey);
    }
  };

  // Admin: Save new or edited service duty
  const handleSaveNewService = (newService: ServiceDuty, targetMonthKey: number, targetYearCe: number) => {
    let updatedSchedules = getScheduleDataByYear(targetYearCe);

    const monthIndex = updatedSchedules.findIndex((m) => m.monthKey === targetMonthKey);

    if (monthIndex >= 0) {
      const monthObj = { ...updatedSchedules[monthIndex] };
      // Replace existing service if same date, or append
      const existingServiceIdx = monthObj.services.findIndex(
        (s) => s.dateStr === newService.dateStr || s.dayDisplay === newService.dayDisplay
      );

      if (existingServiceIdx >= 0) {
        monthObj.services[existingServiceIdx] = newService;
      } else {
        monthObj.services.push(newService);
        // Sort services by date/day
        monthObj.services.sort((a, b) => {
          const dayA = parseInt(a.dayDisplay.replace(/\D/g, ""), 10) || 0;
          const dayB = parseInt(b.dayDisplay.replace(/\D/g, ""), 10) || 0;
          return dayA - dayB;
        });
      }

      updatedSchedules[monthIndex] = monthObj;
    } else {
      // Create new month schedule entry
      const monthNames = [
        "", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
      ];
      const monthShorts = [
        "", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
      ];

      const newMonthSchedule: MonthSchedule = {
        monthKey: targetMonthKey,
        monthNameTh: monthNames[targetMonthKey] || `เดือน ${targetMonthKey}`,
        monthShortTh: monthShorts[targetMonthKey] || `ด.${targetMonthKey}`,
        yearBe: targetYearCe + 543,
        yearCe: targetYearCe,
        services: [newService],
      };
      updatedSchedules.push(newMonthSchedule);
      updatedSchedules.sort((a, b) => a.monthKey - b.monthKey);
    }

    saveScheduleDataByYear(targetYearCe, updatedSchedules);

    if (targetYearCe === selectedYearCe) {
      setYearSchedules(updatedSchedules);
      setSelectedMonthKey(targetMonthKey);
    } else {
      setSelectedYearCe(targetYearCe);
      setSelectedMonthKey(targetMonthKey);
    }

    showToast(`เพิ่มรอบรับใช้ วันที่ ${newService.dayDisplay} ลงตาราง พ.ศ. ${targetYearCe + 543} เรียบร้อยแล้ว`);
  };

  // Admin: Reset schedule data completely down to 0
  const handleConfirmResetToZero = () => {
    const resetData = resetScheduleToZero(selectedYearCe);
    setYearSchedules(resetData);
    if (resetData.length > 0) {
      setSelectedMonthKey(resetData[0].monthKey);
    }
    setIsResetConfirmOpen(false);
    showToast("Reset ข้อมูลตารางรับใช้ทั้งหมดเริ่มต้นจาก 0 เรียบร้อยแล้ว");
  };

  const handleSwapRequest = (service: ServiceDuty, reason: string) => {
    showToast(`ส่งคำขอสลับเวรวันที่ ${service.dayDisplay} ${currentMonthData.monthShortTh} เรียบร้อยแล้ว`);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--background)",
        paddingBottom: "calc(var(--nav-height) + 32px)",
      }}
    >
      {/* App Header */}
      <header
        className="safe-area-top"
        style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          color: "#ffffff",
          padding: "16px 20px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Top Row: Title, Year Switcher & Admin Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link
                href="/dashboard"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
                aria-label="Back to Dashboard"
              >
                ←
              </Link>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
                    Maitrichit Church 1837
                  </span>
                  {/* Discrete Requirements Help Button */}
                  <button
                    onClick={() => setIsRequirementsOpen(true)}
                    title="เงื่อนไขและข้อกำหนดในการจัดตารางรับใช้ (4 Rules Requirement)"
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "1px solid rgba(56, 189, 248, 0.5)",
                      background: "rgba(56, 189, 248, 0.15)",
                      color: "#38bdf8",
                      fontSize: "11px",
                      fontWeight: 800,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ?
                  </button>
                </div>
                <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  ตารางรับใช้ปรนนิบัติ (Serving Roster)
                </h1>
              </div>
            </div>

            {/* Admin Tool Bar: Year Selector, Add Service & Reset */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {/* Year Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.12)", padding: "4px 8px", borderRadius: "8px" }}>
                <span style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 700 }}>ปี:</span>
                <select
                  value={selectedYearCe}
                  onChange={(e) => setSelectedYearCe(Number(e.target.value))}
                  style={{
                    background: "transparent",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value={2026} style={{ color: "#0f172a" }}>พ.ศ. 2569 (2026)</option>
                  <option value={2027} style={{ color: "#0f172a" }}>พ.ศ. 2570 (2027) [ปีถัดไป]</option>
                </select>
              </div>

              {/* Admin Add Service Button */}
              <button
                onClick={() => setIsAdminModalOpen(true)}
                style={{
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
                }}
              >
                + เพิ่มรายการ
              </button>

              {/* Manage Deacons Button */}
              <button
                id="manage-deacons-toolbar-btn"
                onClick={() => setIsManageDeaconsOpen(true)}
                title="จัดการเลขประจำตัวและรายชื่อมัคนายก"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
              >
                <span>👤</span>
                <span>จัดการเลข มน.</span>
              </button>

              {/* Reset Button */}
              <button
                id="reset-schedule-btn"
                onClick={() => setIsResetConfirmOpen(true)}
                title="Reset ข้อมูลตารางรับใช้ทั้งหมดเริ่มต้นจาก 0"
                style={{
                  background: "rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239,68,68,0.4)",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Reset
              </button>

              {/* Clear Filter Button */}
              {selectedDeaconId && (
                <button
                  onClick={() => setSelectedDeaconId(null)}
                  style={{
                    background: "#0284c7",
                    color: "#fff",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ✕ ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>

          {/* View Mode Switcher (4 Clean Modes) */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              background: "rgba(255,255,255,0.1)",
              padding: "4px",
              borderRadius: "12px",
              overflowX: "auto",
            }}
          >
            {[
              { mode: "calendar" as const, label: "ปฏิทินรายเดือน" },
              { mode: "asis-matrix" as const, label: "มุมมองตามรายชื่อ" },
              { mode: "yearly" as const, label: "ภาพรวมรายปี" },
              { mode: "list" as const, label: "ลิสต์รายการ" },
            ].map((tab) => (
              <button
                key={tab.mode}
                onClick={() => setViewMode(tab.mode)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: viewMode === tab.mode ? "var(--mtc-red)" : "transparent",
                  color: viewMode === tab.mode ? "#ffffff" : "#cbd5e1",
                  transition: "all 0.2s ease",
                  boxShadow: viewMode === tab.mode ? "0 2px 8px rgba(198,40,40,0.4)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Toast Notification */}
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "16px",
        }}
      >
        {/* Controls Bar: Month Selector & Deacon Filter (Hidden in Yearly view) */}
        {viewMode !== "yearly" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
              background: "#ffffff",
              padding: "12px 16px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            {/* Month Navigator */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={handlePrevMonth}
                disabled={yearSchedules.findIndex((m) => m.monthKey === selectedMonthKey) <= 0}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#334155",
                  fontWeight: 700,
                  opacity: yearSchedules.findIndex((m) => m.monthKey === selectedMonthKey) <= 0 ? 0.4 : 1,
                }}
              >
                ‹
              </button>

              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(Number(e.target.value))}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                {yearSchedules.map((m) => (
                  <option key={m.monthKey} value={m.monthKey}>
                    {m.monthNameTh} พ.ศ. {m.yearBe}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextMonth}
                disabled={
                  yearSchedules.findIndex((m) => m.monthKey === selectedMonthKey) >=
                  yearSchedules.length - 1
                }
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#334155",
                  fontWeight: 700,
                  opacity:
                    yearSchedules.findIndex((m) => m.monthKey === selectedMonthKey) >=
                    yearSchedules.length - 1
                      ? 0.4
                      : 1,
                }}
              >
                ›
              </button>
            </div>

            {/* Deacon Filter Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                กรองตามชื่อมัคนายก:
              </span>
              <select
                value={selectedDeaconId || ""}
                onChange={(e) => setSelectedDeaconId(e.target.value ? Number(e.target.value) : null)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: selectedDeaconId ? "2px solid #0284c7" : "1px solid #cbd5e1",
                  background: selectedDeaconId ? "#f0f9ff" : "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: selectedDeaconId ? "#0369a1" : "#334155",
                  cursor: "pointer",
                }}
              >
                <option value="">ทั้งหมด ({deacons.length} ท่าน - Supabase)</option>
                {deacons.map((d) => (
                  <option key={d.id} value={d.id}>
                    เบอร์ {d.id}: {d.name} ({d.department})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* View Mode Content Render */}
        <div className="animate-fade-in">
          {viewMode === "calendar" && (
            <ScheduleMonthCalendarView
              monthData={currentMonthData}
              onSelectService={(service) => setActiveDetailService(service)}
              selectedDeaconId={selectedDeaconId}
            />
          )}

          {viewMode === "asis-matrix" && (
            <ScheduleAsIsTableView
              monthData={currentMonthData}
              onSelectService={(service) => setActiveDetailService(service)}
              selectedDeaconId={selectedDeaconId}
              deacons={deacons}
              onOpenManageDeacons={() => setIsManageDeaconsOpen(true)}
              onUpdateServices={(newServices) => {
                const updated = [...yearSchedules];
                const mIdx = updated.findIndex((m) => m.monthKey === selectedMonthKey);
                if (mIdx >= 0) {
                  updated[mIdx] = { ...updated[mIdx], services: newServices };
                  setYearSchedules(updated);
                  saveScheduleDataByYear(selectedYearCe, updated);
                }
              }}
            />
          )}

          {viewMode === "yearly" && (
            <ScheduleYearView
              currentYearBe={currentMonthData.yearBe}
              schedules={yearSchedules}
              onSelectMonth={(monthKey) => {
                setSelectedMonthKey(monthKey);
                setViewMode("calendar");
              }}
            />
          )}

          {viewMode === "list" && (
            <ScheduleListView
              monthData={currentMonthData}
              onSelectService={(service) => setActiveDetailService(service)}
              selectedDeaconId={selectedDeaconId}
            />
          )}
        </div>
      </main>

      {/* Duty Detail & Swap Modal */}
      <DutyDetailModal
        service={activeDetailService}
        onClose={() => setActiveDetailService(null)}
        onSwapRequest={handleSwapRequest}
      />

      {/* Admin Add/Edit Service Modal */}
      <AdminAddServiceModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSave={handleSaveNewService}
        currentYearCe={selectedYearCe}
        currentMonthKey={selectedMonthKey}
        deacons={deacons}
      />

      {/* Requirements & 4 Rules Info Modal */}
      <ScheduleRequirementsModal
        isOpen={isRequirementsOpen}
        onClose={() => setIsRequirementsOpen(false)}
      />

      {/* Manage Deacon Numbers & Information Modal */}
      <ManageDeaconsModal
        isOpen={isManageDeaconsOpen}
        onClose={() => setIsManageDeaconsOpen(false)}
        deacons={deacons}
        onSaveDeacons={handleSaveDeacons}
      />

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setIsResetConfirmOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                fontSize: "22px",
                fontWeight: 900,
              }}
            >
              !
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "8px",
              }}
            >
              ยืนยันการ Reset ข้อมูลทั้งหมด
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              คุณต้องการ Reset ข้อมูลตารางรับใช้ทั้งหมดเริ่มต้นจาก 0 ใช่หรือไม่?
              ข้อมูลรอบการรับใช้ทั้งหมดของทุกเดือนจะถูกล้างว่าง เพื่อให้คุณสามารถเริ่มวางแผนและกำหนดรอบรับใช้ใหม่ได้จากศูนย์
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                id="cancel-reset-btn"
                onClick={() => setIsResetConfirmOpen(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                ยกเลิก
              </button>
              <button
                id="confirm-reset-zero-btn"
                onClick={handleConfirmResetToZero}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
                }}
              >
                ยืนยัน Reset เป็น 0
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile App */}
      <BottomNav />
    </div>
  );
}
