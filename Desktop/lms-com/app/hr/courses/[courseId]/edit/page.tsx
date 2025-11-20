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
import { GripVertical, Plus, Trash2, Edit2, Save, BookOpen, X } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  contentType: string
  duration: number
  order: number
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

function SortableModule({
  module,
  onUpdate,
  onDelete,
  onEdit,
}: {
  module: Module
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: module.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4 bg-white">
      <div className="flex items-start gap-4">
        <div
          {...attributes}
          {...listeners}
          className="mt-2 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 space-y-2">
          <Input
            value={module.title}
            onChange={(e) => onUpdate(module.id, { title: e.target.value })}
            placeholder="Module title"
            className="font-semibold"
          />
          <Textarea
            value={module.description || ""}
            onChange={(e) => onUpdate(module.id, { description: e.target.value })}
            placeholder="Module description"
            rows={2}
          />
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Lessons ({module.lessons?.length || 0})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(module.id)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Lessons
              </Button>
            </div>
            {module.lessons && module.lessons.length > 0 && (
              <div className="pl-4 border-l-2 border-gray-200 space-y-1">
                {module.lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="text-sm text-gray-600">
                    {idx + 1}. {lesson.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(module.id)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onDelete(module.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CourseEditorPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [showModuleDialog, setShowModuleDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      const data = await response.json()
      setCourse(data.course)
      setModules(data.modules || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching course:", error)
      setLoading(false)
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newModules = arrayMove(items, oldIndex, newIndex)
        return newModules.map((m, index) => ({ ...m, order: index }))
      })
      setHasChanges(true)
    }
  }

  const addModule = () => {
    const newModule: Module = {
      id: `temp-${Date.now()}`,
      title: "New Module",
      description: "",
      order: modules.length,
      lessons: [],
    }
    setModules([...modules, newModule])
    setHasChanges(true)
  }

  const updateModule = (moduleId: string, updates: any) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m)))
    setHasChanges(true)
  }

  const deleteModule = (moduleId: string) => {
    if (confirm("Are you sure you want to delete this module? All lessons will be deleted too.")) {
      setModules(modules.filter((m) => m.id !== moduleId))
      setHasChanges(true)
    }
  }

  const handleEditModule = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId)
    if (module) {
      setEditingModule(module)
      setShowModuleDialog(true)
    }
  }

  const handleSaveModule = () => {
    if (editingModule) {
      updateModule(editingModule.id, editingModule)
      setShowModuleDialog(false)
      setEditingModule(null)
    }
  }

  const addLessonToModule = () => {
    if (!editingModule) return

    const newLesson: Lesson = {
      id: `temp-lesson-${Date.now()}`,
      title: "New Lesson",
      description: "",
      content: "",
      contentType: "TEXT",
      duration: 0,
      order: editingModule.lessons.length,
    }

    setEditingModule({
      ...editingModule,
      lessons: [...editingModule.lessons, newLesson],
    })
  }

  const updateLesson = (lessonId: string, updates: any) => {
    if (!editingModule) return

    setEditingModule({
      ...editingModule,
      lessons: editingModule.lessons.map((l) =>
        l.id === lessonId ? { ...l, ...updates } : l
      ),
    })
  }

  const deleteLesson = (lessonId: string) => {
    if (!editingModule) return

    if (confirm("Are you sure you want to delete this lesson?")) {
      setEditingModule({
        ...editingModule,
        lessons: editingModule.lessons.filter((l) => l.id !== lessonId),
      })
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/modules/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules }),
      })

      if (response.ok) {
        alert("Changes saved successfully!")
        setHasChanges(false)
        fetchCourse()
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
                <p className="text-gray-600 mt-2">{course?.title}</p>
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
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={course?.title || ""} readOnly />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={course?.description || ""} readOnly rows={3} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Modules</CardTitle>
                <Button onClick={addModule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Module
                </Button>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={modules.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {modules.map((module) => (
                        <SortableModule
                          key={module.id}
                          module={module}
                          onUpdate={updateModule}
                          onDelete={deleteModule}
                          onEdit={handleEditModule}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Module Edit Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Edit module details and manage lessons</DialogDescription>
          </DialogHeader>

          {editingModule && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Module Title</Label>
                <Input
                  value={editingModule.title}
                  onChange={(e) =>
                    setEditingModule({ ...editingModule, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingModule.description || ""}
                  onChange={(e) =>
                    setEditingModule({ ...editingModule, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg">Lessons ({editingModule.lessons.length})</Label>
                  <Button onClick={addLessonToModule} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingModule.lessons.map((lesson, index) => (
                    <Card key={lesson.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={lesson.title}
                            onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                            placeholder="Lesson title"
                            className="font-medium"
                          />
                          <Textarea
                            value={lesson.description || ""}
                            onChange={(e) =>
                              updateLesson(lesson.id, { description: e.target.value })
                            }
                            placeholder="Lesson description"
                            rows={2}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Content Type</Label>
                              <select
                                value={lesson.contentType}
                                onChange={(e) =>
                                  updateLesson(lesson.id, { contentType: e.target.value })
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="TEXT">Text</option>
                                <option value="VIDEO">Video</option>
                                <option value="PDF">PDF</option>
                                <option value="QUIZ">Quiz</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Duration (minutes)</Label>
                              <Input
                                type="number"
                                value={lesson.duration || 0}
                                onChange={(e) =>
                                  updateLesson(lesson.id, {
                                    duration: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteLesson(lesson.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {editingModule.lessons.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No lessons yet. Click "Add Lesson" to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModule}>
              <Save className="w-4 h-4 mr-2" />
              Save Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
