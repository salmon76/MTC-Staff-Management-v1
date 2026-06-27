"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStaffDetail } from "@/app/actions/staff";
import { Staff } from "@/types";

// Status config
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    online: { label: "ออนไลน์", color: "#2E7D32", bg: "#E8F5E9" },
    meeting: { label: "กำลังประชุม", color: "#C62828", bg: "#FFEBEE" },
    leave: { label: "ลาพักงาน", color: "#E65100", bg: "#FFF3E0" },
    offline: { label: "ออฟไลน์", color: "#616161", bg: "#F5F5F5" },
    busy: { label: "ยุ่ง", color: "#6A1B9A", bg: "#F3E5F5" },
};

const DEPT_LABELS: Record<string, string> = {
    Pastoral: "งานอภิบาล",
    Office: "ธุรการ",
    Worship: "งานนมัสการ",
    Education: "งานการศึกษา",
};

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "13px 0",
                borderBottom: "1px solid var(--border-light)",
            }}
        >
            <div
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: "var(--mtc-red-bg)",
                    color: "var(--mtc-red)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <p
                    style={{
                        fontSize: 10,
                        color: "var(--text-tertiary)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: 3,
                    }}
                >
                    {label}
                </p>
                <p
                    style={{
                        fontSize: 15,
                        color: "var(--text-primary)",
                        fontWeight: 500,
                        wordBreak: "break-word",
                        lineHeight: 1.4,
                    }}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

