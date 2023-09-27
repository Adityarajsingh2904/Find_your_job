"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/userContext";
import { Loader2 } from "lucide-react";
import { getAndSetUserInfo } from "@/userContextUtils";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getIdTokenNoParam } from "@/utils";

interface AuthStateManagerProps {
  children: React.ReactNode;
}

export default function AuthStateManager({ children }: AuthStateManagerProps) {
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await getAndSetUserInfo(setUser);
      } catch (error) {
        console.error("Error checking authentication status:", error);
        // On error, ensure user context is cleared
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [setUser]);

  // You can optionally add a loading state or just return children immediately
  // Returning children immediately means your UI will render before auth check completes
  return (
    <>
      {isLoading ? (
        <div className="h-screen w-screen flex justify-center items-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className={cn("w-full", isAuthPage ? "" : "md:pt-16")}>
          {children}
        </div>
      )}
    </>
  );
}
