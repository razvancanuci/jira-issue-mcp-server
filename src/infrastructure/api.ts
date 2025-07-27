import axios from 'axios';

function getAuthHeader() {
    const token = process.env.JIRA_API_TKN;
    if (!token) {
        throw new Error('JIRA_API_TKN is not defined in environment variables');
    }

    const userEmail = process.env.JIRA_USER_EMAIL;
    if (!userEmail) {
        throw new Error('JIRA_USER_EMAIL is not defined in environment variables');
    }

    const base64Encoded = Buffer.from(`${userEmail}:${token}`, 'utf8').toString('base64');

    return `Basic ${base64Encoded}`;
}
const api = axios.create({
    baseURL: process.env.JIRA_DOMAIN,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `${getAuthHeader()}`,
    },
    validateStatus: () => true
});

export {api};