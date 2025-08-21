import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {app} from "./infrastructure/express.js";
import {logger} from "./infrastructure/logger.js";
import {oauthClient} from "./infrastructure/oauth2.js";
import {ensureOAuth} from "./middlewares/ensureOauth.js";

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
                redirect_uri: 'http://localhost:3000/oauth/callback',
                scope: 'read:jira-user read:jira-work write:jira-work',
                state: 'random_state_string'
            });
            res.redirect(authorizationUri);
        });

        app.get('/oauth/callback', async (req, res) => {
            const { code } = req.query;
            try {
                const result = await oauthClient.getToken({
                    code: code as string,
                    redirect_uri: 'http://localhost:3000/oauth/callback'
                });

                res.json(result);
            } catch (error) {
                const err = error as Error;
                logger.error('Access Token Error', err.message);
                res.status(500).json('Authentication failed');
            }
        });



        app.post('/mcp', ensureOAuth, async (req, res) => {
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