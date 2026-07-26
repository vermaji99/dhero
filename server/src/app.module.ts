
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeadsModule } from './leads/leads.module';
import { NotesModule } from './notes/notes.module';
import { ActivitiesModule } from './activities/activities.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    LeadsModule,
    NotesModule,
    ActivitiesModule,
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule {}
