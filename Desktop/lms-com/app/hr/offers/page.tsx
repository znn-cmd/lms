import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileCheck, Plus } from "lucide-react"
import Link from "next/link"
import { OffersKanban } from "./kanban"

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

  // Fetch generalOffer separately if generalOfferId exists
  const offersWithGeneralOffer = await Promise.all(
    offers.map(async (offer) => {
      const generalOfferId = (offer as any).generalOfferId
      if (generalOfferId) {
        try {
          const generalOffer = await prisma.offer.findUnique({
            where: { id: generalOfferId },
            select: {
              id: true,
              vacancy: {
                select: {
                  title: true,
                },
              },
            },
          })
          return { ...offer, generalOffer }
        } catch (error) {
          // If column doesn't exist or offer not found, skip
          return { ...offer, generalOffer: null }
        }
      }
      return { ...offer, generalOffer: null }
    })
  )

  // Fetch test information separately if testId exists
  const offersWithTests = await Promise.all(
    offersWithGeneralOffer.map(async (offer) => {
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

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-full mx-auto space-y-6">
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

            {offersWithTests.length > 0 ? (
              <OffersKanban offers={offersWithTests} />
            ) : (
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
        </main>
      </div>
    </div>
  )
}

