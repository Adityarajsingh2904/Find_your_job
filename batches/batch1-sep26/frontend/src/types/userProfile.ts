// types/userProfile.ts

/**
 * UserProfile interface for frontend use
 * - Removes Firebase-specific types
 * - Uses appropriate types for form handling
 */
export interface UserProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  profilePhoto?: string; // URL to the stored image
  residentialAddress: string;
  resume?: string; // URL to the stored PDF
  profession: string;
  gender: string;
  summary?: string;
  createdAt?: string; // ISO date string when displayed on frontend
  updatedAt?: string; // ISO date string when displayed on frontend
}

/**
 * Form data interface for creating/updating a user profile
 * - Used for handling form data before submission
 */
export interface UserProfileFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  residentialAddress: string;
  profession: string;
  gender: string;
  summary?: string;
}

/**
 * Interface for the file inputs in the form
 */
export interface UserProfileFiles {
  profilePhoto?: File;
  resume?: File;
}

/**
 * Response from the backend after profile creation/update
 */
export interface UserProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

export type UserProfileFormKey =
  | "firstName"
  | "middleName"
  | "lastName"
  | "phoneNumber"
  | "emailAddress"
  | "residentialAddress"
  | "profession"
  | "gender"
  | "summary";

export interface UpdateProfileResponse {
  message?: string;
  updatedFields?: Record<string, any>;
  error?: string;
}
