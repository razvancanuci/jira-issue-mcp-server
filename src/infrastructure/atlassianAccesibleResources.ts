import {logger} from "./logger.js";
import {getApiInstance} from "./api.js";

export async function getAtlassianAccessibleResources(accessToken: string) {

        const api = getApiInstance('https://api.atlassian.com');
        const response = await api.get('/oauth/token/accessible-resources', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        }).catch((error) => {
            logger.error('Error fetching Atlassian accessible resources:', error);
            throw error;
        });

        const resources = response.data;

        return {
            resources: resources.map((resource: {id: string, url: string}) => ({id: resource.id, url: resource.url})),
        }
}