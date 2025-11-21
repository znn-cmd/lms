"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, ChevronUp, ChevronDown } from "lucide-react"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import { useLocale } from "@/hooks/use-locale"
import { t } from "@/lib/i18n"

interface LessonChatProps {
  candidateId: string
  mentor?: any
}

export function LessonChat({ candidateId, mentor }: LessonChatProps) {
  const { data: session } = useSession()
  const locale = useLocale()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!candidateId || !session) return

    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin.replace('3000', '3001') : "http://localhost:3001")
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
    })

    newSocket.on("connect", () => {
      console.log("Connected to chat server")
      newSocket.emit("join_room", { candidateId, userId: (session?.user as any)?.id })
    })

    newSocket.on("message", (message) => {
      setMessages((prev) => [...prev, message])
    })

    newSocket.on("messages_history", (history) => {
      setMessages(history)
    })

    setSocket(newSocket)

    // Fetch message history
    fetch(`/api/chat/${candidateId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages)
        }
      })

    return () => {
      newSocket.close()
    }
  }, [candidateId, session])

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isMinimized])

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !candidateId) return

    const message = {
      senderId: (session?.user as any)?.id,
      candidateId,
      content: newMessage,
      createdAt: new Date(),
    }

    socket.emit("send_message", message)
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!mentor) {
    return null
  }

  return (
    <Card className="fixed bottom-0 left-64 right-0 z-50 border-t shadow-lg bg-white">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {t("common.chatWith", locale)} {mentor.name} {mentor.surname}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-0">
          <div className="flex flex-col" style={{ maxHeight: "300px" }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[200px]">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  {t("common.noMessages", locale)}
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.senderId === (session?.user as any)?.id
                  return (
                    <div
                      key={idx}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-2 text-sm ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="font-medium mb-1 text-xs">
                          {msg.sender?.name} {msg.sender?.surname}
                        </div>
                        <div>{msg.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString(locale)}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("common.typeYourMessage", locale)}
                  className="flex-1 h-9 text-sm"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

