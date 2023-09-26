"use client";

import {
  UpdateProfileResponse,
  UserProfile,
  UserProfileFormData,
  UserProfileResponse,
} from "@/types/userProfile";
import { getCurrentUser, getIdTokenNoParam } from "@/utils";

export async function getUserProfile() {
  const idToken = await getIdTokenNoParam();
  const user = await getCurrentUser();
  const userId = user?.uid;

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!idToken) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    console.log("response = ", response);

    // Special handling for 404 - profile doesn't exist yet
    if (response.status === 404) {
      console.log("Profile doesn't exist (404 response)");
      return { profileExists: false };
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    const profileData: UserProfile = await response.json();
    console.log("profile = ", profileData);
    return { profileExists: true, profile: profileData };
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
}

/**
 * Creates a user profile by sending form data to the backend
 *
 * @param userId - The ID of the user to create a profile for
 * @param formData - The form data containing text fields
 * @param profilePhotoFile - Optional profile photo file
 * @param resumeFile - Optional resume PDF file
 * @returns Promise with success status, profile data (if successful), and any error message
 */

export const createUserProfile = async (
  userId: string,
  formData: UserProfileFormData,
  profilePhotoFile?: File,
  resumeFile?: File
): Promise<UserProfileResponse> => {
  try {
    // Create FormData object for multipart/form-data request
    const multipartFormData = new FormData();

    // Add all text fields from the form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        multipartFormData.append(key, value.toString());
      }
    });

    // Add profile photo if provided
    if (profilePhotoFile) {
      multipartFormData.append("profilePhoto", profilePhotoFile);
    }

    // Add resume if provided
    if (resumeFile) {
      multipartFormData.append("resume", resumeFile);
    }

    const idToken = await getIdTokenNoParam();

    // Send the request to the backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile/${userId}`,
      {
        method: "POST",
        body: multipartFormData,
        headers: {
          // Don't set Content-Type header for multipart/form-data
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Failed with status code: ${response.status}`,
      };
    }

    return {
      success: true,
      profile: data.profile as UserProfile,
    };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

export const updateUserProfile = async (
  userId: string,
  formData: UserProfileFormData,
  profilePhotoFile?: File,
  resumeFile?: File
): Promise<UpdateProfileResponse> => {
  const idToken = await getIdTokenNoParam();

  if (!userId || !idToken) {
    throw new Error("User ID and authentication token are required");
  }

  // Create a multipart form-data object
  const multipartFormData = new FormData();

  // Add all text fields to form data
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined) {
      multipartFormData.append(key, value);
    }
  });

  // Add files if provided
  if (profilePhotoFile) {
    multipartFormData.append("profilePhoto", profilePhotoFile);
  }

  if (resumeFile) {
    multipartFormData.append("resume", resumeFile);
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          // Don't set Content-Type header when using FormData as fetch sets it automatically with boundary
        },
        body: multipartFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update profile");
    }

    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
