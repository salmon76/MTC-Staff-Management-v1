"use client";

import React, { useState } from "react";
import { MonthSchedule, ServiceDuty, DeaconInfo, DEACONS_LIST } from "@/data/mockScheduleData";

interface ScheduleAsIsTableViewProps {
  monthData: MonthSchedule;
  onSelectService: (service: ServiceDuty) => void;
  selectedDeaconId?: number | null;
  onUpdateServices?: (services: ServiceDuty[]) => void;
  deacons?: DeaconInfo[];
  onOpenManageDeacons?: () => void;
}

interface RowValidationResult {
  hasError: boolean;
  hasWarning: boolean;
  errors: string[];
  warnings: string[];
  duplicateDeaconIds: number[];
  unavailableConflictIds: number[];
  invalidDeaconIds: number[];
}

const SPECIAL_DAY_DEPARTMENT_MAPPING: Record<string, string> = {
  "วันปีใหม่": "ประธาน",
  "วันถวายบุตร": "คริสเตียนศึกษา",
  "วันสตรี": "งานสตรี",
  "วันอนุชน": "งานอนุชน",
  "วันดนตรี": "งานดนตรี",
  "วันดนตรีและนมัสการ": "งานดนตรี",
  "วันสงเคราะห์": "งานสงเคราะห์",
  "วันระลึกผู้สูงอายุ": "งานสงเคราะห์",
  "วันมิชชั่น": "มิชชั่น ศาลาธรรม",
  "วันต้อนรับ": "งานต้อนรับ",
};

