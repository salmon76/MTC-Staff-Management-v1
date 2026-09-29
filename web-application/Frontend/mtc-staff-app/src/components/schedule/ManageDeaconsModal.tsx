"use client";

import React, { useState, useEffect } from "react";
import { DeaconInfo, DEACONS_LIST } from "@/data/mockScheduleData";

interface ManageDeaconsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deacons: DeaconInfo[];
  onSaveDeacons: (updated: DeaconInfo[]) => void;
}

const COMMON_DEPARTMENTS = [
  "ประธานมัคนายก",
  "รองประธาน",
  "คริสเตียนศึกษา",
  "งานอาคารสถานที่",
  "งานสตรี",
  "งานดนตรี",
  "งานต้อนรับ",
  "งานปฏิคม",
  "งานเยาวชน",
  "งานประชาสัมพันธ์",
  "งานพิธีการ",
  "งานสงเคราะห์",
  "งานยานพาหนะ",
  "งานโสตทัศนูปกรณ์",
  "งานอนุชน",
  "พันธกิจทั่วไป",
  "มิชชั่น ศาลาธรรม",
];

export default function ManageDeaconsModal({
  isOpen,
  onClose,
  deacons,
  onSaveDeacons,
}: ManageDeaconsModalProps) {
  const [list, setList] = useState<DeaconInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setList([...deacons].sort((a, b) => a.id - b.id));
      setHasChanges(false);
      setSearchQuery("");
    }
  }, [isOpen, deacons]);

  if (!isOpen) return null;

  const handleFieldChange = (index: number, field: keyof DeaconInfo, value: any) => {
    setList((prev) => {
      const updated = [...prev];
      if (field === "id") {
        const num = parseInt(value, 10);
        updated[index] = { ...updated[index], id: isNaN(num) ? 0 : num };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
    setHasChanges(true);
  };

  const handleAddNewDeacon = () => {
    setList((prev) => {
      const maxId = prev.reduce((max, d) => Math.max(max, d.id), 0);
      const nextId = maxId + 1;
      return [
        ...prev,
        {
          id: nextId,
          name: `มน.ท่านที่ ${nextId}`,
          department: "พันธกิจทั่วไป",
          role: "มัคนายก",
          phone: "",
        },
      ];
    });
    setHasChanges(true);
  };

  const handleDeleteDeacon = (index: number) => {
    const item = list[index];
    if (confirm(`คุณต้องการลบเลขประจำตัวที่ ${item.id} (${item.name}) ใช่หรือไม่?`)) {
      setList((prev) => prev.filter((_, i) => i !== index));
      setHasChanges(true);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("คุณต้องการคืนค่ารายชื่อและเลขประจำตัวมัคนายกกลับเป็นค่าเริ่มต้น (15 ท่าน) ใช่หรือไม่?")) {
      setList([...DEACONS_LIST]);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    // Validate IDs
    const validated = list
      .map((d, idx) => ({
        ...d,
        id: d.id || idx + 1,
        name: d.name.trim() || `มน.ท่านที่ ${d.id || idx + 1}`,
      }))
      .sort((a, b) => a.id - b.id);

    onSaveDeacons(validated);
    onClose();
  };

  const filteredList = list.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.id.toString().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q) ||
      d.role.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
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
          maxWidth: "760px",
          maxHeight: "90vh",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
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
              Deacon Identification Management
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>
              จัดการเลขประจำตัวมัคนายก
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

        {/* Toolbar & Search */}
        <div
          style={{
            padding: "14px 24px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามเลขประจำตัว, ชื่อ หรือฝ่าย..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#ffffff",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "13px",
                color: "#94a3b8",
              }}
            >
              🔍
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={handleAddNewDeacon}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
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
              + เพิ่มมัคนายกใหม่
            </button>

            <button
              onClick={handleResetToDefault}
              title="คืนค่าเป็น 15 ท่านเริ่มต้น"
              style={{
                background: "#f1f5f9",
                color: "#64748b",
                border: "1px solid #cbd5e1",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              คืนค่าเริ่มต้น
            </button>
          </div>
        </div>



        {/* List of Deacons */}
        <div
          style={{
            padding: "16px 24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "65px 1.5fr 1.5fr 1fr 40px",
              gap: "8px",
              padding: "6px 10px",
              background: "#e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#334155",
              marginBottom: "8px",
              alignItems: "center",
            }}
          >
            <div>เลข</div>
            <div>ชื่อมัคนายก</div>
            <div>ฝ่าย / พันธกิจ</div>
            <div>ตำแหน่ง</div>
            <div style={{ textAlign: "center" }}>ลบ</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {filteredList.map((item) => {
              const originalIndex = list.findIndex((d) => d === item);
              return (
                <div
                  key={originalIndex}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "65px 1.5fr 1.5fr 1fr 40px",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    alignItems: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  {/* ID Input */}
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={item.id}
                      onChange={(e) => handleFieldChange(originalIndex, "id", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 4px",
                        textAlign: "center",
                        borderRadius: "6px",
                        border: "1.5px solid #0284c7",
                        fontWeight: 800,
                        fontSize: "13px",
                        color: "#0369a1",
                        background: "#f0f9ff",
                      }}
                    />
                  </div>

                  {/* Name Input */}
                  <div>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleFieldChange(originalIndex, "name", e.target.value)}
                      placeholder="เช่น มน.ธัญวิชญ์"
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    />
                  </div>

                  {/* Department Input */}
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      list="dept-options"
                      value={item.department}
                      onChange={(e) => handleFieldChange(originalIndex, "department", e.target.value)}
                      placeholder="ฝ่าย/พันธกิจ"
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12px",
                        color: "#334155",
                      }}
                    />
                  </div>

                  {/* Role Input */}
                  <div>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => handleFieldChange(originalIndex, "role", e.target.value)}
                      placeholder="มัคนายก"
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12px",
                        color: "#475569",
                      }}
                    />
                  </div>

                  {/* Delete Button */}
                  <div style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleDeleteDeacon(originalIndex)}
                      title="ลบมัคนายกท่านนี้"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: "4px",
                        borderRadius: "4px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredList.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                ไม่พบข้อมูลมัคนายกที่ตรงกับการค้นหา &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          <datalist id="dept-options">
            {COMMON_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept} />
            ))}
          </datalist>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            รวมทั้งหมด <b>{list.length}</b> ท่าน
            {hasChanges && (
              <span style={{ color: "#e11d48", marginLeft: "8px", fontWeight: 700 }}>
                • มีการแก้ไขที่ยังไม่ได้บันทึก
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
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
              type="button"
              onClick={handleSave}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#0284c7",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(2,132,199,0.3)",
              }}
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
