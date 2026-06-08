import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/lokkho",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
    // Separate secret for email verification / password-reset tokens so they
    // can NEVER be replayed as API access tokens (different signing key).
    emailSecret: process.env.JWT_EMAIL_SECRET || "dev_email_secret",
    accessExpires: process.env.ACCESS_TOKEN_EXPIRES || "15m",
    refreshExpires: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  },
  get isProd() {
    return this.nodeEnv === "production";
  },
};

// Fail fast in production if critical secrets are missing or left at their
// insecure dev defaults — never silently ship forgeable tokens.
export function assertProductionConfig(): void {
  if (!env.isProd) return;
  const insecure: string[] = [];
  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET === "dev_access_secret")
    insecure.push("JWT_ACCESS_SECRET");
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === "dev_refresh_secret")
    insecure.push("JWT_REFRESH_SECRET");
  if (!process.env.JWT_EMAIL_SECRET || process.env.JWT_EMAIL_SECRET === "dev_email_secret")
    insecure.push("JWT_EMAIL_SECRET");
  if (!process.env.MONGODB_URI) insecure.push("MONGODB_URI");

  if (insecure.length) {
    throw new Error(
      `Refusing to start in production: set strong, non-default values for ${insecure.join(", ")}.`
    );
  }
}
