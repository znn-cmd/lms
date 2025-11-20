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
      include: {
        user: {
          select: {
            name: true,
            surname: true,
          },
        },
      },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.offerId },
      include: {
        vacancy: {
          select: {
            title: true,
          },
        },
      },
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
        status: "accepted",
        respondedAt: new Date(),
      },
    })

    // Update candidate to employee
    await prisma.user.update({
      where: { id: candidate.userId },
      data: {
        role: UserRole.EMPLOYEE,
      },
    })

    await prisma.candidateProfile.update({
      where: { id: candidate.id },
      data: {
        status: CandidateStatus.HIRED,
      },
    })

    // Create notification for HR
    const hrUsers = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.HR, UserRole.ADMIN] },
      },
    })

    for (const hrUser of hrUsers) {
      await prisma.notification.create({
        data: {
          userId: hrUser.id,
          title: "Offer Accepted",
          message: `${candidate.user.name} ${candidate.user.surname} has accepted the offer${offer.vacancy ? ` for ${offer.vacancy.title}` : ''}`,
          type: "success",
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
        title: "Welcome to the Team!",
        message: "Congratulations! You are now an employee. Check your employee dashboard for additional training.",
        type: "success",
        channel: "INTERNAL",
        relatedId: offer.id,
        relatedType: "offer",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error accepting offer:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

