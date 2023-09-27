export interface JobPost {
  id: string;
  employer_id: string;
  job_title: string;
  type_of_work: string;
  employer_name?: string;
  place_of_work?: string;
  location?: {
    city?: string;
    state?: string;
    district?: string;
    pincode?: string;
  };
  vacancies?: number;
  special_woman_provision?: boolean;
  special_transgender_provision?: boolean;
  special_disability_provision?: boolean;
  wage?: string;
  hours_per_week?: number;
  job_duration?: string;
  start_time?: string;
  end_time?: string;
  job_role_description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobPostForm {
  id: string;
  employer_id: string;
  job_title: string;
  type_of_work: string;
  employer_name?: string;
  place_of_work?: string;
  city?: string;
  state?: string;
  district?: string;
  pincode?: string;
  vacancies?: number;
  special_woman_provision?: boolean;
  special_transgender_provision?: boolean;
  special_disability_provision?: boolean;
  wage?: string;
  hours_per_week?: number;
  job_duration?: string;
  start_time?: string;
  end_time?: string;
  job_role_description?: string;
  createdAt?: string;
  updatedAt?: string;
}
