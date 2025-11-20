"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, CheckCircle2 } from "lucide-react"

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string

  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/tests/${testId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch test")
        }
        return res.json()
      })
      .then(data => {
        if (data.test && data.questions) {
          setTest(data.test)
          setQuestions(data.questions)
          setTimeLeft(data.test?.timeLimit ? Number(data.test.timeLimit) * 60 : null)
        } else {
          console.error("Invalid test data:", data)
        }
        setLoading(false)
      })
      .catch(error => {
        console.error("Error fetching test:", error)
        setLoading(false)
      })
  }, [testId])

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (response.ok) {
        router.push(`/candidate/tests/${testId}/results`)
      } else {
        alert("Error submitting test")
      }
    } catch (error) {
      alert("Error submitting test")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="CANDIDATE" />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-8 mt-16">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="py-12 text-center">
                  <p>Loading test...</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!test || questions.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="CANDIDATE" />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-8 mt-16">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="py-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Test not found</h2>
                  <p className="text-gray-600 mb-6">
                    The test you're looking for doesn't exist or you don't have access to it.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CANDIDATE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
                <p className="text-gray-600 mt-2">{test.description}</p>
              </div>
              {timeLeft !== null && (
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Question {currentQuestion + 1} of {questions.length}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(progress)}% complete
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{question.text}</h3>
                  
                  {question.type === "SINGLE_CHOICE" && (
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      {question.options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "MULTIPLE_CHOICE" && (
                    <div className="space-y-2">
                      {question.options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={`option-${index}`}
                            checked={(answers[question.id] || []).includes(option)}
                            onCheckedChange={(checked) => {
                              const current = answers[question.id] || []
                              if (checked) {
                                handleAnswerChange(question.id, [...current, option])
                              } else {
                                handleAnswerChange(question.id, current.filter((o: string) => o !== option))
                              }
                            }}
                          />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "OPEN_ANSWER" && (
                    <Textarea
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={6}
                    />
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    {currentQuestion < questions.length - 1 ? (
                      <Button
                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                      >
                        Next Question
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={submitting}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {submitting ? "Submitting..." : "Submit Test"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

