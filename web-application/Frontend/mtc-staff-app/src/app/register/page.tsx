"use client";

import React, { useState, useRef } from "react";
import MTCLogo from "@/components/MTCLogo";
import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";
import { useRouter } from "next/navigation";
import { registerStaffAction } from "@/app/actions/staff";

/**
 * Registration Page
 *
 * Flow from Activity Diagram:
 * 1. User enters org code (MC-1837-XXXX)
 * 2. Backend validates org code
 * 3. Valid → Check if registered
 *    a. Not registered → Find LINE User by org code → Invite to join → Registration success
 *    b. Already registered → Show already registered
 * 4. Invalid → Show error message
 */

type RegisterState = "idle" | "submitting" | "success" | "error" | "already-registered";

// Demo valid codes for testing
const DEMO_VALID_CODES = ["MC-1837-0001", "MC-1837-0002", "MC-1837-1234"];

export default function RegisterPage() {
    const router = useRouter();
    const [state, setState] = useState<RegisterState>("idle");
    const [code, setCode] = useState("");
    const [isCodeFocused, setIsCodeFocused] = useState(false);
    const [shakeInput, setShakeInput] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Dark mode toggle (decorative like the UI mockup moon icon)
    const [isDark, setIsDark] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        if (!code.trim()) {
            triggerShake();
            return;
        }

        setState("submitting");

        try {
            const res = await registerStaffAction(code, "@demo.user");

            if (res.success) {
                setState("success");
            } else if (res.error === "already-registered") {
                setState("already-registered");
            } else {
                setState("error");
            }
        } catch (err) {
            console.error("Registration error:", err);
            setState("error");
        }
    }

    function triggerShake() {
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
        inputRef.current?.focus();
    }

    function handleRetry() {
        setState("idle");
        setCode("");
        setTimeout(() => inputRef.current?.focus(), 100);
    }

    function handleContinue() {
        // Navigate to main app / dashboard
        router.push("/dashboard");
        // alert("🎉 ลงทะเบียนสำเร็จ! ไปหน้า Dashboard (ยังไม่ได้สร้าง)");
    }

    function formatCodeInput(value: string): string {
        // Auto-format to MC-1837-XXXX pattern
        const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

        if (cleaned.length <= 2) return cleaned;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
        return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    }

    return (
        <>
            <div
                className="bg-gradient-mtc safe-area-top safe-area-bottom"
                style={{
                    minHeight: "100dvh",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative Background Elements */}
                <div
                    style={{
                        position: "absolute",
                        top: -80,
                        right: -80,
                        width: 200,
                        height: 200,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(198,40,40,0.06) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: -120,
                        left: -60,
                        width: 300,
                        height: 300,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(198,40,40,0.04) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                {/* Theme Toggle (decorative) */}
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 10,
                    }}
                >
                    <button
                        id="theme-toggle-btn"
                        onClick={() => setIsDark(!isDark)}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "var(--shadow-sm)",
                            transition: "all var(--transition-fast)",
                            fontSize: 18,
                        }}
                        aria-label="Toggle theme"
                    >
                        {isDark ? "☀️" : "🌙"}
                    </button>
                </div>

                {/* Main Content */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px 24px",
                    }}
                >
                    <div
                        className="animate-fade-in-up"
                        style={{
                            width: "100%",
                            maxWidth: 380,
                            textAlign: "center",
                        }}
                    >
                        {/* Logo */}
                        <div
                            style={{ marginBottom: 8 }}
                            className="animate-fade-in-scale"
                        >
                            <MTCLogo size={72} className="" />
                        </div>

                        {/* Title */}
                        <h1
                            style={{
                                fontSize: 28,
                                fontWeight: 800,
                                color: "var(--text-primary)",
                                marginBottom: 8,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Welcome Staff
                        </h1>

                        {/* Subtitle */}
                        <p
                            style={{
                                fontSize: 14,
                                color: "var(--text-secondary)",
                                lineHeight: 1.6,
                                marginBottom: 40,
                                maxWidth: 280,
                                margin: "0 auto",
                            }}
                        >
                            Please enter your registration code
                            <br />
                            to access the staff portal.
                        </p>

                        {/* Registration Form */}
                        <form
                            onSubmit={handleRegister}
                            style={{
                                marginTop: 40,
                                textAlign: "left",
                            }}
                        >
                            {/* Code Label */}
                            <label htmlFor="registration-code" className="mtc-label">
                                Registration Code
                            </label>

                            {/* Code Input */}
                            <div
                                style={{
                                    position: "relative",
                                    marginBottom: 24,
                                }}
                                className={shakeInput ? "animate-shake" : ""}
                            >
                                {/* Key Icon */}
                                <div
                                    style={{
                                        position: "absolute",
                                        left: 16,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        display: "flex",
                                        alignItems: "center",
                                        pointerEvents: "none",
                                        color: isCodeFocused
                                            ? "var(--mtc-red)"
                                            : "var(--text-tertiary)",
                                        transition: "color var(--transition-fast)",
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
                                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                    </svg>
                                </div>

                                <input
                                    ref={inputRef}
                                    id="registration-code"
                                    type="text"
                                    className={`mtc-input ${state === "error" ? "error" : ""}`}
                                    placeholder="e.g. MC-1837-XXXX"
                                    value={code}
                                    onChange={(e) => setCode(formatCodeInput(e.target.value))}
                                    onFocus={() => setIsCodeFocused(true)}
                                    onBlur={() => setIsCodeFocused(false)}
                                    autoComplete="off"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                    disabled={state === "submitting"}
                                    maxLength={12}
                                    style={{
                                        paddingLeft: 44,
                                        fontFamily: "'Inter', monospace",
                                        fontSize: 16,
                                        letterSpacing: "0.05em",
                                        fontWeight: 600,
                                    }}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="mtc-btn-primary"
                                id="register-btn"
                                disabled={state === "submitting" || !code.trim()}
                                style={{
                                    width: "100%",
                                    padding: "16px 32px",
                                    fontSize: 16,
                                }}
                            >
                                {state === "submitting" ? (
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 12,
                                        }}
                                    >
                                        <span className="mtc-spinner" />
                                        Verifying...
                                    </span>
                                ) : (
                                    "Register"
                                )}
                            </button>
                        </form>

                        {/* Help Link */}
                        <p
                            style={{
                                marginTop: 24,
                                fontSize: 13,
                                color: "var(--text-tertiary)",
                            }}
                        >
                            Need help with your code?{" "}
                            <a
                                href="#"
                                id="help-link"
                                style={{
                                    color: "var(--mtc-red)",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert(
                                        "กรุณาติดต่อผู้ดูแลระบบเพื่อขอรหัสลงทะเบียน\nEmail: admin@maitrichit.org"
                                    );
                                }}
                            >
                                Contact Admin
                            </a>
                        </p>

                        {/* Demo Hint */}
                        <div
                            style={{
                                marginTop: 32,
                                padding: "12px 16px",
                                background: "rgba(198, 40, 40, 0.04)",
                                borderRadius: "var(--radius-md)",
                                border: "1px dashed rgba(198, 40, 40, 0.2)",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: 12,
                                    color: "var(--text-tertiary)",
                                    lineHeight: 1.5,
                                }}
                            >
                                🧪 <strong>Demo Mode:</strong> ลองใช้รหัส{" "}
                                <code
                                    style={{
                                        background: "rgba(198,40,40,0.08)",
                                        padding: "2px 6px",
                                        borderRadius: 4,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "var(--mtc-red)",
                                    }}
                                >
                                    MC-1837-0001
                                </code>{" "}
                                เพื่อทดสอบ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Safe Area */}
                <div
                    style={{
                        textAlign: "center",
                        padding: "16px 24px 24px",
                        fontSize: 11,
                        color: "var(--text-tertiary)",
                    }}
                >
                    Maitrichit Church © 1837 · Staff Portal v0.1
                </div>
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={state === "success"}
                onContinue={handleContinue}
            />

            {/* Error Modal */}
            <ErrorModal isOpen={state === "error"} onRetry={handleRetry} />

            {/* Already Registered Modal */}
            <ErrorModal
                isOpen={state === "already-registered"}
                title="Already Registered"
                message="This staff member is already registered. If you need to link a new LINE account or reset your registration, please contact your administrator."
                buttonText="Go Back"
                onRetry={handleRetry}
            />
        </>
    );
}
