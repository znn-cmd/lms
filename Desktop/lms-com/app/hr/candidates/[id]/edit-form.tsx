"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EditFormProps {
  candidate: any
  onCancel: () => void
}

export function EditCandidateForm({ candidate, onCancel }: EditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: candidate.user.name || "",
    surname: candidate.user.surname || "",
    email: candidate.user.email || "",
    phone: candidate.user.phone || "",
    city: candidate.city || "",
    country: candidate.country || "",
    experience: candidate.experience?.toString() || "",
    languages: candidate.languages.join(", ") || "",
    resumeLink: candidate.resumeLink || "",
    additionalInfo: candidate.additionalInfo || "",
    status: candidate.status,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.refresh()
        if (onCancel) {
          onCancel()
        } else {
          // For candidate profile page, just refresh
          window.location.reload()
        }
      } else {
        const error = await response.json()
        alert(error.message || "Failed to update profile")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Candidate Information</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">First Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Last Name *</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages (comma-separated)</Label>
            <Input
              id="languages"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              placeholder="English, Russian, Arabic"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumeLink">Resume Link</Label>
            <Input
              id="resumeLink"
              type="url"
              value={formData.resumeLink}
              onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGISTERED">Registered</SelectItem>
                <SelectItem value="PROFILE_COMPLETED">Profile Completed</SelectItem>
                <SelectItem value="IN_COURSE">In Course</SelectItem>
                <SelectItem value="TEST_COMPLETED">Test Completed</SelectItem>
                <SelectItem value="OFFER_SENT">Offer Sent</SelectItem>
                <SelectItem value="OFFER_ACCEPTED">Offer Accepted</SelectItem>
                <SelectItem value="OFFER_DECLINED">Offer Declined</SelectItem>
                <SelectItem value="HIRED">Hired</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="IN_TALENT_POOL">In Talent Pool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

