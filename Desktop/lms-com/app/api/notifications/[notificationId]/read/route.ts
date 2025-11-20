import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    await prisma.notification.update({
      where: {
        id: params.notificationId,
        userId, // Ensure user can only mark their own notifications as read
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

