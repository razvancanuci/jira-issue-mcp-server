import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {app} from "./infrastructure/express.js";
import {logger} from "./infrastructure/logger.js";
import {oauthClient} from "./infrastructure/oauth2.js";
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
            const authorizationUri = oauthClient.authorizeURL({
                redirect_uri: `${process.env.SERVER_DOMAIN}/oauth/callback`,
                scope: 'read:jira-user read:jira-work write:jira-work read:me',
                state: 'random_state_string'
            });

            logger.info('Authorization URL endpoint called');
            res.redirect(authorizationUri);
        });

        app.get('/oauth/callback', async (req, res) => {
            const { code } = req.query;
            let result: AccessToken;
            try {
                result = await oauthClient.getToken({
                    code: code as string,
                    redirect_uri: `${process.env.SERVER_DOMAIN}/oauth/callback`
                });
            } catch (error) {
                const err = error as Error;
                logger.error(`Access Token Error, ${err.message}`);
                return res.status(500).json('Authentication failed');
            }

            const [userInfo, resources] = await Promise.all([
                getAtlassianUserInfo(result.token.access_token as string),
                getAtlassianAccessibleResources(result.token.access_token as string)
            ]);

            const decodedToken = jwt.decode(result.token.access_token as string) as JwtPayload;

            const cacheData: CacheData = {accessToken: result.token.access_token as string, userInfo: userInfo, resources: resources.resources};

            const expiration = new Date((decodedToken.exp as number) * 1000).getTime() - Date.now();

            const compressedData = await compress(JSON.stringify(cacheData));

            await redisClient.setex(userInfo.email, expiration, compressedData);

            logger.info(`User ${userInfo.displayName} authenticated successfully with email ${userInfo.email}`);

            res.json(result);
        });

        logger.info('Starting MCP server with STDIO...');
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}