import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import TestReviewForm from "@/components/test-review-form"

export default async function TestReviewPage({
  params,
}: {
  params: { testId: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "MENTOR") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const candidateTest = await prisma.candidateTest.findUnique({
    where: { id: params.testId },
    include: {
      candidate: {
        include: {
          user: {
            select: {
              name: true,
              surname: true,
            },
          },
        },
      },
      test: {
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
      reviews: {
        where: {
          reviewerId: userId,
        },
      },
    },
  })

  if (!candidateTest || candidateTest.candidate.mentorId !== userId) {
    return <div>Test not found or access denied</div>
  }

  const openAnswers = candidateTest.answers.filter(
    (a) => a.question.type === "OPEN_ANSWER"
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar role="MENTOR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review Test: {candidateTest.test.title}
              </h1>
              <p className="text-gray-600 mt-2">
                Candidate: {candidateTest.candidate.user.name}{" "}
                {candidateTest.candidate.user.surname}
              </p>
            </div>

            <TestReviewForm
              candidateTestId={candidateTest.id}
              openAnswers={openAnswers}
              existingReview={candidateTest.reviews[0]}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

