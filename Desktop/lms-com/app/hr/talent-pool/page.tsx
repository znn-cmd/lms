import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, Search } from "lucide-react"
import { CandidateActions } from "./candidate-actions"

export default async function TalentPoolPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; vacancy?: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const where: any = {
    OR: [
      { status: "IN_TALENT_POOL" },
      { status: "REJECTED" },
      { status: "OFFER_DECLINED" },
    ],
  }

  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status
  }
  if (searchParams.vacancy && searchParams.vacancy !== "all") {
    where.currentVacancyId = searchParams.vacancy
  }
  if (searchParams.search) {
    where.OR = [
      ...(where.OR || []),
      { user: { name: { contains: searchParams.search, mode: "insensitive" } } },
      { user: { surname: { contains: searchParams.search, mode: "insensitive" } } },
      { user: { email: { contains: searchParams.search, mode: "insensitive" } } },
    ]
  }

  const [candidates, vacancies] = await Promise.all([
    prisma.candidateProfile.findMany({
      where,
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
        tests: {
          include: {
            test: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { score: "desc" },
          take: 1,
        },
        registrationSource: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.vacancy.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
      },
    }),
  ])

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Talent Pool</h1>
                <p className="text-gray-600 mt-2">Manage your candidate database</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name or email..."
                      defaultValue={searchParams.search}
                    />
                  </div>
                  <Select defaultValue={searchParams.status || "all"}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="IN_TALENT_POOL">In Talent Pool</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="OFFER_DECLINED">Offer Declined</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue={searchParams.vacancy || "all"}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by vacancy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vacancies</SelectItem>
                      {vacancies.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {candidates.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {candidate.user.name} {candidate.user.surname}
                        </h3>
                        <p className="text-sm text-muted-foreground">{candidate.user.email}</p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Status: {candidate.status.replace("_", " ")}</span>
                          <span>•</span>
                          <span>Vacancy: {candidate.currentVacancy?.title || "None"}</span>
                          <span>•</span>
                          <span>Source: {candidate.registrationSource?.name || "N/A"}</span>
                          {candidate.tests[0] && (
                            <>
                              <span>•</span>
                              <span>Best Score: {candidate.tests[0].score || "N/A"}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <CandidateActions
                        candidateId={candidate.id}
                        candidateName={`${candidate.user.name} ${candidate.user.surname}`}
                        candidateEmail={candidate.user.email}
                        candidatePhone={candidate.user.phone}
                        currentVacancyId={candidate.currentVacancyId}
                        vacancies={vacancies}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {candidates.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Talent Pool is empty</h3>
                    <p className="text-muted-foreground">
                      Candidates will appear here when they are rejected or decline offers.
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

