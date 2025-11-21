import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, GraduationCap, TrendingUp, UserCheck, Clock, XCircle, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getKanbanStats } from "@/lib/kanban-stats"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/i18n"

export default async function HRDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const locale = await getLocale()

  // Get statistics
  const [
    totalCandidates,
    activeVacancies,
    totalCourses,
    candidatesByStatus,
    recentCandidates,
    kanbanStats,
  ] = await Promise.all([
    prisma.candidateProfile.count(),
    prisma.vacancy.count({ where: { isActive: true } }),
    prisma.course.count({ where: { isActive: true } }),
    prisma.candidateProfile.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.candidateProfile.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
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
      },
    }),
    getKanbanStats(),
  ])

  const statusCounts = candidatesByStatus.reduce((acc, item) => {
    acc[item.status] = item._count
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("hr.dashboard.title", locale)}</h1>
              <p className="text-gray-600 mt-2">{t("common.overview", locale)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("hr.dashboard.totalCandidates", locale)}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCandidates}</div>
                  <p className="text-xs text-muted-foreground">{t("common.allTimeRegistrations", locale)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("hr.dashboard.activeVacancies", locale)}</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeVacancies}</div>
                  <p className="text-xs text-muted-foreground">{t("common.currentlyOpen", locale)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("hr.dashboard.activeCourses", locale)}</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses}</div>
                  <p className="text-xs text-muted-foreground">{t("common.availableForTraining", locale)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("hr.dashboard.hired", locale)}</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statusCounts.HIRED || 0}</div>
                  <p className="text-xs text-muted-foreground">{t("common.successfullyHired", locale)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("common.kanbanPipeline", locale)}</CardTitle>
                  <CardDescription>{t("common.candidateDistribution", locale)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{t("common.newCandidate", locale)}</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.newCandidate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{t("common.startedLearning", locale)}</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.startedLearning}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{t("common.inTraining", locale)}</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.inTraining}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{t("common.startedTest", locale)}</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.startedTest}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{t("common.testPassedSuccessfully", locale)}</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.testPassed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{t("common.offerAccepted", locale)}</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.offerAccepted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{t("common.testFailed", locale)}</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.testFailed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{t("common.offerDeclined", locale)}</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.offerDeclined}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("common.recentCandidates", locale)}</CardTitle>
                  <CardDescription>{t("common.latestRegistrations", locale)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCandidates.map((candidate) => (
                      <div key={candidate.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {candidate.user.name} {candidate.user.surname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {candidate.currentVacancy?.title || t("common.noVacancy", locale)}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                          {candidate.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("common.quickActions", locale)}</CardTitle>
                  <CardDescription>{t("common.commonTasks", locale)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/hr/vacancies/new">
                      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        {t("common.createNewVacancy", locale)}
                      </button>
                    </Link>
                    <Link href="/hr/courses/new">
                      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        {t("common.createNewCourse", locale)}
                      </button>
                    </Link>
                    <Link href="/hr/candidates">
                      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        {t("common.viewAllCandidates", locale)}
                      </button>
                    </Link>
                    <Link href="/hr/talent-pool">
                      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        {t("common.talentPool", locale)}
                      </button>
                    </Link>
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

