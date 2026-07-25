
import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async findAll(@CurrentUser() user: User, @Query('limit') limit?: string) {
    return this.activitiesService.findAll(user, limit ? parseInt(limit) : 20);
  }

  @Get('leads/:leadId')
  async findByLeadId(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
  ) {
    return this.activitiesService.findByLeadId(user, leadId);
  }
}
