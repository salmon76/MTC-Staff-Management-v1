"use client";

import React, { useState } from "react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock User Data
const USER_PROFILE = {
    name: "อ.สมชาย ใจดี",
    role: "ศาสนาจารย์ (ศิษยาภิบาลอาวุโส)",
    department: "งานอภิบาลคริสตจักร",
    phone: "084-504-8418",
    email: "somchai@maitrichit.org",
    joinedDate: "12 มิถุนายน 2558",
    avatarUrl: null, // If null, fallback to Initials
    status: "online",
    stats: {
        leaveBalance: 12, // days
        serviceHours: 45, // this month
        tasksPending: 3,
    },
};

export default function ProfilePage() {
    const router = useRouter();
    const [status, setStatus] = useState("online");

    const handleLogout = () => {
        if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            // In a real app, clear tokens here
            router.push("/");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--background)",
                paddingBottom: 80,
            }}
        >
            {/* Header / Cover */}
            <div
                style={{
                    height: 180,
                    background: "linear-gradient(135deg, var(--mtc-red), #D32F2F)",
                    position: "relative",
                    display: "flex",
                    justifyContent: "flex-end", // Back button or settings could go here
                    padding: 20,
                }}
            >
                {/* Settings Icon */}
                <button
                    style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "none",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            </div>

            {/* Profile Info Card (Overlapping) */}
            <div
                className="animate-fade-in-up"
                style={{
                    padding: "0 20px",
                    marginTop: -60, // Overlap effect
                }}
            >
                <div
                    className="mtc-card"
                    style={{
                        padding: "24px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    {/* Avatar */}
                    <div
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background: "white",
                            padding: 4, // border request
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                            marginTop: -60, // Pull avatar up
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                background: "#EF5350",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 32,
                                fontWeight: 700,
                                border: "4px solid white",
                            }}
                        >
                            {USER_PROFILE.name.split(" ")[1]?.charAt(0) || "U"}
                        </div>
                    </div>

                    {/* Name & Role */}
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                            {USER_PROFILE.name}
                        </h2>
                        <p style={{ color: "var(--mtc-red)", fontWeight: 600, fontSize: 14 }}>
                            {USER_PROFILE.role}
                        </p>
                        <p style={{ color: "var(--text-tertiary)", fontSize: 12, marginTop: 4 }}>
                            {USER_PROFILE.department} • เข้าร่วมเมื่อ {USER_PROFILE.joinedDate}
                        </p>
                    </div>

                    {/* Status Select */}
                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "20px",
                                border: "1px solid var(--border-light)",
                                background: status === "online" ? "#E8F5E9" : "#FFEBEE",
                                color: status === "online" ? "#2E7D32" : "#C62828",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                outline: "none",
                            }}
                        >
                            <option value="online">● ออนไลน์</option>
                            <option value="busy">● ยุ่ง</option>
                            <option value="leave">● ลาพักงาน</option>
                        </select>
                    </div>

                    {/* Stats Grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 12,
                            width: "100%",
                            marginTop: 12,
                            paddingTop: 16,
                            borderTop: "1px solid var(--border-light)",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                                {USER_PROFILE.stats.leaveBalance}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>วันลาคงเหลือ</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                                {USER_PROFILE.stats.serviceHours}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>ชั่วโมงรับใช้</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                                {USER_PROFILE.stats.tasksPending}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>งานค้าง</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div style={{ padding: "0 20px 20px", marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Section: Contact Info */}
                <div className="mtc-card" style={{ padding: "0 20px" }}>
                    <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="icon-circle" style={{ background: "#E3F2FD", color: "#1976D2" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>เบอร์โทรศัพท์</div>
                            <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{USER_PROFILE.phone}</div>
                        </div>
                    </div>
                    <div style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="icon-circle" style={{ background: "#FFF3E0", color: "#F57C00" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>อีเมล</div>
                            <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{USER_PROFILE.email}</div>
                        </div>
                    </div>
                </div>

                {/* Section: App Settings */}
                <div className="mtc-card" style={{ padding: "0 20px" }}>
                    {[
                        { label: "ตั้งค่าการแจ้งเตือน", icon: "bell", color: "#7B1FA2", bg: "#F3E5F5" },
                        { label: "ความเป็นส่วนตัวและความปลอดภัย", icon: "shield", color: "#388E3C", bg: "#E8F5E9" },
                        { label: "ช่วยเหลือ & สนับสนุน", icon: "help-circle", color: "#0288D1", bg: "#E1F5FE" },
                    ].map((item, index) => (
                        <div
                            key={index}
                            style={{
                                padding: "16px 0",
                                borderBottom: index < 2 ? "1px solid var(--border-light)" : "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div className="icon-circle" style={{ background: item.bg, color: item.color }}>
                                    {/* Simplified Icon Logic */}
                                    {item.icon === "bell" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>}
                                    {item.icon === "shield" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
                                    {item.icon === "help-circle" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                                </div>
                                <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{item.label}</span>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    ))}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "16px",
                        background: "white",
                        color: "#D32F2F", // Red for danger
                        border: "1px solid #FFCDD2",
                        borderRadius: "12px",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    ออกจากระบบ
                </button>

                {/* Footer Info */}
                <div style={{ textAlign: "center", marginTop: 8, marginBottom: 20 }}>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                        MTC Staff Management v0.1.0 (Beta) <br />
                        พัฒนาโดยทีมเทคโนโลยีไมตรีจิต
                    </p>
                </div>
            </div>

            <BottomNav />

            {/* Inline Styles for Icon Circle */}
            <style jsx global>{`
                .icon-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
}
