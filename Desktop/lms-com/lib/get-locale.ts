import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Locale, defaultLocale } from "@/i18n/config"

export async function getLocale(): Promise<Locale> {
  try {
    const session = await getServerSession(authOptions)
    const language = (session?.user as any)?.language?.toLowerCase() || defaultLocale
    return (language === "ru" ? "ru" : "en") as Locale
  } catch {
    return defaultLocale
  }
}

