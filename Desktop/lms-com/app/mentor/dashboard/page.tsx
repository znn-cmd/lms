import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function MentorDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "MENTOR") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const mentor = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      mentorCandidates: {
        include: {
          user: {
            select: {
              name: true,
              surname: true,
              email: true,
            },
          },
          currentVacancy: {
            select: {
              title: true,
            },
          },
          courses: {
            include: {
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
          tests: {
            where: {
              status: "pending_review",
            },
            include: {
              test: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
      mentorTests: {
        where: {
          candidateTest: {
            status: "pending_review",
          },
        },
        include: {
          candidateTest: {
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
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!mentor) {
    redirect("/auth/signin")
  }

  const candidates = mentor.mentorCandidates
  const pendingTests = mentor.mentorTests
  const totalProgress = candidates.reduce((acc, c) => {
    const avgProgress = c.courses.reduce((sum, cc) => sum + cc.progress, 0) / (c.courses.length || 1)
    return acc + avgProgress
  }, 0) / (candidates.length || 1)

  return (
    <div className="flex min-h-screen">
      <Sidebar role="MENTOR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your candidates and review their progress</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidates.length}</div>
                  <p className="text-xs text-muted-foreground">Assigned candidates</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingTests.length}</div>
                  <p className="text-xs text-muted-foreground">Tests awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(totalProgress)}%</div>
                  <p className="text-xs text-muted-foreground">Course completion</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidates.length}</div>
                  <p className="text-xs text-muted-foreground">Ongoing conversations</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Candidates</CardTitle>
                  <CardDescription>List of candidates you're mentoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {candidates.map((candidate) => (
                      <Link
                        key={candidate.id}
                        href={`/mentor/candidates/${candidate.id}`}
                        className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {candidate.user.name} {candidate.user.surname}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {candidate.currentVacancy?.title || "No vacancy"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Status: {candidate.status.replace("_", " ")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {candidate.courses.length > 0
                                ? Math.round(
                                    candidate.courses.reduce((sum, c) => sum + c.progress, 0) /
                                      candidate.courses.length
                                  )
                                : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground">Progress</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {candidates.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No candidates assigned yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Test Reviews</CardTitle>
                  <CardDescription>Tests that need your review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingTests.map((review) => (
                      <Link
                        key={review.id}
                        href={`/mentor/tests/${review.candidateTest.id}`}
                        className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {review.candidateTest.candidate.user.name}{" "}
                            {review.candidateTest.candidate.user.surname}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {review.candidateTest.test.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted:{" "}
                            {review.candidateTest.completedAt
                              ? new Date(review.candidateTest.completedAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </Link>
                    ))}
                    {pendingTests.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No pending reviews
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

