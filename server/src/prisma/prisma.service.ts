
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function stripQuotes(value: string | undefined): string | undefined {
  if (!value) return value;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

const cleanDatabaseUrl = stripQuotes(process.env.DATABASE_URL);
if (cleanDatabaseUrl !== process.env.DATABASE_URL && cleanDatabaseUrl) {
  process.env.DATABASE_URL = cleanDatabaseUrl;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super(
      cleanDatabaseUrl
        ? { datasources: { db: { url: cleanDatabaseUrl } } }
        : undefined,
    );
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
