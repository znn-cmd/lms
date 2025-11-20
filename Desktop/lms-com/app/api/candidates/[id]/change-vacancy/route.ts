import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CandidateStatus } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { vacancyId } = body

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: params.id },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        startCourse: true,
      },
    })

    if (!vacancy) {
      return NextResponse.json({ message: "Vacancy not found" }, { status: 404 })
    }

    // Update candidate vacancy
    await prisma.candidateProfile.update({
      where: { id: params.id },
      data: {
        currentVacancyId: vacancyId,
        status: CandidateStatus.REGISTERED, // Reset status when changing vacancy
      },
    })

    // Remove old courses
    await prisma.candidateCourse.deleteMany({
      where: { candidateId: params.id },
    })

    // Assign new start course if available
    if (vacancy.startCourse) {
      await prisma.candidateCourse.create({
        data: {
          candidateId: params.id,
          courseId: vacancy.startCourse.id,
          startedAt: new Date(),
        },
      })

      // Update status to IN_COURSE
      await prisma.candidateProfile.update({
        where: { id: params.id },
        data: {
          status: CandidateStatus.IN_COURSE,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error changing vacancy:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

