"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  unreadCount: number
  online: boolean
  type: string
}

interface ConversationListProps {
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
}

export default function ConversationList({ conversations, onSelectConversation }: ConversationListProps) {
  return (
    <div className="space-y-1 p-2 overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={cn(
            "flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors",
            conversation.unreadCount > 0 ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-100",
          )}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="relative">
            <Avatar className="h-12 w-12 border border-blue-100">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                {conversation.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {conversation.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-gray-900 truncate">{conversation.name}</h3>
              <span className="text-xs text-gray-500">{conversation.time}</span>
            </div>
            <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
          </div>

          {conversation.unreadCount > 0 && (
            <div className="flex-shrink-0 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">{conversation.unreadCount}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

