import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: params.id },
      include: {
        startCourse: {
          select: {
            id: true,
            title: true,
          },
        },
        sources: {
          include: {
            _count: {
              select: {
                candidates: true,
              },
            },
          },
        },
        _count: {
          select: {
            candidates: true,
          },
        },
      },
    })

    if (!vacancy) {
      return NextResponse.json({ message: "Vacancy not found" }, { status: 404 })
    }

    return NextResponse.json({ vacancy })
  } catch (error: any) {
    console.error("Error fetching vacancy:", error)
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

    const formData = await request.formData()
    const title = formData.get("title") as string
    const titleRu = formData.get("titleRu") as string
    const description = formData.get("description") as string
    const descriptionRu = formData.get("descriptionRu") as string
    const scoreThreshold = parseInt(formData.get("scoreThreshold") as string)
    const startCourseId = formData.get("startCourseId") as string
    const isActive = formData.get("isActive") === "on"

    const vacancy = await prisma.vacancy.update({
      where: { id: params.id },
      data: {
        title,
        titleRu: titleRu || null,
        description: description || null,
        descriptionRu: descriptionRu || null,
        scoreThreshold,
        startCourseId: startCourseId || null,
        isActive,
      },
    })

    const url = new URL(request.url)
    return NextResponse.redirect(new URL(`/hr/vacancies/${params.id}`, url.origin))
  } catch (error: any) {
    console.error("Error updating vacancy:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

