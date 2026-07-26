
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('ready')
  ready() {
    return {
      status: 'ready',
      service: 'leadflow-server',
      provider: 'mongodb-prisma',
      v: 2,
      deployedAt: process.env.NEXT_PUBLIC_BUILD_ID || process.env.VERCEL_DEPLOYMENT_ID || undefined,
      region: process.env.VERCEL_REGION || undefined,
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'default-allowlist',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  async check() {
    const db = await Promise.race([
      this.prisma
        .$runCommandRaw({ ping: 1 })
        .then((r: any) => ({ ok: !!(r && r.ok === 1) }))
        .catch((err) => ({ ok: false, error: String(err?.message || err) })),
      new Promise<{ ok: false; error: string }>((resolve) =>
        setTimeout(() => resolve({ ok: false, error: 'timeout' }), 2500),
      ),
    ]);

    return {
      status: 'ok',
      service: 'leadflow-server',
      provider: 'mongodb-prisma',
      timestamp: new Date().toISOString(),
      db,
      v: 2,
    };
  }
}
