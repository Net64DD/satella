import fs from 'fs';

const template = fs.readFileSync('Dockerfile.template', 'utf-8');
const lines = fs.readFileSync('.env', 'utf-8').split('\n');

fs.writeFileSync('Dockerfile', template, 'utf-8');
fs.appendFileSync('Dockerfile', '\n\n# Environment variables from .env file\n', 'utf-8');

for (const line of lines) {
    if(line.startsWith('#') || line.trim() === '') continue; // Skip comments and empty lines
    const [key, value] = line.split('=');
    fs.appendFileSync('Dockerfile', `ENV ${key}=${value}\n`, 'utf-8');
}