"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NewChatDialog() {
  const [username, setUsername] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleStartChat = () => {
    if (username.trim()) {
      // In a real app, this would initiate a chat with the user
      console.log("Starting chat with:", username)
      setUsername("")
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
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
            className="mr-1"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="12" x2="12" y1="8" y2="16" />
            <line x1="8" x2="16" y1="12" y2="12" />
          </svg>
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-blue-600">Start a New Conversation</DialogTitle>
          <DialogDescription>Enter the username of the person you want to chat with.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="col-span-3 border-blue-200 focus-visible:ring-blue-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleStartChat} className="bg-blue-600 hover:bg-blue-700" disabled={!username.trim()}>
            Start Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

