import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CandidateStatus } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const role = (session.user as any).role

    const candidate = await prisma.candidateProfile.findUnique({
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
        currentVacancy: true,
        mentor: true,
        registrationSource: true,
        courses: true,
        tests: true,
        offers: true,
      },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    // Check access: candidate can only see their own profile, HR/Admin can see all
    if (role === "CANDIDATE" && candidate.userId !== userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({ candidate })
  } catch (error: any) {
    console.error("Error fetching candidate:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const role = (session.user as any).role

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: params.id },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    // Check access: candidate can only edit their own profile, HR/Admin can edit any
    if (role === "CANDIDATE" && candidate.userId !== userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    if (!["HR", "ADMIN", "CANDIDATE"].includes(role)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      surname,
      email,
      phone,
      city,
      country,
      experience,
      languages,
      resumeLink,
      additionalInfo,
      status,
    } = body

    // Update user data
    await prisma.user.update({
      where: { id: candidate.userId },
      data: {
        name: name || undefined,
        surname: surname || undefined,
        email: email || undefined,
        phone: phone || undefined,
      },
    })

    // Update candidate profile
    const updateData: any = {
      city: city || null,
      country: country || null,
      experience: experience ? parseInt(experience) : null,
      languages: languages ? languages.split(",").map((l: string) => l.trim()).filter(Boolean) : [],
      resumeLink: resumeLink || null,
      additionalInfo: additionalInfo || null,
    }

    // Only HR/Admin can change status
    if (["HR", "ADMIN"].includes(role) && status) {
      updateData.status = status as CandidateStatus
    }

    await prisma.candidateProfile.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating candidate:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

