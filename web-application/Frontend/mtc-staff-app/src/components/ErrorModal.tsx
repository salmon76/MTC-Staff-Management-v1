"use client";

import React from "react";

interface ErrorModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    buttonText?: string;
    onRetry: () => void;
}

export default function ErrorModal({
    isOpen,
    title = "รหัสลงทะเบียนไม่ถูกต้อง",
    message = "รหัสที่ป้อนไม่ถูกต้อง กรุณาตรวจสอบรหัสลงทะเบียนของท่านแล้วลองใหม่อีกครั้ง หากยังพบปัญหา กรุณาติดต่อฝ่ายสนับสนุนเพื่อขอความช่วยเหลือ",
    buttonText = "ลองอีกครั้ง",
    onRetry,
}: ErrorModalProps) {
    if (!isOpen) return null;

    return (
        <div className="mtc-overlay" id="error-modal-overlay">
            <div className="mtc-modal" id="error-modal">
                {/* Warning Icon */}
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "var(--error-bg)",
                        border: "2px solid var(--error-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                    }}
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M16 4L2 28H30L16 4Z"
                            fill="#DC2626"
                            stroke="#DC2626"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M16 13V19"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        <circle cx="16" cy="23" r="1.5" fill="white" />
                    </svg>
                </div>

                {/* Title */}
                <h2
                    style={{
                        fontSize: 20,
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
                        maxWidth: 280,
                        margin: "0 auto 28px",
                    }}
                >
                    {message}
                </p>

                {/* Retry Button */}
                <button
                    id="error-retry-btn"
                    onClick={onRetry}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--mtc-red)",
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: "12px 32px",
                        borderRadius: "var(--radius-full)",
                        transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.background = "var(--mtc-red-bg)";
                    }}
                    onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.background = "none";
                    }}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
