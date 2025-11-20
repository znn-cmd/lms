import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QuestionType, CandidateStatus } from "@prisma/client"
import { createOfferForCandidate } from "@/lib/offer-utils"

export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } }
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

    const body = await request.json()
    const { answers } = body

    const candidateTest = await prisma.candidateTest.findFirst({
      where: {
        candidateId: candidate.id,
        testId: params.testId,
      },
      include: {
        test: {
          include: {
            questions: true,
          },
        },
      },
    })

    if (!candidateTest) {
      return NextResponse.json({ message: "Test not found" }, { status: 404 })
    }

    let totalPoints = 0
    let earnedPoints = 0
    const openAnswers: any[] = []

    // Process each question
    for (const question of candidateTest.test.questions) {
      totalPoints += question.points
      const userAnswer = answers[question.id]

      if (!userAnswer) {
        // No answer provided
        await prisma.answer.create({
          data: {
            candidateTestId: candidateTest.id,
            questionId: question.id,
            answer: JSON.stringify(""),
            points: 0,
          },
        })
        continue
      }

      let isCorrect = false
      let points = 0

      if (question.type === QuestionType.SINGLE_CHOICE) {
        isCorrect = question.correctAnswer === userAnswer
        points = isCorrect ? question.points : 0
      } else if (question.type === QuestionType.MULTIPLE_CHOICE) {
        const correctAnswers = JSON.parse(question.correctAnswer || "[]")
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
        isCorrect =
          correctAnswers.length === userAnswers.length &&
          correctAnswers.every((ans: string) => userAnswers.includes(ans))
        points = isCorrect ? question.points : 0
      } else if (question.type === QuestionType.OPEN_ANSWER) {
        // Open answers need manual review
        openAnswers.push({
          questionId: question.id,
          answer: userAnswer,
        })
        points = 0 // Will be set by reviewer
      }

      earnedPoints += points

      await prisma.answer.create({
        data: {
          candidateTestId: candidateTest.id,
          questionId: question.id,
          answer: JSON.stringify(userAnswer),
          isCorrect: question.type !== QuestionType.OPEN_ANSWER ? isCorrect : null,
          points,
        },
      })
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

    // Update candidate test
    await prisma.candidateTest.update({
      where: { id: candidateTest.id },
      data: {
        score: openAnswers.length > 0 ? null : score, // Score is null if there are open answers
        completedAt: new Date(),
        status: openAnswers.length > 0 ? "pending_review" : "completed",
        timeSpent: candidateTest.startedAt
          ? Math.round((Date.now() - candidateTest.startedAt.getTime()) / 60000)
          : null,
      },
    })

    // Update candidate status if test passed and no open answers
    if (openAnswers.length === 0 && score >= candidateTest.test.passingScore) {
      await prisma.candidateProfile.update({
        where: { id: candidate.id },
        data: {
          status: CandidateStatus.TEST_COMPLETED,
        },
      })

      // Check if there's an offer linked to this test
      const testOffer = await prisma.offer.findFirst({
        where: {
          testId: params.testId,
          vacancyId: candidate.currentVacancy?.id || undefined,
        },
      })

      // Create offer if candidate passed (use test-linked offer or create default)
      if (testOffer) {
        // Create offer based on test-linked template
        await createOfferForCandidate(candidate.id, params.testId)
      } else {
        // Create default offer
        await createOfferForCandidate(candidate.id)
      }
    }

    return NextResponse.json({
      success: true,
      score,
      needsReview: openAnswers.length > 0,
    })
  } catch (error: any) {
    console.error("Error submitting test:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

