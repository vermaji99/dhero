
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

export const ActivityType = {
  LEAD_CREATED: 'LEAD_CREATED',
  LEAD_UPDATED: 'LEAD_UPDATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  LEAD_ASSIGNED: 'LEAD_ASSIGNED',
  LEAD_UNASSIGNED: 'LEAD_UNASSIGNED',
  NOTE_ADDED: 'NOTE_ADDED',
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];
