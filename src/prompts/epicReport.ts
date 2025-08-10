import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {logger} from "../infrastructure/logger.js";

export function epicReportPrompt(server:McpServer) {
    server.registerPrompt(
        "epicReportPrompt",
        {
            title: `JIRA Epic Report Prompt`,
            description: 'In case of an EPIC Issue, please provide all the details that can help in creating an epic report.',
        },
        () => {

            const prompt = `In case of an EPIC issue, please provide a detailed description of the epic, including the goals, objectives, and any relevant information that can help in understanding the epic.
            \nYou can also include any specific requirements or constraints that should be considered when creating the epic report.`;

            logger.info('epicReportPrompt has been called');

            return {
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: prompt
                    }
                }]
            }
        }
    )
}