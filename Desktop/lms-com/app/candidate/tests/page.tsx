import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle2, Clock, Play, Eye } from "lucide-react"
import Link from "next/link"

export default async function CandidateTests() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "CANDIDATE") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      tests: {
        include: {
          test: {
            include: {
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!candidate) {
    redirect("/candidate/dashboard")
  }

  const pendingTests = candidate.tests.filter(t => t.status === "pending" || t.status === "in_progress")
  const completedTests = candidate.tests.filter(t => t.status === "completed")

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CANDIDATE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tests</h1>
              <p className="text-gray-600 mt-2">Complete tests to progress in your application</p>
            </div>

            {pendingTests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Tests</h2>
                <div className="grid gap-4">
                  {pendingTests.map((candidateTest) => (
                    <Card key={candidateTest.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle>{candidateTest.test.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {candidateTest.test.description}
                            </CardDescription>
                          </div>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            {candidateTest.status === "in_progress" ? "In Progress" : "Pending"}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Time limit: {candidateTest.test.timeLimit || "No limit"} minutes</p>
                            <p>Passing score: {candidateTest.test.passingScore}%</p>
                            {candidateTest.test.course && (
                              <p>Course: {candidateTest.test.course.title}</p>
                            )}
                          </div>
                          <Link href={`/candidate/tests/${candidateTest.test.id}`}>
                            <Button>
                              {candidateTest.status === "in_progress" ? (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Start Test
                                </>
                              )}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completedTests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Completed Tests</h2>
                <div className="grid gap-4">
                  {completedTests.map((candidateTest) => (
                    <Card key={candidateTest.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle>{candidateTest.test.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {candidateTest.test.description}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {candidateTest.score !== null && (
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  candidateTest.score >= candidateTest.test.passingScore
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {candidateTest.score}%
                              </span>
                            )}
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              Completed
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {candidateTest.completedAt && (
                              <p>Completed: {new Date(candidateTest.completedAt).toLocaleDateString()}</p>
                            )}
                            {candidateTest.timeSpent && (
                              <p>Time spent: {candidateTest.timeSpent} minutes</p>
                            )}
                          </div>
                          <Link href={`/candidate/tests/${candidateTest.test.id}/results`}>
                            <Button variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Results
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {candidate.tests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tests assigned</h3>
                  <p className="text-muted-foreground">
                    You don't have any tests assigned yet. Complete your courses to unlock tests.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

