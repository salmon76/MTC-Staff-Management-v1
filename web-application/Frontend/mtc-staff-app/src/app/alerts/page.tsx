"use client";

import React, { useState } from "react";
import BottomNav from "@/components/BottomNav";

// Mock Data for Alerts
const ALERTS_DATA = [
    {
        id: 1,
        title: "ขออธิษฐานเผื่อด่วน",
        message: "คุณสมใจเข้ารักษาตัวในห้อง ICU ขอคำอธิษฐานเผื่อจากพี่น้องทุกท่าน",
        date: "12 นาทีที่แล้ว",
        type: "ด่วนที่สุด", // Red
        read: false,
        color: "#EF5350",
    },
    {
        id: 2,
        title: "แจ้งเตือนการประชุม",
        message: "การประชุมเจ้าหน้าที่จะเริ่มในอีก 15 นาทีที่ห้อง A",
        date: "15 นาทีที่แล้ว",
        type: "แจ้งเตือน", // Yellow/Orange
        read: false,
        color: "#FFA726",
    },
    {
        id: 3,
        title: "คำขอลาได้รับการอนุมัติ",
        message: "คำขอลาพักร้อนวันที่ 20-22 มิ.ย. ของคุณได้รับการอนุมัติแล้ว",
        date: "2 ชั่วโมงที่แล้ว",
        type: "อนุมัติ", // Green
        read: true,
        color: "#66BB6A",
    },
    {
        id: 4,
        title: "ประกาศตารางงานใหม่",
        message: "ตารางปฏิบัติงานสำหรับเดือนกรกฎาคมเผยแพร่แล้ว กรุณาตรวจสอบตารางของคุณ",
        date: "เมื่อวานนี้",
        type: "ทั่วไป", // Blue
        read: true,
        color: "#42A5F5",
    },
    {
        id: 5,
        title: "ปิดปรับปรุงระบบ",
        message: "ระบบจะปิดปรับปรุงชั่วคราวในคืนนี้เวลา 02:00 น.",
        date: "2 วันที่แล้ว",
        type: "ทั่วไป",
        read: true,
        color: "#9E9E9E", // Gray
    },
];

export default function AlertsPage() {
    const [alerts, setAlerts] = useState(ALERTS_DATA);

    const markAllAsRead = () => {
        const updatedAlerts = alerts.map((alert) => ({ ...alert, read: true }));
        setAlerts(updatedAlerts);
    };

    const deleteAlert = (id: number) => {
        setAlerts(alerts.filter(a => a.id !== id));
    }

    const unreadCount = alerts.filter(a => !a.read).length;

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--background)",
                paddingBottom: 80,
            }}
        >
            {/* Header */}
            <header
                className="safe-area-top"
                style={{
                    padding: "16px 20px",
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(10px)",
                    position: "sticky",
                    top: 0,
                    zIndex: 40,
                    borderBottom: "1px solid var(--border-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
                    การแจ้งเตือน
                    {unreadCount > 0 && <span style={{ marginLeft: 8, fontSize: 13, background: "#EF5350", color: "white", padding: "2px 8px", borderRadius: 12 }}>{unreadCount}</span>}
                </h1>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        style={{
                            fontSize: 13,
                            color: "var(--mtc-red)",
                            background: "none",
                            border: "none",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        อ่านทั้งหมดแล้ว
                    </button>
                )}
            </header>

            {/* Alerts List */}
            <main className="animate-fade-in" style={{ padding: "16px" }}>
                {alerts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-tertiary)" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔕</div>
                        <p>ไม่มีการแจ้งเตือนในขณะนี้</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="mtc-card"
                                style={{
                                    display: "flex",
                                    overflow: "hidden",
                                    background: alert.read ? "white" : "#FFF8F8", // Highlight unread
                                    border: alert.read ? "none" : "1px solid #FFEBEE",
                                    position: "relative",
                                }}
                            >
                                {/* Status Indicator */}
                                <div
                                    style={{
                                        width: 5,
                                        background: alert.color,
                                    }}
                                />

                                <div style={{ padding: "16px", flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: alert.color,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5
                                        }}>
                                            {alert.type}
                                        </span>
                                        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                                            {alert.date}
                                        </span>
                                    </div>

                                    <h3 style={{
                                        fontSize: 15,
                                        fontWeight: alert.read ? 600 : 700,
                                        color: "var(--text-primary)",
                                        marginBottom: 4
                                    }}>
                                        {alert.title}
                                    </h3>

                                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                                        {alert.message}
                                    </p>
                                </div>

                                {/* Delete Button (Swipe Mock) */}
                                <button
                                    onClick={() => deleteAlert(alert.id)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        padding: "0 12px",
                                        color: "#BDBDBD",
                                        cursor: "pointer",
                                        fontSize: 18,
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
