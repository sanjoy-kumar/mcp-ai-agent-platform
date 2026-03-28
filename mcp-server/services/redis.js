import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    }
});

redis.on('error', (err) => {
    console.warn('Redis Connection Error:', err.message);
    // We don't throw here so the app keeps running without cache
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

// Helper to wrap logic for easier use in agent.js

export const cacheService = {
    async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            return null;
        }
    },

    async set(key, value, ttlSeconds = 3600) {
        try {
            await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        } catch (err) {
            console.error('Redis Save Error:', err);
        }
    }
};

export default redis;

