import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {bugReportPrompt} from "./bugReport.js";
import {epicReportPrompt} from "./epicReport.js";

export function registerPrompts(server: McpServer) {
    bugReportPrompt(server);
    epicReportPrompt(server);
}