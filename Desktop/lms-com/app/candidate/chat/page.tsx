"use client"

import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare } from "lucide-react"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import { useLocale } from "@/hooks/use-locale"
import { t } from "@/lib/i18n"

export default function CandidateChatPage() {
  const { data: session } = useSession()
  const locale = useLocale()
  const [candidateId, setCandidateId] = useState<string | null>(null)
  const [mentor, setMentor] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch candidate profile
    fetch("/api/candidate/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.candidate) {
          setCandidateId(data.candidate.id)
          setMentor(data.candidate.mentor)
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

  if (loading) {
    return <div>{t("common.loading", locale)}</div>
  }

  if (!mentor) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="CANDIDATE" />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-8 mt-16">
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("common.noMentorAssigned", locale)}</h3>
                <p className="text-muted-foreground">
                  {t("common.noMentorAssignedDesc", locale)}
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CANDIDATE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-4xl mx-auto">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t("common.chatWith", locale)} {mentor.name} {mentor.surname}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => {
                    const isOwn = msg.senderId === (session?.user as any)?.id
                    return (
                      <div
                        key={idx}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">
                            {msg.sender?.name} {msg.sender?.surname}
                          </div>
                          <div className="text-sm">{msg.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString(locale)}
                          </div>
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
                      placeholder={t("common.typeYourMessage", locale)}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
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

