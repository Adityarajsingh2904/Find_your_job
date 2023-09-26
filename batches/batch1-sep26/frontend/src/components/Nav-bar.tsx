"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  User,
  BriefcaseBusiness,
  Users,
  Bot,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/userContext";
import { signOut } from "@/actions/auth";
import Image from "next/image";

// Add profileOpen state
export function NavigationBar() {
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { user } = useUser();

  const userType = user?.role || "worker";
  const pathname = usePathname();

  if (pathname == "/auth") return null;

  // Update the workerTabs and employerTabs to remove the Profile tab
  // We'll handle it separately
  const workerTabs = [
    { name: "Home", icon: Home, path: "/" },
    { name: "AI", icon: Bot, path: "/chat" },
    {
      name: "Applied Jobs",
      icon: BriefcaseBusiness,
      path: "/applied-jobs",
    },
    { name: "Community", icon: Users, path: "/community" },
  ];

  const employerTabs = [
    { name: "Home", icon: Home, path: "/" },
    { name: "AI", icon: Bot, path: "/chat" },
    { name: "Posts", icon: BriefcaseBusiness, path: "/employer-post" },
  ];

  const tabs = userType === "worker" ? workerTabs : employerTabs;

  // Update the handleTabClick function to handle profile click
  const handleTabClick = (tab: any) => {
    router.push(tab.path);
  };

  // Add a new return statement with the profile avatar and both sheets
  return (
    <>
      <nav
        className={cn(
          "fixed z-50 w-full bg-background border-t md:border-b md:border-t-0 border-border",
          isDesktop ? "top-0" : "bottom-0"
        )}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo for desktop */}
            {isDesktop && (
              <div className="flex-shrink-0 py-4">
                <Image src="/logo.jpeg" alt="" width={150} height={150}/>
              </div>
            )}

            <div
              className={cn(
                "flex w-full",
                isDesktop ? "justify-end space-x-8" : "justify-between"
              )}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabClick(tab)}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 px-2 md:px-4 md:py-4 md:flex-row md:space-x-2 relative group",
                    "transition-colors hover:text-primary",
                    "flex-1 md:flex-initial"
                  )}
                >
                  <tab.icon className="h-6 w-6 md:h-5 md:w-5" />
                  <span className="text-xs mt-1 md:text-sm md:mt-0 hidden md:block">
                    {tab.name}
                  </span>
                </button>
              ))}

              {/* Profile Avatar Button */}
              <button
                onClick={() => setProfileOpen(true)}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-2 md:px-4 md:py-4 relative group",
                  "transition-colors hover:text-primary",
                  "flex-1 md:flex-initial"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      user?.profilePhoto ||
                      "/placeholder.svg?height=32&width=32"
                    }
                    alt="Profile"
                  />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Sheet */}
      <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <NotificationList />
        </SheetContent>
      </Sheet>

      {/* Profile Sheet */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
          <ProfileContent setProfileOpen={setProfileOpen} />
        </SheetContent>
      </Sheet>

      {/* Spacer to prevent content from being hidden under the navbar */}
      <div className={cn("h-16 md:h-16", isDesktop ? "mt-0" : "mb-0")} />
    </>
  );
}

// Add the ProfileContent component
function ProfileContent({
  setProfileOpen,
}: {
  setProfileOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const { user, setUser } = useUser();

  const handleProfileClick = () => {
    router.push("/profile");
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Handle logout logic here
      console.log("Logging out...");
      // In a real app, you would call your auth service logout method
      await signOut();
      router.push("/auth");
      setProfileOpen(false);
      setUser(null);
    } catch (error) {
      console.error("error while siging out");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={user?.profilePhoto || "/placeholder.svg?height=32&width=32"}
            alt="Profile"
          />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-lg">{user?.firstName}</h3>
          <p className="text-sm text-muted-foreground">{user?.emailAddress}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleProfileClick}
        >
          <User className="mr-2 h-4 w-4" />
          View Profile
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

function NotificationList() {
  const notifications = [
    {
      id: 1,
      title: "New job match",
      description: "A new job matching your skills has been posted",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Application update",
      description: "Your application has been reviewed",
      time: "Yesterday",
      read: true,
    },
    {
      id: 3,
      title: "Message from employer",
      description: "You have a new message from ABC Construction",
      time: "2 days ago",
      read: true,
    },
  ];

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No notifications
        </p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-4 rounded-lg border",
              notification.read ? "bg-background" : "bg-muted"
            )}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{notification.title}</h3>
              <span className="text-xs text-muted-foreground">
                {notification.time}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.description}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