export default function StaffDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [staff, setStaff] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        let active = true;

        async function fetchDetail() {
            try {
                const data = await getStaffDetail(id);
                if (active) {
                    setStaff(data as any);
                }
            } catch (err) {
                console.error("Failed to fetch staff details:", err);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        fetchDetail();

        return () => {
            active = false;
        };
    }, [id]);

    if (isLoading) {
        return (
            <div
                style={{
                    minHeight: "100dvh",
                    background: "var(--background)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span className="mtc-spinner" style={{ width: 32, height: 32, borderColor: "var(--mtc-red) transparent var(--mtc-red) transparent" }} />
            </div>
        );
    }

    if (!staff) {
        return (
            <div
                style={{
                    minHeight: "100dvh",
                    background: "var(--background)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    padding: 24,
                }}
            >
                <p style={{ fontSize: 16, color: "var(--text-secondary)" }}>ไม่พบข้อมูลบุคลากร</p>
                <button
                    onClick={() => router.back()}
                    className="mtc-btn-primary"
                    style={{ width: "auto" }}
                >
                    ย้อนกลับ
                </button>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[staff.status] ?? STATUS_CONFIG.offline;
    const initials = staff.name.split(" ").slice(-1)[0]?.charAt(0) ?? staff.name.charAt(0);

    return (
        <div
            style={{
                minHeight: "100dvh",
                background: "var(--background)",
                paddingBottom: 48,
            }}
        >
            {/* ===== HERO HEADER ===== */}
            <div
                style={{
                    background: `linear-gradient(160deg, ${staff.avatarBg ?? "#C62828"} 0%, ${staff.avatarBg ?? "#C62828"}dd 70%, ${staff.avatarBg ?? "#C62828"}88 100%)`,
                    position: "relative",
                    overflow: "hidden",
                    paddingTop: "env(safe-area-inset-top, 0px)",
                    // Extend down for the curve to fit
                    paddingBottom: 40,
                    marginBottom: 16,
                    zIndex: 0,
                }}
            >
                {/* Curve SVG Bottom */}
                <div
                    style={{
                        position: "absolute",
                        bottom: -1,
                        left: 0,
                        right: 0,
                        width: "100%",
                        lineHeight: 0,
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                >
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 48 }}>
                        <path d="M0,120 Q600,-20 1200,120 Z" fill="var(--background)" />
                    </svg>
                </div>

                {/* Decorative circles */}
                <div
                    style={{
                        position: "absolute",
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.07)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: -20,
                        right: 40,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                        pointerEvents: "none",
                    }}
                />

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    aria-label="Back"
                    style={{
                        position: "absolute",
                        top: "calc(env(safe-area-inset-top, 0px) + 12px)",
                        left: 16,
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.18)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "none",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 10,
                    }}
                >
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                {/* Avatar + Name */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        paddingTop: 64,
                        paddingBottom: 28,
                        gap: 14,
                    }}
                >
                    {/* Avatar */}
                    <div style={{ position: "relative" }}>
                        <div
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                                background: staff.avatarBg ?? "#EF5350",
                                color: staff.avatarColor ?? "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 38,
                                fontWeight: 800,
                                border: "4px solid rgba(255,255,255,0.55)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
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
                                initials
                            )}
                        </div>
                        {/* Status ring */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: 4,
                                right: 4,
                                background: statusCfg.color,
                                border: "3px solid white",
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                            }}
                        />
                    </div>

                    {/* Name + Role */}
                    <div style={{ textAlign: "center", paddingInline: 20 }}>
                        <h1
                            style={{
                                fontSize: 26,
                                fontWeight: 800,
                                color: "white",
                                marginBottom: 4,
                                textShadow: "0 2px 10px rgba(0,0,0,0.18)",
                                lineHeight: 1.2,
                            }}
                        >
                            {staff.name}
                        </h1>
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                            {staff.role}
                        </p>

                        {/* Chips */}
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                justifyContent: "center",
                                marginTop: 12,
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: "var(--radius-full)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    background: "rgba(255,255,255,0.22)",
                                    color: "white",
                                    backdropFilter: "blur(6px)",
                                    WebkitBackdropFilter: "blur(6px)",
                                }}
                            >
                                {DEPT_LABELS[staff.department] ?? staff.department}
                            </span>
                            <span
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: "var(--radius-full)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    background: statusCfg.bg,
                                    color: statusCfg.color,
                                }}
                            >
                                ● {statusCfg.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>


            {/* ===== DETAIL CARDS ===== */}
            <div
                className="app-container"
                style={{ marginTop: 16 }}
            >
                {/* Info Card */}
                <div className="mtc-card animate-fade-in-up" style={{ padding: "4px 20px 4px" }}>
                    {/* Bio */}
                    {staff.bio && (
                        <div
                            style={{
                                padding: "16px 0",
                                borderBottom: "1px solid var(--border-light)",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: 10,
                                    color: "var(--text-tertiary)",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.07em",
                                    marginBottom: 8,
                                }}
                            >
                                ประวัติส่วนตัว
                            </p>
                            <p
                                style={{
                                    fontSize: 14,
                                    color: "var(--text-secondary)",
                                    lineHeight: 1.75,
                                }}
                            >
                                {staff.bio}
                            </p>
                        </div>
                    )}

                    <InfoRow
                        icon={
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        }
                        label="เบอร์โทรศัพท์"
                        value={staff.phone ?? "N/A"}
                    />

                    {staff.email && (
                        <InfoRow
                            icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            }
                            label="อีเมล"
                            value={staff.email}
                        />
                    )}

                    {staff.lineId && (
                        <InfoRow
                            icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--mtc-red)">
                                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.443 24 10.314" />
                                </svg>
                            }
                            label="ไลน์ไอดี"
                            value={staff.lineId}
                        />
                    )}

                    {staff.joinedDate && (
                        <InfoRow
                            icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            }
                            label="วันที่เริ่มงาน"
                            value={staff.joinedDate}
                        />
                    )}

                    {staff.birthday && (
                        <InfoRow
                            icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            }
                            label="วันเกิด"
                            value={staff.birthday}
                        />
                    )}

                    {staff.address && (
                        <InfoRow
                            icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            }
                            label="ที่อยู่"
                            value={staff.address}
                        />
                    )}
                </div>

                {/* Skills */}
                {staff.skills && staff.skills.length > 0 && (
                    <div
                        className="mtc-card animate-fade-in-up delay-100"
                        style={{ marginTop: 14, padding: 20 }}
                    >
                        <p
                            style={{
                                fontSize: 10,
                                color: "var(--text-tertiary)",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                marginBottom: 14,
                            }}
                        >
                            ทักษะและพันธกิจ
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {staff.skills.map((skill) => (
                                <span
                                    key={skill}
                                    style={{
                                        padding: "7px 14px",
                                        borderRadius: "var(--radius-full)",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        background: "var(--mtc-red-bg)",
                                        color: "var(--mtc-red)",
                                        border: "1px solid rgba(198,40,40,0.12)",
                                    }}
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
