"use client";

import React, { useState } from "react";
import BottomNav from "@/components/BottomNav";

// Mock data for the schedule
const ALL_SCHEDULES = [
    { id: 1, title: "Morning Prayer", time: "06:00", staff: "Pastor Somchai", color: "#EF5350", date: 12 },
    { id: 2, title: "Youth Meeting", time: "14:00", staff: "John Doe", color: "#42A5F5", date: 12 },
    { id: 3, title: "Building Maintenance", time: "09:00", staff: "Wichai", color: "#66BB6A", date: 13 },
    { id: 4, title: "Worship Practice", time: "18:00", staff: "John Doe", color: "#AB47BC", date: 14 },
    { id: 5, title: "Sunday Service Prep", time: "10:00", staff: "Pastor Somchai", color: "#EF5350", date: 15 },
    { id: 6, title: "Choir Rehearsal", time: "16:00", staff: "Sarah", color: "#FFA726", date: 15 },
    { id: 7, title: "Counseling", time: "13:00", staff: "John Doe", color: "#26C6DA", date: 16 },
];

export default function SchedulePage() {
    const [isAdmin, setIsAdmin] = useState(true);
    const currentUser = "John Doe";

    const filteredSchedules = isAdmin 
        ? ALL_SCHEDULES 
        : ALL_SCHEDULES.filter(s => s.staff === currentUser);

    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="page-wrapper bg-gradient-mtc">
            <header className="page-header safe-area-top">
                <div className="page-header-inner">
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--mtc-red)", letterSpacing: "-0.02em" }}>
                            MTC Schedule
                        </h1>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Role Toggle Mockup */}
                    <button 
                        onClick={() => setIsAdmin(!isAdmin)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "var(--radius-full)",
                            background: isAdmin ? "var(--mtc-red)" : "var(--surface)",
                            color: isAdmin ? "white" : "var(--text-primary)",
                            border: `1px solid ${isAdmin ? "transparent" : "var(--border)"}`,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: isAdmin ? "var(--shadow-red-sm)" : "none",
                            transition: "all var(--transition-base)"
                        }}
                    >
                        {isAdmin ? "Admin View" : "Staff View"}
                    </button>
                </div>
            </header>

            <main className="app-container animate-fade-in" style={{ paddingTop: 20 }}>
                {/* Calendar Legend */}
                <div style={{ display: "flex", gap: 16, marginBottom: 20, overflowX: "auto", paddingBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF5350" }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>Worship</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#42A5F5" }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>Meeting</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#66BB6A" }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>Mission</span>
                    </div>
                </div>

                {/* Monthly Grid */}
                <div 
                    style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(7, 1fr)", 
                        gap: 8,
                        background: "var(--surface)",
                        padding: 12,
                        borderRadius: "var(--radius-xl)",
                        boxShadow: "var(--shadow-md)",
                        border: "1px solid var(--border-light)"
                    }}
                >
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                        <div key={idx} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", paddingBottom: 8 }}>
                            {day}
                        </div>
                    ))}
                    
                    {/* Empty days padding (assuming month starts on fixed day for mockup) */}
                    {Array.from({ length: 4 }).map((_, i) => <div key={`empty-${i}`} />)}

                    {daysInMonth.map(day => {
                        const dayEvents = filteredSchedules.filter(s => s.date === day);
                        const isToday = day === 12;

                        return (
                            <div 
                                key={day} 
                                style={{ 
                                    aspectRatio: "1/1",
                                    borderRadius: "var(--radius-md)",
                                    border: `1px solid ${isToday ? "var(--mtc-red-soft)" : "var(--border-light)"}`,
                                    background: isToday ? "var(--mtc-red-bg)" : "transparent",
                                    padding: 4,
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-start"
                                }}
                            >
                                <span style={{ 
                                    fontSize: 12, 
                                    fontWeight: isToday ? 800 : 500, 
                                    color: isToday ? "var(--mtc-red)" : "var(--text-primary)",
                                    marginBottom: 4
                                }}>
                                    {day}
                                </span>
                                <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                                    {dayEvents.map(event => (
                                        <div 
                                            key={event.id} 
                                            style={{ 
                                                width: 6, 
                                                height: 6, 
                                                borderRadius: "50%", 
                                                background: event.color,
                                                boxShadow: `0 0 4px ${event.color}40`
                                            }} 
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Event Details for Selected Day (Mock: Day 12) */}
                <div style={{ marginTop: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                            Today's Agenda
                        </h2>
                        <span style={{ fontSize: 13, color: "var(--mtc-red)", fontWeight: 600 }}>12 June 2026</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {filteredSchedules.filter(s => s.date === 12).map(event => (
                            <div 
                                key={event.id}
                                className="mtc-card"
                                style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    padding: "16px",
                                    gap: 16
                                }}
                            >
                                <div style={{ 
                                    width: 48, 
                                    textAlign: "center", 
                                    borderRight: "1px solid var(--border-light)",
                                    paddingRight: 16
                                }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>{event.time}</div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>AM</div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                                        {event.title}
                                    </h3>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {isAdmin && (
                                            <div style={{ 
                                                fontSize: 11, 
                                                padding: "2px 8px", 
                                                background: "var(--surface-secondary)", 
                                                borderRadius: 4,
                                                color: "var(--text-secondary)",
                                                fontWeight: 600
                                            }}>
                                                👤 {event.staff}
                                            </div>
                                        )}
                                        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                            📍 Main Sanctuary
                                        </div>
                                    </div>
                                </div>

                                <div style={{ width: 12, height: 12, borderRadius: "50%", background: event.color }} />
                            </div>
                        ))}

                        {filteredSchedules.filter(s => s.date === 12).length === 0 && (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-tertiary)" }}>
                                <p>No assignments for today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
