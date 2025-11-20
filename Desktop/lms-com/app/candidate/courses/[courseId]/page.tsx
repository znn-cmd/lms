import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Lock, Play, FileText, Video, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

export default async function CoursePage({
  params,
}: {
  params: { courseId: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "CANDIDATE") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
  })

  if (!candidate) {
    redirect("/candidate/dashboard")
  }

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
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
    return <div>Course not found</div>
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

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
      case "WEBINAR_RECORDING":
        return Video
      case "PDF":
      case "TEXT":
        return FileText
      case "EXTERNAL_LINK":
        return LinkIcon
      default:
        return FileText
    }
  }

  const isLessonCompleted = (lessonId: string) => {
    if (!candidateCourse) return false
    return candidateCourse.lessonProgress.some(
      (lp) => lp.lessonId === lessonId && lp.isCompleted
    )
  }

  const canAccessLesson = (lessonOrder: number, moduleOrder: number) => {
    if (!course.isSequential) return true
    if (!candidateCourse) return moduleOrder === 1 && lessonOrder === 1

    // Check if previous lesson is completed
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (module.order < moduleOrder || (module.order === moduleOrder && lesson.order < lessonOrder)) {
          if (!isLessonCompleted(lesson.id)) {
            return false
          }
        }
      }
    }
    return true
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CANDIDATE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
            </div>

            {candidateCourse && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{candidateCourse.progress}%</span>
                    </div>
                    <Progress value={candidateCourse.progress} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {course.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {module.lessons.map((lesson) => {
                        const Icon = getLessonIcon(lesson.type)
                        const completed = isLessonCompleted(lesson.id)
                        const canAccess = canAccessLesson(lesson.order, module.order)

                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border ${
                              completed
                                ? "bg-green-50 border-green-200"
                                : canAccess
                                ? "bg-white border-gray-200 hover:border-primary"
                                : "bg-gray-50 border-gray-200 opacity-60"
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {completed ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                              ) : canAccess ? (
                                <Circle className="w-6 h-6 text-gray-400" />
                              ) : (
                                <Lock className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {lesson.type.replace("_", " ")} • {lesson.duration || "N/A"} min
                              </p>
                            </div>
                            {canAccess ? (
                              <Link href={`/candidate/courses/${course.id}/lessons/${lesson.id}`}>
                                <Button variant={completed ? "outline" : "default"} size="sm">
                                  {completed ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Review
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      Start
                                    </>
                                  )}
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="ghost" size="sm" disabled>
                                <Lock className="w-4 h-4 mr-2" />
                                Locked
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

