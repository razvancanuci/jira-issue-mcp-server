import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import 'dotenv/config';
import {registerTools} from "./tools/index.js";
import {configDotenv} from "dotenv";
import {registerPrompts} from "./prompts/index.js";
import {logger} from "./infrastructure/logger.js";
import {JiraServer} from "./server.js";
import {app} from "./infrastructure/express.js";

configDotenv();
// Create an MCP server
const server = new McpServer({
  name: "Jira tool MCP Server",
  version: "1.0.0"
});

registerTools(server);
registerPrompts(server);

const jiraServer = new JiraServer(server);

logger.info('Starting MCP server...');

jiraServer.start().then(() => {
    app.listen(3000)
});


