import {createIssueTool} from "./createIssue.js";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {getProjectsTool} from "./getProjects.js";
import {getAccessibleResourcesTool} from "./getAccessibleResources.js";

export function registerTools(server: McpServer) {
    createIssueTool(server);
    getProjectsTool(server);
    getAccessibleResourcesTool(server);
}