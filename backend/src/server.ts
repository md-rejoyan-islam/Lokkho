import app from "./app";
import { env, assertProductionConfig } from "./config/env";
import { connectDB } from "./config/db";

async function start() {
  assertProductionConfig(); // refuse to boot prod with default/missing secrets
  await connectDB();
  app.listen(env.port, () => {
    console.log(`🚀 API running on http://localhost:${env.port}`);
  });
}

start();
