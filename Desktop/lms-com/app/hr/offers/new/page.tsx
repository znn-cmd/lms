"use client"

import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState<any[]>([])
  const [vacancies, setVacancies] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [offerType, setOfferType] = useState<"personal" | "general" | null>(null)
  const [formData, setFormData] = useState({
    candidateId: "",
    vacancyId: "",
    testId: "",
    templateId: "",
    content: "",
    contentRu: "",
  })

  useEffect(() => {
    fetch("/api/candidates")
      .then((res) => res.json())
      .then((data) => setCandidates(data.candidates || []))
    
    fetch("/api/vacancies")
      .then((res) => res.json())
      .then((data) => setVacancies(data.vacancies || []))
    
    fetch("/api/tests")
      .then((res) => res.json())
      .then((data) => setTests(data.tests || []))
    
    fetch("/api/offer-templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
  }, [])

  useEffect(() => {
    if (formData.templateId) {
      const template = templates.find((t) => t.id === formData.templateId)
      if (template) {
        const candidate = offerType === "personal" ? candidates.find((c) => c.id === formData.candidateId) : null
        const vacancy = offerType === "general" ? vacancies.find((v) => v.id === formData.vacancyId) : null
        
        if ((offerType === "personal" && candidate) || (offerType === "general" && vacancy)) {
          let content = template.content
          let contentRu = template.contentRu || ""
          
          // Replace variables
          const variables: Record<string, string> = {
            candidateName: candidate ? `${candidate.user.name} ${candidate.user.surname}` : "{{candidateName}}",
            vacancyTitle: vacancy ? vacancy.title : "{{vacancyTitle}}",
            commission: "10",
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            location: candidate?.city || "Dubai",
          }
          
          for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, "g")
            content = content.replace(regex, value)
            if (contentRu) {
              contentRu = contentRu.replace(regex, value)
            }
          }
          
          setFormData({ ...formData, content, contentRu })
        }
      }
    }
  }, [formData.templateId, formData.candidateId, formData.vacancyId, offerType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const requestBody: any = {
        type: offerType,
        content: formData.content.trim(),
      }

      if (offerType === "personal") {
        requestBody.candidateId = formData.candidateId
      } else if (offerType === "general") {
        requestBody.vacancyId = formData.vacancyId
        if (formData.testId && formData.testId !== "none") {
          requestBody.testId = formData.testId
        }
      }

      if (formData.templateId && formData.templateId !== "none") {
        requestBody.templateId = formData.templateId
      }

      if (formData.contentRu && formData.contentRu.trim() !== "") {
        requestBody.contentRu = formData.contentRu.trim()
      }

      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        router.push("/hr/offers")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to create offer")
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
              <Link href="/hr/offers">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Offer</h1>
                <p className="text-gray-600 mt-2">Send a job offer to a candidate</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Offer Details</CardTitle>
                  <CardDescription>Choose offer type and fill in the details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="personal"
                        checked={offerType === "personal"}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setOfferType("personal")
                            setFormData({ ...formData, vacancyId: "", testId: "" })
                          } else {
                            setOfferType(null)
                          }
                        }}
                      />
                      <Label htmlFor="personal" className="font-medium cursor-pointer">
                        Personal Offer
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Send an offer directly to a specific candidate
                    </p>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="general"
                        checked={offerType === "general"}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setOfferType("general")
                            setFormData({ ...formData, candidateId: "" })
                          } else {
                            setOfferType(null)
                          }
                        }}
                      />
                      <Label htmlFor="general" className="font-medium cursor-pointer">
                        General Offer
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Create an offer template for a vacancy that will be shown to candidates after passing a test
                    </p>
                  </div>

                  {offerType === "personal" && (
                    <div className="space-y-2">
                      <Label htmlFor="candidateId">Candidate *</Label>
                      <Select
                        value={formData.candidateId}
                        onValueChange={(value) => setFormData({ ...formData, candidateId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select candidate" />
                        </SelectTrigger>
                        <SelectContent>
                          {candidates.map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              {candidate.user.name} {candidate.user.surname} ({candidate.user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {offerType === "general" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="vacancyId">Vacancy *</Label>
                        <Select
                          value={formData.vacancyId}
                          onValueChange={(value) => setFormData({ ...formData, vacancyId: value, testId: "" })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vacancy" />
                          </SelectTrigger>
                          <SelectContent>
                            {vacancies.map((vacancy) => (
                              <SelectItem key={vacancy.id} value={vacancy.id}>
                                {vacancy.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="testId">Trigger Test (Optional)</Label>
                        <Select
                          value={formData.testId}
                          onValueChange={(value) => setFormData({ ...formData, testId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select test that triggers this offer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No test trigger</SelectItem>
                            {tests
                              .filter((test) => test.vacancyId === formData.vacancyId || !formData.vacancyId)
                              .map((test) => (
                                <SelectItem key={test.id} value={test.id}>
                                  {test.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          If selected, offer will be automatically shown to candidate when they pass this test
                        </p>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="templateId">Template (Optional)</Label>
                    <Select
                      value={formData.templateId}
                      onValueChange={(value) => setFormData({ ...formData, templateId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template or create custom" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Selecting a template will auto-fill the content
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Offer Content (EN) *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentRu">Offer Content (RU)</Label>
                    <Textarea
                      id="contentRu"
                      value={formData.contentRu}
                      onChange={(e) => setFormData({ ...formData, contentRu: e.target.value })}
                      rows={10}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 mt-6">
                <Link href="/hr/offers">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Offer"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

