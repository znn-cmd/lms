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

export default async function EmployeeCoursesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "EMPLOYEE") {
    redirect("/auth/signin")
  }

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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
                <p className="text-gray-600">Please contact HR for assistance.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Additional Training</h1>
              <p className="text-gray-600 mt-2">Continue your professional development</p>
            </div>

            {activeCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Active Training</h2>
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
                                <span>Progress</span>
                                <span>
                                  {completedLessons} / {totalLessons} lessons
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
                              <Button className="w-full">Continue Training</Button>
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
                <h2 className="text-2xl font-semibold mb-4">Completed Training</h2>
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
                          Completed{" "}
                          {candidateCourse.completedAt
                            ? new Date(candidateCourse.completedAt).toLocaleDateString()
                            : "N/A"}
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
                  <h3 className="text-lg font-semibold mb-2">No training assigned</h3>
                  <p className="text-muted-foreground">
                    Additional training courses will appear here when assigned by HR.
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

