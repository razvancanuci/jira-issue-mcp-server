import {createIssueTool} from "./createIssue.js";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerTools(server: McpServer) {
    createIssueTool(server);
}