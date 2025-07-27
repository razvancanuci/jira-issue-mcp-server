import {createTaskTool} from "./createTask.js";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {getIssueTool} from "./getIssue.js";
import {getProjectsTool} from "./getProjects.js";

export function registerTools(server: McpServer) {
    createTaskTool(server);
    getIssueTool(server);
    getProjectsTool(server);
}