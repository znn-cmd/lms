"use client"

import { useState } from "react"
import { Edit } from "lucide-react"
import { EditCandidateForm } from "./edit-form"
import { CandidateActions } from "./actions"

interface ClientPageProps {
  candidate: any
  vacancies: any[]
  children: React.ReactNode
}

export function ClientPageWrapper({ candidate, vacancies, children }: ClientPageProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <>
        <EditCandidateForm candidate={candidate} onCancel={() => setIsEditing(false)} />
        {children}
      </>
    )
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>
      {children}
    </>
  )
}

