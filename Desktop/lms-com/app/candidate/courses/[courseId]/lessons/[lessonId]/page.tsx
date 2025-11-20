"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft, ArrowRight, Video, FileText, Link as LinkIcon } from "lucide-react"
import ReactPlayer from "react-player"
import Link from "next/link"
import { LessonChat } from "@/components/lesson-chat"
import { useSession } from "next-auth/react"

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [candidateId, setCandidateId] = useState<string | null>(null)
  const [mentor, setMentor] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then(res => res.json())
      .then(data => {
        setLesson(data.lesson)
        setCompleted(data.completed)
        setLoading(false)
      })
  }, [lessonId])

  useEffect(() => {
    // Fetch candidate profile for chat
    fetch("/api/candidate/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.candidate) {
          setCandidateId(data.candidate.id)
          setMentor(data.candidate.mentor)
        }
      })
  }, [])

  const handleComplete = async () => {
    await fetch(`/api/lessons/${lessonId}/complete`, {
      method: "POST",
    })
    setCompleted(true)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!lesson) {
    return <div>Lesson not found</div>
  }

  const getContentComponent = () => {
    switch (lesson.type) {
      case "VIDEO":
      case "WEBINAR_RECORDING":
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <ReactPlayer
              url={lesson.content || "https://example.com/video.mp4"}
              width="100%"
              height="100%"
              controls
            />
          </div>
        )
      case "PDF":
        return (
          <iframe
            src={lesson.content}
            className="w-full h-[600px] rounded-lg border"
            title="PDF Document"
          />
        )
      case "EXTERNAL_LINK":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <LinkIcon className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">External Resource</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    This lesson links to an external resource
                  </p>
                  <a
                    href={lesson.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Open Link →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case "TEXT":
      default:
        return (
          <Card>
            <CardContent className="p-6 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.content || lesson.description || "" }} />
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CANDIDATE" />
      <div className="flex-1 ml-64 pb-80">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Link href={`/candidate/courses/${courseId}`}>
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Course
                </Button>
              </Link>
              {completed && (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  Completed
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-gray-600 mt-2">{lesson.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              {getContentComponent()}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" disabled>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Lesson
              </Button>
              {!completed ? (
                <Button onClick={handleComplete}>
                  Mark as Complete
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Link href={`/candidate/courses/${courseId}`}>
                  <Button>
                    Next Lesson
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>
        {candidateId && mentor && (
          <LessonChat candidateId={candidateId} mentor={mentor} />
        )}
      </div>
    </div>
  )
}

