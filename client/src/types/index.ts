
export const UserRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const LeadStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  PROPOSAL: 'PROPOSAL',
  WON: 'WON',
  LOST: 'LOST',
} as const;

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const LeadSource = {
  WEBSITE: 'WEBSITE',
  REFERRAL: 'REFERRAL',
  LINKEDIN: 'LINKEDIN',
  INSTAGRAM: 'INSTAGRAM',
  GOOGLE: 'GOOGLE',
  ADVERTISEMENT: 'ADVERTISEMENT',
  OTHER: 'OTHER',
} as const;

export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource];

export const ActivityType = {
  LEAD_CREATED: 'LEAD_CREATED',
  LEAD_UPDATED: 'LEAD_UPDATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  LEAD_ASSIGNED: 'LEAD_ASSIGNED',
  LEAD_UNASSIGNED: 'LEAD_UNASSIGNED',
  NOTE_ADDED: 'NOTE_ADDED',
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  source: LeadSource;
  message?: string | null;
  status: LeadStatus;
  assignedTo?: User | null;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  leadId: string;
  author: User;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  leadId: string;
  actor?: User | null;
  actorId?: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  stats: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    proposal: number;
    won: number;
    lost: number;
  };
  recentLeads: Lead[];
  recentActivities: Activity[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface CreateLeadInput {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  message?: string;
}

export interface UpdateLeadInput {
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  message?: string;
}

export interface UpdateStatusInput {
  status: LeadStatus;
}

export interface AssignLeadInput {
  assignedToId?: string;
}

export interface CreateNoteInput {
  content: string;
}
