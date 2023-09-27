"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function ChatLink() {
  return (
    <Link href="/chat">
      <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-sm">
        <MessageSquare className="h-4 w-4" />
        <span>Chat with Assistant</span>
      </Button>
    </Link>
  );
}
