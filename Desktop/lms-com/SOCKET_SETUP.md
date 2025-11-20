# Socket.io Setup Guide

## Server Setup

Для работы чата в реальном времени нужно запустить отдельный Socket.io сервер.

### Option 1: Standalone Server

Создайте файл `server.js` в корне проекта:

```javascript
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join_room', async ({ candidateId, userId }) => {
    const room = `candidate_${candidateId}`
    socket.join(room)
    console.log(`User ${userId} joined room ${room}`)

    // Send message history
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { candidateId },
          { receiverId: userId },
          { senderId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    socket.emit('messages_history', messages)
  })

  socket.on('send_message', async (message) => {
    try {
      // Save to database
      const savedMessage = await prisma.chatMessage.create({
        data: {
          senderId: message.senderId,
          candidateId: message.candidateId,
          content: message.content,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              surname: true,
            },
          },
        },
      })

      // Broadcast to room
      const room = `candidate_${message.candidateId}`
      io.to(room).emit('message', savedMessage)
    } catch (error) {
      console.error('Error saving message:', error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})
```

### Option 2: Next.js API Route (Simpler)

Используйте существующий API route `/api/chat/[candidateId]` для отправки сообщений, а для real-time обновлений можно использовать polling или Server-Sent Events.

## Environment Variables

Добавьте в `.env`:

```env
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Running the Server

```bash
# Install dependencies
npm install socket.io

# Run server
node server.js
```

Или добавьте в `package.json`:

```json
{
  "scripts": {
    "socket": "node server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run socket\""
  }
}
```

## Client Configuration

В компонентах чата уже настроен клиент Socket.io. Убедитесь, что `NEXT_PUBLIC_SOCKET_URL` указан правильно.

## Production Deployment

Для продакшена:
1. Запустите Socket.io сервер как отдельный процесс
2. Используйте Redis adapter для масштабирования
3. Настройте load balancer для распределения соединений

