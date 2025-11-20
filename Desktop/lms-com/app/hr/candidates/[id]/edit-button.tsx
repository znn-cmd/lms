"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { EditCandidateForm } from "./edit-form"

interface EditButtonProps {
  candidateId: string
  candidate: any
}

export function EditCandidateButton({ candidate, candidateId }: EditButtonProps) {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const handleCancel = () => {
    setIsEditing(false)
    router.refresh()
  }

  if (isEditing) {
    return (
      <div className="mb-6 -mt-4">
        <EditCandidateForm candidate={candidate} onCancel={handleCancel} />
      </div>
    )
  }

  return (
    <Button variant="outline" onClick={() => setIsEditing(true)}>
      <Edit className="w-4 h-4 mr-2" />
      Edit Profile
    </Button>
  )
}

