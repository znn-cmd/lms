"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Eye, Calendar, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface Candidate {
  id: string
  status: string
  createdAt: Date
  user: {
    name: string | null
    surname: string | null
    email: string
    phone: string | null
  }
  currentVacancy: {
    id: string
    title: string
  } | null
  mentor: {
    name: string | null
    surname: string | null
  } | null
  tests: Array<{
    score: number | null
    status: string
    test: {
      passingScore: number
    }
  }>
  courses: Array<{
    progress: number
    startedAt: Date | null
  }>
}

interface KanbanColumn {
  id: string
  title: string
  color: "default" | "green" | "red" | "yellow" | "blue"
  statuses: string[]
  getCandidates: (candidates: Candidate[]) => Candidate[]
}

export function CandidatesKanban({
  candidates,
  searchParams,
}: {
  candidates: Candidate[]
  searchParams: { search?: string; dateFrom?: string; dateTo?: string }
}) {
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  const [search, setSearch] = useState(searchParams.search || "")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.dateTo ? new Date(searchParams.dateTo) : undefined
  )

  const columns: KanbanColumn[] = useMemo(
    () => [
      {
        id: "new",
        title: "New Candidate",
        color: "blue",
        statuses: ["REGISTERED", "PROFILE_COMPLETED"],
        getCandidates: (candidates) => {
          const usedIds = new Set<string>()
          // Get all used IDs from previous columns
          candidates.forEach((c) => {
            if (!["REGISTERED", "PROFILE_COMPLETED"].includes(c.status)) {
              usedIds.add(c.id)
            }
          })
          return candidates.filter((c) => {
            if (usedIds.has(c.id)) return false
            return ["REGISTERED", "PROFILE_COMPLETED"].includes(c.status)
          })
        },
      },
      {
        id: "started_learning",
        title: "Started Learning",
        color: "default",
        statuses: ["IN_COURSE"],
        getCandidates: (candidates) => {
          const usedIds = new Set<string>()
          // Get all used IDs from previous columns
          candidates.forEach((c) => {
            if (!["REGISTERED", "PROFILE_COMPLETED", "IN_COURSE"].includes(c.status)) {
              usedIds.add(c.id)
            } else {
              const course = c.courses[0]
              if (course && course.progress >= 50) {
                usedIds.add(c.id)
              }
            }
          })
          return candidates.filter((c) => {
            if (usedIds.has(c.id)) return false
            if (c.status !== "IN_COURSE") return false
            const course = c.courses[0]
            return course && course.progress < 50
          })
        },
      },
      {
        id: "learning",
        title: "In Training",
        color: "default",
        statuses: ["IN_COURSE"],
        getCandidates: (candidates) => {
          const usedIds = new Set<string>()
          // Get all used IDs from previous columns
          candidates.forEach((c) => {
            if (!["REGISTERED", "PROFILE_COMPLETED", "IN_COURSE"].includes(c.status)) {
              usedIds.add(c.id)
            } else if (c.status === "IN_COURSE") {
              const course = c.courses[0]
              if (!course || course.progress < 50) {
                usedIds.add(c.id)
              }
            }
          })
          return candidates.filter((c) => {
            if (usedIds.has(c.id)) return false
            if (c.status !== "IN_COURSE") return false
            const course = c.courses[0]
            return course && course.progress >= 50 && course.progress < 100
          })
        },
      },
      {
        id: "started_test",
        title: "Started Test",
        color: "default",
        statuses: ["TEST_COMPLETED"],
        getCandidates: (candidates) => {
          const usedIds = new Set<string>()
          // Get all used IDs from previous columns
          candidates.forEach((c) => {
            if (["OFFER_ACCEPTED", "HIRED", "OFFER_DECLINED", "REJECTED"].includes(c.status)) {
              usedIds.add(c.id)
            }
            const test = c.tests[0]
            if (
              test &&
              test.score !== null &&
              ((test.score >= test.test.passingScore && test.status === "completed") ||
                (test.score < test.test.passingScore && test.status === "completed"))
            ) {
              usedIds.add(c.id)
            }
          })
          return candidates.filter((c) => {
            if (usedIds.has(c.id)) return false
            if (c.status !== "TEST_COMPLETED" && c.status !== "OFFER_SENT") return false
            const test = c.tests[0]
            return test && (test.status === "in_progress" || test.status === "pending_review" || test.score === null)
          })
        },
      },
      {
        id: "test_passed",
        title: "Test Passed Successfully",
        color: "yellow",
        statuses: ["TEST_COMPLETED", "OFFER_SENT"],
        getCandidates: (candidates) => {
          const usedIds = new Set<string>()
          // Get all used IDs from previous columns
          candidates.forEach((c) => {
            if (["OFFER_ACCEPTED", "HIRED", "OFFER_DECLINED", "REJECTED"].includes(c.status)) {
              usedIds.add(c.id)
            }
            const test = c.tests[0]
            if (
              test &&
              test.score !== null &&
              test.score < test.test.passingScore &&
              test.status === "completed"
            ) {
              usedIds.add(c.id)
            }
          })
          // Get candidates who passed test and have offer sent
          return candidates.filter((c) => {
            if (usedIds.has(c.id)) return false
            if (c.status !== "OFFER_SENT" && c.status !== "TEST_COMPLETED") return false
            const test = c.tests[0]
            return (
              test &&
              test.score !== null &&
              test.score >= test.test.passingScore &&
              test.status === "completed"
            )
          })
        },
      },
      {
        id: "offer_accepted",
        title: "Offer Accepted",
        color: "green",
        statuses: ["OFFER_ACCEPTED", "HIRED"],
        getCandidates: (candidates) =>
          candidates.filter((c) => ["OFFER_ACCEPTED", "HIRED"].includes(c.status)),
      },
      {
        id: "test_failed",
        title: "Test Failed",
        color: "red",
        statuses: ["REJECTED", "TEST_COMPLETED"],
        getCandidates: (candidates) => {
          const usedIds = new Set<string>()
          // Get all used IDs from previous columns
          candidates.forEach((c) => {
            if (["OFFER_ACCEPTED", "HIRED", "OFFER_DECLINED"].includes(c.status)) {
              usedIds.add(c.id)
            }
            const test = c.tests[0]
            if (
              test &&
              test.score !== null &&
              test.score >= test.test.passingScore &&
              test.status === "completed"
            ) {
              usedIds.add(c.id)
            }
          })
          return candidates.filter((c) => {
            if (usedIds.has(c.id)) return false
            if (c.status === "REJECTED") return true
            if (c.status !== "TEST_COMPLETED") return false
            const test = c.tests[0]
            return (
              test &&
              test.score !== null &&
              test.score < test.test.passingScore &&
              test.status === "completed"
            )
          })
        },
      },
      {
        id: "offer_declined",
        title: "Offer Declined",
        color: "red",
        statuses: ["OFFER_DECLINED"],
        getCandidates: (candidates) =>
          candidates.filter((c) => c.status === "OFFER_DECLINED"),
      },
    ],
    []
  )

  const filteredCandidates = useMemo(() => {
    let filtered = candidates

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.user.name?.toLowerCase().includes(searchLower) ||
          c.user.surname?.toLowerCase().includes(searchLower) ||
          c.user.email.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [candidates, search])

  const totalCandidates = filteredCandidates.length

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (dateFrom) params.set("dateFrom", dateFrom.toISOString().split("T")[0])
    if (dateTo) params.set("dateTo", dateTo.toISOString().split("T")[0])
    router.push(`/hr/candidates?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearch("")
    setDateFrom(undefined)
    setDateTo(undefined)
    router.push("/hr/candidates")
  }

  const getColumnColor = (color: string) => {
    switch (color) {
      case "green":
        return "border-green-500 bg-green-50"
      case "red":
        return "border-red-500 bg-red-50"
      case "yellow":
        return "border-yellow-500 bg-yellow-50"
      case "blue":
        return "border-blue-500 bg-blue-50"
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
      case "blue":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
        <p className="text-gray-600 mt-2">Manage and track candidate progress</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="min-w-[150px]">
              <Label>Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFrom ? dateFrom.toLocaleDateString() : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="min-w-[150px]">
              <Label>Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateTo ? dateTo.toLocaleDateString() : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>

            {(search || dateFrom || dateTo) && (
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => {
            const columnCandidates = column.getCandidates(filteredCandidates)
            const percentage =
              totalCandidates > 0 ? Math.round((columnCandidates.length / totalCandidates) * 100) : 0

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
                    <span className="text-xs font-medium">{columnCandidates.length}</span>
                  </div>
                  <div className="text-xs opacity-75">{percentage}% of total</div>
                </div>

                {/* Column Content */}
                <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {columnCandidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="hover:shadow-md transition-shadow cursor-pointer bg-white"
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold text-sm">
                              {candidate.user.name} {candidate.user.surname}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {candidate.user.email}
                            </p>
                          </div>
                          {candidate.currentVacancy && (
                            <p className="text-xs text-muted-foreground">
                              {candidate.currentVacancy.title}
                            </p>
                          )}
                          <Link href={`/hr/candidates/${candidate.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {columnCandidates.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No candidates
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

