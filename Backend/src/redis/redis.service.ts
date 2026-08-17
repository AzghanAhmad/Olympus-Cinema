import { Global, Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private loggedError = false;
  readonly client: Redis;

  constructor(private config: ConfigService) {
    const redisUrl = this.config.get<string>('REDIS_URL');
    const common = {
      maxRetriesPerRequest: null as null,
      enableReadyCheck: true,
      retryStrategy: (times: number) => Math.min(times * 200, 5000),
    };

    this.client = redisUrl
      ? new Redis(redisUrl, common)
      : new Redis({
          host: this.config.get<string>('REDIS_HOST', 'localhost'),
          port: this.config.get<number>('REDIS_PORT', 6379),
          password: this.config.get<string>('REDIS_PASSWORD') || undefined,
          ...common,
        });
    this.client.on('error', (err) => {
      if (!this.loggedError) {
        this.loggedError = true;
        this.logger.error(
          `Redis unavailable (${err.message}). Start it with: docker compose up -d`,
        );
      }
    });
    this.client.on('ready', () => {
      this.loggedError = false;
      this.logger.log('Redis connected');
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, payload);
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await this.client.del(...keys);
  }

  /** Atomic multi-seat hold using SET NX */
  async acquireSeatHolds(
    keys: string[],
    holdId: string,
    ttlSeconds: number,
  ): Promise<{ acquired: string[]; failed: string[] }> {
    const acquired: string[] = [];
    const failed: string[] = [];

    for (const key of keys) {
      const result = await this.client.set(key, holdId, 'EX', ttlSeconds, 'NX');
      if (result === 'OK') {
        acquired.push(key);
      } else {
        failed.push(key);
        break;
      }
    }

    if (failed.length > 0 && acquired.length > 0) {
      await this.client.del(...acquired);
      return { acquired: [], failed: keys };
    }

    return { acquired, failed };
  }
}
