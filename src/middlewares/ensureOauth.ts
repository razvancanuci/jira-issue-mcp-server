import { oauthClient } from "../infrastructure/oauth2.js";
import { Request, Response, NextFunction } from 'express';
import { logger } from '../infrastructure/logger.js';
import jwt, {JwtPayload} from 'jsonwebtoken';

//TODO: to be deleted after redis will be added to check
export async function ensureOAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.decode(token) as JwtPayload;

        if (!decodedToken) {
            logger.warn('Invalid token format');
            return res.status(401).json({ error: 'Invalid token format' });
        }

        let accessToken = oauthClient.createToken({
            access_token: token,
            expires_at: decodedToken.expires_at || new Date((decodedToken.exp as number) * 1000).toISOString(),
            token_type: 'Bearer',
            scope: decodedToken.scope || 'read:jira-user read:jira-work write:jira-work'
        });

        if (!accessToken) {
            logger.warn('Failed to create access token');
            return res.redirect('/auth');
        }

        if (accessToken.expired()) {
            try {
                accessToken = await accessToken.refresh();
            } catch (error) {
                logger.warn('Token refresh failed:', error);
                return res.redirect('/auth');
            }
        }

        req.accessToken = accessToken;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
}
