"use client";

import React from "react";

interface SuccessModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    buttonText?: string;
    onContinue: () => void;
}

export default function SuccessModal({
    isOpen,
    title = "ยืนยันตัวตนสำเร็จ!",
    message = "รหัสลงทะเบียนของคุณได้รับการยืนยันแล้ว สามารถเข้าใช้งานระบบพอร์ทัลบุคลากรได้เลย",
    buttonText = "เริ่มต้นใช้งาน",
    onContinue,
}: SuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="mtc-overlay" id="success-modal-overlay">
            <div className="mtc-modal" id="success-modal">
                {/* Animated Check Icon */}
                <div
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #16A34A, #22C55E)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        position: "relative",
                    }}
                >
                    {/* Pulse Ring */}
                    <div
                        style={{
                            position: "absolute",
                            inset: -8,
                            borderRadius: "50%",
                            border: "3px solid #16A34A",
                            animation: "pulse-ring 1.5s ease-out infinite",
                            opacity: 0.5,
                        }}
                    />
                    {/* Check SVG */}
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 20L17 27L30 13"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                strokeDasharray: 100,
                                strokeDashoffset: 0,
                                animation: "check-draw 0.6s ease 0.3s forwards",
                            }}
                        />
                    </svg>
                </div>

                {/* Title */}
                <h2
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 12,
                    }}
                >
                    {title}
                </h2>

                {/* Message */}
                <p
                    style={{
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "var(--text-secondary)",
                        marginBottom: 28,
                        maxWidth: 260,
                        margin: "0 auto 28px",
                    }}
                >
                    {message}
                </p>

                {/* Page Dots */}
                <div className="page-dots" style={{ marginBottom: 28 }}>
                    <div className="page-dot active" />
                    <div className="page-dot active" />
                    <div className="page-dot" />
                </div>

                {/* Button */}
                <button
                    className="mtc-btn-primary"
                    id="success-continue-btn"
                    onClick={onContinue}
                    style={{ width: "100%", padding: "16px 32px", fontSize: 16 }}
                >
                    {buttonText}
                </button>

                {/* Help Link */}
                <p
                    style={{
                        marginTop: 16,
                        fontSize: 13,
                        color: "var(--text-tertiary)",
                    }}
                >
                    ต้องการความช่วยเหลือ? ติดต่อฝ่ายสนับสนุน
                </p>
            </div>
        </div>
    );
}
