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
} from "lucide-react"

interface SidebarProps {
  role: string
}

const candidateLinks = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/courses", label: "My Courses", icon: BookOpen },
  { href: "/candidate/tests", label: "Tests", icon: FileText },
  { href: "/candidate/offers", label: "Offers", icon: FileText },
  { href: "/candidate/chat", label: "Chat", icon: MessageSquare },
  { href: "/candidate/notifications", label: "Notifications", icon: Bell },
  { href: "/candidate/profile", label: "Profile", icon: User },
]

const employeeLinks = [
  { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employee/courses", label: "Training", icon: BookOpen },
  { href: "/employee/notifications", label: "Notifications", icon: Bell },
  { href: "/employee/profile", label: "Profile", icon: User },
]

const mentorLinks = [
  { href: "/mentor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mentor/candidates", label: "Candidates", icon: Users },
  { href: "/mentor/tests", label: "Test Reviews", icon: FileText },
  { href: "/mentor/notifications", label: "Notifications", icon: Bell },
]

const hrLinks = [
  { href: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hr/vacancies", label: "Vacancies", icon: Briefcase },
  { href: "/hr/candidates", label: "Candidates", icon: Users },
  { href: "/hr/courses", label: "Courses", icon: GraduationCap },
  { href: "/hr/tests", label: "Tests", icon: FileText },
  { href: "/hr/offers", label: "Offers", icon: FileCheck },
  { href: "/hr/talent-pool", label: "Talent Pool", icon: Database },
  { href: "/hr/webinars", label: "Webinars", icon: Calendar },
  { href: "/hr/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/hr/notifications", label: "Notifications", icon: Bell },
  { href: "/hr/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  
  const links = 
    role === "CANDIDATE" ? candidateLinks :
    role === "EMPLOYEE" ? employeeLinks :
    role === "MENTOR" ? mentorLinks :
    hrLinks

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
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

