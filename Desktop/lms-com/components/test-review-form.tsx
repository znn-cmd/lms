"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/hooks/use-locale"
import { t } from "@/lib/i18n"

export default function TestReviewForm({
  candidateTestId,
  openAnswers,
  existingReview,
}: {
  candidateTestId: string
  openAnswers: any[]
  existingReview?: any
}) {
  const router = useRouter()
  const locale = useLocale()
  const [reviews, setReviews] = useState<Record<string, { score: number; comment: string }>>(
    openAnswers.reduce((acc, answer) => {
      acc[answer.id] = {
        score: existingReview?.manualScore || 0,
        comment: existingReview?.comment || "",
      }
      return acc
    }, {} as Record<string, { score: number; comment: string }>)
  )
  const [generalComment, setGeneralComment] = useState(existingReview?.comment || "")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/tests/${candidateTestId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews,
          generalComment,
        }),
      })

      if (response.ok) {
        router.push("/mentor/dashboard")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {openAnswers.map((answer) => (
        <Card key={answer.id}>
          <CardHeader>
            <CardTitle className="text-lg">{answer.question.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("common.candidatesAnswer", locale)}</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p>{JSON.parse(answer.answer || '""')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("common.score", locale)} (0-{answer.question.points})</Label>
                <Input
                  type="number"
                  min="0"
                  max={answer.question.points}
                  value={reviews[answer.id]?.score || 0}
                  onChange={(e) =>
                    setReviews({
                      ...reviews,
                      [answer.id]: {
                        ...reviews[answer.id],
                        score: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>{t("common.comment", locale)}</Label>
                <Textarea
                  value={reviews[answer.id]?.comment || ""}
                  onChange={(e) =>
                    setReviews({
                      ...reviews,
                      [answer.id]: {
                        ...reviews[answer.id],
                        comment: e.target.value,
                      },
                    })
                  }
                  placeholder={t("common.addFeedback", locale)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {openAnswers.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("common.noOpenEndedQuestions", locale)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("common.generalComment", locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={generalComment}
            onChange={(e) => setGeneralComment(e.target.value)}
            placeholder={t("common.addOverallFeedback", locale)}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          {t("common.cancel", locale)}
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? t("common.submitting", locale) : t("common.submitReview", locale)}
        </Button>
      </div>
    </div>
  )
}

