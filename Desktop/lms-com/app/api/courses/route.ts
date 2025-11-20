import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Language } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            modules: true,
            candidateCourses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ courses })
  } catch (error: any) {
    console.error("Error fetching courses:", error)
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
    const { title, titleRu, description, descriptionRu, language, isSequential } = body

    const userId = (session.user as any).id

    const course = await prisma.course.create({
      data: {
        title,
        titleRu: titleRu || null,
        description: description || null,
        descriptionRu: descriptionRu || null,
        language: (language as Language) || Language.EN,
        isSequential: isSequential !== undefined ? isSequential : true,
        isActive: true,
        createdById: userId,
      },
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

