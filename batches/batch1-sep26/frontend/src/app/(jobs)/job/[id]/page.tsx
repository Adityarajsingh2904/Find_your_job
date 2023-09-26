"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Briefcase, Calendar, Clock, MapPin, Users, Banknote, Building } from "lucide-react"
import { getJobPostById } from "@/actions/jobPost"
import { useEffect, useState } from "react"
import type { JobPost } from "@/types/jobpost"
import GoogleMapDialog from "@/components/google-map-dialog"

export default function JobDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [job, setJob] = useState<JobPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [applied, setApplied] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false) // state to toggle the map dialog

  useEffect(() => {
    async function loadJob() {
      try {
        const jobData = await getJobPostById(id)
        if (!jobData) {
          setError(true)
          return
        }
        setJob(jobData)
      } catch (err) {
        console.error("Error fetching job:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [id])

  if (loading) {
    return <LoadingState />
  }

  if (error || !job) {
    return <ErrorState />
  }

  const formattedLocation = job.location
    ? [
        job.location.city,
        job.location.district,
        job.location.state,
        job.location.pincode,
      ]
        .filter(Boolean)
        .join(", ")
    : null

  const handleApply = () => {
    if (typeof window !== "undefined") {
      // Get existing jobs from localStorage
      const existingJobs = JSON.parse(localStorage.getItem("jobs") || "[]")

      // Append new job data
      const updatedJobs = [...existingJobs, job]

      // Save back to localStorage
      localStorage.setItem("jobs", JSON.stringify(updatedJobs))
      setApplied(true)
    }
  }

  // Determine the location string to pass to the map dialog.
  const mapLocation = (job.place_of_work || "") + ", " + (formattedLocation || "")
  console.log(mapLocation)

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to all jobs
      </Link>

      <Card className="mb-6 border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">{job.job_title}</CardTitle>
              {job.employer_name && (
                <div className="flex items-center text-muted-foreground mt-2">
                  <Building className="h-4 w-4 mr-1" />
                  <span>{job.employer_name}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-medium">
                {job.type_of_work}
              </Badge>
              {job.special_woman_provision && (
                <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300">
                  Women-Friendly
                </Badge>
              )}
              {job.special_transgender_provision && (
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                  Transgender-Friendly
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-muted-foreground">
                    {job.place_of_work || "Not specified"}
                    {formattedLocation && <span> - {formattedLocation}</span>}
                  </p>
                  <Button
                    onClick={() => setIsMapOpen(true)}
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-blue-200"
                  >
                    View Map
                  </Button>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Vacancies</h3>
                  <p className="text-muted-foreground">{job.vacancies || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Duration</h3>
                  <p className="text-muted-foreground">{job.job_duration || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Banknote className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Wage</h3>
                  <p className="text-green-600 font-semibold">{job.wage || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Working Hours</h3>
                  <p className="text-muted-foreground">
                    {job.hours_per_week ? `${job.hours_per_week} hours/week` : "Not specified"}
                    {job.start_time && job.end_time && (
                      <span className="block mt-1">
                        {job.start_time} - {job.end_time}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Job Description
            </h3>
            <div className="bg-muted/30 rounded-lg p-5 leading-relaxed">
              {job.job_role_description ? (
                <p>{job.job_role_description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description provided.</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-2 pb-6 px-6">
          <Button
            onClick={handleApply}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-6 sm:py-2 text-base"
          >
            {applied ? "✔ Applied" : "Apply Now"}
          </Button>
        </CardFooter>
      </Card>

      {job.createdAt && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Posted on {new Date(job.createdAt).toLocaleDateString()}
          {job.updatedAt &&
            job.updatedAt !== job.createdAt &&
            ` • Updated on ${new Date(job.updatedAt).toLocaleDateString()}`}
        </p>
      )}

      {/* Google Map Dialog */}
      <GoogleMapDialog
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        location={mapLocation}
        title="Job Location"
      />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <div className="flex items-center text-sm font-medium mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" />
        <span>Back to all jobs</span>
      </div>

      <Card className="mb-6 border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start">
                <Skeleton className="h-5 w-5 mr-2 mt-0.5" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div>
            <div className="flex items-center mb-3">
              <Skeleton className="h-6 w-6 mr-2" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-2 pb-6 px-6">
          <Skeleton className="h-12 w-full sm:w-32" />
          <Skeleton className="h-12 w-full sm:w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to all jobs
      </Link>

      <Card className="border-none shadow-lg text-center py-12">
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600 dark:text-red-400 h-6 w-6"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Job Not Found</h2>
            <p className="text-muted-foreground max-w-md">
              We couldn't find the job you're looking for. It may have been removed or the link might be incorrect.
            </p>
            <Button asChild className="mt-4">
              <Link href="/jobs">Browse All Jobs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
