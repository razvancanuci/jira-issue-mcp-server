import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import 'dotenv/config';
import {registerTools} from "./tools/index.js";
import {configDotenv} from "dotenv";
import {registerResources} from "./resources/index.js";
import {registerPrompts} from "./prompts/index.js";

configDotenv({debug: true});
// Create an MCP server
const server = new McpServer({
  name: "Jira tool MCP Server",
  version: "1.0.0"
});

registerTools(server);
registerResources(server);
registerPrompts(server);

const transport = new StdioServerTransport();
await server.connect(transport);

