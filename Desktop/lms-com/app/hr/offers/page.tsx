import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileCheck, Plus, Edit, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"

export default async function OffersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const offers = await prisma.offer.findMany({
    include: {
      candidate: {
        include: {
          user: {
            select: {
              name: true,
              surname: true,
              email: true,
            },
          },
        },
      },
      vacancy: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Fetch test information separately if testId exists
  const offersWithTests = await Promise.all(
    offers.map(async (offer) => {
      if (offer.testId) {
        const test = await prisma.test.findUnique({
          where: { id: offer.testId },
          select: {
            id: true,
            title: true,
          },
        })
        return { ...offer, test }
      }
      return { ...offer, test: null }
    })
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Accepted
          </span>
        )
      case "declined":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            Declined
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            Pending
          </span>
        )
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "declined":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Offers</h1>
                <p className="text-gray-600 mt-2">Manage job offers and responses</p>
              </div>
              <Link href="/hr/offers/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Offer
                </Button>
              </Link>
            </div>

            <div className="grid gap-4">
              {offersWithTests.map((offer) => (
                <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(offer.status)}
                          {offer.type === "personal" 
                            ? `Personal Offer for ${offer.candidate?.user.name} ${offer.candidate?.user.surname}`
                            : `General Offer for ${offer.vacancy?.title}`
                          }
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <div className="space-y-1">
                            <p className="font-medium">
                              Type: {offer.type === "personal" ? "Personal" : "General"}
                            </p>
                            {offer.type === "personal" && offer.candidate && (
                              <>
                                <p>Candidate: {offer.candidate.user.name} {offer.candidate.user.surname}</p>
                                <p>Email: {offer.candidate.user.email}</p>
                              </>
                            )}
                            {offer.type === "general" && offer.vacancy && (
                              <p>Vacancy: {offer.vacancy.title}</p>
                            )}
                            {offer.test && <p>Triggered by: {offer.test.title}</p>}
                            <p>Sent: {new Date(offer.sentAt).toLocaleDateString()}</p>
                            {offer.respondedAt && (
                              <p>Responded: {new Date(offer.respondedAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(offer.status)}
                        <Link href={`/hr/offers/${offer.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {offer.content.substring(0, 200)}
                        {offer.content.length > 200 && "..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {offers.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileCheck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first job offer for a candidate
                    </p>
                    <Link href="/hr/offers/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Offer
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

