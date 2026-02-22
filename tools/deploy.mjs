import { exec } from "child_process";
import pkg from "../package.json" with { type: "json" };

// Config
const IMAGE_TAG = `v${pkg.version}`;
const REPO_NAME = `lywx/${pkg.name}`;
const FULL_IMAGE = `${REPO_NAME}:${IMAGE_TAG}`;
const CONTAINER_NAME = `${pkg.name}-container`;

/**
 * Helper to run commands and stream output to your terminal in real-time
 */
async function run(command) {
  console.log(`\x1b[36mrunning:\x1b[0m ${command}`); // Cyan color for the command

  return new Promise((resolve, reject) => {
    const process = exec(command);

    // Stream stdout/stderr to your terminal
    process.stdout?.on("data", (data) =>
      Buffer.from(data)
        .toString()
        .split("\n")
        .forEach((line) => line && console.log(`  ${line}`)),
    );
    process.stderr?.on("data", (data) =>
      Buffer.from(data)
        .toString()
        .split("\n")
        .forEach((line) => line && console.error(`  \x1b[31m${line}\x1b[0m`)),
    );

    process.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function deploy() {
  try {
    console.log(`\n🚀 Starting deployment for version: ${IMAGE_TAG}...\n`);

    // 1. Stop and Remove old container (ignore errors if it doesn't exist)
    console.log("Cleaning up old containers...");
    try {
      await run(`docker stop ${CONTAINER_NAME} && docker rm ${CONTAINER_NAME}`);
    } catch (e) {
      // It's okay if this fails (e.g., container doesn't exist yet)
      console.log("No existing container to clean up.");
    }

    // 2. Docker Build
    console.log("Building new image...");
    await run(
      `docker build --platform linux/arm64 -t ${FULL_IMAGE} -t ${REPO_NAME}:latest .`,
    );

    // 3. Docker Run (The "Redeploy" step)
    console.log("Starting new container...");
    await run(
      `docker run -d --name ${CONTAINER_NAME} -p 8080:8080 --restart always ${REPO_NAME}:latest`,
    );

    console.log("\n✅ Deployment successful and container is running!");
  } catch (err) {
    console.error("\n❌ Deployment failed!");
    console.error(err.message);
    process.exit(1);
  }
}

deploy();
