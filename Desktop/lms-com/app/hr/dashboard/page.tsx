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

export default async function HRDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

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
              <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
              <p className="text-gray-600 mt-2">Overview of your hiring pipeline</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCandidates}</div>
                  <p className="text-xs text-muted-foreground">All time registrations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Vacancies</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeVacancies}</div>
                  <p className="text-xs text-muted-foreground">Currently open</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses}</div>
                  <p className="text-xs text-muted-foreground">Available for training</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hired</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statusCounts.HIRED || 0}</div>
                  <p className="text-xs text-muted-foreground">Successfully hired</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kanban Pipeline</CardTitle>
                  <CardDescription>Candidate distribution by kanban status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">New Candidate</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.newCandidate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Started Learning</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.startedLearning}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">In Training</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.inTraining}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Started Test</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.startedTest}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Test Passed Successfully</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.testPassed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Offer Accepted</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.offerAccepted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Test Failed</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.testFailed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Offer Declined</span>
                      </div>
                      <span className="font-semibold">{kanbanStats.offerDeclined}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Candidates</CardTitle>
                  <CardDescription>Latest registrations</CardDescription>
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
                            {candidate.currentVacancy?.title || "No vacancy"}
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
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/hr/vacancies/new">
                      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        Create New Vacancy
                      </button>
                    </Link>
                    <Link href="/hr/courses/new">
                      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        Create New Course
                      </button>
                    </Link>
                    <Link href="/hr/candidates">
                      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        View All Candidates
                      </button>
                    </Link>
                    <Link href="/hr/talent-pool">
                      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        Talent Pool
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

