
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Eye, User } from 'lucide-react'
import { leadsApi, usersApi } from '../services/api'
import { LeadStatus, LeadSource, UserRole } from '../types'
import { useAuthStore } from '../store/authStore'
import { Layout } from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'

export function LeadsPage() {
  const { user } = useAuthStore()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [assignedFilter, setAssignedFilter] = useState<string>('')
  const limit = 10

  const { data: leadsData, isLoading, error } = useQuery({
    queryKey: ['leads', page, search, statusFilter, sourceFilter, assignedFilter],
    queryFn: () =>
      leadsApi.getAll({
        page,
        limit,
        search: search || undefined,
        status: (statusFilter as LeadStatus) || undefined,
        source: (sourceFilter as LeadSource) || undefined,
        assignedToId: assignedFilter || undefined,
      }),
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    enabled: user?.role === UserRole.ADMIN,
  })

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setSourceFilter('')
    setAssignedFilter('')
    setPage(1)
  }

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW:
        return 'primary'
      case LeadStatus.CONTACTED:
        return 'secondary'
      case LeadStatus.QUALIFIED:
        return 'warning'
      case LeadStatus.PROPOSAL:
        return 'default'
      case LeadStatus.WON:
        return 'success'
      case LeadStatus.LOST:
        return 'danger'
      default:
        return 'default'
    }
  }

  const leads = leadsData?.data || []
  const meta = leadsData?.meta
  const totalPages = meta?.totalPages || 1

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error loading leads</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-500 mt-1">
              {meta?.total ? `Showing ${leads.length} of ${meta.total} leads` : 'No leads'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-40"
                >
                  <option value="">All Status</option>
                  {Object.values(LeadStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>

                <Select
                  value={sourceFilter}
                  onChange={(e) => {
                    setSourceFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-40"
                >
                  <option value="">All Sources</option>
                  {Object.values(LeadSource).map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </Select>

                {user?.role === UserRole.ADMIN && (
                  <Select
                    value={assignedFilter}
                    onChange={(e) => {
                      setAssignedFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-40"
                  >
                    <option value="">All Assignees</option>
                    <option value="unassigned">Unassigned</option>
                    {users?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </Select>
                )}

                {(search || statusFilter || sourceFilter || assignedFilter) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.company || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(lead.status)}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.assignedTo?.fullName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {leads.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No leads found</p>
              </div>
            )}

            {/* Pagination */}
            {meta && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
