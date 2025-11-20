import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const role = (session.user as any).role

    // Verify access: mentor or candidate themselves
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: params.candidateId },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    if (role === "CANDIDATE" && candidate.userId !== userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    if (role === "MENTOR" && candidate.mentorId !== userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { candidateId: params.candidateId },
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
      orderBy: { createdAt: "asc" },
      take: 100,
    })

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { content } = body

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: params.candidateId },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: userId,
        candidateId: params.candidateId,
        content,
      },
    })

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

