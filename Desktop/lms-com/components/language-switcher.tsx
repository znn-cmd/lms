"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { Locale } from "@/i18n/config"

export function LanguageSwitcher() {
  const { data: session, update } = useSession()

  const handleLanguageChange = async (locale: Locale) => {
    // Update user language preference
    await fetch("/api/user/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: locale.toUpperCase() }),
    })
    
    // Reload to apply language
    window.location.reload()
  }

  const currentLanguage = (session?.user as any)?.language?.toLowerCase() || "en"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
          English {currentLanguage === "en" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("ru")}>
          Русский {currentLanguage === "ru" && "✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

