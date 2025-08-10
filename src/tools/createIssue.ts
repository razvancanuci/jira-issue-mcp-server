import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import {api} from "../infrastructure/api.js";
import {ADFDocumentSchema} from "../models/index.js";
import {StatusCodes} from "../constants/statusCodes.js";
import {logger} from "../infrastructure/logger.js";

export function createIssueTool(server: McpServer) {
    server.tool(
        'createIssue',
        'Creates an issue to the users',
        {
            summary: z.string().describe("The title of the issue to be created."),
            description: ADFDocumentSchema.describe("The description of the issue to be created, formatted as an Atlassian Document Format (ADF)."),
            projectKey: z.string().describe("The ID or key of the project where the issue will be created."),
            type: z.enum(['Task', 'Bug', 'Epic', 'Story']).optional().describe("The type of the issue to be created. If not provided, it will default to 'Task'."),
            priority: z.enum(['Low', 'Medium', 'High']).optional().describe("The priority of the issue to be created. If not provided, it will default to 'Medium'."),
        },
        async ({summary, description, projectKey, type, priority}) => {
            try {
                return await handleCreateIssueTool({summary, description, projectKey, type, priority});
            }
            catch(err) {
                logger.error('Error creating issue:', err);
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `Error creating issue: ${err instanceof Error ? err.message : 'Unknown error'}`,
                        },
                    ],
                };
            }
        }
    );
}

async function handleCreateIssueTool({summary, description, projectKey, type, priority} : {
    summary: string,
    description: {
        type: "doc"
        version: 1
        content?: any[] | undefined
    },
    projectKey: string,
    type?: 'Task' | 'Bug' | 'Epic' | 'Story',
    priority?: 'Low' | 'Medium' | 'High'}) : Promise<any> {

    const response = await api.post(`rest/api/3/issue`, {
        fields: {
            project: {
                key: projectKey,
            },
            summary,
            description,
            issuetype: {
                name: type || 'Task'
            },
            priority: {
                name: priority || 'Medium'
            },
        }
    });

    if (response.status !== StatusCodes.CREATED) {
        logger.error('Creating issue failed:', {status: response.statusText, data: response.data});
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Error creating issue: ${response.statusText}`,
                },
            ],
        };
    }

    logger.info('Issue created successfully:', {summary, description, projectKey, type, priority});
    return {
        content: [
            {
                type: "text",
                text: "Issue added successfully!",
            },
        ],
    };
}