
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: User, limit: number = 20) {
    const where: any = {};

    if (user.role === 'MEMBER') {
      // Only show activities for leads assigned to member
      where.lead = {
        assignedToId: user.id,
      };
    }

    return this.prisma.activity.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByLeadId(user: User, leadId: string) {
    // First check lead access
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new Error('Lead not found');
    }

    if (user.role === 'MEMBER' && lead.assignedToId !== user.id) {
      throw new Error('Access denied');
    }

    return this.prisma.activity.findMany({
      where: { leadId },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
