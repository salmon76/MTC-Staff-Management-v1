// Enum-like Types for Consistency
export type EventType = "Service" | "Meeting" | "Task" | "Ministry";
export type TaskStatus = "pending" | "in-progress" | "done" | "cancelled";
export type PriorityLevel = "low" | "medium" | "high" | "urgent";
export type StaffStatus = "online" | "offline" | "meeting" | "leave" | "busy";
export type Department = "Pastoral" | "Office" | "Worship" | "Education" | "Maintenance" | "IT" | "Other";

// Staff / User Interface
export interface Staff {
    id: number | string;
    name: string;
    role: string;
    department: Department | string;
    status: StaffStatus;
    phone: string;
    email?: string;
    avatarBg?: string; // Hex color
    avatarColor?: string; // Hex color
    joinedDate?: string;
    bio?: string;
    birthday?: string; // "DD MMM YYYY"
    lineId?: string;
    address?: string;
    skills?: string[];
    avatarUrl?: string; // full URL for photo
}

// Event / Task Interface
export interface EventTask {
    id: number | string;
    title: string;
    date: string; // ISO Date "YYYY-MM-DD"
    time: string; // "HH:MM" or "HH:MM - HH:MM"
    description?: string;
    type: EventType;
    location?: string;
    assignee?: string; // User ID or Name
    status?: TaskStatus; // Only for Type="Task"
    priority?: PriorityLevel; // Only for Type="Task"
    color?: string; // Hex color for calendar
    category?: string; // Master Data ID
}

// Master Data (Dropdown Options)
export interface MasterDataOption {
    id: string;
    label: string;
    value?: string;
    color?: string;
}

export interface AppMasterData {
    categories: MasterDataOption[];
    priorities: MasterDataOption[];
    locations: MasterDataOption[];
    assignees: MasterDataOption[];
}
