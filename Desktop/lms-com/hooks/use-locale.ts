"use client"

import { useSession } from "next-auth/react"
import { Locale, defaultLocale } from "@/i18n/config"

export function useLocale(): Locale {
  const { data: session } = useSession()
  const language = (session?.user as any)?.language?.toLowerCase() || defaultLocale
  return (language === "ru" ? "ru" : "en") as Locale
}

