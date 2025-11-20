import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { MessageSquare, BookOpen, FileText } from "lucide-react"
import Link from "next/link"

export default async function CandidateDetailPage({
  params,
}: {
  params: { candidateId: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "MENTOR") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const candidate = await prisma.candidateProfile.findUnique({
    where: {
      id: params.candidateId,
      mentorId: userId,
    },
    include: {
      user: {
        select: {
          name: true,
          surname: true,
          email: true,
          phone: true,
        },
      },
      currentVacancy: {
        select: {
          title: true,
        },
      },
      courses: {
        include: {
          course: {
            select: {
              title: true,
              description: true,
            },
          },
        },
      },
      tests: {
        include: {
          test: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!candidate) {
    return <div>Candidate not found or access denied</div>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="MENTOR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {candidate.user.name} {candidate.user.surname}
                </h1>
                <p className="text-gray-600 mt-2">{candidate.user.email}</p>
              </div>
              <Link href={`/mentor/chat/${candidate.id}`}>
                <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Open Chat
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{candidate.status.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vacancy</p>
                    <p className="font-medium">{candidate.currentVacancy?.title || "None"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{candidate.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{candidate.experience || 0} years</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidate.courses.map((cc) => (
                      <div key={cc.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{cc.course.title}</span>
                          <span>{cc.progress}%</span>
                        </div>
                        <Progress value={cc.progress} className="h-2" />
                      </div>
                    ))}
                    {candidate.courses.length === 0 && (
                      <p className="text-sm text-muted-foreground">No courses assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidate.tests.map((ct) => (
                      <div key={ct.id} className="flex items-center justify-between p-2 rounded border">
                        <div>
                          <p className="font-medium text-sm">{ct.test.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {ct.status.replace("_", " ")}
                            {ct.score !== null && ` • ${ct.score}%`}
                          </p>
                        </div>
                        {ct.status === "pending_review" && (
                          <Link href={`/mentor/tests/${ct.id}`}>
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </Link>
                        )}
                      </div>
                    ))}
                    {candidate.tests.length === 0 && (
                      <p className="text-sm text-muted-foreground">No tests taken</p>
                    )}
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

