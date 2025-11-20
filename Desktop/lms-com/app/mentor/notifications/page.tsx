import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function MentorNotificationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any)?.role !== "MENTOR") {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="MENTOR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-2">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={notification.isRead ? "opacity-75" : "border-l-4 border-l-primary"}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getTypeIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {notifications.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      You're all caught up! New notifications will appear here.
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

