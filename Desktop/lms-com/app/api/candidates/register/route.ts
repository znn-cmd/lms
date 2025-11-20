import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole, CandidateStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      confirmPassword,
      name,
      surname,
      phone,
      city,
      country,
      experience,
      languages,
      resumeLink,
      additionalInfo,
      sourceLink,
    } = body

    // Validation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Find registration source
    const source = await prisma.registrationSource.findUnique({
      where: { uniqueLink: sourceLink },
      include: { vacancy: true },
    })

    if (!source) {
      return NextResponse.json(
        { message: "Invalid registration link" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and candidate profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        surname,
        phone,
        role: UserRole.CANDIDATE,
        candidateProfile: {
          create: {
            city,
            country,
            experience: experience ? parseInt(experience) : null,
            languages: languages || [],
            resumeLink,
            additionalInfo,
            status: CandidateStatus.REGISTERED,
            currentVacancyId: source.vacancyId,
            registrationSourceId: source.id,
          },
        },
      },
      include: {
        candidateProfile: true,
      },
    })

    // Update registration source stats
    await prisma.registrationSource.update({
      where: { id: source.id },
      data: {
        registrations: {
          increment: 1,
        },
      },
    })

    // Assign start course if available
    if (source.vacancy.startCourseId && user.candidateProfile) {
      await prisma.candidateCourse.create({
        data: {
          candidateId: user.candidateProfile.id,
          courseId: source.vacancy.startCourseId,
          startedAt: new Date(),
        },
      })
    }

    return NextResponse.json(
      { message: "Registration successful", userId: user.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: 500 }
    )
  }
}

