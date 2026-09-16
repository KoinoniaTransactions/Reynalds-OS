import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/appointments",
        destination: "/contact#schedule-consultation",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
