
import {
  User,
  Lead,
  Note,
  Activity,
  DashboardStats,
  LoginCredentials,
  LoginResponse,
  CreateLeadInput,
  UpdateLeadInput,
  UpdateStatusInput,
  AssignLeadInput,
  CreateNoteInput,
  PaginatedResponse,
  ApiResponse,
  LeadStatus,
  LeadSource,
} from '../types'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { accessToken } = useAuthStore.getState()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'An error occurred')
  }

  return data
}

// Auth
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const res = await fetchApi<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    return res.data
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await fetchApi<ApiResponse<User>>('/auth/me')
    return res.data
  },
}

// Leads
export const leadsApi = {
  createPublic: async (data: CreateLeadInput): Promise<Lead> => {
    const res = await fetchApi<ApiResponse<Lead>>('/leads/public', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },

  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: LeadStatus
    source?: LeadSource
    assignedToId?: string
  }): Promise<PaginatedResponse<Lead>> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.source) searchParams.set('source', params.source)
    if (params?.assignedToId) searchParams.set('assignedToId', params.assignedToId)

    const res = await fetchApi<ApiResponse<PaginatedResponse<Lead>>>(
      `/leads?${searchParams.toString()}`,
    )
    return res.data
  },

  getOne: async (id: string): Promise<Lead & { notes: Note[]; activities: Activity[] }> => {
    const res = await fetchApi<ApiResponse<Lead & { notes: Note[]; activities: Activity[] }>>(`/leads/${id}`)
    return res.data
  },

  create: async (data: CreateLeadInput): Promise<Lead> => {
    const res = await fetchApi<ApiResponse<Lead>>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },

  update: async (id: string, data: UpdateLeadInput): Promise<Lead> => {
    const res = await fetchApi<ApiResponse<Lead>>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return res.data
  },

  updateStatus: async (id: string, data: UpdateStatusInput): Promise<Lead> => {
    const res = await fetchApi<ApiResponse<Lead>>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return res.data
  },

  assign: async (id: string, data: AssignLeadInput): Promise<Lead> => {
    const res = await fetchApi<ApiResponse<Lead>>(`/leads/${id}/assignment`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi(`/leads/${id}`, {
      method: 'DELETE',
    })
  },
}

// Notes
export const notesApi = {
  getByLeadId: async (leadId: string): Promise<Note[]> => {
    const res = await fetchApi<ApiResponse<Note[]>>(`/leads/${leadId}/notes`)
    return res.data
  },

  create: async (leadId: string, data: CreateNoteInput): Promise<Note> => {
    const res = await fetchApi<ApiResponse<Note>>(`/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },
}

// Activities
export const activitiesApi = {
  getAll: async (limit?: number): Promise<Activity[]> => {
    const searchParams = new URLSearchParams()
    if (limit) searchParams.set('limit', limit.toString())
    
    const res = await fetchApi<ApiResponse<Activity[]>>(`/activities?${searchParams.toString()}`)
    return res.data
  },

  getByLeadId: async (leadId: string): Promise<Activity[]> => {
    const res = await fetchApi<ApiResponse<Activity[]>>(`/activities/leads/${leadId}`)
    return res.data
  },
}

// Dashboard
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetchApi<ApiResponse<DashboardStats>>('/dashboard/stats')
    return res.data
  },
}

// Users
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const res = await fetchApi<ApiResponse<User[]>>('/users')
    return res.data
  },
}
