"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"

interface Offer {
  id: string
  status: string
  type: string
  sentAt: Date
  respondedAt: Date | null
  content: string
  generalOfferId?: string | null
  generalOffer?: {
    id: string
    vacancy: {
      title: string
    } | null
  } | null
  candidate: {
    user: {
      name: string | null
      surname: string | null
      email: string
    }
  } | null
  vacancy: {
    id: string
    title: string
  } | null
  test: {
    id: string
    title: string
  } | null
}

interface KanbanColumn {
  id: string
  title: string
  color: "yellow" | "green" | "red" | "default"
  filter: (offers: Offer[]) => Offer[]
}

export function OffersKanban({ offers }: { offers: Offer[] }) {
  const columns: KanbanColumn[] = useMemo(
    () => [
      {
        id: "general",
        title: "General Offer",
        color: "default",
        filter: (offers) => offers.filter((offer) => offer.type === "general"),
      },
      {
        id: "pending",
        title: "Pending",
        color: "yellow",
        filter: (offers) => offers.filter((offer) => (offer.status === "pending" || offer.status === "sent") && offer.type === "personal"),
      },
      {
        id: "accepted",
        title: "Accepted",
        color: "green",
        filter: (offers) => offers.filter((offer) => offer.status === "accepted" && offer.type === "personal"),
      },
      {
        id: "declined",
        title: "Declined",
        color: "red",
        filter: (offers) => offers.filter((offer) => offer.status === "declined" && offer.type === "personal"),
      },
    ],
    []
  )

  const getColumnOffers = (filter: (offers: Offer[]) => Offer[]) => {
    return filter(offers)
  }

  const getColumnColor = (color: string) => {
    switch (color) {
      case "green":
        return "border-green-500 bg-green-50"
      case "red":
        return "border-red-500 bg-red-50"
      case "yellow":
        return "border-yellow-500 bg-yellow-50"
      default:
        return "border-gray-300 bg-gray-50"
    }
  }

  const getColumnHeaderColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800"
      case "red":
        return "bg-red-100 text-red-800"
      case "yellow":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalOffers = offers.length

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => {
            const columnOffers = getColumnOffers(column.filter)
            // For General Offer column, calculate percentage from all offers
            // For other columns, calculate from personal offers only
            const personalOffers = offers.filter((o) => o.type === "personal")
            const totalForPercentage = column.id === "general" ? totalOffers : personalOffers.length
            const percentage =
              totalForPercentage > 0 ? Math.round((columnOffers.length / totalForPercentage) * 100) : 0

            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-80 border-2 rounded-lg ${getColumnColor(column.color)}`}
              >
                {/* Column Header */}
                <div
                  className={`p-4 rounded-t-lg border-b-2 ${getColumnHeaderColor(column.color)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <span className="text-xs font-medium">{columnOffers.length}</span>
                  </div>
                  <div className="text-xs opacity-75">{percentage}% of total</div>
                </div>

                {/* Column Content */}
                <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {columnOffers.map((offer) => (
                    <Card
                      key={offer.id}
                      className="hover:shadow-md transition-shadow cursor-pointer bg-white"
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold text-sm">
                              {offer.type === "personal" && offer.candidate
                                ? `${offer.candidate.user.name} ${offer.candidate.user.surname}`
                                : offer.vacancy?.title || "General Offer"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {offer.type === "personal" ? "Personal" : "General"}
                            </p>
                            {offer.type === "personal" && offer.candidate && (
                              <p className="text-xs text-muted-foreground truncate">
                                {offer.candidate.user.email}
                              </p>
                            )}
                            {offer.type === "general" && offer.vacancy && (
                              <p className="text-xs text-muted-foreground">
                                {offer.vacancy.title}
                              </p>
                            )}
                            {offer.test && (
                              <p className="text-xs text-muted-foreground">
                                Test: {offer.test.title}
                              </p>
                            )}
                            {offer.type === "personal" && (offer as any).generalOfferId && (
                              <p className="text-xs text-blue-600 font-medium">
                                From General Offer
                                {offer.generalOffer?.vacancy && ` (${offer.generalOffer.vacancy.title})`}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Sent: {new Date(offer.sentAt).toLocaleDateString()}
                            </p>
                            {offer.respondedAt && (
                              <p className="text-xs text-muted-foreground">
                                Responded: {new Date(offer.respondedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="bg-gray-50 rounded p-2 mt-2">
                            <p className="text-xs text-gray-700 line-clamp-2">
                              {offer.content.substring(0, 100)}
                              {offer.content.length > 100 && "..."}
                            </p>
                          </div>
                          <Link href={`/hr/offers/${offer.id}/edit`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {columnOffers.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No offers
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

