"use server";

import { prisma } from "@/lib/prisma";

export async function getStaffList(searchTerm = "", departmentFilter = "All") {
  try {
    const whereClause: any = {};

    // 1. Apply search term filter
    if (searchTerm.trim()) {
      whereClause.name = {
        contains: searchTerm.trim(),
        mode: "insensitive", // case-insensitive search
      };
    }

    // 2. Apply department chip filter
    if (departmentFilter === "Pastors") {
      whereClause.department = "Pastoral";
    } else if (departmentFilter === "Office") {
      whereClause.department = "Office";
    } else if (departmentFilter === "Others") {
      whereClause.department = {
        notIn: ["Pastoral", "Office"],
      };
    }

    const staffList = await prisma.staff.findMany({
      where: whereClause,
      orderBy: {
        id: "asc",
      },
    });

    // Plain object conversion to prevent serialization issues with Date objects
    return staffList.map((staff) => ({
      ...staff,
      createdAt: staff.createdAt.toISOString(),
      updatedAt: staff.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error in getStaffList action:", error);
    throw new Error("Failed to fetch staff list");
  }
}

export async function getStaffDetail(id: string) {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) return null;

    return {
      ...staff,
      createdAt: staff.createdAt.toISOString(),
      updatedAt: staff.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error in getStaffDetail action:", error);
    throw new Error("Failed to fetch staff details");
  }
}

// Maps registration code to staff ID for demo
const CODE_TO_STAFF_MAP: Record<string, string> = {
  "MC-1837-0001": "staff-1",
  "MC-1837-0002": "staff-2",
  "MC-1837-1234": "staff-3",
};

export async function registerStaffAction(code: string, lineUserId = "@demo.user") {
  try {
    const codeUpper = code.trim().toUpperCase();
    const staffId = CODE_TO_STAFF_MAP[codeUpper];

    if (!staffId) {
      return { success: false, error: "invalid-code" };
    }

    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return { success: false, error: "invalid-code" };
    }

    // Check if already registered (e.g. already has a lineId assigned that is not the default demo one)
    if (staff.lineId && staff.lineId !== `@rev.somchai` && staff.lineId !== `@pas.mana` && staff.lineId !== `@suda.ngam` && staff.lineId !== lineUserId) {
      return { success: false, error: "already-registered" };
    }

    // Update staff record with LINE ID
    const updatedStaff = await prisma.staff.update({
      where: { id: staffId },
      data: {
        lineId: lineUserId,
        status: "online", // Set status to online upon registration
      },
    });

    return {
      success: true,
      staff: {
        ...updatedStaff,
        createdAt: updatedStaff.createdAt.toISOString(),
        updatedAt: updatedStaff.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error in registerStaffAction:", error);
    return { success: false, error: "server-error" };
  }
}
