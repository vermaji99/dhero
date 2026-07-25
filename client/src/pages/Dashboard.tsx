
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { TrendingUp, Users, DollarSign, Activity, ArrowRight } from 'lucide-react'
import { dashboardApi, activitiesApi } from '../services/api'
import { Layout } from '../components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'

export function DashboardPage() {
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
  })

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesApi.getAll(10),
  })

  if (statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (statsError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error loading dashboard</p>
        </div>
      </Layout>
    )
  }

  const stats = statsData?.stats
  const recentLeads = statsData?.recentLeads || []
  const recentActivities = activitiesData || []

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'primary'
      case 'CONTACTED':
        return 'secondary'
      case 'QUALIFIED':
        return 'warning'
      case 'PROPOSAL':
        return 'default'
      case 'WON':
        return 'success'
      case 'LOST':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your leads.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">New</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats?.new}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Won</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats?.won}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Lost</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats?.lost}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Leads</CardTitle>
              <Link to="/leads" className="text-blue-600 hover:text-blue-500 text-sm flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <Link key={lead.id} to={`/leads/${lead.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{lead.fullName}</p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {lead.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
                {recentLeads.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent leads</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {activitiesLoading && (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                )}
                {!activitiesLoading && recentActivities.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
