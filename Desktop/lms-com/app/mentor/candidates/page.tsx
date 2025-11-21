import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import Link from "next/link"

export default async function MentorCandidatesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "MENTOR") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const candidates = await prisma.candidateProfile.findMany({
    where: { mentorId: userId },
    include: {
      user: {
        select: {
          name: true,
          surname: true,
          email: true,
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
            },
          },
        },
      },
    },
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar role="MENTOR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("mentor.candidates.title", locale)}</h1>
              <p className="text-gray-600 mt-2">{t("mentor.candidates.subtitle", locale)}</p>
            </div>

            <div className="grid gap-4">
              {candidates.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={`/mentor/candidates/${candidate.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {candidate.user.name} {candidate.user.surname}
                          </h3>
                          <p className="text-sm text-muted-foreground">{candidate.user.email}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {candidate.currentVacancy?.title || t("common.noVacancy", locale)} • {t("common.status", locale)}:{" "}
                            {candidate.status.replace("_", " ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {candidate.courses.length} {t("common.course", locale)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {candidates.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("mentor.dashboard.noCandidatesAssigned", locale)}</h3>
                    <p className="text-muted-foreground">
                      {t("mentor.candidates.noCandidatesAssignedDesc", locale)}
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

