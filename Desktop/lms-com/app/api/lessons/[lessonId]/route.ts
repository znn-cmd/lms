import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "CANDIDATE") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 })
    }

    // Check if candidate has access to this course
    const candidateCourse = await prisma.candidateCourse.findFirst({
      where: {
        candidateId: candidate.id,
        courseId: lesson.module.course.id,
      },
      include: {
        lessonProgress: {
          where: {
            lessonId: lesson.id,
          },
        },
      },
    })

    if (!candidateCourse) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    const completed = candidateCourse.lessonProgress[0]?.isCompleted || false

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        content: lesson.content,
        duration: lesson.duration,
      },
      completed,
    })
  } catch (error: any) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

