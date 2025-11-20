import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const role = (session.user as any)?.role
    
    // For HR/Admin, return full test with questions
    if (role === "HR" || role === "ADMIN") {
      const test = await prisma.test.findUnique({
        where: { id: params.testId },
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          vacancy: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      })

      if (!test) {
        return NextResponse.json({ message: "Test not found" }, { status: 404 })
      }

      return NextResponse.json({ test, questions: test.questions })
    }

    // For candidates, return test without correct answers
    if (role !== "CANDIDATE") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    const test = await prisma.test.findUnique({
      where: { id: params.testId },
    })

    if (!test) {
      return NextResponse.json({ message: "Test not found" }, { status: 404 })
    }

    // Get or create candidate test
    let candidateTest = await prisma.candidateTest.findFirst({
      where: {
        candidateId: candidate.id,
        testId: test.id,
      },
    })

    if (!candidateTest) {
      candidateTest = await prisma.candidateTest.create({
        data: {
          candidateId: candidate.id,
          testId: test.id,
          status: "in_progress",
          startedAt: new Date(),
        },
      })
    }

    const questions = await prisma.question.findMany({
      where: { testId: test.id },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        timeLimit: test.timeLimit,
        passingScore: test.passingScore,
      },
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        points: q.points,
      })),
    })
  } catch (error: any) {
    console.error("Error fetching test:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

