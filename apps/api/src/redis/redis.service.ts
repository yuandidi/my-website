import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    this.client = new Redis(redisUrl);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
      return;
    }
    await this.client.set(key, value);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async setSession(sessionId: string, data: object, ttlSeconds = 86400) {
    await this.set(`session:${sessionId}`, JSON.stringify(data), ttlSeconds);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    const raw = await this.get(`session:${sessionId}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async revokeToken(token: string, ttlSeconds: number) {
    await this.set(`revoked:${token}`, '1', ttlSeconds);
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const value = await this.get(`revoked:${token}`);
    return value === '1';
  }
}
