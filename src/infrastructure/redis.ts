import {Redis, RedisOptions} from "ioredis";
import {logger} from "./logger.js";

const options: RedisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379,

    connectTimeout: 10000,
    commandTimeout: 5000,
    lazyConnect: true,
    keepAlive: 30000,

    maxRetriesPerRequest: 3,

    reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
    },

    enableReadyCheck: true,

    enableAutoPipelining: true,

    showFriendlyErrorStack: true,

    retryStrategy: (times: number) => {
        return Math.min(times * 50, 2000);
    }
}

const redisClient = new Redis(options);

redisClient.on('connect', () => {
    logger.info('Redis client connected');
});

redisClient.on('ready', () => {
    logger.info('Redis client ready');
});

redisClient.on('error', (err: Error) => {
    logger.error('Redis client error:', err);
});

redisClient.on('close', () => {
    logger.info('Redis client connection closed');
});

redisClient.on('reconnecting', () => {
    logger.warn('Redis client reconnecting');
});

redisClient.on('end', () => {
    logger.info('Redis client connection ended');
});


export { redisClient }
