import { exec } from "child_process";
import pkg from "../package.json" with { type: "json" };

// Config
const IMAGE_TAG = `v${pkg.version}`;
const REPO_NAME = `lywx/${pkg.name}`;
const FULL_IMAGE = `${REPO_NAME}:${IMAGE_TAG}`;

/**
 * Helper to run commands and stream output to your terminal in real-time
 */
async function run(command) {
  console.log(`\x1b[36mrunning:\x1b[0m ${command}`); // Cyan color for the command
  
  return new Promise((resolve, reject) => {
    const process = exec(command);

    // Stream stdout/stderr to your terminal
    process.stdout?.on("data", (data) => Buffer.from(data).toString().split('\n').forEach(line => line && console.log(`  ${line}`)));
    process.stderr?.on("data", (data) => Buffer.from(data).toString().split('\n').forEach(line => line && console.error(`  \x1b[31m${line}\x1b[0m`)));

    process.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function deploy() {
  try {
    console.log(`\n🚀 Starting deployment for version: ${IMAGE_TAG}...\n`);

    // 1. Docker Build
    await run(`docker build --platform linux/amd64 -t ${FULL_IMAGE} -t ${REPO_NAME}:latest .`);

    // 2. Docker Push
    await run(`docker push ${FULL_IMAGE}`);
    await run(`docker push ${REPO_NAME}:latest`);

    // 3. Validate manifest (Optional but recommended)
    await run(`docker manifest inspect ${FULL_IMAGE}`);
    console.log("\n✅ Deployment successful!");
  } catch (err) {
    console.error("\n❌ Deployment failed!");
    console.error(err.message);
    process.exit(1);
  }
}

deploy();