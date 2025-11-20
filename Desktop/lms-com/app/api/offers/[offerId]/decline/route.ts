import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CandidateStatus, UserRole } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "CANDIDATE") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.offerId },
    })

    if (!offer || offer.candidateId !== candidate.id) {
      return NextResponse.json({ message: "Offer not found" }, { status: 404 })
    }

    if (offer.status !== "sent") {
      return NextResponse.json({ message: "Offer already responded to" }, { status: 400 })
    }

    await prisma.offer.update({
      where: { id: offer.id },
      data: {
        status: "declined",
        respondedAt: new Date(),
      },
    })

    await prisma.candidateProfile.update({
      where: { id: candidate.id },
      data: {
        status: CandidateStatus.IN_TALENT_POOL,
      },
    })

    // Create notification for HR about decline
    const hrUsers = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.HR, UserRole.ADMIN] },
      },
    })

    for (const hrUser of hrUsers) {
      await prisma.notification.create({
        data: {
          userId: hrUser.id,
          title: "Offer Declined",
          message: `${candidate.user.name} ${candidate.user.surname} has declined the offer for ${offer.vacancy.title}. Candidate moved to talent pool.`,
          type: "warning",
          channel: "INTERNAL",
          relatedId: offer.id,
          relatedType: "offer",
        },
      })
    }

    // Create notification for candidate
    await prisma.notification.create({
      data: {
        userId: candidate.userId,
        title: "Offer Declined",
        message: "You have declined the job offer. Your profile has been moved to the talent pool.",
        type: "info",
        channel: "INTERNAL",
        relatedId: offer.id,
        relatedType: "offer",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error declining offer:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

