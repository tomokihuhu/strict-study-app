import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 💡 追加：「これらはバックエンド専用だから勝手にバンドル（圧縮）しないでね」という指示
  serverExternalPackages: ["typeorm", "better-sqlite3", "pg"],
};
export default nextConfig;
