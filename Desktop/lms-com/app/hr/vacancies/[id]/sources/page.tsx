"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Copy, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function RegistrationSourcesPage() {
  const params = useParams()
  const router = useRouter()
  const vacancyId = params.id as string

  const [sources, setSources] = useState<any[]>([])
  const [vacancy, setVacancy] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newSourceName, setNewSourceName] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [vacancyId])

  const fetchData = async () => {
    try {
      const [vacancyResponse, sourcesResponse] = await Promise.all([
        fetch(`/api/vacancies/${vacancyId}`),
        fetch(`/api/vacancies/${vacancyId}/sources`),
      ])
      
      const vacancyData = await vacancyResponse.json()
      const sourcesData = await sourcesResponse.json()
      
      setVacancy(vacancyData.vacancy)
      setSources(sourcesData.sources || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setLoading(false)
    }
  }

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSourceName.trim()) return

    try {
      const response = await fetch(`/api/vacancies/${vacancyId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSourceName }),
      })

      if (response.ok) {
        setNewSourceName("")
        setShowAddForm(false)
        fetchData()
      } else {
        alert("Failed to create source")
      }
    } catch (error) {
      alert("An error occurred")
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return

    try {
      const response = await fetch(`/api/vacancies/${vacancyId}/sources/${sourceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      } else {
        alert("Failed to delete source")
      }
    } catch (error) {
      alert("An error occurred")
    }
  }

  const copyLink = (link: string) => {
    const fullUrl = `${window.location.origin}/register/${link}`
    navigator.clipboard.writeText(fullUrl)
    alert("Link copied to clipboard!")
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
              <Link href={`/hr/vacancies/${vacancyId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Registration Links</h1>
                <p className="text-gray-600 mt-2">{vacancy?.title}</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registration Sources</CardTitle>
                    <CardDescription>
                      Create unique registration links for different channels
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Source
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <form onSubmit={handleCreateSource} className="mb-6 p-4 border rounded-lg">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Source name (e.g., LinkedIn, HH.ru, Facebook)"
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        required
                      />
                      <Button type="submit">Create</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {sources.map((source) => {
                    const fullLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register/${source.uniqueLink}`
                    return (
                      <div
                        key={source.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{source.name}</h3>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                                  {fullLink}
                                </code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyLink(source.uniqueLink)}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy
                                </Button>
                                <a
                                  href={fullLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" size="sm">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </a>
                              </div>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>Registrations: {source.registrations}</span>
                                <span>Completions: {source.completions}</span>
                                <span>Candidates: {source._count?.candidates || 0}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSource(source.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}

                  {sources.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No registration sources yet. Create one to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

