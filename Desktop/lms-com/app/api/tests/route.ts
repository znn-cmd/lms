import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const tests = await prisma.test.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        vacancy: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            questions: true,
            candidateTests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ tests })
  } catch (error: any) {
    console.error("Error fetching tests:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, titleRu, description, descriptionRu, courseId, vacancyId, passingScore, timeLimit } = body

    const test = await prisma.test.create({
      data: {
        title,
        titleRu: titleRu || null,
        description: description || null,
        descriptionRu: descriptionRu || null,
        courseId: courseId || null,
        vacancyId: vacancyId || null,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || null,
        isActive: true,
      },
    })

    return NextResponse.json({ test }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating test:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

