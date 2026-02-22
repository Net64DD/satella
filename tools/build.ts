import fs from "fs";

const template = fs.readFileSync("Dockerfile.template", "utf-8");
const lines = fs.readFileSync(".env", "utf-8").split("\n");
let output = `# Environment variables from .env file\n`;

for (const line of lines) {
  if (line.startsWith("#") || line.trim() === "") continue;
  // Split on the first "=" to allow values that contain "="
  const [key, ...rest] = line.split("=");
  const value = rest.join("=");
  output += `ENV ${key}=${value}\n`;
}

fs.writeFileSync(
  "Dockerfile",
  template.replace("${ENV_VARS}", output),
  "utf-8",
);
