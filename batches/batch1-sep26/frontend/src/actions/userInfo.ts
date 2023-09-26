"use client";

import { getCurrentUser, getIdTokenNoParam } from "@/utils";
import { getUserProfile } from "./profile";

interface GetRoleResponse {
  role?: string;
  error?: string;
}

export async function getUserRole(): Promise<GetRoleResponse> {
  try {
    const idToken = await getIdTokenNoParam();
    const user = await getCurrentUser();
    const userId = user?.uid;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!idToken) {
      throw new Error("Authentication token is required");
    }

    const payload = {
      userId,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-role`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || "Failed to fetch user role",
      };
    }

    return {
      role: data.role,
    };
  } catch (error) {
    console.error("Error fetching user role:", error);
    return {
      error: "An error occurred while fetching the user role",
    };
  }
}

export async function getUserInfo() {
  try {
    const role = await getUserRole();
    const userProfile = await getUserProfile();

    if (userProfile.profileExists) {
      return { ...role, ...userProfile.profile };
    } else {
      return { ...role };
    }
  } catch (error) {
    console.error("Error occured while fetching userInfo");
  }
}
