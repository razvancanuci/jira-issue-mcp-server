import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import {getUpdatedCachedData} from "../utils/cacheData.js";


export function getAccessibleResourcesTool(server: McpServer) {
    server.tool('get_accessible_resources',
        'Fetches a list of resources the user has access to.',
        {
            userEmail: z.string().email().describe("The email of the user accessing the resources.")
        },
        async ({ userEmail }) => {
            const cacheData = await getUpdatedCachedData(userEmail);

            if(!cacheData) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `Please try again after authorizing the app to access your Jira data.`,
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(cacheData.resources),
                    },
                ],
            }
        });
}