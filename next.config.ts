import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.kakaocdn.net",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
