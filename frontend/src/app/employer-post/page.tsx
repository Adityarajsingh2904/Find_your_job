"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Briefcase,
  Banknote,
  Calendar,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
  Users,
  Edit,
  Trash2,
  Filter,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import WorkerRequestCard from "@/components/WorkerRequest";

interface JobLocation {
  city?: string;
  state?: string;
  district?: string;
  pincode?: string;
}

interface Job {
  id: string;
  employer_id: string;
  job_title: string;
  type_of_work: string;
  employer_name?: string;
  place_of_work?: string;
  location?: JobLocation;
  vacancies?: number;
  special_woman_provision?: boolean;
  special_transgender_provision?: boolean;
  wage?: string;
  hours_per_week?: number;
  job_duration?: string;
  start_time?: string;
  end_time?: string;
  job_role_description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Worker request interface
interface WorkerRequest {
  id: string;
  job_id: string;
  worker_id: string;
  worker_name: string;
  worker_contact?: string;
  worker_location?: string;
  is_woman?: boolean;
  is_lgbtq?: boolean;
  is_disabled?: boolean;
  experience?: string;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

// Mock data for worker requests (in a real app, this would come from localStorage or an API)
const mockWorkerRequests: WorkerRequest[] = [
  {
    id: "req1",
    job_id: "job1",
    worker_id: "worker1",
    worker_name: "Priya Sharma",
    worker_contact: "+91 9876543210",
    worker_location: "Mumbai, Maharashtra",
    is_woman: true,
    is_lgbtq: false,
    is_disabled: false,
    experience: "3 years in construction",
    message: "I'm interested in this position and have relevant experience.",
    status: "pending",
    createdAt: "2023-03-15T10:30:00Z",
  },
  {
    id: "req2",
    job_id: "job1",
    worker_id: "worker2",
    worker_name: "Raj Kumar",
    worker_contact: "+91 8765432109",
    worker_location: "Delhi, NCR",
    is_woman: false,
    is_lgbtq: false,
    is_disabled: true,
    experience: "5 years in similar roles",
    message: "I have extensive experience and am available immediately.",
    status: "accepted",
    createdAt: "2023-03-16T09:15:00Z",
  },
  {
    id: "req3",
    job_id: "job2",
    worker_id: "worker3",
    worker_name: "Alex Fernandes",
    worker_contact: "+91 7654321098",
    worker_location: "Bangalore, Karnataka",
    is_woman: false,
    is_lgbtq: true,
    is_disabled: false,
    experience: "2 years of relevant experience",
    message: "Looking forward to joining your team.",
    status: "pending",
    createdAt: "2023-03-17T14:45:00Z",
  },
  {
    id: "req4",
    job_id: "job3",
    worker_id: "worker4",
    worker_name: "Meera Patel",
    worker_contact: "+91 6543210987",
    worker_location: "Ahmedabad, Gujarat",
    is_woman: true,
    is_lgbtq: false,
    is_disabled: false,
    experience: "1 year experience",
    message: "I'm a quick learner and hard worker.",
    status: "rejected",
    createdAt: "2023-03-18T11:20:00Z",
  },
  {
    id: "req5",
    job_id: "job2",
    worker_id: "worker5",
    worker_name: "Vikram Singh",
    worker_contact: "+91 5432109876",
    worker_location: "Jaipur, Rajasthan",
    is_woman: false,
    is_lgbtq: false,
    is_disabled: false,
    experience: "4 years experience",
    message: "Interested in this opportunity.",
    status: "pending",
    createdAt: "2023-03-19T16:10:00Z",
  },
];

export default function EmployerPostsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [workerRequests, setWorkerRequests] = useState<WorkerRequest[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [requestFilters, setRequestFilters] = useState({
    women: false,
    lgbtq: false,
    disabled: false,
    status: "all",
  });

  // Fetch jobs from localStorage
  useEffect(() => {
    const fetchJobs = () => {
      try {
        const savedJobs = localStorage.getItem("jobs");
        if (savedJobs) {
          const parsedJobs = JSON.parse(savedJobs);
          // In a real app, filter jobs by employer_id
          // const employerJobs = parsedJobs.filter(job => job.employer_id === currentEmployerId);
          setJobs(parsedJobs);
          setFilteredJobs(parsedJobs);
        }

        // In a real app, fetch worker requests from localStorage or API
        // For now, use mock data
        setWorkerRequests(mockWorkerRequests);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Use setTimeout to simulate loading and avoid hydration issues
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter jobs based on search term and filter type
  useEffect(() => {
    let result = [...jobs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.job_title?.toLowerCase().includes(term) ||
          job.place_of_work?.toLowerCase().includes(term)
      );
    }

    if (filterType && filterType !== "all") {
      result = result.filter((job) => job.type_of_work === filterType);
    }

    setFilteredJobs(result);
  }, [searchTerm, filterType, jobs]);

  // Get filtered worker requests
  const getFilteredRequests = () => {
    let filtered = [...workerRequests];

    // Filter by selected job
    if (selectedJobId) {
      filtered = filtered.filter((req) => req.job_id === selectedJobId);
    }

    // Apply category filters
    if (requestFilters.women) {
      filtered = filtered.filter((req) => req.is_woman);
    }

    if (requestFilters.lgbtq) {
      filtered = filtered.filter((req) => req.is_lgbtq);
    }

    if (requestFilters.disabled) {
      filtered = filtered.filter((req) => req.is_disabled);
    }

    // Apply status filter
    if (requestFilters.status !== "all") {
      filtered = filtered.filter((req) => req.status === requestFilters.status);
    }

    return filtered;
  };

  // Get job title by ID
  const getJobTitle = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    return job ? job.job_title : "Unknown Job";
  };

  // Handle request status change
  const handleStatusChange = (
    requestId: string,
    newStatus: "accepted" | "rejected" | "pending"
  ) => {
    setWorkerRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );

    // In a real app, update localStorage or make API call
    // localStorage.setItem("jobRequests", JSON.stringify(updatedRequests));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType(null);
  };

  // Reset request filters
  const resetRequestFilters = () => {
    setRequestFilters({
      women: false,
      lgbtq: false,
      disabled: false,
      status: "all",
    });
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          Employer Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your job posts and worker applications
        </p>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>My Job Posts</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Worker Requests</span>
          </TabsTrigger>
        </TabsList>

        {/* Job Posts Tab */}
        <TabsContent value="posts">
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job posts by title or location..."
                  className="pl-10 border-blue-200 focus-visible:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="w-full sm:w-48">
                <Select
                  value={filterType || "all"}
                  onValueChange={(value) => setFilterType(value)}
                >
                  <SelectTrigger className="border-blue-200 focus-visible:ring-blue-500">
                    <div className="flex items-center">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Job Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                asChild
              >
                <Link href="/">
                  <span>Post New Job</span>
                </Link>
              </Button>

              {(searchTerm || (filterType && filterType !== "all")) && (
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Job Posts */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className={`overflow-hidden transition-all hover:shadow-md ${
                    job.special_woman_provision
                      ? "border-l-4 border-l-pink-500"
                      : job.special_transgender_provision
                      ? "border-l-4 border-l-purple-500"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-2 relative">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg sm:text-xl pr-16">
                        {job.job_title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 h-8 w-8"
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/job-post-form?edit=${job.id}`}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Post</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Post</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Building2 className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {job.employer_name || "Your Company"}
                      </span>
                    </div>
                    <div className="absolute top-12 right-4 flex flex-col sm:flex-row gap-1">
                      {job.special_woman_provision && (
                        <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300">
                          Women
                        </Badge>
                      )}
                      {job.special_transgender_provision && (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                          LGBTQ+
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {job.place_of_work ||
                            (job.location
                              ? `${job.location.city || ""} ${
                                  job.location.state || ""
                                }`.trim()
                              : "Location not provided")}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
                        <Badge
                          variant="outline"
                          className="font-normal rounded-sm"
                        >
                          {job.type_of_work}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                        <Banknote className="h-4 w-4 mr-1 flex-shrink-0" />
                        {job.wage || "Salary not provided"}
                      </div>
                      {job.createdAt && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      )}

                      {/* Worker requests count */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-blue-600">
                          <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>
                            {
                              workerRequests.filter(
                                (req) => req.job_id === job.id
                              ).length
                            }{" "}
                            applications
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 -mr-2"
                          onClick={() => {
                            setSelectedJobId(job.id);
                            document.getElementById("requests-tab")?.click();
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Link href={`/job/${job.id}`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full hover:bg-blue-50"
                      >
                        <span>View Details</span>
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-blue-800 mb-2">
                No job posts found
              </h3>
              <p className="text-blue-600 mb-6">
                {jobs.length === 0
                  ? "You haven't posted any jobs yet."
                  : "No jobs match your current filters."}
              </p>
              {jobs.length === 0 ? (
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/job-post-form">Post Your First Job</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Worker Requests Tab */}
        <TabsContent value="requests" id="requests-tab">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Job filter */}
              <div className="w-full sm:w-64">
                <Select
                  value={selectedJobId || "all"}
                  onValueChange={(value) =>
                    setSelectedJobId(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="border-blue-200 focus-visible:ring-blue-500">
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by Job" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.job_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status filter */}
              <div className="w-full sm:w-48">
                <Select
                  value={requestFilters.status}
                  onValueChange={(value: any) =>
                    setRequestFilters({ ...requestFilters, status: value })
                  }
                >
                  <SelectTrigger className="border-blue-200 focus-visible:ring-blue-500">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category filters */}
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="women"
                          checked={requestFilters.women}
                          onCheckedChange={(checked) =>
                            setRequestFilters({
                              ...requestFilters,
                              women: checked === true,
                            })
                          }
                          className="border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white"
                        />
                        <label
                          htmlFor="women"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Women
                        </label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show only women applicants</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lgbtq"
                          checked={requestFilters.lgbtq}
                          onCheckedChange={(checked) =>
                            setRequestFilters({
                              ...requestFilters,
                              lgbtq: checked === true,
                            })
                          }
                          className="border-purple-300 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white"
                        />
                        <label
                          htmlFor="lgbtq"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          LGBTQ+
                        </label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show only LGBTQ+ applicants</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="disabled"
                          checked={requestFilters.disabled}
                          onCheckedChange={(checked) =>
                            setRequestFilters({
                              ...requestFilters,
                              disabled: checked === true,
                            })
                          }
                          className="border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                        />
                        <label
                          htmlFor="disabled"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Disabled
                        </label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show only disabled applicants</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Reset filters */}
              {(selectedJobId ||
                requestFilters.women ||
                requestFilters.lgbtq ||
                requestFilters.disabled ||
                requestFilters.status !== "all") && (
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={resetRequestFilters}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>

          {/* Worker Requests List */}
          <div className="space-y-4">
            {getFilteredRequests().length > 0 ? (
              getFilteredRequests().map((request) => (
                <WorkerRequestCard
                  key={request.id}
                  request={request}
                  jobTitle={getJobTitle(request.job_id)}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-medium text-blue-800 mb-2">
                  No worker requests found
                </h3>
                <p className="text-blue-600 mb-6">
                  {workerRequests.length === 0
                    ? "You haven't received any job applications yet."
                    : "No applications match your current filters."}
                </p>
                {workerRequests.length > 0 && (
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-100"
                    onClick={resetRequestFilters}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
