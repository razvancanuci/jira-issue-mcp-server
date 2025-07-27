import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import 'dotenv/config';
import {registerTools} from "./tools/index.js";
import {configDotenv} from "dotenv";

configDotenv({debug: true});
// Create an MCP server
const server = new McpServer({
  name: "Jira tool MCP Server",
  version: "1.0.0"
});

registerTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);

