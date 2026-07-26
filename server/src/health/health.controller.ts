
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const db = await this.prisma
      .$runCommandRaw({ ping: 1 })
      .then((r: any) => ({ ok: r && r.ok === 1 }))
      .catch((err) => ({ ok: false, error: String(err?.message || err) }));

    return {
      status: 'ok',
      service: 'leadflow-server',
      provider: 'mongodb-prisma',
      timestamp: new Date().toISOString(),
      db,
      v: 1,
    };
  }
}
