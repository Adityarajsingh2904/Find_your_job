import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blue Collar Jobs",
  description: "Find blue collar job opportunities with inclusive workplaces",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
