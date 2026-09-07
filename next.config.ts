import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.1.11","192.168.1.10", "localhost", "127.0.0.1"],
};

export default nextConfig;
