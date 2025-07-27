type OAuthToken = {
    access_token:  string;
    expires_in:    number;
    refresh_token: string;
    scope:         string;
    token_type:    string;
};

type OAuthUser = {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    verified: boolean;
    email: string;
    flags: number;
    banner: string;
    accent_color: string;
    premium_type: number;
    public_flags: number;
};

type DiscordGuild = {
    id: string;
    name: string;
    icon: string;
};

type AuthToken = {
    access_token:  string;
    refresh_token: string;
    expires_in:    number;
};

export { AuthToken, OAuthToken, OAuthUser, DiscordGuild };