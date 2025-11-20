import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, User, GraduationCap, FileText, MessageSquare } from "lucide-react"
import Link from "next/link"
import { CandidateActions } from "./actions"
import { EditCandidateButton } from "./edit-button"

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const [candidate, vacancies] = await Promise.all([
    prisma.candidateProfile.findUnique({
      where: { id: params.id },
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
          id: true,
          title: true,
        },
      },
      mentor: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
        },
      },
      registrationSource: {
        select: {
          name: true,
        },
      },
      courses: {
        include: {
          course: {
            select: {
              id: true,
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
              id: true,
              title: true,
              passingScore: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      offers: {
        include: {
          vacancy: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  }),
    prisma.vacancy.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
      },
      orderBy: { title: "asc" },
    }),
  ])

  if (!candidate) {
    return <div>Candidate not found</div>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/hr/candidates">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {candidate.user.name} {candidate.user.surname}
                </h1>
                <p className="text-gray-600 mt-2">{candidate.user.email}</p>
              </div>
              <div className="flex gap-2">
                <EditCandidateButton candidate={candidate} candidateId={candidate.id} />
                {candidate.mentor && (
                  <Link href={`/mentor/chat/${candidate.id}`}>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{candidate.status.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vacancy</p>
                    <p className="font-medium">{candidate.currentVacancy?.title || "None"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Source</p>
                    <p className="font-medium">{candidate.registrationSource?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{candidate.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">{candidate.country || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{candidate.experience || 0} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Languages</p>
                    <p className="font-medium">{candidate.languages.join(", ") || "N/A"}</p>
                  </div>
                  {candidate.resumeLink && (
                    <div>
                      <p className="text-sm text-muted-foreground">Resume</p>
                      <a
                        href={candidate.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Resume →
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.user.phone || "Not provided"}</span>
                  </div>
                  {candidate.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{candidate.city}, {candidate.country}</span>
                    </div>
                  )}
                  {candidate.mentor && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Mentor</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {candidate.mentor.name} {candidate.mentor.surname}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{candidate.mentor.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                    <p className="text-2xl font-bold">{candidate.courses.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tests Completed</p>
                    <p className="text-2xl font-bold">
                      {candidate.tests.filter((t) => t.status === "completed").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Offers Received</p>
                    <p className="text-2xl font-bold">{candidate.offers.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registered</p>
                    <p className="text-sm">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>

            {candidate.courses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidate.courses.map((cc) => (
                      <div key={cc.id}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{cc.course.title}</span>
                          <span>{cc.progress}%</span>
                        </div>
                        <Progress value={cc.progress} className="h-2" />
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>
                            Started:{" "}
                            {cc.startedAt ? new Date(cc.startedAt).toLocaleDateString() : "Not started"}
                          </span>
                          {cc.completedAt && (
                            <span>Completed: {new Date(cc.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <CandidateActions
              candidateId={candidate.id}
              currentVacancyId={candidate.currentVacancyId}
              currentStatus={candidate.status}
              vacancies={vacancies}
            />

            {candidate.tests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {candidate.tests.map((ct) => (
                      <div
                        key={ct.id}
                        className="flex items-center justify-between p-3 rounded border"
                      >
                        <div>
                          <p className="font-medium">{ct.test.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {ct.status.replace("_", " ")}
                            {ct.score !== null && ` • Score: ${ct.score}%`}
                            {ct.score !== null && ct.score >= ct.test.passingScore && (
                              <span className="text-green-600 ml-2">✓ Passed</span>
                            )}
                            {ct.score !== null && ct.score < ct.test.passingScore && (
                              <span className="text-red-600 ml-2">✗ Failed</span>
                            )}
                          </p>
                        </div>
                        {ct.completedAt && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(ct.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {candidate.offers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Offers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {candidate.offers.map((offer) => (
                      <div key={offer.id} className="p-3 rounded border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{offer.vacancy.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Status: {offer.status} • Sent: {new Date(offer.sentAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              offer.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : offer.status === "declined"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {offer.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

