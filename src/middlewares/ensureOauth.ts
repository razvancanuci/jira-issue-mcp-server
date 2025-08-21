import {oauthClient} from "../infrastructure/oauth2.js";


export async function ensureOAuth(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    let accessToken = oauthClient.createToken(token);
    if(!accessToken) {
        return res.redirect('/auth');
    }

    if(accessToken.expired()) {
        accessToken = await accessToken.refresh();
    }

    req.accesToken = accessToken;
    next();
}
