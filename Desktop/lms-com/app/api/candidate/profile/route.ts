import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "CANDIDATE") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
          },
        },
      },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json({ candidate })
  } catch (error: any) {
    console.error("Error fetching candidate profile:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

