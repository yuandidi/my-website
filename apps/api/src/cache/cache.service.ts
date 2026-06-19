import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly prefix = 'blog:';

  constructor(private readonly redis: RedisService) {}

  private buildKey(key: string) {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(this.buildKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(
      this.buildKey(key),
      JSON.stringify(value),
      ttlSeconds,
    );
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.buildKey(key));
  }

  async wrap<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await factory();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}
