"use client";

import React, { useState } from "react";
import Link from "next/link";
import MTCLogo from "./MTCLogo";

export interface DashboardProps {
    userName: string;
}

// Action button component
function ActionButton({
    icon,
    label,
    href,
    color = "secondary",
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
    color?: "primary" | "secondary";
}) {
    const isPrimary = color === "primary";

    return (
        <Link
            href={href}
            className={`mtc-card action-btn ${isPrimary ? "action-btn-primary" : ""}`}
            style={{
                display: "flex",
                flexDirection: isPrimary ? "row" : "column",
                alignItems: isPrimary ? "center" : "flex-start",
                justifyContent: isPrimary ? "flex-start" : "space-between",
                padding: isPrimary ? "28px" : "20px",
                gap: 16,
                textDecoration: "none",
                color: isPrimary ? "white" : "var(--mtc-red)",
                background: isPrimary
                    ? "linear-gradient(135deg, var(--mtc-red), var(--mtc-red-dark))"
                    : "var(--surface)",
                minHeight: isPrimary ? 120 : 140,
                position: "relative",
                overflow: "hidden",
                border: "none",
                boxShadow: isPrimary
                    ? "var(--shadow-red-lg)"
                    : "var(--shadow-sm)",
            }}
        >
            {/* Decorative background for primary */}
            {isPrimary && (
                <div
                    style={{
                        position: "absolute",
                        right: -20,
                        bottom: -20,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.1)",
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Icon Area */}
            <div
                style={{
                    width: isPrimary ? 56 : 48,
                    height: isPrimary ? 56 : 48,
                    borderRadius: isPrimary ? "50%" : "12px",
                    background: isPrimary ? "rgba(255,255,255,0.2)" : "var(--mtc-red-bg)",
                    color: isPrimary ? "white" : "var(--mtc-red)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isPrimary ? 0 : 8,
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>

            {/* Label Area */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    flex: 1,
                }}
            >
                <span
                    style={{
                        fontSize: isPrimary ? 20 : 15,
                        fontWeight: 700,
                        color: isPrimary ? "white" : "var(--text-primary)",
                        lineHeight: 1.2,
                    }}
                >
                    {label}
                </span>
                {isPrimary && (
                    <span
                        style={{
                            fontSize: 13,
                            opacity: 0.8,
                            fontWeight: 500,
                        }}
                    >
                        ตรวจสอบตารางงานและการประชุมของคุณ
                    </span>
                )}
            </div>

            {/* Arrow for primary */}
            {isPrimary && (
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.8 }}
                >
                    <path d="M9 18l6-6-6-6" />
                </svg>
            )}
        </Link>
    );
}

export default function DashboardView({ userName }: DashboardProps) {
    const [showGreeting, setShowGreeting] = useState(true);

    return (
        <div
            className="app-container"
            style={{
                paddingTop: 8,
                paddingBottom: "calc(var(--nav-height) + 16px)",
            }}
        >
            {/* Greeting Card */}
            {showGreeting && (
                <div
                    className="mtc-card animate-fade-in-up"
                    style={{
                        padding: "20px",
                        marginBottom: 24,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        position: "relative",
                        background: "linear-gradient(135deg, white, #FEF2F2)", // Red tint
                        borderLeft: "4px solid var(--mtc-red)",
                    }}
                >
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                        <MTCLogo size={42} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3
                            style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: "var(--mtc-red)",
                                marginBottom: 4,
                            }}
                        >
                            ยินดีต้อนรับกลับมา คุณ {userName}! 🙏
                        </h3>
                        <p
                            style={{
                                fontSize: 13,
                                color: "var(--text-secondary)",
                                lineHeight: 1.5,
                            }}
                        >
                            ตรวจสอบตารางงานด้านล่าง หรือจองทรัพยากรสำหรับงานพันธกิจของคุณ
                        </p>
                    </div>
                    <button
                        onClick={() => setShowGreeting(false)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            padding: 4,
                        }}
                        aria-label="Close"
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
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Grid Layout */}
            <div
                className="animate-fade-in-up delay-100"
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "auto auto", // Two rows
                    gap: 16,
                }}
            >
                {/* Main Action: My Schedule (Span full width) */}
                <div style={{ gridColumn: "1 / -1" }}>
                    <ActionButton
                        href="/schedule"
                        label="ตารางงานของฉัน"
                        color="primary"
                        icon={
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        }
                    />
                </div>

                {/* Action: Car Reserve */}
                <ActionButton
                    href="/reserve/car"
                    label="จองรถคริสตจักร"
                    icon={
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                            <circle cx="6.5" cy="16.5" r="2.5" />
                            <circle cx="16.5" cy="16.5" r="2.5" />
                        </svg>
                    }
                />

                {/* Action: Equipment */}
                <ActionButton
                    href="/equipment"
                    label="จองอุปกรณ์"
                    icon={
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                    }
                />

                {/* Additional Action: Staff Directory */}
                <ActionButton
                    href="/staff"
                    label="ทำเนียบบุคลากร"
                    icon={
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    }
                />

                {/* Additional Action: Request Leave */}
                <ActionButton
                    href="/leave"
                    label="ขออนุมัติลา"
                    icon={
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <path d="M16 14l-4 4" />
                            <path d="M12 14l4 4" />
                        </svg>
                    }
                />
            </div>

            {/* Recent Activity Section (Optional filler) */}
            <div style={{ marginTop: 32 }} className="animate-fade-in-up delay-200">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 16,
                    }}
                >
                    <h3
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                        }}
                    >
                        การแจ้งเตือนวันนี้
                    </h3>
                    <Link
                        href="/alerts"
                        style={{
                            fontSize: 13,
                            color: "var(--mtc-red)",
                            textDecoration: "none",
                            fontWeight: 600,
                        }}
                    >
                        ดูทั้งหมด
                    </Link>
                </div>

                {/* Empty State / No Alerts */}
                <div
                    style={{
                        background: "var(--surface)",
                        borderRadius: "var(--radius-lg)",
                        padding: "24px",
                        textAlign: "center",
                        border: "1px dashed var(--border)",
                    }}
                >
                    <p
                        style={{
                            fontSize: 14,
                            color: "var(--text-tertiary)",
                            fontStyle: "italic",
                        }}
                    >
                        ไม่มีการแจ้งเตือนใหม่ในวันนี้ 🎉
                    </p>
                </div>
            </div>
        </div>
    );
}
