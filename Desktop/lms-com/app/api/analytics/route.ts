import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Funnel data
    const applications = await prisma.candidateProfile.count()
    const registrations = await prisma.candidateProfile.count({
      where: { status: { not: "REGISTERED" } },
    })
    const profilesCompleted = await prisma.candidateProfile.count({
      where: { status: { in: ["PROFILE_COMPLETED", "IN_COURSE", "TEST_COMPLETED", "OFFER_SENT", "OFFER_ACCEPTED", "HIRED"] } },
    })
    const inCourse = await prisma.candidateProfile.count({
      where: { status: "IN_COURSE" },
    })
    const testsCompleted = await prisma.candidateProfile.count({
      where: { status: "TEST_COMPLETED" },
    })
    const offersSent = await prisma.candidateProfile.count({
      where: { status: "OFFER_SENT" },
    })
    const hired = await prisma.candidateProfile.count({
      where: { status: "HIRED" },
    })

    // Status distribution
    const statusGroups = await prisma.candidateProfile.groupBy({
      by: ["status"],
      _count: true,
    })

    const statusDistribution = statusGroups.map((group) => ({
      name: group.status.replace("_", " "),
      value: group._count,
    }))

    // Source performance
    const sources = await prisma.registrationSource.findMany({
      include: {
        _count: {
          select: {
            candidates: true,
          },
        },
      },
    })

    const sourcePerformance = sources.map((source) => ({
      name: source.name,
      registrations: source.registrations,
      completions: source.completions,
      candidates: source._count.candidates,
    }))

    // Test scores by vacancy
    const vacancies = await prisma.vacancy.findMany({
      include: {
        candidates: {
          include: {
            tests: {
              where: {
                score: { not: null },
              },
            },
          },
        },
      },
    })

    const testScores = vacancies.map((vacancy) => {
      const scores = vacancy.candidates
        .flatMap((c) => c.tests)
        .map((t) => t.score)
        .filter((s): s is number => s !== null)

      const averageScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0

      return {
        vacancy: vacancy.title,
        averageScore,
        passingScore: vacancy.scoreThreshold,
        count: scores.length,
      }
    })

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyData = await prisma.candidateProfile.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        status: true,
      },
    })

    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthRegistrations = monthlyData.filter(
        (d) => d.createdAt >= monthStart && d.createdAt <= monthEnd
      ).length

      const monthHired = monthlyData.filter(
        (d) => d.status === "HIRED" && d.createdAt >= monthStart && d.createdAt <= monthEnd
      ).length

      return {
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        registrations: monthRegistrations,
        hired: monthHired,
      }
    })

    return NextResponse.json({
      funnel: {
        applications,
        registrations,
        profilesCompleted,
        inCourse,
        testsCompleted,
        offersSent,
        hired,
      },
      statusDistribution,
      sourcePerformance,
      testScores,
      monthlyTrends,
    })
  } catch (error: any) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

