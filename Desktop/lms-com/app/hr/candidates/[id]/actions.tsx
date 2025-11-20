"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Briefcase, Loader2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CandidateActionsProps {
  candidateId: string
  currentVacancyId: string | null
  currentStatus: string
  vacancies: Array<{ id: string; title: string }>
}

export function CandidateActions({
  candidateId,
  currentVacancyId,
  currentStatus,
  vacancies,
}: CandidateActionsProps) {
  const router = useRouter()
  const [selectedVacancy, setSelectedVacancy] = useState(currentVacancyId || "")
  const [loading, setLoading] = useState(false)
  const [completingCourse, setCompletingCourse] = useState(false)

  const handleChangeVacancy = async () => {
    if (!selectedVacancy || selectedVacancy === currentVacancyId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/candidates/${candidateId}/change-vacancy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyId: selectedVacancy }),
      })

      if (response.ok) {
        router.refresh()
        alert("Vacancy changed successfully")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to change vacancy")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteCourse = async () => {
    setCompletingCourse(true)
    try {
      const response = await fetch(`/api/candidates/${candidateId}/complete-course`, {
        method: "POST",
      })

      if (response.ok) {
        router.refresh()
        alert("Course marked as completed. Test will be assigned.")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to complete course")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setCompletingCourse(false)
    }
  }

  const canCompleteCourse = currentStatus === "IN_COURSE"

  const handleDeleteCandidate = () => {
    // TODO: Implement delete functionality
    alert("Delete candidate functionality will be implemented soon")
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">Actions</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Manage candidate workflow</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Vacancy Section */}
          <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-1 block">Change Vacancy</label>
              <p className="text-xs text-muted-foreground mb-3">
                Assign candidate to a different position
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedVacancy} onValueChange={setSelectedVacancy}>
                <SelectTrigger className="flex-1 h-10">
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
              <Button
                onClick={handleChangeVacancy}
                disabled={loading || selectedVacancy === currentVacancyId || !selectedVacancy}
                variant="outline"
                className="h-10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Change
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Changing vacancy will assign the new vacancy's start course
            </p>
          </div>

          {/* Course Completion Section */}
          {canCompleteCourse && (
            <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-1 block">Course Completion</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Mark course as completed and proceed to testing
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default" className="w-full h-10" disabled={completingCourse}>
                    {completingCourse ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Course as Completed
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark Course as Completed?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Mark all course lessons as completed</li>
                        <li>Change candidate status to "Test Completed"</li>
                        <li>Assign the vacancy's test (if available)</li>
                        <li>Initiate the offer process if test score is sufficient</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCompleteCourse}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground">
                This will automatically assign tests and trigger the offer process
              </p>
            </div>
          )}
        </div>

        {/* Delete Candidate Section */}
        <div className="pt-4 border-t border-red-200">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-sm font-semibold text-red-900 mb-1 block">Danger Zone</label>
                <p className="text-xs text-red-700 mb-3">
                  Permanently delete this candidate and all associated data. This action cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="h-10"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteCandidate()
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Candidate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">Delete Candidate?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you absolutely sure? This will permanently delete:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Candidate profile and all personal information</li>
                        <li>All course progress and test results</li>
                        <li>All offers and communication history</li>
                        <li>All associated data</li>
                      </ul>
                      <strong className="text-red-600 block mt-3">This action cannot be undone.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteCandidate}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

