"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from "lucide-react"
import Link from "next/link"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Question {
  id: string
  text: string
  textRu: string
  type: string
  options: string[]
  optionsRu: string[]
  correctAnswer: string | null
  correctAnswerRu: string | null
  points: number
  order: number
}

function SortableQuestion({
  question,
  onUpdate,
  onDelete,
}: {
  question: Question
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: question.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4 bg-white">
      <div className="flex items-start gap-4">
        <div {...attributes} {...listeners} className="mt-2 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Question Text (EN) *</Label>
              <Textarea
                value={question.text}
                onChange={(e) => onUpdate(question.id, { text: e.target.value })}
                rows={2}
                required
              />
            </div>
            <div>
              <Label>Question Text (RU)</Label>
              <Textarea
                value={question.textRu || ""}
                onChange={(e) => onUpdate(question.id, { textRu: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div>
            <Label>Question Type *</Label>
            <Select
              value={question.type}
              onValueChange={(value) => onUpdate(question.id, { type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="OPEN_ANSWER">Open Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") && (
            <div className="space-y-2">
              <Label>Options (EN) - one per line</Label>
              <Textarea
                value={question.options.join("\n")}
                onChange={(e) =>
                  onUpdate(question.id, {
                    options: e.target.value.split("\n").filter(Boolean),
                  })
                }
                rows={4}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
              <Label>Options (RU) - one per line</Label>
              <Textarea
                value={(question.optionsRu || []).join("\n")}
                onChange={(e) =>
                  onUpdate(question.id, {
                    optionsRu: e.target.value.split("\n").filter(Boolean),
                  })
                }
                rows={4}
                placeholder="Вариант 1&#10;Вариант 2&#10;Вариант 3"
              />
              <div>
                <Label>Correct Answer (EN) *</Label>
                {question.type === "SINGLE_CHOICE" ? (
                  <Select
                    value={question.correctAnswer || ""}
                    onValueChange={(value) => onUpdate(question.id, { correctAnswer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((opt, idx) => (
                        <SelectItem key={idx} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    {question.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(question.correctAnswer
                            ? JSON.parse(question.correctAnswer)
                            : []
                          ).includes(opt)}
                          onChange={(e) => {
                            const current = question.correctAnswer
                              ? JSON.parse(question.correctAnswer)
                              : []
                            const updated = e.target.checked
                              ? [...current, opt]
                              : current.filter((a: string) => a !== opt)
                            onUpdate(question.id, { correctAnswer: JSON.stringify(updated) })
                          }}
                        />
                        <Label>{opt}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <Label>Points *</Label>
            <Input
              type="number"
              min="1"
              value={question.points}
              onChange={(e) =>
                onUpdate(question.id, { points: parseInt(e.target.value) || 1 })
              }
            />
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => onDelete(question.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function EditTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string

  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchTest()
  }, [testId])

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}`)
      const data = await response.json()
      setTest(data.test)
      setQuestions(data.questions || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching test:", error)
      setLoading(false)
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newQuestions = arrayMove(items, oldIndex, newIndex)
        return newQuestions.map((q, index) => ({ ...q, order: index + 1 }))
      })
      setHasChanges(true)
    }
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      text: "",
      textRu: "",
      type: "SINGLE_CHOICE",
      options: [],
      optionsRu: [],
      correctAnswer: null,
      correctAnswerRu: null,
      points: 10,
      order: questions.length + 1,
    }
    setQuestions([...questions, newQuestion])
    setHasChanges(true)
  }

  const updateQuestion = (questionId: string, updates: any) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)))
    setHasChanges(true)
  }

  const deleteQuestion = (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((q) => q.id !== questionId))
      setHasChanges(true)
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/tests/${testId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      })

      if (response.ok) {
        alert("Changes saved successfully!")
        setHasChanges(false)
        fetchTest()
      } else {
        const error = await response.json()
        alert(error.message || "Failed to save changes")
      }
    } catch (error) {
      alert("An error occurred while saving")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/hr/tests">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Edit Test</h1>
                  <p className="text-gray-600 mt-2">{test?.title}</p>
                </div>
              </div>
              {hasChanges && (
                <Button onClick={handleSaveAll} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save All Changes"}
                </Button>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={test?.title || ""} readOnly />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={test?.description || ""} readOnly rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Passing Score</Label>
                    <Input value={`${test?.passingScore || 0}%`} readOnly />
                  </div>
                  <div>
                    <Label>Time Limit</Label>
                    <Input value={test?.timeLimit ? `${test.timeLimit} minutes` : "No limit"} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Questions</CardTitle>
                <Button onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {questions.map((question) => (
                        <SortableQuestion
                          key={question.id}
                          question={question}
                          onUpdate={updateQuestion}
                          onDelete={deleteQuestion}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {questions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions yet. Click "Add Question" to create one.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

