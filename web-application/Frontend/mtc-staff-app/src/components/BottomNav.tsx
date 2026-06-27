"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    {
        label: "หน้าแรก",
        href: "/dashboard",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        label: "บุคลากร",
        href: "/staff",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        label: "อุปกรณ์",
        href: "/equipment",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
    },
    {
        label: "งานซ่อม",
        href: "/tickets",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        ),
    },
    {
        label: "ฉัน",
        href: "/profile",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="safe-area-bottom"
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderTop: "1px solid var(--border-light)",
                zIndex: 100,
                boxShadow: "0 -2px 16px rgba(0,0,0,0.06)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    maxWidth: "var(--app-max-width)",
                    margin: "0 auto",
                    height: "var(--nav-height)",
                    paddingInline: "var(--app-padding)",
                }}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                                textDecoration: "none",
                                color: isActive ? "var(--mtc-red)" : "var(--text-tertiary)",
                                flex: 1,
                                height: "100%",
                                transition: "all var(--transition-fast)",
                            }}
                        >
                            <div
                                style={{
                                    transform: isActive ? "scale(1.1)" : "scale(1)",
                                    transition: "transform var(--transition-spring)",
                                }}
                            >
                                {/* Clone icon to adjust stroke width if active */}
                                {React.cloneElement(item.icon as React.ReactElement<any>, {
                                    strokeWidth: isActive ? 2.5 : 2,
                                })}
                            </div>
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: isActive ? 700 : 500,
                                }}
                            >
                                {item.label}
                            </span>

                            {/* Active Indicator Dot (Optional) */}
                            {isActive && (
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 4,
                                        width: 4,
                                        height: 4,
                                        borderRadius: "50%",
                                        background: "var(--mtc-red)",
                                    }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
