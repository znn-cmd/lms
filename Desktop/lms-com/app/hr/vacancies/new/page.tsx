"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewVacancyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    titleRu: "",
    description: "",
    descriptionRu: "",
    scoreThreshold: 70,
    startCourseId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/vacancies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/hr/vacancies")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to create vacancy")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/hr/vacancies">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Vacancy</h1>
                <p className="text-gray-600 mt-2">Add a new job opening to your pipeline</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Vacancy Information</CardTitle>
                  <CardDescription>Basic details about the position</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (EN) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Real Estate Agent (Dubai)"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titleRu">Title (RU)</Label>
                    <Input
                      id="titleRu"
                      value={formData.titleRu}
                      onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                      placeholder="e.g., Риэлтор (Дубай)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (EN)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the position..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionRu">Description (RU)</Label>
                    <Textarea
                      id="descriptionRu"
                      value={formData.descriptionRu}
                      onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                      placeholder="Описание вакансии..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scoreThreshold">Score Threshold (%) *</Label>
                    <Input
                      id="scoreThreshold"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.scoreThreshold}
                      onChange={(e) =>
                        setFormData({ ...formData, scoreThreshold: parseInt(e.target.value) || 70 })
                      }
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Minimum test score required to pass
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startCourseId">Start Course (Optional)</Label>
                    <Input
                      id="startCourseId"
                      value={formData.startCourseId}
                      onChange={(e) => setFormData({ ...formData, startCourseId: e.target.value })}
                      placeholder="Course ID (leave empty for now)"
                    />
                    <p className="text-sm text-muted-foreground">
                      Course to assign automatically when candidate registers
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 mt-6">
                <Link href="/hr/vacancies">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Vacancy"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

