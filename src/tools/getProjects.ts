import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {api} from "../infrastructure/api.js";


export function getProjectsTool(server: McpServer) {
    server.tool(
        'getProjects',
        'Get a list of projects from Jira',
        {},
        async () => {
            const response = await api.get('/rest/api/3/project');

            if (response.status !== 200) {
                console.error({status: response.statusText, data: response.data});
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `Error fetching projects: ${response.statusText}`,
                        },
                    ],
                };
            }

            const projects = response.data;
            return {
                content: [
                    {
                        type: "text",
                        text: `Fetched ${projects.length} projects successfully.`,
                    }
                ]
            }
        }
    );
}