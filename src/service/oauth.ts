import { DiscordGuild, OAuthToken, OAuthUser } from '../types/discord';

class DiscordOAuthService {

    getURL() {
        return `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID!}&response_type=code&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI!)}&scope=${process.env.DISCORD_SCOPE}`;
    }

    async getAccessToken(code: string): Promise<OAuthToken> {
        const raw = await (await fetch(`${process.env.DISCORD_API_URL}/oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.DISCORD_REDIRECT_URI!,
                scope: 'identify guilds',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })).json();

        return raw as OAuthToken;
    }

    async getUser(oauth: OAuthToken): Promise<OAuthUser> {
        const raw = await (await fetch(`${process.env.DISCORD_API_URL}/users/@me`, {
            headers: {
                authorization: `${oauth.token_type} ${oauth.access_token}`,
            },
        })).json();

        return raw as OAuthUser;
    }

    async getGuilds(oauth: OAuthToken): Promise<DiscordGuild[]> {
        const raw = await (await fetch(`${process.env.DISCORD_API_URL}/users/@me/guilds`, {
            headers: {
                authorization: `${oauth.token_type} ${oauth.access_token}`,
            },
        })).json();

        return raw as DiscordGuild[];
    }
}

export default new DiscordOAuthService();