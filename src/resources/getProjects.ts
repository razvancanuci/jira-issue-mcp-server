import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import { api } from "../infrastructure/api.js";
import {StatusCodes} from "../constants/statusCodes.js";
import {logger} from "../infrastructure/logger.js";

export function getProjectsResource(server: McpServer) {
    server.resource(
        'get_projects',
        'jira://projects',
        {
            title: 'All projects',
            description: 'Data related to the projects in Jira',
            mimeType: 'application/json',
        },
        async (uri) => {
            const response = await api.get('/rest/api/3/project/search');

            if (response.status !== StatusCodes.OK) {
                logger.error('Error fetching projects:', response.statusText, response.data);
                throw new Error(`Error fetching projects: ${response.statusText}`);
            }
            const data = response.data.values.map((val: any) => ({
                id: val.id,
                key: val.key,
                name: val.name,
            }))

            logger.info('Fetched projects:', data);

            return {
                contents: [{
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify(data),
                }]
            };
        }
    );
}