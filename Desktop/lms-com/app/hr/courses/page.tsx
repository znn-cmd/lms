import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Plus, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/i18n"

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const locale = await getLocale()

  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: {
          modules: true,
          candidateCourses: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          surname: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("hr.courses.title", locale)}</h1>
                <p className="text-gray-600 mt-2">{t("hr.courses.subtitle", locale)}</p>
              </div>
              <Link href="/hr/courses/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("hr.courses.createCourse", locale)}
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {course.description || t("common.noDescription", locale)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.isActive ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {t("common.active", locale)}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {t("common.inactive", locale)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t("common.modules", locale)}</p>
                        <p className="text-lg font-semibold">{course._count.modules}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("common.enrolled", locale)}</p>
                        <p className="text-lg font-semibold">{course._count.candidateCourses}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("common.language", locale)}</p>
                        <p className="text-lg font-semibold">{course.language}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("common.sequential", locale)}</p>
                        <p className="text-lg font-semibold">{course.isSequential ? t("common.yes", locale) : t("common.no", locale)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/hr/courses/${course.id}/edit`}>
                        <Button variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          {t("common.edit", locale)}
                        </Button>
                      </Link>
                      <Link href={`/hr/courses/${course.id}`}>
                        <Button variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          {t("common.view", locale)}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {courses.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("common.noCoursesYet", locale)}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("common.noCoursesYetDesc", locale)}
                    </p>
                    <Link href="/hr/courses/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        {t("hr.courses.createCourse", locale)}
                      </Button>
                    </Link>
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

