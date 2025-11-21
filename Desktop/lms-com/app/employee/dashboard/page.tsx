import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/i18n"

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "EMPLOYEE") {
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
      currentVacancy: {
        select: {
          title: true,
        },
      },
      courses: {
        include: {
          course: true,
        },
      },
      tests: {
        include: {
          test: true,
        },
      },
      offers: {
        where: {
          status: "accepted",
        },
        include: {
          vacancy: {
            select: {
              title: true,
            },
          },
        },
        take: 1,
      },
    },
  })

  if (!candidate) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="EMPLOYEE" />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-8 mt-16">
            <Card>
              <CardContent className="py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("common.profileNotFound", locale)}</h2>
                <p className="text-gray-600">{t("common.contactHRForAssistance", locale)}</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const activeCourse = candidate.courses.find((c) => !c.completedAt)
  const completedCourses = candidate.courses.filter((c) => c.completedAt)
  const completedTests = candidate.tests.filter((t) => t.status === "completed")

  return (
    <div className="flex min-h-screen">
      <Sidebar role="EMPLOYEE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("employee.dashboard.welcome", locale)}, {candidate.user.name} {candidate.user.surname}!
              </h1>
              <p className="text-gray-600 mt-2">{t("employee.dashboard.subtitle", locale)}</p>
            </div>

            {candidate.offers.length > 0 && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    {t("common.congratulations", locale)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {t("employee.dashboard.offerAccepted", locale).replace("{vacancy}", candidate.offers[0].vacancy ? ` for ${candidate.offers[0].vacancy.title}` : "")}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("employee.dashboard.currentTraining", locale)}</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activeCourse ? activeCourse.course.title : t("common.none", locale)}
                  </div>
                  {activeCourse && (
                    <div className="mt-2">
                      <Progress value={activeCourse.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeCourse.progress}% {t("common.complete", locale)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("employee.dashboard.completedCourses", locale)}</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedCourses.length}</div>
                  <p className="text-xs text-muted-foreground">{t("common.totalCompleted", locale)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("employee.dashboard.testsPassed", locale)}</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTests.length}</div>
                  <p className="text-xs text-muted-foreground">{t("common.successfullyCompleted", locale)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("employee.dashboard.position", locale)}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sm">
                    {candidate.currentVacancy?.title || t("common.nA", locale)}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("common.currentRole", locale)}</p>
                </CardContent>
              </Card>
            </div>

            {activeCourse && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("employee.dashboard.currentTrainingProgress", locale)}</CardTitle>
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
                    <Link href={`/employee/courses/${activeCourse.course.id}`}>
                      <Button>{t("employee.dashboard.continueTraining", locale)}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{t("employee.dashboard.yourJourney", locale)}</CardTitle>
                <CardDescription>{t("employee.dashboard.journeyDescription", locale)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">{t("employee.dashboard.applicationSubmitted", locale)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(candidate.createdAt).toLocaleDateString(locale)}
                      </p>
                    </div>
                  </div>

                  {completedCourses.map((cc) => (
                    <div key={cc.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{t("employee.dashboard.courseCompleted", locale)}: {cc.course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {cc.completedAt ? new Date(cc.completedAt).toLocaleDateString(locale) : t("common.inProgress", locale)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {completedTests.map((ct) => (
                    <div key={ct.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <Award className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{t("employee.dashboard.testPassed", locale)}: {ct.test.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("common.score", locale)}: {ct.score}% •{" "}
                          {ct.completedAt ? new Date(ct.completedAt).toLocaleDateString(locale) : t("common.pending", locale)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {candidate.offers.length > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Award className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{t("common.offerAccepted", locale)}</p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.offers[0].vacancy?.title || t("common.offers", locale)} •{" "}
                          {candidate.offers[0].respondedAt
                            ? new Date(candidate.offers[0].respondedAt).toLocaleDateString(locale)
                            : t("common.pending", locale)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

