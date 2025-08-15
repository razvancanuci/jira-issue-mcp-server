import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import 'dotenv/config';
import {registerTools} from "./tools/index.js";
import {configDotenv} from "dotenv";
import {registerResources} from "./resources/index.js";
import {registerPrompts} from "./prompts/index.js";
import apm from 'elastic-apm-node';
import {logger} from "./infrastructure/logger.js";
import {JiraServer} from "./server.js";

configDotenv();
// Create an MCP server
const server = new McpServer({
  name: "Jira tool MCP Server",
  version: "1.0.0"
});

registerTools(server);
registerResources(server);
registerPrompts(server);

apm.start({
    captureBody: 'all',
    serviceName: 'jira-tool-mcp-server',
    serverUrl: process.env.ELASTIC_URL,
    apiKey: process.env.ELASTIC_APM_API_KEY,
    transactionSampleRate: 1.0,
    environment: process.env.ENVIRONMENT || 'development',
    active: true,
    verifyServerCert: false,
    captureErrorLogStackTraces: 'always',
    ignoreUrls: ['/health', '/favicon.ico'],

    instrument: true,
});

const jiraServer = new JiraServer(server);

logger.info('Starting MCP server...');

await jiraServer.start();


