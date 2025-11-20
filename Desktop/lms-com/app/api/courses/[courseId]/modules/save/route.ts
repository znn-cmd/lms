import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { modules } = body

    // Process each module
    for (const moduleData of modules) {
      if (moduleData.id.startsWith("temp-")) {
        // Create new module
        const newModule = await prisma.module.create({
          data: {
            title: moduleData.title,
            description: moduleData.description || null,
            order: moduleData.order,
            courseId: params.courseId,
          },
        })

        // Create lessons for new module
        if (moduleData.lessons && moduleData.lessons.length > 0) {
          for (const lessonData of moduleData.lessons) {
            await prisma.lesson.create({
              data: {
                title: lessonData.title,
                description: lessonData.description || null,
                content: lessonData.content || "",
                contentType: lessonData.contentType || "TEXT",
                duration: lessonData.duration || 0,
                order: lessonData.order || 0,
                moduleId: newModule.id,
              },
            })
          }
        }
      } else {
        // Update existing module
        await prisma.module.update({
          where: { id: moduleData.id },
          data: {
            title: moduleData.title,
            description: moduleData.description || null,
            order: moduleData.order,
          },
        })

        // Get existing lessons
        const existingLessons = await prisma.lesson.findMany({
          where: { moduleId: moduleData.id },
        })

        const existingLessonIds = existingLessons.map((l) => l.id)
        const newLessonIds = (moduleData.lessons || [])
          .filter((l: any) => !l.id.startsWith("temp-lesson-"))
          .map((l: any) => l.id)

        // Delete removed lessons
        const lessonsToDelete = existingLessonIds.filter((id) => !newLessonIds.includes(id))
        if (lessonsToDelete.length > 0) {
          await prisma.lesson.deleteMany({
            where: { id: { in: lessonsToDelete } },
          })
        }

        // Update or create lessons
        if (moduleData.lessons && moduleData.lessons.length > 0) {
          for (const lessonData of moduleData.lessons) {
            if (lessonData.id.startsWith("temp-lesson-")) {
              // Create new lesson
              await prisma.lesson.create({
                data: {
                  title: lessonData.title,
                  description: lessonData.description || null,
                  content: lessonData.content || "",
                  contentType: lessonData.contentType || "TEXT",
                  duration: lessonData.duration || 0,
                  order: lessonData.order || 0,
                  moduleId: moduleData.id,
                },
              })
            } else {
              // Update existing lesson
              await prisma.lesson.update({
                where: { id: lessonData.id },
                data: {
                  title: lessonData.title,
                  description: lessonData.description || null,
                  content: lessonData.content || "",
                  contentType: lessonData.contentType || "TEXT",
                  duration: lessonData.duration || 0,
                  order: lessonData.order || 0,
                },
              })
            }
          }
        }
      }
    }

    // Delete modules that are not in the list
    const moduleIds = modules
      .filter((m: any) => !m.id.startsWith("temp-"))
      .map((m: any) => m.id)

    if (moduleIds.length > 0) {
      await prisma.module.deleteMany({
        where: {
          courseId: params.courseId,
          id: { notIn: moduleIds },
        },
      })
    } else {
      // If all modules are new, delete all existing ones
      await prisma.module.deleteMany({
        where: { courseId: params.courseId },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving modules:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

