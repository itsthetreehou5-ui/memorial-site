// lib/redis.js
import { Redis } from '@upstash/redis';

// No TS non-null (!) or type assertions—just plain JS env reads
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Export both ways so existing imports keep working
export default redis;
export { redis };
