"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="HR" />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-8 mt-16">
            <div className="max-w-7xl mx-auto">Loading analytics...</div>
          </main>
        </div>
      </div>
    )
  }

  const funnelData = [
    { name: 'Applications', value: data?.funnel?.applications || 100, fill: '#0088FE' },
    { name: 'Registrations', value: data?.funnel?.registrations || 80, fill: '#00C49F' },
    { name: 'Profiles Completed', value: data?.funnel?.profilesCompleted || 65, fill: '#FFBB28' },
    { name: 'In Course', value: data?.funnel?.inCourse || 50, fill: '#FF8042' },
    { name: 'Tests Completed', value: data?.funnel?.testsCompleted || 40, fill: '#8884d8' },
    { name: 'Offers Sent', value: data?.funnel?.offersSent || 25, fill: '#82ca9d' },
    { name: 'Hired', value: data?.funnel?.hired || 20, fill: '#ffc658' },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar role="HR" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into your hiring pipeline</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hiring Funnel</CardTitle>
                  <CardDescription>Candidate progression through the pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={funnelData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Current candidate status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={data?.statusDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(data?.statusDistribution || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source Performance</CardTitle>
                  <CardDescription>Registration sources comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data?.sourcePerformance || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="registrations" fill="#0088FE" name="Registrations" />
                      <Bar dataKey="completions" fill="#00C49F" name="Completions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Scores Distribution</CardTitle>
                  <CardDescription>Average test scores by vacancy</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data?.testScores || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vacancy" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="averageScore" fill="#FF8042" name="Average Score" />
                      <Bar dataKey="passingScore" fill="#8884d8" name="Passing Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Registration and hiring trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data?.monthlyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="registrations" stroke="#0088FE" name="Registrations" />
                      <Line type="monotone" dataKey="hired" stroke="#00C49F" name="Hired" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

