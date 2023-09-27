"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "@/actions/profile";
import { UserProfileFormKey } from "@/types/userProfile";
import { toast } from "sonner";
import { getCurrentUser, getIdTokenNoParam } from "@/utils";
import { getUserRole } from "@/actions/userInfo";
import { useUser } from "@/context/userContext";
import { profileExists } from "@/userContextUtils";

export default function ProfileForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    residentialAddress: "",
    profession: "",
    gender: "",
    summary: "",
  });

  // To store the URL strings for file fields
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userInfo = useUser().user;

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = () => {
      try {
        setLoading(true);

        setFormData({
          firstName: userInfo?.firstName || "",
          middleName: userInfo?.middleName || "",
          lastName: userInfo?.lastName || "",
          phoneNumber: userInfo?.phoneNumber || "",
          emailAddress: userInfo?.emailAddress || "",
          residentialAddress: userInfo?.residentialAddress || "",
          profession: userInfo?.profession || "",
          gender: userInfo?.gender || "",
          summary: userInfo?.summary || "",
        });

        // Store URLs for file fields
        if (userInfo?.profilePhoto) {
          setProfilePhotoUrl(userInfo?.profilePhoto);
        }

        if (userInfo?.resume) {
          setResumeUrl(userInfo.resume);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Type the change event for input, textarea, or select elements
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Type the change event for file inputs
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (name === "profilePhoto") {
          setProfilePhotoUrl(event.target?.result as string);
        } else if (name === "resume") {
          setResumeUrl(event.target?.result as string);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Type the submit event for a form element
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await getCurrentUser();
      const userId = user?.uid;

      // Prepare form data for API call
      const profileFormData: Record<string, string> = {};

      // Add all text form fields
      Object.keys(formData).forEach((key) => {
        profileFormData[key] = formData[key as UserProfileFormKey];
      });

      // Get file inputs
      const profilePhotoInput = document.getElementById(
        "profilePhoto"
      ) as HTMLInputElement | null;
      let profilePhotoFile: File | undefined = undefined;
      if (profilePhotoInput?.files && profilePhotoInput.files[0]) {
        profilePhotoFile = profilePhotoInput.files[0];
      }

      const resumeInput = document.getElementById(
        "resume"
      ) as HTMLInputElement | null;
      let resumeFile: File | undefined = undefined;
      if (resumeInput?.files && resumeInput.files[0]) {
        resumeFile = resumeInput.files[0];
      }

      // If we have existing profile data, update it, otherwise create new
      if (profileExists(userInfo)) {
        // Call the update function
        const result = await updateUserProfile(
          userId!,
          formData,
          profilePhotoFile,
          resumeFile
        );

        if (result.error) {
          throw new Error(result.error);
        }
        console.log("success");
        toast.success("Profile updated successfully 🎉");
        // router.push("/dashboard");
      } else {
        // Call the create function (assuming it has a similar interface)
        const result = await createUserProfile(
          userId!,
          formData,
          profilePhotoFile,
          resumeFile
        );

        if (result.error) {
          throw new Error(result.error);
        }
        toast.success("Profile created successfully 🎉");
        // router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error managing profile:", error);
      toast.error(error.message || "Failed to save profile. Please try again.");
      setError(error.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && formData.firstName === "") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {profileExists(userInfo) ? "Your Profile" : "Complete Your Profile"}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name
            </label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number*
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address*
            </label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Residential Address*
          </label>
          <textarea
            name="residentialAddress"
            value={formData.residentialAddress}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profession*
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender*
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">LGBTQ+</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="A brief summary about yourself, your experience, and what you're looking for..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Photo
          </label>
          <input
            id="profilePhoto"
            type="file"
            name="profilePhoto"
            onChange={handleFileChange}
            accept="image/jpeg,image/jpg,image/png"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {profilePhotoUrl && (
            <div className="mt-2">
              <img
                src={profilePhotoUrl}
                alt="Profile preview"
                className="h-24 w-24 object-cover rounded-full"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume/CV
          </label>
          <input
            id="resume"
            type="file"
            name="resume"
            onChange={handleFileChange}
            accept=".pdf"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {resumeUrl && (
            <div className="mt-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Current Resume (PDF)
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
