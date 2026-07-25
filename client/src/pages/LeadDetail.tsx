
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  User,
  Phone,
  Building,
  Mail,
  MessageSquare,
  Clock,
  Trash2,
} from 'lucide-react'
import { leadsApi, notesApi, usersApi } from '../services/api'
import { LeadStatus, UserRole, CreateNoteInput } from '../types'
import { useAuthStore } from '../store/authStore'
import { Layout } from '../components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'

const noteSchema = z.object({
  content: z.string().min(1, 'Note is required').max(2000, 'Note is too long'),
})

type NoteFormData = z.infer<typeof noteSchema>

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: lead, isLoading: leadLoading, error: leadError } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getOne(id!),
    enabled: !!id,
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    enabled: user?.role === UserRole.ADMIN,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
    },
  })

  const assignLeadMutation = useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId?: string }) =>
      leadsApi.assign(id, { assignedToId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
    },
  })

  const createNoteMutation = useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: CreateNoteInput }) =>
      notesApi.create(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
      reset()
    },
  })

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      navigate('/leads')
    },
  })

  const onSubmitNote = handleSubmit((data) => {
    if (id) {
      createNoteMutation.mutate({ leadId: id, data })
    }
  })

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

  if (leadLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (leadError || !lead) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Lead not found</p>
          <Button variant="outline" onClick={() => navigate('/leads')} className="mt-4">
            Back to Leads
          </Button>
        </div>
      </Layout>
    )
  }

  const canEdit =
    user?.role === UserRole.ADMIN ||
    (user?.role === UserRole.MEMBER && lead.assignedToId === user.id)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <div>
          <Button variant="ghost" onClick={() => navigate('/leads')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{lead.fullName}</CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={getStatusBadgeVariant(lead.status)}>
                      {lead.status}
                    </Badge>
                    <Badge variant="secondary">{lead.source}</Badge>
                  </div>
                </div>
                {user?.role === UserRole.ADMIN && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this lead?')) {
                        deleteLeadMutation.mutate(lead.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{lead.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-gray-900">{lead.company || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-gray-900">
                        {new Date(lead.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {lead.message && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Message</p>
                    <p className="text-gray-900">{lead.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={onSubmitNote} className="space-y-3">
                  <Textarea
                    placeholder="Add a note..."
                    rows={3}
                    {...register('content')}
                    className={errors.content ? 'border-red-500' : ''}
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm">{errors.content.message}</p>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={createNoteMutation.isPending}
                  >
                    {createNoteMutation.isPending ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    Add Note
                  </Button>
                </form>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {lead.notes?.map((note) => (
                    <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{note.author.fullName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                    </div>
                  ))}
                  {(!lead.notes || lead.notes.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No notes yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lead.activities?.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          {activity.actor?.fullName || 'System'}
                          <span>•</span>
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!lead.activities || lead.activities.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No activity yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                {canEdit ? (
                  <Select
                    value={lead.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({
                        id: lead.id,
                        status: e.target.value as LeadStatus,
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    {Object.values(LeadStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Badge variant={getStatusBadgeVariant(lead.status)} className="text-sm">
                    {lead.status}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Assignment */}
            {user?.role === UserRole.ADMIN && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned To</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={lead.assignedToId || 'unassigned'}
                    onChange={(e) => {
                      const assignedToId =
                        e.target.value === 'unassigned' ? undefined : e.target.value
                      assignLeadMutation.mutate({ id: lead.id, assignedToId })
                    }}
                    disabled={assignLeadMutation.isPending}
                  >
                    <option value="unassigned">Unassigned</option>
                    {users?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </Select>
                </CardContent>
              </Card>
            )}

            {user?.role !== UserRole.ADMIN && lead.assignedTo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned To</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lead.assignedTo.fullName}</p>
                      <p className="text-sm text-gray-500">{lead.assignedTo.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
