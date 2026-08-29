import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo root (avoids Turbopack workspace-root inference warnings and
  // lets the server read ../../docs at runtime).
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
