import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AutomationList } from "./automation-list"
import { Button } from "@/components/ui/button"
import { Plus, Zap } from "lucide-react"
import Link from "next/link"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/i18n"

export default async function AutomationPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !["HR", "ADMIN"].includes((session.user as any)?.role)) {
    redirect("/auth/signin")
  }

  const locale = await getLocale()

  const triggers = await prisma.trigger.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar role={(session.user as any).role} />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("hr.automation.title", locale)}</h1>
                <p className="text-gray-600 mt-2">{t("hr.automation.subtitle", locale)}</p>
              </div>
              <Link href="/hr/automation/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("hr.automation.createAutomation", locale)}
                </Button>
              </Link>
            </div>

            <AutomationList triggers={triggers} />
          </div>
        </main>
      </div>
    </div>
  )
}

