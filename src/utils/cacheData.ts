import {CacheData} from "../models/index.js";
import {redisClient} from "../infrastructure/redis.js";
import {decompress} from "./compression.js";
import {getAuthorizationUri} from "../infrastructure/oauth2.js";
import open from 'open';

export async function getCacheData(userEmail: string): Promise<CacheData | null> {
    const cacheStr = await redisClient.get(userEmail);

    if(!cacheStr) {
        const authUrl = getAuthorizationUri();
        await open(authUrl);
        return null;
    }

    return await decompress(cacheStr);
}