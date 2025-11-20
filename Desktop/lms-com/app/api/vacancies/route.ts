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

    const vacancies = await prisma.vacancy.findMany({
      include: {
        _count: {
          select: {
            candidates: true,
            sources: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ vacancies })
  } catch (error: any) {
    console.error("Error fetching vacancies:", error)
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
    const { title, titleRu, description, descriptionRu, scoreThreshold, startCourseId } = body

    const userId = (session.user as any).id

    const vacancy = await prisma.vacancy.create({
      data: {
        title,
        titleRu: titleRu || null,
        description: description || null,
        descriptionRu: descriptionRu || null,
        scoreThreshold: scoreThreshold || 70,
        startCourseId: startCourseId || null,
        isActive: true,
        createdById: userId,
      },
    })

    return NextResponse.json({ vacancy }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating vacancy:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

