"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  MessageSquare,
  User,
  Settings,
  Briefcase,
  Users,
  GraduationCap,
  Calendar,
  BarChart3,
  Database,
  FileCheck,
  Bell,
  Zap,
} from "lucide-react"
import { useLocale } from "@/hooks/use-locale"
import { t } from "@/lib/i18n"

interface SidebarProps {
  role: string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const locale = useLocale()
  
  const getLinks = () => {
    if (role === "CANDIDATE") {
      return [
        { href: "/candidate/dashboard", labelKey: "common.dashboard", icon: LayoutDashboard },
        { href: "/candidate/courses", labelKey: "common.myCourses", icon: BookOpen },
        { href: "/candidate/tests", labelKey: "common.tests", icon: FileText },
        { href: "/candidate/offers", labelKey: "common.offers", icon: FileText },
        { href: "/candidate/chat", labelKey: "common.chat", icon: MessageSquare },
        { href: "/candidate/notifications", labelKey: "common.notifications", icon: Bell },
        { href: "/candidate/profile", labelKey: "common.profile", icon: User },
      ]
    } else if (role === "EMPLOYEE") {
      return [
        { href: "/employee/dashboard", labelKey: "common.dashboard", icon: LayoutDashboard },
        { href: "/employee/courses", labelKey: "common.training", icon: BookOpen },
        { href: "/employee/notifications", labelKey: "common.notifications", icon: Bell },
        { href: "/employee/profile", labelKey: "common.profile", icon: User },
      ]
    } else if (role === "MENTOR") {
      return [
        { href: "/mentor/dashboard", labelKey: "common.dashboard", icon: LayoutDashboard },
        { href: "/mentor/candidates", labelKey: "common.candidates", icon: Users },
        { href: "/mentor/tests", labelKey: "common.testReviews", icon: FileText },
        { href: "/mentor/notifications", labelKey: "common.notifications", icon: Bell },
      ]
    } else {
      return [
        { href: "/hr/dashboard", labelKey: "common.dashboard", icon: LayoutDashboard },
        { href: "/hr/vacancies", labelKey: "common.vacancies", icon: Briefcase },
        { href: "/hr/candidates", labelKey: "common.candidates", icon: Users },
        { href: "/hr/courses", labelKey: "common.courses", icon: GraduationCap },
        { href: "/hr/tests", labelKey: "common.tests", icon: FileText },
        { href: "/hr/offers", labelKey: "common.offers", icon: FileCheck },
        { href: "/hr/talent-pool", labelKey: "common.talentPool", icon: Database },
        { href: "/hr/webinars", labelKey: "common.webinars", icon: Calendar },
        { href: "/hr/analytics", labelKey: "common.analytics", icon: BarChart3 },
        { href: "/hr/notifications", labelKey: "common.notifications", icon: Bell },
        { href: "/hr/automation", labelKey: "common.automation", icon: Zap },
        { href: "/hr/settings", labelKey: "common.settings", icon: Settings },
      ]
    }
  }

  const links = getLinks()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">LMS Platform</h2>
      </div>
      <nav className="px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{t(link.labelKey, locale)}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

