import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CandidatesKanban } from "./kanban"

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { 
    search?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const where: any = {}
  
  // Date filter
  if (searchParams.dateFrom || searchParams.dateTo) {
    where.createdAt = {}
    if (searchParams.dateFrom) {
      where.createdAt.gte = new Date(searchParams.dateFrom)
    }
    if (searchParams.dateTo) {
      const dateTo = new Date(searchParams.dateTo)
      dateTo.setHours(23, 59, 59, 999) // End of day
      where.createdAt.lte = dateTo
    }
  }

  // Search filter
  if (searchParams.search) {
    where.OR = [
      { user: { name: { contains: searchParams.search, mode: "insensitive" } } },
      { user: { surname: { contains: searchParams.search, mode: "insensitive" } } },
      { user: { email: { contains: searchParams.search, mode: "insensitive" } } },
    ]
  }

  const candidates = await prisma.candidateProfile.findMany({
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
      mentor: {
        select: {
          name: true,
          surname: true,
        },
      },
      tests: {
        include: {
          test: {
            select: {
              passingScore: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      courses: {
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
        take: 1,
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
          <div className="max-w-full mx-auto">
            <CandidatesKanban candidates={candidates} searchParams={searchParams} />
          </div>
        </main>
      </div>
    </div>
  )
}
