
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('leads/:leadId/notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findByLeadId(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
  ) {
    return this.notesService.findByLeadId(user, leadId);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    return this.notesService.create(user, leadId, createNoteDto);
  }
}
