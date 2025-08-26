import {AuthorizationCode} from 'simple-oauth2';


const config = {
    client: {
        id: process.env.JIRA_CLIENT_ID as string,
        secret: process.env.JIRA_CLIENT_SECRET as string,
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
        redirect_uri: `${process.env.SERVER_DOMAIN}/oauth/callback`,
        scope: 'read:jira-user read:jira-work write:jira-work read:me',
        state: 'random_state_string'
    });
}

export { oauthClient }
