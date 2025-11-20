import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Link as LinkIcon, Save } from "lucide-react"
import Link from "next/link"

export default async function VacancyManagePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const vacancy = await prisma.vacancy.findUnique({
    where: { id: params.id },
    include: {
      startCourse: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          candidates: true,
          sources: true,
        },
      },
    },
  })

  if (!vacancy) {
    return <div>Vacancy not found</div>
  }

  const courses = await prisma.course.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
    },
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/hr/vacancies">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Vacancy</h1>
                <p className="text-gray-600 mt-2">{vacancy.title}</p>
              </div>
            </div>

            <form action={`/api/vacancies/${vacancy.id}`} method="POST" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vacancy Details</CardTitle>
                  <CardDescription>Edit vacancy information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (EN) *</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={vacancy.title}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titleRu">Title (RU)</Label>
                    <Input
                      id="titleRu"
                      name="titleRu"
                      defaultValue={vacancy.titleRu || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (EN)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={vacancy.description || ""}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionRu">Description (RU)</Label>
                    <Textarea
                      id="descriptionRu"
                      name="descriptionRu"
                      defaultValue={vacancy.descriptionRu || ""}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scoreThreshold">Score Threshold (%) *</Label>
                    <Input
                      id="scoreThreshold"
                      name="scoreThreshold"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={vacancy.scoreThreshold}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startCourseId">Start Course</Label>
                    <select
                      id="startCourseId"
                      name="startCourseId"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue={vacancy.startCourseId || ""}
                    >
                      <option value="">None</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      defaultChecked={vacancy.isActive}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 mt-6">
                <Link href="/hr/vacancies">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Link href={`/hr/vacancies/${vacancy.id}/sources`}>
                  <Button type="button" variant="outline">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Registration Links
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

