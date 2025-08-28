import {AuthorizationCode} from 'simple-oauth2';
import {SERVER_DNS} from "./express.js";


const config = {
    client: {
        id: process.env.ATLASSIAN_CLIENT_ID as string,
        secret: process.env.ATLASSIAN_CLIENT_SECRET as string,
    },
    auth: {
        tokenHost: 'https://auth.atlassian.com',
        authorizePath: '/authorize',
        tokenPath: '/oauth/token'
    }
}

const oauthClient = new AuthorizationCode(config);

export function getAuthorizationUri() {
    return oauthClient.authorizeURL({
        redirect_uri: `${SERVER_DNS}/oauth/callback`,
        scope: 'read:jira-user read:jira-work write:jira-work read:me',
        state: 'random_state_string'
    });
}

export { oauthClient }
