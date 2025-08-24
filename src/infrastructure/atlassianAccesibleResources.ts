import {logger} from "./logger.js";

export async function getAtlassianAccessibleResources(accessToken: string) {
    try {
        const response = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Atlassian API error: ${response.status}`);
        }

        const resources = await response.json();

        return {
            resources: resources.map((resource: {id: string, url: string}) => ({id: resource.id, url: resource.url})),
        }

    } catch (error) {
        logger.error('Error fetching Atlassian accessible resources:', error);
        throw error;
    }
}