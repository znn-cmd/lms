import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/i18n"

export default async function CandidateOffers() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "CANDIDATE") {
    redirect("/auth/signin")
  }

  const locale = await getLocale()
  const userId = (session.user as any).id
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      offers: {
        include: {
          vacancy: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!candidate) {
    redirect("/candidate/dashboard")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CANDIDATE" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("common.jobOffers", locale)}</h1>
              <p className="text-gray-600 mt-2">{t("common.reviewAndRespond", locale)}</p>
            </div>

            <div className="grid gap-6">
              {candidate.offers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{offer.vacancy?.title || t("common.offers", locale)}</CardTitle>
                        <CardDescription className="mt-2">
                          {t("common.offerSentOn", locale)} {new Date(offer.sentAt).toLocaleDateString(locale)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {offer.status === "accepted" && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {t("common.accepted", locale)}
                          </span>
                        )}
                        {offer.status === "declined" && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            {t("common.declined", locale)}
                          </span>
                        )}
                        {offer.status === "sent" && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {t("common.pending", locale)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: offer.content }} />
                      </div>
                      {offer.status === "sent" && (
                        <div className="flex gap-2 pt-4 border-t">
                          <form action={`/api/offers/${offer.id}/accept`} method="POST">
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t("common.acceptOffer", locale)}
                            </Button>
                          </form>
                          <form action={`/api/offers/${offer.id}/decline`} method="POST">
                            <Button type="submit" variant="destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              {t("common.declineOffer", locale)}
                            </Button>
                          </form>
                        </div>
                      )}
                      {offer.respondedAt && (
                        <p className="text-sm text-muted-foreground">
                          {t("common.respondedOn", locale)} {new Date(offer.respondedAt).toLocaleDateString(locale)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {candidate.offers.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("common.noOffersYet", locale)}</h3>
                    <p className="text-muted-foreground">
                      {t("common.noOffersYetDesc", locale)}
                    </p>
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

