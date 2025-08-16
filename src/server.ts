import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {app} from "./infrastructure/express.js";
import {logger} from "./infrastructure/logger.js";

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