import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CandidateStatus } from "@prisma/client"
import { createOfferForCandidate } from "@/lib/offer-utils"

export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "MENTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { reviews, generalComment } = body

    const candidateTest = await prisma.candidateTest.findUnique({
      where: { id: params.testId },
      include: {
        candidate: true,
        test: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!candidateTest || candidateTest.candidate.mentorId !== userId) {
      return NextResponse.json({ message: "Test not found" }, { status: 404 })
    }

    // Update scores for open answers
    let totalPoints = 0
    let earnedPoints = 0

    for (const answer of candidateTest.answers) {
      totalPoints += answer.question.points
      if (reviews[answer.id]) {
        earnedPoints += reviews[answer.id].score
        await prisma.answer.update({
          where: { id: answer.id },
          data: {
            points: reviews[answer.id].score,
          },
        })
      } else {
        earnedPoints += answer.points || 0
      }
    }

    const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

    // Create or update review
    const existingReview = await prisma.testReview.findFirst({
      where: {
        candidateTestId: candidateTest.id,
        reviewerId: userId,
      },
    })

    if (existingReview) {
      await prisma.testReview.update({
        where: { id: existingReview.id },
        data: {
          comment: generalComment,
          manualScore: finalScore,
        },
      })
    } else {
      await prisma.testReview.create({
        data: {
          candidateTestId: candidateTest.id,
          reviewerId: userId,
          comment: generalComment,
          manualScore: finalScore,
        },
      })
    }

    // Update candidate test
    await prisma.candidateTest.update({
      where: { id: candidateTest.id },
      data: {
        score: finalScore,
        status: "completed",
      },
    })

    // Update candidate status if passed
    if (finalScore >= candidateTest.test.passingScore) {
      await prisma.candidateProfile.update({
        where: { id: candidateTest.candidate.id },
        data: {
          status: CandidateStatus.TEST_COMPLETED,
        },
      })

      // Check if there's an offer linked to this test
      const candidate = await prisma.candidateProfile.findUnique({
        where: { id: candidateTest.candidate.id },
        include: {
          currentVacancy: true,
        },
      })

      const testOffer = candidate?.currentVacancy
        ? await prisma.offer.findFirst({
            where: {
              testId: params.testId,
              vacancyId: candidate.currentVacancy.id,
            },
          })
        : null

      // Create offer if candidate passed (use test-linked offer or create default)
      if (testOffer) {
        await createOfferForCandidate(candidateTest.candidate.id, params.testId)
      } else {
        await createOfferForCandidate(candidateTest.candidate.id)
      }
    }

    return NextResponse.json({ success: true, score: finalScore })
  } catch (error: any) {
    console.error("Error reviewing test:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

