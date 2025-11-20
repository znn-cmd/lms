"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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

export default function EditOfferPage() {
  const params = useParams()
  const router = useRouter()
  const offerId = params.offerId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [candidates, setCandidates] = useState<any[]>([])
  const [vacancies, setVacancies] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [offerType, setOfferType] = useState<string>("personal")
  const [formData, setFormData] = useState({
    candidateId: "",
    vacancyId: "",
    testId: "",
    templateId: "",
    content: "",
    contentRu: "",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/candidates").then((res) => res.json()),
      fetch("/api/vacancies").then((res) => res.json()),
      fetch("/api/tests").then((res) => res.json()),
      fetch("/api/offer-templates").then((res) => res.json()),
      fetch(`/api/offers/${offerId}`).then((res) => res.json()),
    ]).then(([candidatesData, vacanciesData, testsData, templatesData, offerData]) => {
      setCandidates(candidatesData.candidates || [])
      setVacancies(vacanciesData.vacancies || [])
      setTests(testsData.tests || [])
      setTemplates(templatesData.templates || [])
      
      if (offerData.offer) {
        setOfferType(offerData.offer.type || "personal")
        setFormData({
          candidateId: offerData.offer.candidateId || "",
          vacancyId: offerData.offer.vacancyId || "",
          testId: offerData.offer.testId || "none",
          templateId: offerData.offer.templateId || "none",
          content: offerData.offer.content,
          contentRu: offerData.offer.contentRu || "",
        })
      }
      setLoading(false)
    })
  }, [offerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: offerType,
          candidateId: formData.candidateId || null,
          vacancyId: formData.vacancyId || null,
          testId: formData.testId && formData.testId !== "none" ? formData.testId : null,
          templateId: formData.templateId && formData.templateId !== "none" ? formData.templateId : null,
          content: formData.content,
          contentRu: formData.contentRu || null,
        }),
      })

      if (response.ok) {
        router.push("/hr/offers")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to update offer")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
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
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/hr/offers">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Offer</h1>
                <p className="text-gray-600 mt-2">Update job offer details</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Offer Details</CardTitle>
                  <CardDescription>Update offer information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="vacancyId">Vacancy *</Label>
                    <Select
                      value={formData.vacancyId}
                      onValueChange={(value) => setFormData({ ...formData, vacancyId: value })}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateId">Template (Optional)</Label>
                    <Select
                      value={formData.templateId}
                      onValueChange={(value) => setFormData({ ...formData, templateId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

