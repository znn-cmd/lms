import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
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

    const candidateCourse = await prisma.candidateCourse.findFirst({
      where: {
        candidateId: candidate.id,
        courseId: lesson.module.course.id,
      },
      include: {
        lessonProgress: true,
      },
    })

    if (!candidateCourse) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    // Update or create lesson progress
    const existingProgress = candidateCourse.lessonProgress.find(
      (lp) => lp.lessonId === lesson.id
    )

    if (existingProgress) {
      await prisma.lessonProgress.update({
        where: { id: existingProgress.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      })
    } else {
      await prisma.lessonProgress.create({
        data: {
          candidateCourseId: candidateCourse.id,
          lessonId: lesson.id,
          isCompleted: true,
          completedAt: new Date(),
        },
      })
    }

    // Recalculate course progress
    const totalLessons = await prisma.lesson.count({
      where: {
        module: {
          courseId: lesson.module.course.id,
        },
      },
    })

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        candidateCourseId: candidateCourse.id,
        isCompleted: true,
      },
    })

    const progress = Math.round((completedLessons / totalLessons) * 100)

    await prisma.candidateCourse.update({
      where: { id: candidateCourse.id },
      data: {
        progress,
        ...(progress === 100 && !candidateCourse.completedAt
          ? { completedAt: new Date() }
          : {}),
      },
    })

    return NextResponse.json({ success: true, progress })
  } catch (error: any) {
    console.error("Error completing lesson:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

