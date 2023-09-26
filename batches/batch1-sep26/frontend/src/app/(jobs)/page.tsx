"use client";

import { useUser } from "@/context/userContext";
import { JobsList } from "./job-list";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, ShipWheelIcon as Wheelchair } from "lucide-react";
import JobPostForm from "@/components/job-post";

export default function JobsPage() {
  const { user } = useUser();
  const userRole = user?.role || "worker"; // Default to worker if role is not available

  // If user is an employer, show the job post form
  if (userRole === "employer") {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="space-y-4 mb-8">
          <h1 className="text-xl font-bold tracking-tight">
            The right <span className="text-blue-500">JOB</span> can change a
            life. The right hire can change a{" "}
            <span className="text-blue-500">BUSINESS</span>.
          </h1>
        </div>

        <JobPostForm />
      </div>
    );
  }

  // Otherwise, show the worker view with job listings
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Blue Collar Job Opportunities
            </h1>
          </div>
          <p className="text-muted-foreground">
            Browse available positions and find the perfect fit for your skills
            and experience.
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 border">
          <h2 className="text-lg font-medium mb-2">Inclusivity Indicators</h2>
          <p className="text-sm text-muted-foreground mb-3">
            We use colored indicators to highlight jobs at workplaces that are
            especially welcoming to different groups:
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <div className="w-3 h-6 bg-pink-500 mr-2 rounded-sm"></div>
              <Badge
                variant="outline"
                className="bg-pink-100 text-pink-700 border-pink-300"
              >
                <Users className="h-3 w-3 mr-1" />
                Women-friendly workplaces
              </Badge>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-6 bg-purple-500 mr-2 rounded-sm"></div>
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-700 border-purple-300"
              >
                <Heart className="h-3 w-3 mr-1" />
                LGBTQ+-friendly workplaces
              </Badge>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-6 bg-blue-500 mr-2 rounded-sm"></div>
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-700 border-blue-300"
              >
                <Wheelchair className="h-3 w-3 mr-1" />
                Disability-friendly workplaces
              </Badge>
            </div>
          </div>
        </div>

        <JobsList />
      </div>
    </div>
  );
}
