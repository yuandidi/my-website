import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    const [db, redis] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1`.then(() => 'ok').catch(() => 'error'),
      this.redis
        .ping()
        .then(() => 'ok')
        .catch(() => 'error'),
    ]);

    const healthy = db === 'ok' && redis === 'ok';

    return {
      status: healthy ? 'ok' : 'degraded',
      services: { database: db, redis },
    };
  }
}
