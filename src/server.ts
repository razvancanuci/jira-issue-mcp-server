import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {randomUUID} from "node:crypto";

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
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }

    private async handleRemoteServer() {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID()
        });

        await this.server.connect(transport);
    }
}