"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip } from "lucide-react"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

export default function ChatPage() {
  const params = useParams()
  const candidateId = params.candidateId as string
  const { data: session } = useSession()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return

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

  return (
    <div className="flex min-h-screen">
      <Sidebar role="MENTOR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-4xl mx-auto">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message, index) => {
                    const isMine = message.senderId === (session?.user as any)?.id
                    return (
                      <div
                        key={index}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isMine
                              ? "bg-primary text-primary-foreground"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMine ? "text-primary-foreground/70" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button onClick={sendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

