import {logger} from "./logger.js";
import {getApiInstance} from "./api.js";

export async function getAtlassianUserInfo(accessToken: string) {

        const api = getApiInstance('https://api.atlassian.com');

        const response = await api.get('/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        }).catch((error) => {
            logger.error('Error fetching Atlassian user info:', error);
            throw error;
        });

        const userInfo =  response.data;

        return {
            accountId: userInfo.account_id,
            email: userInfo.email,
            displayName: userInfo.name,
        };
}