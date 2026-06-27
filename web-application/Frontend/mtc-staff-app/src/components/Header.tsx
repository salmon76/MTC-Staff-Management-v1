"use client";

import React from "react";
import Image from "next/image";

interface HeaderProps {
    userName?: string;
    avatarUrl?: string; // If no avatar, use Initials
    onMenuClick?: () => void;
    onSearchClick?: () => void;
}

export default function Header({
    userName = "Staff",
    avatarUrl,
    onMenuClick,
    onSearchClick,
}: HeaderProps) {
    return (
        <header
            className="safe-area-top"
            style={{
                background: "var(--background)",
                padding: "16px 20px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                zIndex: 50,
            }}
        >
            {/* Search Button (Left) */}
            <button
                onClick={onSearchClick}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                }}
                aria-label="Search"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </button>

            {/* User Info (Center) */}
            <div style={{ textAlign: "center" }}>
                <p
                    style={{
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-tertiary)",
                        marginBottom: 2,
                    }}
                >
                    {new Date().toLocaleDateString('th-TH', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                    })}
                </p>
                <h2
                    style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                    }}
                >
                    คริสตจักรไมตรีจิต
                    <span
                        style={{
                            display: "inline-block",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "var(--mtc-red)",
                        }}
                    />
                </h2>
            </div>

            {/* Menu / Avatar Button (Right) */}
            <button
                onClick={onMenuClick}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    overflow: "hidden",
                }}
                aria-label="User Menu"
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Profile"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            background: "var(--mtc-red-bg)",
                            color: "var(--mtc-red)",
                            fontSize: 14,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {userName.charAt(0)}
                    </div>
                )}
            </button>
        </header>
    );
}
