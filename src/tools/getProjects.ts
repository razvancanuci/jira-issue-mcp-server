import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import {getApiInstance} from "../infrastructure/api.js";
import {StatusCodes} from "../constants/statusCodes.js";
import {logger} from "../infrastructure/logger.js";
import {getUpdatedCachedData} from "../utils/cacheData.js";

export function getProjectsTool(server: McpServer) {
    server.tool(
        'get_projects',
        'Get the projects the user has access to',
        {
            userEmail: z.string().email().describe("The email of the user accessing the projects."),
            resourceId: z.string().describe("The id of the resource being used to call to get the projects."),
        },
        async ({userEmail, resourceId}) => {

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

            const api = getApiInstance(`https://api.atlassian.com/ex/jira/${resourceId}`);

            const response = await api.get('/rest/api/3/project/search', { headers: {
                    'Authorization': `Bearer ${cacheData.accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }});

            if (response.status !== StatusCodes.OK) {
                logger.error('Error fetching projects:', response.statusText, response.data, userEmail);
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `Error getting projects: ${response.statusText}`,
                        },
                    ],
                };
            }

            const data = response.data.values.map((val: any) => ({
                id: val.id,
                key: val.key,
                name: val.name,
            }))

            logger.info('Fetched projects:', data);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data),
                    },
                ],
            };
        }
    );
}
