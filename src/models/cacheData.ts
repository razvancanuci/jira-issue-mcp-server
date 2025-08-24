
export type CacheData = {
    accessToken: string;
    userInfo: {
        accountId: string;
        email: string;
        displayName: string;
    },
    resources: {
        id: string;
        url: string;
    }
}