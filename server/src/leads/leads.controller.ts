
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  UpdateStatusDto,
  AssignLeadDto,
  GetLeadsQueryDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UserRole } from '../common/types/enums';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Public endpoint
  @Post('public')
  @HttpCode(HttpStatus.CREATED)
  async createPublic(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.createPublicLead(createLeadDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @CurrentUser() user: User,
    @Query() query: GetLeadsQueryDto,
  ) {
    return this.leadsService.findAll(user, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.leadsService.findOne(user, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: User, @Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(user, createLeadDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(user, id, updateLeadDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.leadsService.updateStatus(user, id, updateStatusDto);
  }

  @Patch(':id/assignment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async assignLead(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() assignLeadDto: AssignLeadDto,
  ) {
    return this.leadsService.assignLead(user, id, assignLeadDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.leadsService.remove(user, id);
  }
}
