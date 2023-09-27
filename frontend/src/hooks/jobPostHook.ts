import { useState, useEffect } from "react";
import { getJobPosts } from "@/actions/jobPost";
import { JobPost } from "@/types/jobpost";

interface UseJobPostsParams {
  limit?: number;
  employer_id?: string;
  type_of_work?: string;
  enabled?: boolean;
}

export function useJobPosts({
  limit = 50,
  employer_id,
  type_of_work,
  enabled = true,
}: UseJobPostsParams = {}) {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchJobs() {
      if (!enabled) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const posts = await getJobPosts({ limit, employer_id, type_of_work });

        if (isMounted) {
          setJobPosts(posts);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch job posts");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, [limit, employer_id, type_of_work, enabled]);

  return { jobPosts, loading, error };
}
