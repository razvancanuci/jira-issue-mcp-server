import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {bugReportPrompt} from "./bugReport.js";

export function registerPrompts(server: McpServer) {
    bugReportPrompt(server);
}