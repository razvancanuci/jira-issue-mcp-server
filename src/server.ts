import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {app, SERVER_DNS} from "./infrastructure/express.js";
import {logger} from "./infrastructure/logger.js";
import {getAuthorizationUri, oauthClient} from "./infrastructure/oauth2.js";
import {getAtlassianUserInfo} from "./infrastructure/atlassianUserInfo.js";
import {getAtlassianAccessibleResources} from "./infrastructure/atlassianAccesibleResources.js";
import {AccessToken} from "simple-oauth2";
import {CacheData} from "./models/index.js";
import {redisClient} from "./infrastructure/redis.js";
import jwt, {JwtPayload} from "jsonwebtoken";
import {compress} from "./utils/compression.js";

export class JiraServer {

    constructor(private readonly server: McpServer) {}

    public async start() {

        app.get('/health', (_req, res) => {
            res.status(200).send('OK');
        });

        app.get('/auth', (_req, res) => {
            const authorizationUri = getAuthorizationUri();

            logger.info('Authorization URL endpoint called');
            res.redirect(authorizationUri);
        });

        app.get('/oauth/callback', async (req, res) => {
            const { code } = req.query;
            let result: AccessToken;
            try {
                result = await oauthClient.getToken({
                    code: code as string,
                    redirect_uri: `${SERVER_DNS}/oauth/callback`
                });
            } catch (error) {
                logger.error(`Access Token Error`, error);
                return res.status(500).json('Something went wrong');
            }

            let userInfo: any;
            let resources: any;
            try {
                [userInfo, resources] = await Promise.all([
                    getAtlassianUserInfo(result.token.access_token as string),
                    getAtlassianAccessibleResources(result.token.access_token as string)
                ]);
            } catch(error) {
                logger.error('Error fetching user info or resources', error);
                return res.status(500).json('Something went wrong');
            }

            const decodedToken = jwt.decode(result.token.access_token as string) as JwtPayload;

            const cacheData: CacheData = {accessToken: result.token.access_token as string, userInfo: userInfo, resources: resources.resources};

            const expiration = new Date((decodedToken.exp as number) * 1000).getTime() - Date.now();

            const compressedData = await compress(JSON.stringify(cacheData));

            try {
                await redisClient.setex(userInfo.email, expiration, compressedData);
            }
            catch (error) {
                logger.error('Error caching data in Redis', error);
                return res.status(500).json('Something went wrong');
            }
            logger.info(`User ${userInfo.displayName} authenticated successfully with email ${userInfo.email}`);

            res.status(200).send('Authentication successful!');
        });

        logger.info('Starting MCP server with STDIO...');
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}