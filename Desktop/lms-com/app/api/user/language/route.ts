import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Language } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { language } = body

    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        language: language as Language,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating language:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

