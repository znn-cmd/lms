"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, Video } from "lucide-react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import Link from "next/link"
import { useLocale } from "@/hooks/use-locale"
import { t } from "@/lib/i18n"

export default function WebinarsPage() {
  const locale = useLocale()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/webinars")
      .then((res) => res.json())
      .then((data) => {
        const calendarEvents = data.webinars.map((w: any) => ({
          id: w.id,
          title: w.title,
          start: w.startDate,
          end: w.endDate || w.startDate,
          backgroundColor: w.isActive ? "#3b82f6" : "#9ca3af",
        }))
        setEvents(calendarEvents)
        setLoading(false)
      })
  }, [])

  const handleDateClick = (arg: any) => {
    // Open create webinar dialog
    console.log("Date clicked:", arg.dateStr)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("common.webinars", locale)}</h1>
                <p className="text-gray-600 mt-2">{t("common.scheduleAndManageWebinars", locale)}</p>
              </div>
              <Link href="/hr/webinars/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("common.createWebinar", locale)}
                </Button>
              </Link>
            </div>

            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div>{t("common.loadingCalendar", locale)}</div>
                ) : (
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    dateClick={handleDateClick}
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    height="auto"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

