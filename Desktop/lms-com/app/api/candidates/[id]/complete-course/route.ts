import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CandidateStatus } from "@prisma/client"
import { createOfferForCandidate } from "@/lib/offer-utils"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: params.id },
      include: {
        courses: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
        currentVacancy: {
          include: {
            startCourse: {
              include: {
                modules: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    // Mark all lessons in all courses as completed
    for (const candidateCourse of candidate.courses) {
      const allLessons = candidateCourse.course.modules.flatMap((m) => m.lessons)

      for (const lesson of allLessons) {
        const existingProgress = await prisma.lessonProgress.findFirst({
          where: {
            candidateCourseId: candidateCourse.id,
            lessonId: lesson.id,
          },
        })

        if (!existingProgress) {
          await prisma.lessonProgress.create({
            data: {
              candidateCourseId: candidateCourse.id,
              lessonId: lesson.id,
              isCompleted: true,
              completedAt: new Date(),
            },
          })
        } else if (!existingProgress.isCompleted) {
          await prisma.lessonProgress.update({
            where: { id: existingProgress.id },
            data: {
              isCompleted: true,
              completedAt: new Date(),
            },
          })
        }
      }

      // Update course progress to 100%
      await prisma.candidateCourse.update({
        where: { id: candidateCourse.id },
        data: {
          progress: 100,
          completedAt: new Date(),
        },
      })
    }

    // Update candidate status
    await prisma.candidateProfile.update({
      where: { id: params.id },
      data: {
        status: CandidateStatus.TEST_COMPLETED,
      },
    })

    // Assign test if available and vacancy has one
    if (candidate.currentVacancy?.startCourse) {
      const courseTests = await prisma.test.findMany({
        where: {
          courseId: candidate.currentVacancy.startCourse.id,
          isActive: true,
        },
      })

      for (const test of courseTests) {
        const existingTest = await prisma.candidateTest.findFirst({
          where: {
            candidateId: params.id,
            testId: test.id,
          },
        })

        if (!existingTest) {
          await prisma.candidateTest.create({
            data: {
              candidateId: params.id,
              testId: test.id,
              status: "pending",
            },
          })
        }
      }

      // Check if any test is already completed with passing score
      const completedTests = await prisma.candidateTest.findMany({
        where: {
          candidateId: params.id,
          status: "completed",
          score: { not: null },
        },
        include: {
          test: true,
        },
      })

      const passedTest = completedTests.find(
        (ct) => ct.score !== null && ct.score >= ct.test.passingScore
      )

      if (passedTest) {
        // Test already passed, create offer
        await createOfferForCandidate(params.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error completing course:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

