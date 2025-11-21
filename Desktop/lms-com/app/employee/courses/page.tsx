import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/i18n"

export default async function EmployeeCoursesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "EMPLOYEE") {
    redirect("/auth/signin")
  }

  const locale = await getLocale()
  const userId = (session.user as any).id
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      courses: {
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: true,
                },
                orderBy: { order: "asc" },
              },
            },
          },
          lessonProgress: true,
        },
        orderBy: { startedAt: "desc" },
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

  const activeCourses = candidate.courses.filter((c) => !c.completedAt)
  const completedCourses = candidate.courses.filter((c) => c.completedAt)

  return (
    <div className="flex min-h-screen">
      <Sidebar role="EMPLOYEE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("employee.courses.title", locale)}</h1>
              <p className="text-gray-600 mt-2">{t("employee.courses.subtitle", locale)}</p>
            </div>

            {activeCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("employee.courses.activeTraining", locale)}</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeCourses.map((candidateCourse) => {
                    const totalLessons = candidateCourse.course.modules.reduce(
                      (sum, module) => sum + module.lessons.length,
                      0
                    )
                    const completedLessons = candidateCourse.lessonProgress.filter(
                      (lp) => lp.completedAt
                    ).length

                    return (
                      <Card key={candidateCourse.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            {candidateCourse.course.title}
                          </CardTitle>
                          <CardDescription>{candidateCourse.course.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>{t("common.progress", locale)}</span>
                                <span>
                                  {completedLessons} / {totalLessons} {t("common.lessons", locale)}
                                </span>
                              </div>
                              <Progress
                                value={
                                  totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
                                }
                                className="h-2"
                              />
                            </div>
                            <Link href={`/employee/courses/${candidateCourse.course.id}`}>
                              <Button className="w-full">{t("employee.dashboard.continueTraining", locale)}</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {completedCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("employee.courses.completedTraining", locale)}</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((candidateCourse) => (
                    <Card
                      key={candidateCourse.id}
                      className="opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          {candidateCourse.course.title}
                        </CardTitle>
                        <CardDescription>{candidateCourse.course.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {t("common.completed", locale)}{" "}
                          {candidateCourse.completedAt
                            ? new Date(candidateCourse.completedAt).toLocaleDateString(locale)
                            : t("common.nA", locale)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeCourses.length === 0 && completedCourses.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("employee.courses.noTrainingAssigned", locale)}</h3>
                  <p className="text-muted-foreground">
                    {t("employee.courses.noTrainingAssignedDesc", locale)}
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

