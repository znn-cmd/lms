import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, CheckCircle2, Lock } from "lucide-react"
import Link from "next/link"

export default async function EmployeeCoursePage({
  params,
}: {
  params: { courseId: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "EMPLOYEE") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
  })

  if (!candidate) {
    redirect("/employee/dashboard")
  }

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    select: {
      id: true,
      title: true,
      description: true,
      sequentialCompletion: true,
      modules: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!course) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="EMPLOYEE" />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-8 mt-16">
            <Card>
              <CardContent className="py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const candidateCourse = await prisma.candidateCourse.findFirst({
    where: {
      candidateId: candidate.id,
      courseId: course.id,
    },
    include: {
      lessonProgress: true,
    },
  })

  if (!candidateCourse) {
    redirect("/employee/courses")
  }

  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
  const completedLessons = candidateCourse.lessonProgress.filter((lp) => lp.completedAt).length
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Check if course is sequential
  const isSequential = course.sequentialCompletion

  return (
    <div className="flex min-h-screen">
      <Sidebar role="EMPLOYEE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => {
                const moduleLessons = module.lessons
                const moduleCompletedLessons = moduleLessons.filter((lesson) =>
                  candidateCourse.lessonProgress.some(
                    (lp) => lp.lessonId === lesson.id && lp.completedAt
                  )
                ).length

                // Check if previous module is completed (for sequential courses)
                const previousModuleCompleted =
                  !isSequential ||
                  moduleIndex === 0 ||
                  course.modules[moduleIndex - 1].lessons.every((lesson) =>
                    candidateCourse.lessonProgress.some(
                      (lp) => lp.lessonId === lesson.id && lp.completedAt
                    )
                  )

                return (
                  <Card key={module.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>
                          Module {moduleIndex + 1}: {module.title}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {moduleCompletedLessons} / {moduleLessons.length} lessons
                        </span>
                      </CardTitle>
                      {module.description && (
                        <CardDescription>{module.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {moduleLessons.map((lesson, lessonIndex) => {
                          const isCompleted = candidateCourse.lessonProgress.some(
                            (lp) => lp.lessonId === lesson.id && lp.completedAt
                          )

                          // Check if previous lesson is completed (for sequential courses)
                          const previousLessonCompleted =
                            !isSequential ||
                            lessonIndex === 0 ||
                            candidateCourse.lessonProgress.some(
                              (lp) =>
                                lp.lessonId === moduleLessons[lessonIndex - 1].id &&
                                lp.completedAt
                            )

                          const isLocked = isSequential && !previousLessonCompleted

                          return (
                            <Link
                              key={lesson.id}
                              href={
                                isLocked
                                  ? "#"
                                  : `/employee/courses/${course.id}/lessons/${lesson.id}`
                              }
                            >
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                  isLocked
                                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-50"
                                    : isCompleted
                                    ? "bg-green-50 border-green-200 hover:bg-green-100"
                                    : "bg-white border-gray-200 hover:bg-gray-50 cursor-pointer"
                                }`}
                              >
                                {isLocked ? (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium">{lesson.title}</p>
                                  {lesson.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                                {isLocked && (
                                  <span className="text-xs text-muted-foreground">
                                    Complete previous lesson
                                  </span>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

