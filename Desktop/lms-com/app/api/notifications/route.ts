import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return NextResponse.json({ notifications, unreadCount })
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds } = body

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark multiple notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: (session.user as any).id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

