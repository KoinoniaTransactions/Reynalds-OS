import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@reynalds-os/design-system"
  ]
};

export default nextConfig;
