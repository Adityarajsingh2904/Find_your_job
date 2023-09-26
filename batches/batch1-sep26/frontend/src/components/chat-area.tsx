"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { messages } from "@/lib/data"

interface ChatAreaProps {
  employer: {
    id: string
    name: string
    online: boolean
    type: string
    company?: string
    position?: string
  }
}

export default function ChatArea({ employer }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the server
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-blue-100">
            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
              {employer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-gray-900">{employer.name}</h2>
              <span className={cn("h-2 w-2 rounded-full", employer.online ? "bg-green-500" : "bg-gray-300")} />
              <span className="text-xs text-gray-500">{employer.online ? "Online" : "Offline"}</span>
            </div>
            {employer.company && (
              <p className="text-xs text-gray-500">
                {employer.position} at {employer.company}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 5v14" />
                    <path d="M5 5h14" />
                    <path d="M5 14a4 4 0 0 0 4 4h6" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Video Call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voice Call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More Options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isUser = message.sender === "user"
          const showAvatar = index === 0 || messages[index - 1].sender !== message.sender

          return (
            <div key={message.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              <div className={cn("flex items-end gap-2 max-w-[80%]", isUser && "flex-row-reverse")}>
                {!isUser && showAvatar && (
                  <Avatar className="h-8 w-8 border border-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-xs">
                      {employer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}

                {!isUser && !showAvatar && <div className="w-8" />}

                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-full",
                    isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div className={cn("text-xs mt-1", isUser ? "text-blue-100" : "text-gray-500")}>{message.time}</div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} /> {/* Empty div for scrolling to bottom */}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-blue-100">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="pr-10 min-h-[50px] border-blue-200 focus-visible:ring-blue-500"
              aria-multiline="true"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 bottom-2 text-blue-600 hover:text-blue-700 hover:bg-transparent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" x2="9.01" y1="9" y2="9" />
                <line x1="15" x2="15.01" y1="9" y2="9" />
              </svg>
            </Button>
          </div>

          <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 h-[50px] px-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
            Send
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            Photo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13h8" />
              <path d="M8 17h8" />
              <path d="M8 9h1" />
            </svg>
            Document
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <rect width="8" height="8" x="3" y="3" rx="2" />
              <rect width="8" height="8" x="13" y="3" rx="2" />
              <rect width="8" height="8" x="3" y="13" rx="2" />
              <rect width="8" height="8" x="13" y="13" rx="2" />
            </svg>
            Templates
          </Button>
        </div>
      </div>
    </div>
  )
}

