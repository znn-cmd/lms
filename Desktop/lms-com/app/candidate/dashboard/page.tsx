import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, FileText, CheckCircle2, Clock } from "lucide-react"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/i18n"

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "CANDIDATE") {
    redirect("/auth/signin")
  }

  const locale = await getLocale()
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("common.profileNotFound", locale)}</h2>
                  <p className="text-gray-600 mb-6">
                    {t("common.contactHR", locale)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("common.waitOrContact", locale)}
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
              <h1 className="text-3xl font-bold text-gray-900">{t("candidate.dashboard.title", locale)}, {candidate.user.name || t("common.candidates", locale)}!</h1>
              <p className="text-gray-600 mt-2">{t("common.hereProgress", locale)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("candidate.dashboard.currentCourse", locale)}</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeCourse?.course.title || t("common.none", locale)}</div>
                  {activeCourse && (
                    <div className="mt-2">
                      <Progress value={activeCourse.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{activeCourse.progress}% {t("common.complete", locale)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("candidate.dashboard.testsCompleted", locale)}</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTests.length}</div>
                  <p className="text-xs text-muted-foreground">{t("common.outOf", locale)} {candidate.tests.length} {t("common.total", locale)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("candidate.dashboard.pendingTests", locale)}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingTests.length}</div>
                  <p className="text-xs text-muted-foreground">{t("common.awaitingCompletion", locale)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("candidate.dashboard.status", locale)}</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{candidate.status.replace("_", " ")}</div>
                  <p className="text-xs text-muted-foreground">{candidate.currentVacancy?.title || t("common.noVacancy", locale)}</p>
                </CardContent>
              </Card>
            </div>

            {activeCourse && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("candidate.dashboard.currentCourseProgress", locale)}</CardTitle>
                  <CardDescription>{activeCourse.course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t("common.overallProgress", locale)}</span>
                        <span>{activeCourse.progress}%</span>
                      </div>
                      <Progress value={activeCourse.progress} className="h-3" />
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("common.started", locale)}</span>{" "}
                        {activeCourse.startedAt ? new Date(activeCourse.startedAt).toLocaleDateString(locale) : t("common.notStarted", locale)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {candidate.mentor && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("common.yourMentor", locale)}</CardTitle>
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

