import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
let basePath = "";
let assetPrefix = "";

if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
  const hasCname = fs.existsSync(path.join(process.cwd(), "public", "CNAME"));
  if (repo && !hasCname && !repo.endsWith(".github.io")) {
    basePath = `/${repo}`;
    assetPrefix = `/${repo}/`;
  }
}

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: assetPrefix || undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  allowedDevOrigins: ["192.168.1.11", "192.168.1.10", "localhost", "127.0.0.1"],
};

export default nextConfig;
