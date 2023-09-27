import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Search Assistant",
  description:
    "Chat with our job search assistant to find the perfect blue collar job",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {children}
    </div>
  );
}
