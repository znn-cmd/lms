import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const role = (session.user as any)?.role

  switch (role) {
    case "CANDIDATE":
      redirect("/candidate/dashboard")
    case "MENTOR":
      redirect("/mentor/dashboard")
    case "HR":
    case "ADMIN":
      redirect("/hr/dashboard")
    default:
      redirect("/auth/signin")
  }
}

