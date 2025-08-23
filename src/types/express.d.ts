import {AccessToken} from "simple-oauth2";

declare global {
    namespace Express {
        interface Request {
            accessToken: AccessToken;
        }
    }
}