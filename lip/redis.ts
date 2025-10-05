import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env
