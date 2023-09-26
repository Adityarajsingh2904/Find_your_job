"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  Search,
  Loader2,
  X,
  ChevronRight,
  Banknote,
  SlidersHorizontal,
} from "lucide-react";
import { useJobPosts } from "@/hooks/jobPostHook";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

export function JobsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [inclusivityFilter, setInclusivityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { jobPosts, loading, error } = useJobPosts({
    limit: 50,
    // Optional: Pass other parameters as needed
  });

  // Get unique cities from job locations for filtering
  const locations = Array.from(
    new Set(jobPosts.map((job) => job.location?.city).filter(Boolean))
  );

  // Filter jobs based on search and filters
  const filteredJobs = jobPosts.filter((job) => {
    const matchesSearch =
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.employer_name &&
        job.employer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.type_of_work.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      locationFilter === "all"
        ? true
        : job.location?.city?.includes(locationFilter);

    const matchesType =
      typeFilter === "all" ? true : job.type_of_work === typeFilter;

    // Using explicit boolean checks for each inclusivity option
    const matchesInclusivity = (() => {
      if (inclusivityFilter === "all") return true;
      if (inclusivityFilter === "women-friendly")
        return job.special_woman_provision === true;
      if (inclusivityFilter === "lgbt-friendly")
        return job.special_transgender_provision === true;
      if (inclusivityFilter === "disability-friendly")
        return job.special_disability_provision === true;
      return false;
    })();

    return (
      matchesSearch && matchesLocation && matchesType && matchesInclusivity
    );
  });

  const resetFilters = () => {
    setLocationFilter("all");
    setTypeFilter("all");
    setInclusivityFilter("all");
    setSearchTerm("");
  };

  const hasActiveFilters =
    locationFilter !== "all" ||
    typeFilter !== "all" ||
    inclusivityFilter !== "all" ||
    searchTerm !== "";

  const activeFilterCount =
    (locationFilter !== "all" ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (inclusivityFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
            Find Your Perfect Job
          </h2>

          {/* Search bar with mobile filter button */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search jobs..."
              className="pl-10 pr-12 h-12 text-base bg-white dark:bg-gray-950 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Mobile filter button using Sheet component */}
            <div className="absolute right-1 top-1 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-md"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="h-[80vh] sm:h-[60vh] rounded-t-xl"
                >
                  <SheetHeader className="mb-4">
                    <SheetTitle>Filter Jobs</SheetTitle>
                    <SheetDescription>
                      Refine your job search with these filters
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 overflow-y-auto pb-16">
                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile-location"
                        className="text-sm font-medium"
                      >
                        Location
                      </Label>
                      <Select
                        value={locationFilter}
                        onValueChange={setLocationFilter}
                      >
                        <SelectTrigger
                          id="mobile-location"
                          className="bg-white dark:bg-gray-950"
                        >
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          {locations.map((loc, index) => (
                            <SelectItem key={index} value={loc!}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile-type"
                        className="text-sm font-medium"
                      >
                        Job Type
                      </Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger
                          id="mobile-type"
                          className="bg-white dark:bg-gray-950"
                        >
                          <SelectValue placeholder="All types" />
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

                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile-inclusivity"
                        className="text-sm font-medium"
                      >
                        Inclusivity
                      </Label>
                      <Select
                        value={inclusivityFilter}
                        onValueChange={setInclusivityFilter}
                      >
                        <SelectTrigger
                          id="mobile-inclusivity"
                          className="bg-white dark:bg-gray-950"
                        >
                          <SelectValue placeholder="All jobs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All jobs</SelectItem>
                          <SelectItem value="women-friendly">
                            Women-friendly
                          </SelectItem>
                          <SelectItem value="disability-friendly">
                            Disability-friendly
                          </SelectItem>
                          <SelectItem value="lgbt-friendly">
                            LGBTQ+-friendly
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <div className="flex w-full gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={resetFilters}
                      >
                        Reset
                      </Button>
                      <SheetClose asChild>
                        <Button className="flex-1">Apply Filters</Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop filters */}
          <div className="mt-4 hidden md:grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger
                  id="location"
                  className="bg-white dark:bg-gray-950"
                >
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((loc, index) => (
                    <SelectItem key={index} value={loc!}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Job Type
              </Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type" className="bg-white dark:bg-gray-950">
                  <SelectValue placeholder="All types" />
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

            <div className="space-y-2">
              <Label htmlFor="inclusivity" className="text-sm font-medium">
                Inclusivity
              </Label>
              <Select
                value={inclusivityFilter}
                onValueChange={setInclusivityFilter}
              >
                <SelectTrigger
                  id="inclusivity"
                  className="bg-white dark:bg-gray-950"
                >
                  <SelectValue placeholder="All jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All jobs</SelectItem>
                  <SelectItem value="women-friendly">Women-friendly</SelectItem>
                  <SelectItem value="disability-friendly">
                    Disability-friendly
                  </SelectItem>
                  <SelectItem value="lgbt-friendly">LGBTQ+-friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-1"
                  >
                    <span className="max-w-[100px] sm:max-w-none truncate">
                      "{searchTerm}"
                    </span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchTerm("")}
                    />
                  </Badge>
                )}
                {locationFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    <span className="max-w-[80px] sm:max-w-none truncate">
                      {locationFilter}
                    </span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setLocationFilter("all")}
                    />
                  </Badge>
                )}
                {typeFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-1"
                  >
                    <Briefcase className="h-3 w-3" />
                    <span>{typeFilter}</span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setTypeFilter("all")}
                    />
                  </Badge>
                )}
                {inclusivityFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-1"
                  >
                    <span>{inclusivityFilter}</span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setInclusivityFilter("all")}
                    />
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-12 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            Error loading jobs. Please try again later.
          </p>
        </div>
      ) : (
        <>
          {filteredJobs.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {filteredJobs.length}
                  </span>{" "}
                  jobs
                </p>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="relevance">Relevance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                            Disability-friendly
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
                                ? [job.location.city, job.location.state]
                                    .filter(Boolean)
                                    .join(", ")
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
                            Posted{" "}
                            {new Date(job.createdAt).toLocaleDateString()}
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

              <div className="flex justify-center mt-6 sm:mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-4 sm:px-8 font-medium"
                >
                  Load More Jobs
                  <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-0" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-10 sm:py-16 bg-muted/30 rounded-lg">
              <div className="max-w-md mx-auto space-y-4 px-4">
                <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="text-lg sm:text-xl font-semibold">
                  No jobs found
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  No jobs match your current search criteria. Try adjusting your
                  filters or search terms.
                </p>
                <Button onClick={resetFilters} className="mt-4">
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4" />
        </div>
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}
