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
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/i18n"

export default async function CandidateTests() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "CANDIDATE") {
    redirect("/auth/signin")
  }

  const locale = await getLocale()
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
              <h1 className="text-3xl font-bold text-gray-900">{t("candidate.tests.title", locale)}</h1>
              <p className="text-gray-600 mt-2">{t("common.completeTestsToProgress", locale)}</p>
            </div>

            {pendingTests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("common.pendingTests", locale)}</h2>
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
                            {candidateTest.status === "in_progress" ? t("common.inProgress", locale) : t("common.pending", locale)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>{t("common.timeLimit", locale)}: {candidateTest.test.timeLimit || t("common.noLimit", locale)} {t("common.minutes", locale)}</p>
                            <p>{t("common.passingScore", locale)}: {candidateTest.test.passingScore}%</p>
                            {candidateTest.test.course && (
                              <p>{t("common.courses", locale)}: {candidateTest.test.course.title}</p>
                            )}
                          </div>
                          <Link href={`/candidate/tests/${candidateTest.test.id}`}>
                            <Button>
                              {candidateTest.status === "in_progress" ? (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  {t("common.continue", locale)}
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  {t("common.startTest", locale)}
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
                <h2 className="text-xl font-semibold mb-4">{t("common.completedTests", locale)}</h2>
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
                              {t("common.completed", locale)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {candidateTest.completedAt && (
                              <p>{t("common.completed", locale)}: {new Date(candidateTest.completedAt).toLocaleDateString(locale)}</p>
                            )}
                            {candidateTest.timeSpent && (
                              <p>{t("common.timeSpent", locale)}: {candidateTest.timeSpent} {t("common.minutes", locale)}</p>
                            )}
                          </div>
                          <Link href={`/candidate/tests/${candidateTest.test.id}/results`}>
                            <Button variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              {t("common.viewResults", locale)}
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
                  <h3 className="text-lg font-semibold mb-2">{t("common.noTestsAssigned", locale)}</h3>
                  <p className="text-muted-foreground">
                    {t("common.noTestsAssignedDesc", locale)}
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

