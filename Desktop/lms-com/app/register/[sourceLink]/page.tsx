"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Link as LinkIcon } from "lucide-react"

export default function RegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const sourceLink = params.sourceLink as string
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    surname: "",
    phone: "",
    city: "",
    country: "",
    experience: "",
    languages: [] as string[],
    resumeUrl: "",
    resumeLink: "",
    additionalInfo: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/candidates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sourceLink,
        }),
      })

      if (response.ok) {
        router.push("/auth/signin?registered=true")
      } else {
        const error = await response.json()
        alert(error.message || "Registration failed")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Step 1: Basic Information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Next: Profile Information</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Step 2: Additional Information
          </CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
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
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeLink">Resume Link (LinkedIn, HH, Google Drive)</Label>
              <div className="flex gap-2">
                <Input
                  id="resumeLink"
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={formData.resumeLink}
                  onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
                />
                <Button type="button" variant="outline" size="icon">
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Tell us about yourself, your goals, etc."
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Registering..." : "Complete Registration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

