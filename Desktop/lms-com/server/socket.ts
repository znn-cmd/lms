import { Server as SocketIOServer } from "socket.io"
import { Server as HTTPServer } from "http"

let io: SocketIOServer | null = null

export function initializeSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    socket.on("join_room", ({ candidateId, userId }) => {
      const room = `candidate_${candidateId}`
      socket.join(room)
      console.log(`User ${userId} joined room ${room}`)
    })

    socket.on("send_message", async (message) => {
      // Save message to database
      // Broadcast to room
      const room = `candidate_${message.candidateId}`
      io?.to(room).emit("message", {
        ...message,
        id: Date.now().toString(),
      })
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  return io
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized")
  }
  return io
}

