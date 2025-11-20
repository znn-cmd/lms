import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Edit, Trash2, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

export default async function TestsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const tests = await prisma.test.findMany({
    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },
      vacancy: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          questions: true,
          candidateTests: true,
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
                <h1 className="text-3xl font-bold text-gray-900">Tests</h1>
                <p className="text-gray-600 mt-2">Manage tests and assessments</p>
              </div>
              <Link href="/hr/tests/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test
                </Button>
              </Link>
            </div>

            <div className="grid gap-4">
              {tests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{test.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {test.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.isActive ? (
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
                        <p className="text-sm text-muted-foreground">Questions</p>
                        <p className="text-lg font-semibold">{test._count.questions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Passing Score</p>
                        <p className="text-lg font-semibold">{test.passingScore}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time Limit</p>
                        <p className="text-lg font-semibold">{test.timeLimit || "No limit"} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Attempts</p>
                        <p className="text-lg font-semibold">{test._count.candidateTests}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm text-muted-foreground mb-4">
                      {test.course && (
                        <span>Course: {test.course.title}</span>
                      )}
                      {test.vacancy && (
                        <>
                          {test.course && <span>•</span>}
                          <span>Vacancy: {test.vacancy.title}</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/hr/tests/${test.id}/edit`}>
                        <Button variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="outline">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {tests.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tests yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first test to assess candidates
                    </p>
                    <Link href="/hr/tests/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Test
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

