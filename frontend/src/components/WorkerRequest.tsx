import { Badge, Briefcase, MapPin, User } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { DialogHeader } from "./ui/dialog";

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

export default function WorkerRequestCard({
  request,
  jobTitle,
  onStatusChange,
}: {
  request: WorkerRequest;
  jobTitle: string;
  onStatusChange: (
    requestId: string,
    status: "accepted" | "rejected" | "pending"
  ) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Determine card border color based on worker category
  const getBorderColor = () => {
    if (request.is_woman) return "border-l-4 border-l-pink-500";
    if (request.is_lgbtq) return "border-l-4 border-l-purple-500";
    if (request.is_disabled) return "border-l-4 border-l-blue-500";
    return "";
  };

  // Get status badge color
  const getStatusBadge = () => {
    switch (request.status) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${getBorderColor()}`}
    >
      <CardHeader className="pb-2 relative">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {request.worker_name}
              <div className="flex gap-1 mt-1">
                {request.is_woman && (
                  <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                    Women
                  </Badge>
                )}
                {request.is_lgbtq && (
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                    LGBTQ+
                  </Badge>
                )}
                {request.is_disabled && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    Disabled
                  </Badge>
                )}
              </div>
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Applied for:{" "}
              <span className="font-medium text-blue-600">{jobTitle}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            <div className="text-xs text-muted-foreground">
              {new Date(request.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{request.worker_location || "Location not provided"}</span>
          </div>
          {request.experience && (
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{request.experience}</span>
            </div>
          )}
          {request.message && (
            <div className="text-sm border-l-2 border-blue-200 pl-3 py-1 italic">
              "{request.message}"
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Worker Profile</DialogTitle>
              <DialogDescription>
                Detailed information about {request.worker_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{request.worker_name}</h3>
                  <div className="flex gap-1 mt-1">
                    {request.is_woman && (
                      <Badge className="bg-pink-100 text-pink-700">Women</Badge>
                    )}
                    {request.is_lgbtq && (
                      <Badge className="bg-purple-100 text-purple-700">
                        LGBTQ+
                      </Badge>
                    )}
                    {request.is_disabled && (
                      <Badge className="bg-blue-100 text-blue-700">
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {request.worker_location || "Location not provided"}
                  </span>
                </div>
                {request.worker_contact && (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 text-muted-foreground"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{request.worker_contact}</span>
                  </div>
                )}
                {request.experience && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{request.experience}</span>
                  </div>
                )}
              </div>

              {request.message && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Message from applicant:
                  </h4>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {request.message}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {request.status === "pending" ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onStatusChange(request.id, "rejected")}
            >
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onStatusChange(request.id, "accepted")}
            >
              Accept
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 hover:bg-blue-50"
            onClick={() => onStatusChange(request.id, "pending")}
          >
            Change Status
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
