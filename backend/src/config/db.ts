import mongoose from "mongoose";
import dns from "node:dns";
import { env } from "./env";

function configureDnsForSrv(uri: string): void {
  if (!uri.startsWith("mongodb+srv://")) return;

  const isBun =
    typeof (globalThis as any).Bun !== "undefined" ||
    Boolean((process.versions as any).bun);

  let servers: string[] | null = null;
  if (process.env.DNS_SERVERS !== undefined) {
    servers = process.env.DNS_SERVERS.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (isBun) {
    servers = ["8.8.8.8", "1.1.1.1"];
  }

  if (servers && servers.length) {
    try {
      dns.setServers(servers);
    } catch {
      /* ignore — fall back to system DNS */
    }
  }
}

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  configureDnsForSrv(env.mongoUri);
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(
      `✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`,
    );
  } catch (err) {
    const message = (err as Error).message;
    console.error("❌ MongoDB connection error:", message);
    if (/querySrv|ECONNREFUSED|ENOTFOUND|ETIMEOUT/.test(message)) {
      console.error(
        "   ↳ DNS/SRV lookup failed. Try setting DNS_SERVERS=8.8.8.8,1.1.1.1 in .env,\n" +
          "     or use a non-SRV mongodb:// connection string, or check Atlas IP allowlist.",
      );
    }
    process.exit(1);
  }
}
