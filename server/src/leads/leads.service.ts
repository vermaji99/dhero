
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  UpdateStatusDto,
  AssignLeadDto,
  GetLeadsQueryDto,
} from './dto';
import { User } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async createPublicLead(createLeadDto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: createLeadDto,
    });

    await this.prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'LEAD_CREATED',
        description: 'Lead created through public form',
      },
    });

    return lead;
  }

  async findAll(user: User, query: GetLeadsQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      source,
      assignedToId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (user.role === 'MEMBER') {
      where.assignedToId = user.id;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: leads,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(user: User, id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        notes: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        activities: {
          include: {
            actor: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Check permissions
    if (user.role === 'MEMBER' && lead.assignedToId !== user.id) {
      throw new ForbiddenException('You do not have access to this lead');
    }

    return lead;
  }

  async create(user: User, createLeadDto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: createLeadDto,
    });

    await this.prisma.activity.create({
      data: {
        leadId: lead.id,
        actorId: user.id,
        type: 'LEAD_CREATED',
        description: 'Lead created by admin',
      },
    });

    return lead;
  }

  async update(user: User, id: string, updateLeadDto: UpdateLeadDto) {
    const lead = await this.findOne(user, id);

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
    });

    await this.prisma.activity.create({
      data: {
        leadId: id,
        actorId: user.id,
        type: 'LEAD_UPDATED',
        description: 'Lead details updated',
      },
    });

    return updatedLead;
  }

  async updateStatus(user: User, id: string, updateStatusDto: UpdateStatusDto) {
    const lead = await this.findOne(user, id);

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });

    await this.prisma.activity.create({
      data: {
        leadId: id,
        actorId: user.id,
        type: 'STATUS_CHANGED',
        description: `Status changed from ${lead.status} to ${updateStatusDto.status}`,
      },
    });

    return updatedLead;
  }

  async assignLead(user: User, id: string, assignLeadDto: AssignLeadDto) {
    const lead = await this.findOne(user, id);

    const { assignedToId } = assignLeadDto;

    // If unassigning
    if (!assignedToId && lead.assignedToId) {
      await this.prisma.activity.create({
        data: {
          leadId: id,
          actorId: user.id,
          type: 'LEAD_UNASSIGNED',
          description: 'Lead unassigned',
        },
      });
    } else if (assignedToId && assignedToId !== lead.assignedToId) {
      // If assigning
      const assignee = await this.prisma.user.findUnique({
        where: { id: assignedToId },
      });
      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      await this.prisma.activity.create({
        data: {
          leadId: id,
          actorId: user.id,
          type: 'LEAD_ASSIGNED',
          description: `Lead assigned to ${assignee.fullName}`,
        },
      });
    }

    return this.prisma.lead.update({
      where: { id },
      data: { assignedToId },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(user: User, id: string) {
    await this.findOne(user, id); // This will check permissions
    return this.prisma.lead.delete({ where: { id } });
  }
}
