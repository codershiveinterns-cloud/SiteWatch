import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native SQLite driver must not be bundled by Turbopack/webpack.
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  // Ship the migrated + seeded database file with every server function.
  outputFileTracingIncludes: {
    "/**": ["./prisma/sitewatch.db", "./.session-secret"],
  },
};

export default nextConfig;
