
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { User } from '@prisma/client';
import { ActivityType } from '../common/types/enums';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findByLeadId(user: User, leadId: string) {
    // First check if user can access the lead
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (user.role === 'MEMBER' && lead.assignedToId !== user.id) {
      throw new ForbiddenException('You do not have access to this lead');
    }

    return this.prisma.note.findMany({
      where: { leadId },
      include: {
        author: {
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

  async create(user: User, leadId: string, createNoteDto: CreateNoteDto) {
    // Check lead access
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (user.role === 'MEMBER' && lead.assignedToId !== user.id) {
      throw new ForbiddenException('You do not have access to this lead');
    }

    const note = await this.prisma.note.create({
      data: {
        ...createNoteDto,
        leadId,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    await this.prisma.activity.create({
      data: {
        leadId,
        actorId: user.id,
        type: ActivityType.NOTE_ADDED,
        description: 'Note added',
      },
    });

    return note;
  }
}
