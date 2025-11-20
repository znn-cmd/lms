import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CandidateProfileForm } from "./profile-form"

export default async function CandidateProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "CANDIDATE") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          surname: true,
          email: true,
          phone: true,
        },
      },
      currentVacancy: {
        select: {
          title: true,
        },
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
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your personal information</p>
            </div>

            <CandidateProfileForm candidate={candidate} />
          </div>
        </main>
      </div>
    </div>
  )
}

