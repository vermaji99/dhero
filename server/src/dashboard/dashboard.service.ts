
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { LeadStatus } from '../common/types/enums';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: User) {
    const where: any = {};

    if (user.role === 'MEMBER') {
      where.assignedToId = user.id;
    }

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      proposalLeads,
      wonLeads,
      lostLeads,
      recentLeads,
      recentActivities,
    ] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { ...where, status: LeadStatus.NEW } }),
      this.prisma.lead.count({ where: { ...where, status: LeadStatus.CONTACTED } }),
      this.prisma.lead.count({ where: { ...where, status: LeadStatus.QUALIFIED } }),
      this.prisma.lead.count({ where: { ...where, status: LeadStatus.PROPOSAL } }),
      this.prisma.lead.count({ where: { ...where, status: LeadStatus.WON } }),
      this.prisma.lead.count({ where: { ...where, status: LeadStatus.LOST } }),
      this.prisma.lead.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.activity.findMany({
        where: user.role === 'MEMBER' ? {
          lead: { assignedToId: user.id },
        } : {},
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          actor: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        qualified: qualifiedLeads,
        proposal: proposalLeads,
        won: wonLeads,
        lost: lostLeads,
      },
      recentLeads,
      recentActivities,
    };
  }
}
