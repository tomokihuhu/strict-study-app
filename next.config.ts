import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 💡 修正：「mysql2」をリストに追加！
  serverExternalPackages: ["typeorm", "better-sqlite3", "pg", "mysql2"],
};
export default nextConfig;