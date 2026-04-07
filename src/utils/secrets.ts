import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const loadSecrets = async () => {
    const secret = process.env.AWS_SECRET;
    const client = new SecretsManagerClient({});

    console.log("Loading secrets from AWS Secrets Manager...");

    const response = await client.send(new GetSecretValueCommand({
        SecretId: secret!,
    }));

    const raw = response.SecretString;
    if (!raw) {
        throw new Error("Failed to load secrets: empty secret string");
    }

    const items = JSON.parse(raw);
    for (const key in items) {
        process.env[key] = items[key];
    }
};