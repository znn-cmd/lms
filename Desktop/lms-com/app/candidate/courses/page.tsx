import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Play, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"

export default async function CandidateCourses() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "CANDIDATE") {
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
          lessonProgress: {
            include: {
              lesson: true,
            },
          },
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
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CANDIDATE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 mt-2">Continue your learning journey</p>
            </div>

            <div className="grid gap-6">
              {candidate.courses.map((candidateCourse) => {
                const totalLessons = candidateCourse.course.modules.reduce(
                  (acc, module) => acc + module.lessons.length,
                  0
                )
                const completedLessons = candidateCourse.lessonProgress.filter(
                  (lp) => lp.isCompleted
                ).length
                const progressPercentage = totalLessons > 0 
                  ? Math.round((completedLessons / totalLessons) * 100)
                  : 0

                return (
                  <Card key={candidateCourse.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl">{candidateCourse.course.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {candidateCourse.course.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {candidateCourse.completedAt ? (
                            <span className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="w-5 h-5" />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-blue-600">
                              <Clock className="w-5 h-5" />
                              In Progress
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {completedLessons} / {totalLessons} lessons
                            </span>
                          </div>
                          <Progress value={progressPercentage} className="h-3" />
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div>
                            <span>Modules: </span>
                            <span className="font-medium">{candidateCourse.course.modules.length}</span>
                          </div>
                          <div>
                            <span>Started: </span>
                            <span className="font-medium">
                              {candidateCourse.startedAt 
                                ? new Date(candidateCourse.startedAt).toLocaleDateString()
                                : "Not started"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Link href={`/candidate/courses/${candidateCourse.course.id}`}>
                            <Button>
                              <Play className="w-4 h-4 mr-2" />
                              {candidateCourse.startedAt ? "Continue Learning" : "Start Course"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {candidate.courses.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses assigned</h3>
                    <p className="text-muted-foreground">
                      You don't have any courses assigned yet. Contact your mentor or HR for more information.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

