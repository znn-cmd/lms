import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, FileText, CheckCircle2, Clock } from "lucide-react"

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "CANDIDATE") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          surname: true,
        },
      },
      currentVacancy: true,
      courses: {
        include: {
          course: true,
        },
      },
      tests: {
        include: {
          test: true,
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      mentor: {
        select: {
          name: true,
          surname: true,
          email: true,
        },
      },
    },
  })

  if (!candidate) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="CANDIDATE" />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-8 mt-16">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="py-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
                  <p className="text-gray-600 mb-6">
                    Your candidate profile has not been created yet. Please contact HR or administrator to set up your profile.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    If you just registered, please wait a moment for your profile to be created, or contact support.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const activeCourse = candidate.courses.find(c => !c.completedAt)
  const completedTests = candidate.tests.filter(t => t.status === "completed")
  const pendingTests = candidate.tests.filter(t => t.status !== "completed")

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CANDIDATE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {candidate.user.name || "Candidate"}!</h1>
              <p className="text-gray-600 mt-2">Here's your learning progress</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Course</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeCourse?.course.title || "None"}</div>
                  {activeCourse && (
                    <div className="mt-2">
                      <Progress value={activeCourse.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{activeCourse.progress}% complete</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTests.length}</div>
                  <p className="text-xs text-muted-foreground">Out of {candidate.tests.length} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingTests.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting completion</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{candidate.status.replace("_", " ")}</div>
                  <p className="text-xs text-muted-foreground">{candidate.currentVacancy?.title || "No vacancy"}</p>
                </CardContent>
              </Card>
            </div>

            {activeCourse && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Course Progress</CardTitle>
                  <CardDescription>{activeCourse.course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{activeCourse.progress}%</span>
                      </div>
                      <Progress value={activeCourse.progress} className="h-3" />
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Started:</span>{" "}
                        {activeCourse.startedAt ? new Date(activeCourse.startedAt).toLocaleDateString() : "Not started"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {candidate.mentor && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Mentor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {candidate.mentor.name?.[0]}{candidate.mentor.surname?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {candidate.mentor.name} {candidate.mentor.surname}
                      </p>
                      <p className="text-sm text-muted-foreground">{candidate.mentor.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

