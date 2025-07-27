import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import {api} from "../infrastructure/api.js";

export function getIssueTool(server: McpServer) {
    server.tool(
        'getIssue',
        'Get an issue from Jira by its ID or key and return its details',
        {
            issueIdOrKey: z.string().describe("The ID or the key of the issue that will be retrieved."),
        },
        async ({issueIdOrKey}) => {
            const response = await api.get(`/rest/api/3/issue/${issueIdOrKey}`);

            if (response.status != 200) {
                console.error({status: response.statusText, data: response.data});
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: response.statusText,
                        },
                    ],
                };
            }
            const data = response.data;
            return {
                content: [
                    data
                ],
            };
        }
    );
}