export default function ScheduleAsIsTableView({
  monthData,
  onSelectService,
  selectedDeaconId,
  onUpdateServices,
  deacons = DEACONS_LIST,
  onOpenManageDeacons,
}: ScheduleAsIsTableViewProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editedServices, setEditedServices] = useState<ServiceDuty[]>(monthData.services);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [validationErrorsSummary, setValidationErrorsSummary] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);

  // Synchronize when monthData changes
  React.useEffect(() => {
    setEditedServices(monthData.services);
  }, [monthData]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const isDeaconActive = (duty: ServiceDuty, deaconId: number) => {
    const idStr = deaconId.toString();
    return (
      duty.offeringUpper.includes(deaconId) ||
      duty.offeringLower.includes(deaconId) ||
      duty.servingUpperRoom === idStr ||
      duty.servingLowerRoom === idStr ||
      duty.servingMainGate === idStr ||
      duty.worshipLeader?.includes(idStr)
    );
  };

  // Validation function for a single service row
  const validateRow = (service: ServiceDuty): RowValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const duplicateDeaconIds: number[] = [];
    const unavailableConflictIds: number[] = [];
    const invalidDeaconIds: number[] = [];

    const validDeaconIds = new Set(deacons.map((d) => d.id));

    // 1. Check Date / Day Display
    if (!service.dayDisplay || service.dayDisplay.trim() === "") {
      errors.push("ช่องวันที่ต้องไม่ว่างเปล่า");
    }

    // 2. Parse unavailable deacon IDs
    const unavailableSet = new Set<number>();
    if (service.unavailableNotes) {
      const parts = service.unavailableNotes.split(/[,、\s]+/);
      parts.forEach((p) => {
        const num = parseInt(p.replace(/\D/g, ""), 10);
        if (!isNaN(num) && num > 0) {
          unavailableSet.add(num);
        }
      });
    }

    // 3. Collect assigned deacon IDs
    const assignedDeacons: { id: number; location: string }[] = [];

    // Offering Upper
    service.offeringUpper.forEach((num, idx) => {
      if (num > 0) {
        if (!validDeaconIds.has(num)) {
          invalidDeaconIds.push(num);
          errors.push(`เลข มน. ${num} ในถือกองถวายบนช่องที่ ${idx + 1} ไม่มีในระบบ`);
        }
        assignedDeacons.push({ id: num, location: `ถือกองถวายบน (${idx + 1})` });
      }
    });

    // Offering Lower
    service.offeringLower.forEach((num, idx) => {
      if (num > 0) {
        if (!validDeaconIds.has(num)) {
          invalidDeaconIds.push(num);
          errors.push(`เลข มน. ${num} ในถือกองถวายล่างช่องที่ ${idx + 1} ไม่มีในระบบ`);
        }
        assignedDeacons.push({ id: num, location: `ถือกองถวายล่าง (${idx + 1})` });
      }
    });

    // Stations
    const checkStation = (val: string | undefined, loc: string) => {
      if (val && val.trim() !== "" && val !== "—") {
        const num = parseInt(val.trim(), 10);
        if (!isNaN(num) && num > 0) {
          if (!validDeaconIds.has(num)) {
            invalidDeaconIds.push(num);
            errors.push(`เลข มน. ${num} ที่ ${loc} ไม่มีในระบบ`);
          }
          assignedDeacons.push({ id: num, location: loc });
        }
      }
    };

    checkStation(service.servingUpperRoom, "ห้องบน");
    checkStation(service.servingLowerRoom, "ห้องล่าง");
    checkStation(service.servingMainGate, "ประตูใหญ่");

    // 4. Duplicate checks
    const countMap: Record<number, string[]> = {};
    assignedDeacons.forEach((item) => {
      if (!countMap[item.id]) {
        countMap[item.id] = [];
      }
      countMap[item.id].push(item.location);
    });

    Object.entries(countMap).forEach(([idStr, locations]) => {
      const idNum = Number(idStr);
      if (locations.length > 1) {
        duplicateDeaconIds.push(idNum);
        errors.push(`มัคนายกหมายเลข ${idNum} ถูกจัดซ้ำในวันเดียวกัน: ${locations.join(", ")}`);
      }
    });

    // 5. Unavailable conflicts
    assignedDeacons.forEach((item) => {
      if (unavailableSet.has(item.id)) {
        if (!unavailableConflictIds.includes(item.id)) {
          unavailableConflictIds.push(item.id);
          warnings.push(`มัคนายกหมายเลข ${item.id} ติดหมายเหตุว่าไม่ได้ แต่ได้รับมอบหมายที่ ${item.location}`);
        }
      }
    });

    return {
      hasError: errors.length > 0,
      hasWarning: warnings.length > 0,
      errors,
      warnings,
      duplicateDeaconIds,
      unavailableConflictIds,
      invalidDeaconIds,
    };
  };

  // Inline edit handler for top-level fields
  const handleCellChange = (index: number, field: keyof ServiceDuty, value: any) => {
    setEditedServices((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Offering array change handler
  const handleOfferingChange = (
    rowIndex: number,
    arrayField: "offeringUpper" | "offeringLower",
    posIndex: number,
    rawValue: string
  ) => {
    setEditedServices((prev) => {
      const copy = [...prev];
      const targetRow = { ...copy[rowIndex] };
      const arr = [...targetRow[arrayField]];
      const cleanNum = parseInt(rawValue.replace(/\D/g, ""), 10);
      arr[posIndex] = isNaN(cleanNum) ? 0 : cleanNum;
      targetRow[arrayField] = arr;
      copy[rowIndex] = targetRow;
      return copy;
    });
  };

  // Add new empty service row
  const handleAddRow = () => {
    const nextDay = editedServices.length > 0 
      ? Math.max(...editedServices.map(s => parseInt(s.dayDisplay.replace(/\D/g, ""), 10) || 0)) + 7 
      : 1;
    const dayStr = nextDay <= 31 ? String(nextDay) : "1";
    const dateFormatted = `${monthData.yearCe}-${String(monthData.monthKey).padStart(2, "0")}-${dayStr.padStart(2, "0")}`;

    const newRow: ServiceDuty = {
      id: `manual-service-${Date.now()}`,
      dateStr: dateFormatted,
      dayDisplay: dayStr,
      dayOfWeek: "อาทิตย์",
      topic: "นมัสการวันพระเจ้า",
      scripture: "",
      preacher: "ศจ.บุญนาม",
      translator: "",
      worshipLeader: deacons[0]?.name || "มน.ธัญวิชญ์",
      worshipTranslator: "",
      offeringUpper: [0, 0, 0, 0, 0, 0, 0, 0],
      offeringLower: [0, 0, 0, 0],
      servingUpperRoom: "",
      servingLowerRoom: "",
      servingMainGate: "",
      unavailableNotes: "",
    };

    setEditedServices((prev) => [...prev, newRow]);
    showToast("เพิ่มแถวการรับใช้ใหม่เรียบร้อยแล้ว");
  };

  // Delete service row
  const handleDeleteRow = (index: number) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบแถววันที่ ${editedServices[index].dayDisplay}?`)) {
      setEditedServices((prev) => prev.filter((_, i) => i !== index));
      showToast("ลบแถวเรียบร้อยแล้ว");
    }
  };

  // Save manual edits with full validation check
  const handleSaveEdits = () => {
    const allErrors: string[] = [];
    editedServices.forEach((service, idx) => {
      const validation = validateRow(service);
      if (validation.hasError) {
        validation.errors.forEach((err) => {
          allErrors.push(`[แถววันที่ ${service.dayDisplay || idx + 1}]: ${err}`);
        });
      }
    });

    if (allErrors.length > 0) {
      setValidationErrorsSummary(allErrors);
      setShowValidationModal(true);
      return;
    }

    if (onUpdateServices) {
      onUpdateServices(editedServices);
    }
    setIsEditMode(false);
    showToast("บันทึกการแก้ไขตารางและตรวจสอบข้อมูลถูกต้องเรียบร้อยแล้ว");
  };

  const handleCancelEdits = () => {
    setEditedServices(monthData.services);
    setIsEditMode(false);
    showToast("ยกเลิกการแก้ไข");
  };

  // Auto-calculate schedule based on the 4 Conditional Arrangement Rules
  const handleAutoSchedule = () => {
    const deaconsList = deacons && deacons.length > 0 ? [...deacons] : [...DEACONS_LIST];
    const deaconServingCount: Record<number, number> = {};
    deaconsList.forEach((d) => (deaconServingCount[d.id] = 0));

    const computed = editedServices.map((service) => {
      const assignedToday = new Set<number>();
      const unavailable = (service.unavailableNotes || "")
        .split(",")
        .map((s) => parseInt(s.trim().replace(/\D/g, ""), 10))
        .filter((n) => !isNaN(n));

      unavailable.forEach((n) => assignedToday.add(n));

      // Rule 1: Special Day Department Mapping for Worship Leader
      let worshipLeaderName = service.worshipLeader;
      const matchedDept = Object.entries(SPECIAL_DAY_DEPARTMENT_MAPPING).find(([key]) =>
        service.specialEvent?.includes(key)
      );

      if (matchedDept) {
        const targetDept = matchedDept[1];
        const matchedDeacon = deaconsList.find(
          (d) => d.department.includes(targetDept) && !assignedToday.has(d.id) && deaconServingCount[d.id] < 2
        );
        if (matchedDeacon) {
          worshipLeaderName = `${matchedDeacon.name}`;
          assignedToday.add(matchedDeacon.id);
          deaconServingCount[matchedDeacon.id] = (deaconServingCount[matchedDeacon.id] || 0) + 1;
        }
      }

      // Rule 2 & 3: Location Priority (Upper Room = P1, Lower Room = P1, Main Gate = P2) + Max 2 weeks/month quota
      const pickDeaconForStation = (preferredDeptKeywords: string[] = []): string => {
        let candidate = deaconsList.find(
          (d) =>
            !assignedToday.has(d.id) &&
            deaconServingCount[d.id] < 2 &&
            preferredDeptKeywords.some((k) => d.department.includes(k))
        );

        if (!candidate) {
          candidate = deaconsList.find(
            (d) => !assignedToday.has(d.id) && deaconServingCount[d.id] < 2
          );
        }

        if (!candidate) {
          candidate = deaconsList.find((d) => !assignedToday.has(d.id)) || deaconsList[0];
        }

        assignedToday.add(candidate.id);
        deaconServingCount[candidate.id] = (deaconServingCount[candidate.id] || 0) + 1;
        return candidate.id.toString();
      };

      const servingUpper = pickDeaconForStation(["พิธีการ", "ประธาน", "รองประธาน"]);
      const servingLower = pickDeaconForStation(["อาคารสถานที่", "เยาวชน", "โสต"]);
      const servingGate = pickDeaconForStation(["ต้อนรับ", "ปฏิคม", "ประชาสัมพันธ์"]);

      return {
        ...service,
        worshipLeader: worshipLeaderName,
        servingUpperRoom: servingUpper,
        servingLowerRoom: servingLower,
        servingMainGate: servingGate,
      };
    });

    setEditedServices(computed);
    if (onUpdateServices) {
      onUpdateServices(computed);
    }
    showToast("คำนวณและจัดเวรรับใช้อัตโนมัติตามกฎ 4 ข้อสำเร็จแล้ว");
  };

  const activeServicesList = isEditMode ? editedServices : monthData.services;

  return (
    <div style={{ width: "100%", borderRadius: "14px", border: "1px solid #cbd5e1", background: "#ffffff", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
      {/* Toast */}
      {toastMsg && (
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
          {toastMsg}
        </div>
      )}

      {/* Validation Error Modal */}
      {showValidationModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
              borderTop: "6px solid #ef4444",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#991b1b", margin: 0 }}>
                พบข้อมูลไม่ถูกต้องก่อนบันทึก
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}>
              กรุณาแก้ไขข้อผิดพลาดในตารางด้านล่างนี้ก่อนทำการบันทึกข้อมูล:
            </p>
            <div
              style={{
                maxHeight: "260px",
                overflowY: "auto",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "20px",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#b91c1c", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {validationErrorsSummary.map((err, i) => (
                  <li key={i} style={{ lineHeight: "1.4" }}>{err}</li>
                ))}
              </ul>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowValidationModal(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                กลับไปแก้ไขในตาราง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner with Actions */}
      <div
        style={{
          background: isEditMode ? "#f0fdf4" : "#e2e8f0",
          borderBottom: isEditMode ? "2px solid #86efac" : "1px solid #94a3b8",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#1e293b",
          transition: "background-color 0.2s ease",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ background: isEditMode ? "#16a34a" : "#0284c7", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "12px" }}>
            {monthData.monthNameTh} {monthData.yearBe}
          </span>
          <span>{monthData.themeBanner || "ตารางรับใช้ประจำเดือน"}</span>
        </div>

        {/* Action Controls for As-Is Table */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!isEditMode && (
            <button
              onClick={handleAutoSchedule}
              title="คำนวณและจัดเวรรับใช้อัตโนมัติตามกฎ 4 ข้อ"
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background: "#0284c7",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(2,132,199,0.3)",
              }}
            >
              Auto Calculate
            </button>
          )}

          {onOpenManageDeacons && !isEditMode && (
            <button
              id="open-manage-deacons-table-btn"
              onClick={onOpenManageDeacons}
              title="จัดการเลขประจำตัวและรายชื่อมัคนายก"
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#0f172a",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              จัดการเลข มน.
            </button>
          )}

          {isEditMode ? (
            <>
              <button
                onClick={handleAddRow}
                title="เพิ่มแถวรอบการรับใช้ใหม่"
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px dashed #0284c7",
                  background: "#f0f9ff",
                  color: "#0369a1",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                เพิ่มแถว
              </button>

              <button
                onClick={handleCancelEdits}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ยกเลิก
              </button>

              <button
                onClick={handleSaveEdits}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#16a34a",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                }}
              >
                บันทึกการแก้ไข
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: "#0d9488",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(13,148,136,0.3)",
              }}
            >
              แก้ไขในตาราง
            </button>
          )}
        </div>
      </div>

      {/* Spreadsheet Matrix Table */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            textAlign: "center",
            whiteSpace: "nowrap",
            minWidth: "1350px",
          }}
        >
          <thead>
            {/* Super Header Row 1 */}
            <tr style={{ background: "#f8fafc", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #cbd5e1" }}>
              <th rowSpan={2} style={{ padding: "8px", border: "1px solid #94a3b8", width: "45px" }}>วัน</th>
              <th rowSpan={2} style={{ padding: "8px", border: "1px solid #94a3b8", minWidth: "110px" }}>วันพิเศษ</th>
              <th rowSpan={2} style={{ padding: "8px", border: "1px solid #94a3b8", minWidth: "160px" }}>เรื่อง/ประเด็นหลัก</th>
              <th rowSpan={2} style={{ padding: "8px", border: "1px solid #94a3b8", minWidth: "100px" }}>ข้อพระธรรม</th>
              <th colSpan={4} style={{ padding: "6px", border: "1px solid #94a3b8", background: "#f1f5f9" }}>นมัสการใหญ่</th>
              <th colSpan={8} style={{ padding: "6px", border: "1px solid #94a3b8", background: "#e2e8f0" }}>มน.ถือกองถวายบน</th>
              <th colSpan={4} style={{ padding: "6px", border: "1px solid #94a3b8", background: "#f1f5f9" }}>มน.ถือกองถวายล่าง</th>
              <th colSpan={3} style={{ padding: "6px", border: "1px solid #94a3b8", background: "#e2e8f0" }}>มน.ร่วมนำนมัสการ & รับใช้</th>
              <th rowSpan={2} style={{ padding: "8px", border: "1px solid #94a3b8", minWidth: "120px" }}>หมายเหตุ/ไม่ได้</th>
              {isEditMode && (
                <th rowSpan={2} style={{ padding: "8px", border: "1px solid #94a3b8", width: "40px", background: "#fef2f2" }}>ลบ</th>
              )}
            </tr>

            {/* Sub Header Row 2 */}
            <tr style={{ background: "#f8fafc", fontWeight: 700, color: "#334155", fontSize: "11px", borderBottom: "2px solid #64748b" }}>
              <th style={{ padding: "6px 8px", border: "1px solid #94a3b8", minWidth: "80px" }}>ผู้เทศนา</th>
              <th style={{ padding: "6px 8px", border: "1px solid #94a3b8", minWidth: "80px" }}>ผู้แปล</th>
              <th style={{ padding: "6px 8px", border: "1px solid #94a3b8", minWidth: "90px" }}>ผู้นำ</th>
              <th style={{ padding: "6px 8px", border: "1px solid #94a3b8", minWidth: "80px" }}>แปลนำ</th>

              {/* Upper Offering 1-8 */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <th key={`u-${num}`} style={{ padding: "4px 2px", border: "1px solid #94a3b8", width: "36px" }}>{num}</th>
              ))}

              {/* Lower Offering 1-4 */}
              {[1, 2, 3, 4].map((num) => (
                <th key={`l-${num}`} style={{ padding: "4px 2px", border: "1px solid #94a3b8", width: "36px" }}>{num}</th>
              ))}

              {/* Stations */}
              <th style={{ padding: "6px 8px", border: "1px solid #94a3b8", minWidth: "75px" }}>ห้องบน</th>
              <th style={{ padding: "6px 8px", border: "1px solid #94a3b8", minWidth: "85px" }}>ห้องล่าง/ชั้น4</th>
              <th style={{ padding: "6px 8px", border: "1px solid #94a3b8", minWidth: "75px" }}>ประตูใหญ่</th>
            </tr>
          </thead>

          <tbody>
            {activeServicesList.length === 0 ? (
              <tr>
                <td
                  colSpan={isEditMode ? 26 : 25}
                  style={{
                    textAlign: "center",
                    padding: "48px 16px",
                    color: "#64748b",
                    fontSize: "13px",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#334155", marginBottom: "6px" }}>
                    ยังไม่มีรอบการรับใช้ในเดือนนี้
                  </div>
                  <div style={{ color: "#64748b" }}>
                    สามารถกดปุ่ม <b>&quot;+ เพิ่มรายการ&quot;</b> ด้านบน หรือกด <b>&quot;แก้ไขในตาราง&quot;</b> เพื่อเริ่มกรอกข้อมูล
                  </div>
                </td>
              </tr>
            ) : (
              activeServicesList.map((service, idx) => {
                const isCommunion = service.specialEventType === "communion" || service.specialEvent?.includes("มหาสนิท");
                const isHolyWeek = service.specialEventType === "holy-week";
                const isCamp = service.specialEventType === "camp";
                const isHovered = hoveredRowId === service.id;
                const hasSelectedDeacon = selectedDeaconId ? isDeaconActive(service, selectedDeaconId) : false;

                const validation = validateRow(service);

                let rowBg = "#ffffff";
                if (validation.hasError) {
                  rowBg = "#fef2f2";
                } else if (validation.hasWarning) {
                  rowBg = "#fffbeb";
                } else if (hasSelectedDeacon) {
                  rowBg = "#fef9c3";
                } else if (isCommunion) {
                  rowBg = "#fff1f2";
                } else if (isHolyWeek) {
                  rowBg = "#faf5ff";
                } else if (isCamp) {
                  rowBg = "#f0fdf4";
                } else if (idx % 2 === 1) {
                  rowBg = "#f8fafc";
                }

                if (isHovered && !isEditMode) {
                  rowBg = "#e0f2fe";
                }

                return (
                  <tr
                    key={service.id || idx}
                    onMouseEnter={() => setHoveredRowId(service.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    onClick={() => !isEditMode && onSelectService(service)}
                    style={{
                      background: rowBg,
                      cursor: isEditMode ? "default" : "pointer",
                      transition: "background-color 0.15s ease",
                      borderBottom: "1px solid #cbd5e1",
                      fontWeight: isCommunion ? 600 : 400,
                    }}
                  >
                    {/* Day */}
                    <td style={{ padding: "6px 4px", border: "1px solid #cbd5e1", fontWeight: 800, color: "#0f172a" }}>
                      {isEditMode ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                          <input
                            type="text"
                            value={service.dayDisplay}
                            onChange={(e) => handleCellChange(idx, "dayDisplay", e.target.value)}
                            placeholder="วันที่"
                            style={{
                              width: "38px",
                              textAlign: "center",
                              border: !service.dayDisplay ? "1px solid #ef4444" : "1px solid #cbd5e1",
                              borderRadius: "4px",
                              padding: "3px 0",
                              fontWeight: 800,
                            }}
                          />
                          {validation.hasError && (
                            <span title={validation.errors.join("\n")} style={{ cursor: "help", fontSize: "11px", color: "#dc2626", fontWeight: 900 }}>
                              !
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          <span>{service.dayDisplay}</span>
                          {validation.hasError && (
                            <span title={validation.errors.join("\n")} style={{ cursor: "help", fontSize: "11px", color: "#dc2626", fontWeight: 900 }}>
                              !
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Special Event */}
                    <td style={{ padding: "4px 6px", border: "1px solid #cbd5e1", color: isCommunion ? "var(--mtc-red)" : "#334155", fontWeight: isCommunion ? 700 : 500 }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={service.specialEvent || ""}
                          onChange={(e) => handleCellChange(idx, "specialEvent", e.target.value)}
                          placeholder="เช่น มหาสนิท, วันแม่"
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                        />
                      ) : (
                        service.specialEvent || "—"
                      )}
                    </td>

                    {/* Topic */}
                    <td style={{ padding: "4px 6px", border: "1px solid #cbd5e1", textAlign: "left", color: "#0f172a" }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={service.topic}
                          onChange={(e) => handleCellChange(idx, "topic", e.target.value)}
                          placeholder="เรื่อง/ประเด็นหลัก"
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                        />
                      ) : (
                        service.topic
                      )}
                    </td>

                    {/* Scripture */}
                    <td style={{ padding: "4px 6px", border: "1px solid #cbd5e1", color: "#475569", fontSize: "11px" }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={service.scripture}
                          onChange={(e) => handleCellChange(idx, "scripture", e.target.value)}
                          placeholder="ข้อพระธรรม"
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                        />
                      ) : (
                        service.scripture
                      )}
                    </td>

                    {/* Preacher */}
                    <td style={{ padding: "4px 6px", border: "1px solid #cbd5e1", fontWeight: 600, color: "#1e293b" }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={service.preacher}
                          onChange={(e) => handleCellChange(idx, "preacher", e.target.value)}
                          placeholder="ผู้เทศนา"
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                        />
                      ) : (
                        service.preacher
                      )}
                    </td>

                    {/* Translator */}
                    <td style={{ padding: "4px 6px", border: "1px solid #cbd5e1", color: "#475569" }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={service.translator}
                          onChange={(e) => handleCellChange(idx, "translator", e.target.value)}
                          placeholder="ผู้แปล"
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                        />
                      ) : (
                        service.translator || "—"
                      )}
                    </td>

                    {/* Worship Leader */}
                    <td style={{ padding: "4px 6px", border: "1px solid #cbd5e1", fontWeight: 700, color: "var(--mtc-red)" }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={service.worshipLeader}
                          onChange={(e) => handleCellChange(idx, "worshipLeader", e.target.value)}
                          placeholder="ผู้นำนมัสการ"
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                        />
                      ) : (
                        service.worshipLeader
                      )}
                    </td>

                    {/* Worship Translator */}
                    <td style={{ padding: "4px 6px", border: "1px solid #cbd5e1", color: "#475569" }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={service.worshipTranslator}
                          onChange={(e) => handleCellChange(idx, "worshipTranslator", e.target.value)}
                          placeholder="แปลนำ"
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                        />
                      ) : (
                        service.worshipTranslator || "—"
                      )}
                    </td>

                    {/* Offering Upper 1-8 (Editable Inputs) */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((pos) => {
                      const deaconNum = service.offeringUpper[pos] ?? 0;
                      const isTargetDeacon = selectedDeaconId === deaconNum && deaconNum > 0;
                      const isDuplicate = deaconNum > 0 && validation.duplicateDeaconIds.includes(deaconNum);
                      const isConflict = deaconNum > 0 && validation.unavailableConflictIds.includes(deaconNum);
                      const isInvalid = deaconNum > 0 && validation.invalidDeaconIds.includes(deaconNum);

                      return (
                        <td
                          key={`u-val-${pos}`}
                          style={{
                            padding: "2px",
                            border: "1px solid #cbd5e1",
                            fontWeight: 700,
                            color: isTargetDeacon ? "#ffffff" : isDuplicate ? "#b91c1c" : "#334155",
                            background: isDuplicate ? "#fee2e2" : isConflict ? "#fef3c7" : isTargetDeacon ? "#0284c7" : "transparent",
                          }}
                        >
                          {isEditMode ? (
                            <input
                              type="text"
                              value={deaconNum > 0 ? deaconNum : ""}
                              onChange={(e) => handleOfferingChange(idx, "offeringUpper", pos, e.target.value)}
                              placeholder="-"
                              title={
                                isDuplicate
                                  ? `เลข ${deaconNum} ซ้ำในวันนี้`
                                  : isConflict
                                  ? `เลข ${deaconNum} ระบุว่าไม่ได้`
                                  : isInvalid
                                  ? `เลข ${deaconNum} ไม่มีในระบบ`
                                  : `มน. ถือกองถวายบน ช่องที่ ${pos + 1}`
                              }
                              style={{
                                width: "28px",
                                height: "24px",
                                textAlign: "center",
                                border: isDuplicate || isInvalid ? "2px solid #ef4444" : isConflict ? "2px solid #f59e0b" : "1px solid #cbd5e1",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: isDuplicate ? "#fef2f2" : "#ffffff",
                              }}
                            />
                          ) : (
                            deaconNum > 0 ? deaconNum : ""
                          )}
                        </td>
                      );
                    })}

                    {/* Offering Lower 1-4 (Editable Inputs) */}
                    {[0, 1, 2, 3].map((pos) => {
                      const deaconNum = service.offeringLower[pos] ?? 0;
                      const isTargetDeacon = selectedDeaconId === deaconNum && deaconNum > 0;
                      const isDuplicate = deaconNum > 0 && validation.duplicateDeaconIds.includes(deaconNum);
                      const isConflict = deaconNum > 0 && validation.unavailableConflictIds.includes(deaconNum);
                      const isInvalid = deaconNum > 0 && validation.invalidDeaconIds.includes(deaconNum);

                      return (
                        <td
                          key={`l-val-${pos}`}
                          style={{
                            padding: "2px",
                            border: "1px solid #cbd5e1",
                            fontWeight: 700,
                            color: isTargetDeacon ? "#ffffff" : isDuplicate ? "#b91c1c" : "#334155",
                            background: isDuplicate ? "#fee2e2" : isConflict ? "#fef3c7" : isTargetDeacon ? "#0284c7" : "transparent",
                          }}
                        >
                          {isEditMode ? (
                            <input
                              type="text"
                              value={deaconNum > 0 ? deaconNum : ""}
                              onChange={(e) => handleOfferingChange(idx, "offeringLower", pos, e.target.value)}
                              placeholder="-"
                              title={
                                isDuplicate
                                  ? `เลข ${deaconNum} ซ้ำในวันนี้`
                                  : isConflict
                                  ? `เลข ${deaconNum} ระบุว่าไม่ได้`
                                  : isInvalid
                                  ? `เลข ${deaconNum} ไม่มีในระบบ`
                                  : `มน. ถือกองถวายล่าง ช่องที่ ${pos + 1}`
                              }
                              style={{
                                width: "28px",
                                height: "24px",
                                textAlign: "center",
                                border: isDuplicate || isInvalid ? "2px solid #ef4444" : isConflict ? "2px solid #f59e0b" : "1px solid #cbd5e1",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: isDuplicate ? "#fef2f2" : "#ffffff",
                              }}
                            />
                          ) : (
                            deaconNum > 0 ? deaconNum : ""
                          )}
                        </td>
                      );
                    })}

                    {/* Station Upper Room */}
                    {(() => {
                      const num = parseInt(service.servingUpperRoom || "", 10);
                      const isDup = !isNaN(num) && num > 0 && validation.duplicateDeaconIds.includes(num);
                      const isConf = !isNaN(num) && num > 0 && validation.unavailableConflictIds.includes(num);
                      return (
                        <td style={{ padding: "4px 2px", border: "1px solid #cbd5e1", fontWeight: 700, color: "#0369a1" }}>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={service.servingUpperRoom || ""}
                              onChange={(e) => handleCellChange(idx, "servingUpperRoom", e.target.value)}
                              placeholder="เลข มน."
                              style={{
                                width: "50px",
                                height: "24px",
                                textAlign: "center",
                                border: isDup ? "2px solid #ef4444" : isConf ? "2px solid #f59e0b" : "1px solid #cbd5e1",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            />
                          ) : (
                            service.servingUpperRoom || "—"
                          )}
                        </td>
                      );
                    })()}

                    {/* Station Lower Room */}
                    {(() => {
                      const num = parseInt(service.servingLowerRoom || "", 10);
                      const isDup = !isNaN(num) && num > 0 && validation.duplicateDeaconIds.includes(num);
                      const isConf = !isNaN(num) && num > 0 && validation.unavailableConflictIds.includes(num);
                      return (
                        <td style={{ padding: "4px 2px", border: "1px solid #cbd5e1", fontWeight: 700, color: "#0369a1" }}>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={service.servingLowerRoom || ""}
                              onChange={(e) => handleCellChange(idx, "servingLowerRoom", e.target.value)}
                              placeholder="เลข มน."
                              style={{
                                width: "55px",
                                height: "24px",
                                textAlign: "center",
                                border: isDup ? "2px solid #ef4444" : isConf ? "2px solid #f59e0b" : "1px solid #cbd5e1",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            />
                          ) : (
                            service.servingLowerRoom || "—"
                          )}
                        </td>
                      );
                    })()}

                    {/* Station Main Gate */}
                    {(() => {
                      const num = parseInt(service.servingMainGate || "", 10);
                      const isDup = !isNaN(num) && num > 0 && validation.duplicateDeaconIds.includes(num);
                      const isConf = !isNaN(num) && num > 0 && validation.unavailableConflictIds.includes(num);
                      return (
                        <td style={{ padding: "4px 2px", border: "1px solid #cbd5e1", fontWeight: 700, color: "#0369a1" }}>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={service.servingMainGate || ""}
                              onChange={(e) => handleCellChange(idx, "servingMainGate", e.target.value)}
                              placeholder="เลข มน."
                              style={{
                                width: "50px",
                                height: "24px",
                                textAlign: "center",
                                border: isDup ? "2px solid #ef4444" : isConf ? "2px solid #f59e0b" : "1px solid #cbd5e1",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            />
                          ) : (
                            service.servingMainGate || "—"
                          )}
                        </td>
                      );
                    })()}

                    {/* Unavailable Notes */}
                    <td style={{ padding: "4px 6px", border: "1px solid #cbd5e1", color: "#dc2626", fontSize: "11px", fontWeight: 600 }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={service.unavailableNotes || ""}
                          onChange={(e) => handleCellChange(idx, "unavailableNotes", e.target.value)}
                          placeholder="เช่น 5, 8 ไม่ได้"
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                        />
                      ) : (
                        service.unavailableNotes || ""
                      )}
                    </td>

                    {/* Delete Row Button */}
                    {isEditMode && (
                      <td style={{ padding: "4px", border: "1px solid #cbd5e1", background: "#fef2f2" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRow(idx);
                          }}
                          title="ลบแถวนี้"
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: 800,
                          }}
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Instructions for Edit Mode */}
      {isEditMode && (
        <div
          style={{
            padding: "8px 16px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            fontSize: "11px",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <span><b>คำแนะนำ:</b> สามารถพิมพ์แก้ไขได้ทุกช่องทันที</span>
            <span><b>กรอบสีแดง:</b> มีเลข มน. ซ้ำซ้อนในวันเดียวกัน หรือไม่มีในระบบ</span>
            <span><b>กรอบสีส้ม:</b> มน. ที่ระบุว่าไม่ว่างถูกจัดลงเวร</span>
          </div>
          <div>
            <span>เมื่อแก้ไขเรียบร้อยแล้ว ให้กดปุ่ม <b>&quot;บันทึกการแก้ไข&quot;</b> เพื่อเซฟข้อมูลลงระบบ</span>
          </div>
        </div>
      )}
    </div>
  );
}
