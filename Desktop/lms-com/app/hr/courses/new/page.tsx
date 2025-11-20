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
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    titleRu: "",
    description: "",
    descriptionRu: "",
    language: "EN",
    isSequential: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/hr/courses/${data.course.id}/edit`)
      } else {
        const error = await response.json()
        alert(error.message || "Failed to create course")
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
              <Link href="/hr/courses">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-gray-600 mt-2">Add a new training course</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>Basic details about the course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (EN) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Real Estate Agent Fundamentals"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titleRu">Title (RU)</Label>
                    <Input
                      id="titleRu"
                      value={formData.titleRu}
                      onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                      placeholder="e.g., Основы работы риэлтора"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (EN)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the course..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionRu">Description (RU)</Label>
                    <Textarea
                      id="descriptionRu"
                      value={formData.descriptionRu}
                      onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                      placeholder="Описание курса..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language *</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData({ ...formData, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EN">English</SelectItem>
                        <SelectItem value="RU">Russian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSequential"
                      checked={formData.isSequential}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isSequential: checked as boolean })
                      }
                    />
                    <Label htmlFor="isSequential" className="cursor-pointer">
                      Require sequential completion (lessons must be completed in order)
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 mt-6">
                <Link href="/hr/courses">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

