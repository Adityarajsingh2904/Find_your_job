"use client"

import { useState, useRef, useEffect, type JSX } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User2, Briefcase, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { v4 as uuidv4 } from "uuid"
import ReactMarkdown from "react-markdown"

type MessageRole = "user" | "assistant"

interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  error?: boolean
  isLoading?: boolean
}

const CHUNK_TIMEOUT = 30000 // 30 seconds without data
const MAX_RETRIES = 3

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content: "Hello! I'm your job search assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Refs for streaming
  const eventSourceRef = useRef<EventSource | null>(null)
  const chunkTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef<number>(0)
  const thread_id = useRef<string>(uuidv4())

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Cleanup the stream on component unmount
  useEffect(() => {
    return () => {
      cleanupStream()
    }
  }, [])

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const cleanupStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (chunkTimeoutRef.current) {
      clearTimeout(chunkTimeoutRef.current)
      chunkTimeoutRef.current = null
    }
    setIsLoading(false)
  }

  const startChunkTimeout = (assistantMessageId: string) => {
    if (chunkTimeoutRef.current) {
      clearTimeout(chunkTimeoutRef.current)
    }
    chunkTimeoutRef.current = setTimeout(() => {
      console.error("No data received for 30 seconds")
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: msg.content + "\n[Error: Response timeout - No data received for 30 seconds]",
                error: true,
                isLoading: false,
              }
            : msg,
        ),
      )
      cleanupStream()
    }, CHUNK_TIMEOUT)
  }

  const handleStreamError = (assistantMessageId: string, errorMsg: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: msg.content + `\n[Error: ${errorMsg}]`,
              error: true,
              isLoading: false,
            }
          : msg,
      ),
    )
    cleanupStream()
  }

  // Handle sending a message
  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return

    // Reset any existing stream and retry count
    cleanupStream()
    retryCountRef.current = 0
    setIsLoading(true)

    // Create a new user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    // Create a placeholder assistant message with loading state
    const assistantMessageId = uuidv4()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    }

    // Add both messages to the chat
    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")

    try {
      // Open a connection to your chatbot backend using EventSource
      console.log("before sending request", text)
      const url = `${process.env.NEXT_PUBLIC_CHAT_URL}/api/stream-prompt?thread_id=${
        thread_id.current
      }&prompt=${encodeURIComponent(text)}`
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      let fullMessage = ""

      eventSource.onmessage = (event) => {
        try {
          const content = event.data
          if (content) {
            // Reset the chunk timeout every time data is received
            startChunkTimeout(assistantMessageId)

            // If the backend sends an error message, handle it
            if (content.includes("[Error:")) {
              handleStreamError(assistantMessageId, content)
              return
            }

            // Append the chunk to the full message and update the assistant message
            fullMessage += content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, content: fullMessage, isLoading: false } : msg,
              ),
            )
          }
        } catch (error) {
          console.error("Error processing stream message:", error)
          handleStreamError(assistantMessageId, "Failed to process response")
        }
      }

      eventSource.onerror = (error) => {
        console.error("Stream error:", error)
        retryCountRef.current++
        if (retryCountRef.current >= MAX_RETRIES) {
          handleStreamError(assistantMessageId, "Connection failed after multiple retries")
        }
      }

      // Listen for a custom "done" event to clean up
      eventSource.addEventListener("done", () => {
        cleanupStream()
      })
    } catch (error) {
      console.error("Error connecting to stream:", error)
      handleStreamError(assistantMessageId, "Failed to establish connection")
    }
  }

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Render message content with markdown support
  const renderMessageContent = (content: string): JSX.Element => {
    return (
      <ReactMarkdown
        components={{
          p: ({ node, children, ...props }) => (
            <p className="text-sm leading-relaxed" {...props}>
              {children}
            </p>
          ),
          strong: ({ node, children, ...props }) => (
            <span className="font-bold text-primary" {...props}>
              {children}
            </span>
          ),
          em: ({ node, children, ...props }) => (
            <span className="italic text-primary-foreground/80" {...props}>
              {children}
            </span>
          ),
          h1: ({ node, children, ...props }) => (
            <h1 className="text-lg font-bold mb-2" {...props}>
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-md font-bold mb-1.5" {...props}>
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-sm font-bold mb-1" {...props}>
              {children}
            </h3>
          ),
          ul: ({ node, children, ...props }) => (
            <ul className="list-disc pl-5 my-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol className="list-decimal pl-5 my-2" {...props}>
              {children}
            </ol>
          ),
          li: ({ node, children, ...props }) => (
            <li className="mb-1" {...props}>
              {children}
            </li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 pt-16 pb-20 md:pt-20 md:pb-4 overflow-hidden bg-background">
      <div className="w-full max-w-4xl h-[calc(100vh-12rem)] md:h-[min(800px,calc(100vh-6rem))] flex">
        <Card className="border rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-background to-muted/30 w-full h-full flex flex-col">
          <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="p-3 md:p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-primary/20">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="AI Assistant" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Bot size={18} />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                  </div>
                  <div>
                    <p className="font-semibold">Job Assistant</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Available 24/7
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Briefcase className="h-3 w-3 mr-1" />
                  Job Expert
                </Badge>
              </div>
            </div>

            {/* Chat messages */}
            <ScrollArea className="flex-1 p-4 bg-gradient-to-br from-slate-50/50 to-blue-50/50 dark:from-slate-950/50 dark:to-blue-950/50 overflow-y-auto">
              <div className="space-y-6 py-2">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div
                      className={`flex items-start gap-3 max-w-[85%] ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar
                        className={`h-9 w-9 mt-0.5 border-2 ${
                          message.role === "assistant"
                            ? "border-blue-200 dark:border-blue-800"
                            : "border-indigo-200 dark:border-indigo-800"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <>
                            <AvatarImage src="/placeholder.svg?height=36&width=36" alt="AI Assistant" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              <Bot size={16} />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                              <User2 size={16} />
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                            message.role === "assistant"
                              ? "bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          }`}
                        >
                          {message.isLoading ? (
                            <div className="flex space-x-2 py-1">
                              <div
                                className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                            </div>
                          ) : message.role === "user" ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          ) : (
                            renderMessageContent(message.content)
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 ml-2">{formatTime(message.timestamp)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Chat input */}
            <div className="p-3 md:p-4 border-t bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/50 relative z-10 shadow-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center space-x-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 bg-white/80 dark:bg-slate-800/80 border-blue-100 dark:border-blue-900 rounded-full pl-4 pr-4 py-5 md:py-6 focus-visible:ring-blue-500 text-sm md:text-base"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="rounded-full h-10 md:h-12 w-10 md:w-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md"
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

