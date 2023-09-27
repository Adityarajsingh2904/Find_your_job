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
  Loader2,
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
import type { JobPost } from "@/types/jobpost";

interface JobLocation {
  city?: string;
  state?: string;
  district?: string;
  pincode?: string;
}

export default function AppliedJobs() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);

  useEffect(() => {
    // Retrieve jobs from localStorage
    const fetchJobs = () => {
      try {
        const savedJobs = localStorage.getItem("jobs");
        if (savedJobs) {
          const parsedJobs = JSON.parse(savedJobs);
          setJobs(parsedJobs);
          setFilteredJobs(parsedJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs from localStorage:", error);
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

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.job_title?.toLowerCase().includes(term) ||
          job.employer_name?.toLowerCase().includes(term) ||
          job.place_of_work?.toLowerCase().includes(term) ||
          job.location?.city?.toLowerCase().includes(term)
      );
    }

    // Apply job type filter
    if (filterType) {
      result = result.filter((job) => job.type_of_work === filterType);
    }

    setFilteredJobs(result);
  }, [searchTerm, filterType, jobs]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Applied Jobs</h1>
        <p className="text-muted-foreground">
          View and manage all the jobs you've applied for
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, company or location..."
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
              value={filterType || ""}
              onValueChange={(value) => setFilterType(value || null)}
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

          {(searchTerm || filterType) && (
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

      {/* Job Cards */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className={`overflow-hidden transition-all hover:shadow-md group ${
                job.special_woman_provision
                  ? "border-l-4 border-l-pink-500"
                  : job.special_transgender_provision
                  ? "border-l-4 border-l-purple-500"
                  : job.special_disability_provision
                  ? "border-l-4 border-l-blue-500"
                  : ""
              }`}
            >
              <CardHeader className="pb-2 relative">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg sm:text-xl pr-16 group-hover:text-primary transition-colors">
                    {job.job_title}
                  </CardTitle>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Building2 className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {job.employer_name || "Unknown Employer"}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex flex-col sm:flex-row gap-1">
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
                  {job.special_disability_provision && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                      Disabled
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
                    <Badge variant="outline" className="font-normal rounded-sm">
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
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Link href={`/job/${job.id}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
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
            No jobs found
          </h3>
          <p className="text-blue-600 mb-6">
            {jobs.length === 0
              ? "You haven't applied to any jobs yet."
              : "No jobs match your current filters."}
          </p>
          {jobs.length > 0 && (
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
    </div>
  );
}
