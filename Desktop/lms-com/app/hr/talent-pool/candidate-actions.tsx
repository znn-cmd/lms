"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Mail, Loader2, Phone, Copy, Check, User } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CandidateActionsProps {
  candidateId: string
  candidateName: string
  candidateEmail: string
  candidatePhone?: string | null
  currentVacancyId: string | null
  vacancies: Array<{ id: string; title: string }>
}

export function CandidateActions({
  candidateId,
  candidateName,
  candidateEmail,
  candidatePhone,
  currentVacancyId,
  vacancies,
}: CandidateActionsProps) {
  const router = useRouter()
  const [selectedVacancy, setSelectedVacancy] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [reassignOpen, setReassignOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const [phoneCopied, setPhoneCopied] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")

  const handleReassign = async () => {
    if (!selectedVacancy || selectedVacancy === currentVacancyId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/candidates/${candidateId}/change-vacancy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyId: selectedVacancy }),
      })

      if (response.ok) {
        setReassignOpen(false)
        router.refresh()
        alert("Candidate reassigned successfully")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to reassign candidate")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text)
    if (type === "email") {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } else {
      setPhoneCopied(true)
      setTimeout(() => setPhoneCopied(false), 2000)
    }
  }

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${candidateEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.location.href = mailtoLink
    setContactOpen(false)
  }

  return (
    <div className="flex gap-2">
      {/* View Profile Button */}
      <Link href={`/hr/candidates/${candidateId}`}>
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          View Profile
        </Button>
      </Link>

      {/* Reassign Dialog */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Reassign
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Candidate</DialogTitle>
            <DialogDescription>
              Select a new vacancy for {candidateName}. This will reset their progress and assign them to the new vacancy's starting course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Vacancy</Label>
              <Select value={selectedVacancy} onValueChange={setSelectedVacancy}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vacancy" />
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
            {selectedVacancy === currentVacancyId && (
              <p className="text-sm text-amber-600">
                This is the candidate's current vacancy
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReassign}
              disabled={loading || !selectedVacancy || selectedVacancy === currentVacancyId}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reassigning...
                </>
              ) : (
                "Reassign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Contact
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {candidateName}</DialogTitle>
            <DialogDescription>
              Get in touch with the candidate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Input value={candidateEmail} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(candidateEmail, "email")}
                >
                  {emailCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = `mailto:${candidateEmail}`
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Open Email
                </Button>
              </div>
            </div>

            {candidatePhone && (
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="flex items-center gap-2">
                  <Input value={candidatePhone} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(candidatePhone, "phone")}
                  >
                    {phoneCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = `tel:${candidatePhone}`
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t pt-4 space-y-2">
              <Label>Quick Email</Label>
              <Input
                placeholder="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
              <Textarea
                placeholder="Message..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSendEmail} disabled={!emailSubject.trim()}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

