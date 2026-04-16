import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const retrievePublicKeys = async (): Promise<Map<string, string>> => {
    const client = new SecretsManagerClient({});

    const response = await client.send(new GetSecretValueCommand({
        SecretId: process.env.AWS_PUB_KEYS!,
    }));

    const raw = response.SecretString;
    if (!raw) {
        throw new Error("Failed to load secrets: empty secret string");
    }

    const items = JSON.parse(raw);
    const keys = new Map<string, string>();
    for (const key in items) {
        keys.set(key, items[key]);
    }
    return keys;
};