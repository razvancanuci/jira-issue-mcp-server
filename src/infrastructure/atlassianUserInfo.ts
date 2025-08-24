import {logger} from "./logger.js";

export async function getAtlassianUserInfo(accessToken: string) {
    try {
        const response = await fetch('https://api.atlassian.com/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Atlassian API error: ${response.status}`);
        }

        const userInfo = await response.json();

        return {
            accountId: userInfo.account_id,
            email: userInfo.email,
            displayName: userInfo.name,
        };

    } catch (error) {
        logger.error('Error fetching Atlassian user info:', error);
        throw error;
    }
}