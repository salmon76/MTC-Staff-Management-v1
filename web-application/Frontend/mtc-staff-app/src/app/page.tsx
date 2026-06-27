"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MTCLogo from "@/components/MTCLogo";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Login Page (Entry Point)
 *
 * Flow from Activity Diagram:
 * 1. User opens LIFF → Get line_user_id from LINE
 * 2. Check user in Database
 * 3. Found & Registered → Login success → Show main menu
 * 4. Not Found → Redirect to Registration
 */

type LoginState = "initializing" | "checking" | "not-found" | "success" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>("initializing");
  const [userName, setUserName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    handleLogin();
  }, []);

  async function handleLogin() {
    try {
      setState("initializing");

      // Step 1: Initialize LIFF & get LINE user ID
      // In production, uncomment and use real LIFF:
      // const { initializeLiff, getLiffProfile } = await import("@/lib/liff");
      // const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";
      // const isInit = await initializeLiff(liffId);
      // if (!isInit) return;
      // const profile = await getLiffProfile();

      // Simulate LIFF initialization delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock profile for demo
      const profile = {
        userId: "U_demo_user_001",
        displayName: "Demo User",
      };

      if (!profile) {
        setState("error");
        setErrorMessage("ไม่สามารถดึงข้อมูลจาก LINE ได้");
        return;
      }

      // Step 2: Check user in database
      setState("checking");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock database check
      // In production, call API: const res = await fetch(`/api/users/check?lineUserId=${profile.userId}`);
      const isRegistered = false; // Change to true to test success flow

      if (isRegistered) {
        // Step 3: Found & Registered → Login Success
        setUserName(profile.displayName);
        setState("success");
      } else {
        // Step 4: Not Found → Redirect to Registration
        setState("not-found");
        // Small delay for UX before redirect
        await new Promise((resolve) => setTimeout(resolve, 800));
        router.push("/register");
      }
    } catch (err) {
      console.error("Login error:", err);
      setState("error");
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
    }
  }

  // Loading / Initializing state
  if (state === "initializing") {
    return <LoadingScreen message="กำลังเชื่อมต่อกับ LINE..." />;
  }

  // Checking database state
  if (state === "checking") {
    return <LoadingScreen message="กำลังตรวจสอบข้อมูลสมาชิก..." />;
  }

  // Not found - redirecting
  if (state === "not-found") {
    return <LoadingScreen message="กำลังนำไปยังหน้าลงทะเบียน..." />;
  }

  // Login success
  if (state === "success") {
    return (
      <div
        className="bg-gradient-mtc"
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          className="animate-fade-in-scale"
          style={{
            textAlign: "center",
            maxWidth: 340,
          }}
        >
          {/* Success Icon */}
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
              boxShadow: "0 8px 30px rgba(22, 163, 74, 0.3)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M9 18L15 24L27 12"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            สวัสดี, {userName}! 👋
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            ยินดีต้อนรับกลับเข้าสู่ระบบ
            <br />
            พอร์ทัลบุคลากรคริสตจักรไมตรีจิต
          </p>

          <button
            className="mtc-btn-primary"
            id="go-to-main-btn"
            style={{ width: "100%", padding: "16px 32px" }}
            onClick={() => {
              // Navigate to main menu
              router.push("/dashboard");
            }}
          >
            เข้าสู่แดชบอร์ด
          </button>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div
      className="bg-gradient-mtc"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="animate-fade-in-up"
        style={{
          textAlign: "center",
          maxWidth: 340,
        }}
      >
        <MTCLogo size={72} className="" />
        <div style={{ height: 24 }} />

        {/* Error Icon */}
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
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 4L2 24H26L14 4Z"
              fill="#DC2626"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M14 12V17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="14" cy="20" r="1.2" fill="white" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          เกิดข้อผิดพลาด
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          {errorMessage}
        </p>

        <button
          className="mtc-btn-primary"
          id="retry-login-btn"
          onClick={() => handleLogin()}
          style={{ width: "100%", padding: "16px 32px" }}
        >
          ลองใหม่อีกครั้ง
        </button>

        <p
          style={{
            marginTop: 20,
            fontSize: 13,
            color: "var(--text-tertiary)",
          }}
        >
          หากยังพบปัญหา กรุณาติดต่อผู้ดูแลระบบ
        </p>
      </div>
    </div>
  );
}
