"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Staff } from "@/types";
import { getStaffList } from "@/app/actions/staff";
import LoadingScreen from "@/components/LoadingScreen";

// Status Indicator Component
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    online: { label: "ออนไลน์", color: "#66BB6A" },
    meeting: { label: "กำลังประชุม", color: "#EF5350" },
    leave: { label: "ลาพักงาน", color: "#FFA726" },
    offline: { label: "ออฟไลน์", color: "#BDBDBD" },
    busy: { label: "ยุ่ง", color: "#AB47BC" },
};

const FILTER_LABELS: Record<string, string> = {
    All: "ทั้งหมด",
    Pastors: "ศิษยาภิบาล",
    Office: "ธุรการ",
    Others: "อื่นๆ",
};

const DEPT_LABELS: Record<string, string> = {
    Pastoral: "งานอภิบาล",
    Office: "ธุรการ",
    Worship: "งานนมัสการ",
    Education: "งานการศึกษา",
};

const StatusDot = ({ status }: { status: string }) => {
    const color = STATUS_CONFIG[status]?.color ?? "#BDBDBD";
    return (
        <div
            style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                backgroundColor: color,
                border: "2px solid white",
                position: "absolute",
                bottom: 1,
                right: 1,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
            }}
        />
    );
};

export default function StaffPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("All");
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setIsLoading(true);

        const fetchStaff = async () => {
            try {
                const data = await getStaffList(searchTerm, filter);
                if (active) {
                    setStaffList(data as any);
                }
            } catch (err) {
                console.error("Failed to load staff list:", err);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        const timer = setTimeout(fetchStaff, searchTerm ? 250 : 0);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [searchTerm, filter]);

    return (
        <div className="page-wrapper">
            {/* Sticky Header */}
            <header className="page-header safe-area-top">
                <div className="page-header-inner">
                    <h1
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                        }}
                    >
                        ทำเนียบบุคลากร
                    </h1>

                    {/* Add Button */}
                    <button
                        aria-label="Add Staff"
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "var(--mtc-red)",
                            color: "white",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                            boxShadow: "var(--shadow-red-sm)",
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="animate-fade-in">
                <div className="app-container" style={{ paddingTop: 20, paddingBottom: 16 }}>
                    {/* Search Bar */}
                    <div style={{ position: "relative", marginBottom: 16 }}>
                        <div
                            style={{
                                position: "absolute",
                                left: 14,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--text-tertiary)",
                                pointerEvents: "none",
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            placeholder="ค้นหาบุคลากรด้วยชื่อ..."
                            className="mtc-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: 42 }}
                        />
                    </div>

                    {/* Filter Chips */}
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            overflowX: "auto",
                            paddingBottom: 4,
                            marginBottom: 20,
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        {["All", "Pastors", "Office", "Others"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "var(--radius-full)",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    border: "none",
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    transition: "all var(--transition-fast)",
                                    background:
                                        filter === f ? "var(--mtc-red)" : "var(--surface)",
                                    color: filter === f ? "white" : "var(--text-secondary)",
                                    boxShadow:
                                        filter === f
                                            ? "var(--shadow-red-sm)"
                                             : "var(--shadow-sm)",
                                    minHeight: 36,
                                }}
                            >
                                {FILTER_LABELS[f] ?? f}
                            </button>
                        ))}
                    </div>

                    {/* Staff List */}
                    {isLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                            <span className="mtc-spinner" style={{ width: 32, height: 32, borderColor: "var(--mtc-red) transparent var(--mtc-red) transparent" }} />
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {staffList.map((staff) => (
                                <Link
                                    key={staff.id}
                                    href={`/staff/${staff.id}`}
                                    className="mtc-card"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "14px 16px",
                                        gap: 14,
                                        textDecoration: "none",
                                        color: "inherit",
                                        minHeight: 72,
                                    }}
                                >
                                    {/* Avatar */}
                                    <div style={{ position: "relative", flexShrink: 0 }}>
                                        <div
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: "50%",
                                                background: staff.avatarBg || "#DDD",
                                                color: staff.avatarColor || "#000",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                                fontWeight: 700,
                                                overflow: "hidden",
                                            }}
                                        >
                                            {staff.avatarUrl ? (
                                                <img
                                                    src={staff.avatarUrl}
                                                    alt={staff.name}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                staff.name.split(" ").slice(-1)[0]?.charAt(0)
                                            )}
                                        </div>
                                        <StatusDot status={staff.status} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3
                                            style={{
                                                fontSize: 15,
                                                fontWeight: 700,
                                                color: "var(--text-primary)",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                marginBottom: 2,
                                            }}
                                        >
                                            {staff.name}
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: 13,
                                                color: "var(--text-secondary)",
                                                marginBottom: 4,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {staff.role}
                                        </p>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                padding: "2px 8px",
                                                borderRadius: 6,
                                                background: "var(--background)",
                                                color: "var(--text-tertiary)",
                                                display: "inline-block",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {DEPT_LABELS[staff.department] ?? staff.department}
                                        </span>
                                    </div>

                                    {/* Right: call + chevron */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {staff.phone && (
                                            <a
                                                href={`tel:${staff.phone.replace(/[-\s]/g, "")}`}
                                                aria-label={`Call ${staff.name}`}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: "50%",
                                                    background: "#E8F5E9",
                                                    color: "#2E7D32",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    textDecoration: "none",
                                                    border: "1px solid #C8E6C9",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                            </a>
                                        )}

                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="var(--text-tertiary)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}

                            {staffList.length === 0 && (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "48px 0",
                                        color: "var(--text-tertiary)",
                                    }}
                                >
                                    <svg
                                        width="40"
                                        height="40"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ margin: "0 auto 12px", display: "block" }}
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <p style={{ fontSize: 15 }}>ไม่พบรายชื่อบุคลากร</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
