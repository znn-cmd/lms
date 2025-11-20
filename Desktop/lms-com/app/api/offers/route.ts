import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CandidateStatus } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const offers = await prisma.offer.findMany({
      include: {
        candidate: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                email: true,
              },
            },
          },
        },
        vacancy: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ offers })
  } catch (error: any) {
    console.error("Error fetching offers:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, candidateId, vacancyId, testId, templateId, content, contentRu } = body

    // Validate required fields
    if (!type || !["personal", "general"].includes(type)) {
      return NextResponse.json({ message: "Invalid offer type" }, { status: 400 })
    }

    if (!content || content.trim() === "") {
      return NextResponse.json({ message: "Offer content is required" }, { status: 400 })
    }

    // Validate required fields based on type
    if (type === "personal" && (!candidateId || candidateId.trim() === "")) {
      return NextResponse.json({ message: "Candidate is required for personal offers" }, { status: 400 })
    }
    if (type === "general" && (!vacancyId || vacancyId.trim() === "")) {
      return NextResponse.json({ message: "Vacancy is required for general offers" }, { status: 400 })
    }

    // Prepare data object
    const offerData: any = {
      type: type,
      content: content.trim(),
      status: "sent",
    }

    // Set candidateId only for personal offers
    if (type === "personal" && candidateId) {
      offerData.candidateId = candidateId
    } else {
      offerData.candidateId = null
    }

    // Set vacancyId only for general offers
    if (type === "general" && vacancyId) {
      offerData.vacancyId = vacancyId
    } else {
      offerData.vacancyId = null
    }

    // Optional fields
    if (testId && testId !== "none" && testId.trim() !== "") {
      offerData.testId = testId
    } else {
      offerData.testId = null
    }

    if (templateId && templateId !== "none" && templateId.trim() !== "") {
      offerData.templateId = templateId
    } else {
      offerData.templateId = null
    }

    if (contentRu && contentRu.trim() !== "") {
      offerData.contentRu = contentRu.trim()
    } else {
      offerData.contentRu = null
    }

    const offer = await prisma.offer.create({
      data: offerData,
    })

    // Update candidate status for personal offers
    if (type === "personal" && candidateId) {
      await prisma.candidateProfile.update({
        where: { id: candidateId },
        data: {
          status: CandidateStatus.OFFER_SENT,
        },
      })

      // Create notification for candidate
      const candidate = await prisma.candidateProfile.findUnique({
        where: { id: candidateId },
        include: { user: true },
      })

      if (candidate) {
        await prisma.notification.create({
          data: {
            userId: candidate.userId,
            title: "New Job Offer",
            message: `You have received a job offer. Please check your offers section.`,
            type: "success",
            channel: "INTERNAL",
            relatedId: offer.id,
            relatedType: "offer",
          },
        })
      }
    }

    return NextResponse.json({ offer }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating offer:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

