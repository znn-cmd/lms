import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course, modules: course.modules })
  } catch (error: any) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

