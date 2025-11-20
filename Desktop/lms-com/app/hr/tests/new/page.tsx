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
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    titleRu: "",
    description: "",
    descriptionRu: "",
    courseId: "",
    vacancyId: "",
    passingScore: 70,
    timeLimit: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/hr/tests/${data.test.id}/edit`)
      } else {
        const error = await response.json()
        alert(error.message || "Failed to create test")
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
              <Link href="/hr/tests">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Test</h1>
                <p className="text-gray-600 mt-2">Add a new assessment test</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Test Information</CardTitle>
                  <CardDescription>Basic details about the test</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (EN) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Real Estate Fundamentals Test"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titleRu">Title (RU)</Label>
                    <Input
                      id="titleRu"
                      value={formData.titleRu}
                      onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                      placeholder="e.g., Тест по основам недвижимости"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (EN)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the test..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionRu">Description (RU)</Label>
                    <Textarea
                      id="descriptionRu"
                      value={formData.descriptionRu}
                      onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                      placeholder="Описание теста..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="courseId">Course (Optional)</Label>
                      <Input
                        id="courseId"
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                        placeholder="Course ID"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vacancyId">Vacancy (Optional)</Label>
                      <Input
                        id="vacancyId"
                        value={formData.vacancyId}
                        onChange={(e) => setFormData({ ...formData, vacancyId: e.target.value })}
                        placeholder="Vacancy ID"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%) *</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.passingScore}
                        onChange={(e) =>
                          setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        min="0"
                        value={formData.timeLimit}
                        onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                        placeholder="Leave empty for no limit"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 mt-6">
                <Link href="/hr/tests">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Test"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

