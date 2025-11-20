import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Plus, Link as LinkIcon, Users, Settings } from "lucide-react"
import Link from "next/link"

export default async function VacanciesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const vacancies = await prisma.vacancy.findMany({
    include: {
      _count: {
        select: {
          candidates: true,
          sources: true,
        },
      },
      startCourse: {
        select: {
          title: true,
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
                <h1 className="text-3xl font-bold text-gray-900">Vacancies</h1>
                <p className="text-gray-600 mt-2">Manage job openings and recruitment</p>
              </div>
              <Link href="/hr/vacancies/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Vacancy
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {vacancies.map((vacancy) => (
                <Card key={vacancy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{vacancy.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {vacancy.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {vacancy.isActive ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Candidates</p>
                        <p className="text-lg font-semibold">{vacancy._count.candidates}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sources</p>
                        <p className="text-lg font-semibold">{vacancy._count.sources}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Score Threshold</p>
                        <p className="text-lg font-semibold">{vacancy.scoreThreshold}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Start Course</p>
                        <p className="text-lg font-semibold">
                          {vacancy.startCourse?.title || "None"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/hr/vacancies/${vacancy.id}`}>
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/hr/vacancies/${vacancy.id}/sources`}>
                        <Button variant="outline">
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Registration Links
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {vacancies.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No vacancies yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first vacancy to start recruiting candidates.
                    </p>
                    <Link href="/hr/vacancies/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Vacancy
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

