import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const sources = await prisma.registrationSource.findMany({
      where: { vacancyId: params.id },
      include: {
        _count: {
          select: {
            candidates: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ sources })
  } catch (error: any) {
    console.error("Error fetching sources:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    // Generate unique link
    const uniqueToken = randomBytes(8).toString("hex")
    const uniqueLink = `${params.id}/${uniqueToken}`

    const source = await prisma.registrationSource.create({
      data: {
        name,
        uniqueLink,
        vacancyId: params.id,
      },
    })

    return NextResponse.json({ source }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating source:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

