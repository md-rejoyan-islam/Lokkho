import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server build for small Docker images (run via bun .next/standalone/server.js).
  output: "standalone",
  // Root file-tracing at this app so standalone output is `.next/standalone/server.js`
  // (without this, the monorepo parent is detected and the output nests under /frontend).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
