// utils/auth.ts
"use client";

import { getUserInfo } from "./actions/userInfo";
import { useUser } from "./context/userContext";
import { User } from "./types/userContext";
import { getCurrentUser } from "./utils";

// Example function to fetch user data from an API
export async function fetchUserData(): Promise<User> {
  try {
    const response = await fetch("/api/user");
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// Function to handle user logout
export async function logoutUser() {
  try {
    // Call your logout API endpoint if needed
    await fetch("/api/logout", { method: "POST" });
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
}

export async function getAndSetUserInfo(setUser: (user: User | null) => void) {
  try {
    const user = await getCurrentUser();

    if (user) {
      // User is authenticated, set the user data in context
      const userInfo = await getUserInfo();

      const userData: User = {
        role: userInfo?.role || "",
        emailAddress: userInfo?.emailAddress || "",
        firstName: userInfo?.firstName || "",
        lastName: userInfo?.lastName || "",
        middleName: userInfo?.middleName || "",
        gender: userInfo?.gender || "",
        phoneNumber: userInfo?.phoneNumber || "",
        profession: userInfo?.profession || "",
        residentialAddress: userInfo?.residentialAddress || "",
        summary: userInfo?.summary || "",
        profilePhoto: userInfo?.profilePhoto || "",
        resume: userInfo?.resume || "",
      };

      setUser(userData);
    } else {
      // User is not authenticated, ensure user context is cleared
      setUser(null);
    }
  } catch (error) {
    console.error("Error getting and setting the userInfo:", error);
    // On error, ensure user context is cleared
    setUser(null);
  }
}

export const profileExists = (user: User | null): boolean => {
  if (user?.firstName) {
    return true;
  }
  return false;
};
