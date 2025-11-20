import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "EMPLOYEE") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            surname: true,
            email: true,
          },
        },
        mentor: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                id: true,
              },
            },
          },
        },
        currentVacancy: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ candidate })
  } catch (error: any) {
    console.error("Error fetching employee profile:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

