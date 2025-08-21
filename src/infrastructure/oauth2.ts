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

export { oauthClient }
