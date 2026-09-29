"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import DashboardView from "@/components/DashboardView";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState("Staff");

    useEffect(() => {
        // Simulate data fetching
        const timer = setTimeout(() => {
            setUserName("ธัญวิชญ์ ทีหงัน (Thanyawit Teengan)"); // Mock user from UI
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen message="Loading dashboard..." />;
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--background)",
                paddingBottom: 80, // Space for BottomNav
            }}
        >
            <Header
                userName={userName}
                // Mock Avatar URL
                avatarUrl="https://ui-avatars.com/api/?name=Thanyawit+Teengan&background=EF5350&color=fff"
                onMenuClick={() => alert("Open Menu")}
                onSearchClick={() => alert("Search")}
            />

            <main className="animate-fade-in">
                <DashboardView userName={userName} />
            </main>

            <BottomNav />
        </div>
    );
}
