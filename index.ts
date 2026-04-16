import startServer from "./src/app";
import mongoose from "mongoose";
import { loadSecrets } from '@app/utils/secrets';

const main = async () => {
  await loadSecrets();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
  const app = await startServer(port);
  await mongoose.connect(process.env.MONGODB_URI as string);

  app.on('listening', () => {
    console.log(`Server is listening on port ${port}`);
  });
};

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("close", () => {
  console.error("Closed MongoDB connection");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

main().catch(console.error);
