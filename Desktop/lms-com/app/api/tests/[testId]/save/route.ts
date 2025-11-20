import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QuestionType } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { questions } = body

    // Process each question
    for (const questionData of questions) {
      if (questionData.id.startsWith("temp-")) {
        // Create new question
        await prisma.question.create({
          data: {
            testId: params.testId,
            text: questionData.text,
            textRu: questionData.textRu || null,
            type: questionData.type as QuestionType,
            options: questionData.options || [],
            optionsRu: questionData.optionsRu || [],
            correctAnswer: questionData.correctAnswer || null,
            correctAnswerRu: questionData.correctAnswerRu || null,
            points: questionData.points || 10,
            order: questionData.order || 0,
          },
        })
      } else {
        // Update existing question
        await prisma.question.update({
          where: { id: questionData.id },
          data: {
            text: questionData.text,
            textRu: questionData.textRu || null,
            type: questionData.type as QuestionType,
            options: questionData.options || [],
            optionsRu: questionData.optionsRu || [],
            correctAnswer: questionData.correctAnswer || null,
            correctAnswerRu: questionData.correctAnswerRu || null,
            points: questionData.points || 10,
            order: questionData.order || 0,
          },
        })
      }
    }

    // Delete questions that are not in the list
    const questionIds = questions
      .filter((q: any) => !q.id.startsWith("temp-"))
      .map((q: any) => q.id)

    if (questionIds.length > 0) {
      await prisma.question.deleteMany({
        where: {
          testId: params.testId,
          id: { notIn: questionIds },
        },
      })
    } else {
      // If all questions are new, delete all existing ones
      await prisma.question.deleteMany({
        where: { testId: params.testId },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving questions:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

