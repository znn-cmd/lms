import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.offerId },
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
            id: true,
            title: true,
          },
        },
      },
    })

    // Fetch test separately if testId exists
    let test = null
    if (offer?.testId) {
      test = await prisma.test.findUnique({
        where: { id: offer.testId },
        select: {
          id: true,
          title: true,
        },
      })
    }

    const offerWithTest = offer ? { ...offer, test } : null

    if (!offerWithTest) {
      return NextResponse.json({ message: "Offer not found" }, { status: 404 })
    }

    return NextResponse.json({ offer: offerWithTest })
  } catch (error: any) {
    console.error("Error fetching offer:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, candidateId, vacancyId, testId, templateId, content, contentRu } = body

    const offer = await prisma.offer.update({
      where: { id: params.offerId },
      data: {
        type: type || "personal",
        candidateId: candidateId || null,
        vacancyId: vacancyId || null,
        testId: testId || null,
        templateId: templateId || null,
        content,
        contentRu: contentRu || null,
      },
    })

    return NextResponse.json({ offer })
  } catch (error: any) {
    console.error("Error updating offer:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

