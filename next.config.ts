import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "myanimelist.net",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
