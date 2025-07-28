import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {getProjectsResource} from "./getProjects.js";

export function registerResources(server: McpServer) {
    getProjectsResource(server);
}