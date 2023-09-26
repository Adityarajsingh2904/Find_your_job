import { JobPost, JobPostForm } from "@/types/jobpost"; // Import your JobPost interface
import { getIdTokenNoParam } from "@/utils";

export async function getJobPosts({
  limit = 50,
  employer_id,
  type_of_work,
}: {
  limit?: number;
  employer_id?: string;
  type_of_work?: string;
}): Promise<JobPost[]> {
  try {
    // Build the query parameters
    const params = new URLSearchParams();

    if (limit) params.append("limit", limit.toString());
    if (employer_id) params.append("employer_id", employer_id);
    if (type_of_work) params.append("type_of_work", type_of_work);

    const idToken = await getIdTokenNoParam();

    // Make the API request
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/job/all?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch job posts");
    }

    const data = await response.json();
    return data.jobPosts;
  } catch (error) {
    console.error("Error fetching job posts:", error);
    throw error;
  }
}

/**
 * Fetches a job post by its ID from the backend
 * @param jobId - The ID of the job post to fetch
 * @param idToken - The authorization token for authentication
 * @returns The job post data
 */
export async function getJobPostById(jobId: string): Promise<JobPost> {
  try {
    // Ensure we have a job ID
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    const idToken = await getIdTokenNoParam();

    // Ensure we have an ID token
    if (!idToken) {
      throw new Error("Authorization token is required");
    }

    // Make the request to the backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/job/job-post/${jobId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Parse the response
    const data = await response.json();

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch job post");
    }

    return data.jobPost;
  } catch (error) {
    console.error("Error fetching job post:", error);
    throw error;
  }
}

// utils/jobApi.ts

/**
 * Creates a job post by sending data to the backend API
 * @param jobData The job post data
 * @param idToken The Firebase authentication token
 * @param apiUrl The backend API URL (defaults to localhost:3000 for development)
 * @returns Promise with the response data
 */
export async function createJobPost(jobData: JobPostForm): Promise<any> {
  try {
    const idToken = await getIdTokenNoParam();
    // Create a FormData object to send the job post data
    const formData = new FormData();

    // Add all job data fields to the FormData
    Object.entries(jobData).forEach(([key, value]) => {
      if (value !== undefined) {
        // Don't add undefined values
        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value as string);
        }
      }
    });

    // Make the API request
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/job/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create job post");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating job post:", error);
    throw error;
  }
}
