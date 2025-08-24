import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {app} from "./infrastructure/express.js";
import {logger} from "./infrastructure/logger.js";
import {oauthClient} from "./infrastructure/oauth2.js";
import {getAtlassianUserInfo} from "./infrastructure/atlassianUserInfo.js";
import {getAtlassianAccessibleResources} from "./infrastructure/atlassianAccesibleResources.js";
import {AccessToken} from "simple-oauth2";

export class JiraServer {

    constructor(private readonly server: McpServer) {}

    public async start() {
        if (process.env.ENVIRONMENT === 'local') {
            await this.handleLocalServer();
            return;
        }

        await this.handleRemoteServer();
    }

    private async handleLocalServer() {
        logger.info('Starting MCP server with STDIO...');
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }

    private async handleRemoteServer() {

        app.get('/auth', (_req, res) => {
            const authorizationUri = oauthClient.authorizeURL({
                redirect_uri: `${process.env.SERVER_DOMAIN}/oauth/callback`,
                scope: 'read:jira-user read:jira-work write:jira-work read:me',
                state: 'random_state_string'
            });
            res.redirect(authorizationUri);
        });

        //TODO: Add redis to store user info, access token and other data
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

                res.json(result);

        });


        //TODO: At each resource / tool, need to request account id and check redis. If the data is not present, it needs to open a browser window to /auth
        app.post('/mcp', async (req, res) => {
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined
            })

            await this.server.connect(transport)
            await transport.handleRequest(req, res, req.body)
        })

        app.get('/mcp', async (req, res) => {
            res.status(200).send('OK')
        })

        logger.info('Starting MCP server with Streamable HTTP...')
    }
}