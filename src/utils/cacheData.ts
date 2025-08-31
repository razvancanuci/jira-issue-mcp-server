import {CacheData} from "../models/index.js";
import {redisClient} from "../infrastructure/redis.js";
import {compress, decompress} from "./compression.js";
import {getAuthorizationUri, oauthClient} from "../infrastructure/oauth2.js";
import open from 'open';
import jwt, {JwtPayload} from "jsonwebtoken";
import {logger} from "../infrastructure/logger.js";
import {Constants} from "../constants/constants.js";

export async function getUpdatedCachedData(userEmail: string): Promise<CacheData | null> {
    const cacheStr = await redisClient.get(userEmail);

    if(!cacheStr) {
        const authUrl = getAuthorizationUri();
        await open(authUrl);
        return null;
    }

    const decompressed =  await decompress(cacheStr);
    const data =  JSON.parse(decompressed) as CacheData;

    const decodedToken = jwt.decode(data.accessToken) as JwtPayload;

    let accessToken = oauthClient.createToken({
        access_token: data.accessToken,
        expires_at: decodedToken.expires_at || new Date((decodedToken.exp as number) * Constants.MILLISECOND_DIFFERENCE).toISOString(),
        token_type: 'Bearer',
        scope: decodedToken.scope || 'read:jira-user read:jira-work write:jira-work read:me'
    });

    if(accessToken.expired()) {
        try {
            accessToken = await accessToken.refresh();
            data.accessToken = accessToken.token.access_token as string;

            const expiration = new Date((decodedToken.exp as number) * Constants.MILLISECOND_DIFFERENCE + Constants.DAY_IN_MS).getTime() - Date.now();
            const compressedData = await compress(JSON.stringify(data));
            await redisClient.setex(userEmail, expiration, compressedData);

            return data;
        } catch (error) {
            logger.error('Error refreshing access token:', error);
            const authUrl = getAuthorizationUri();
            await open(authUrl);
            return null;
        }
    }

    return data;

}