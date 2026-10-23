import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/appointments",
        destination: "/contact#schedule-consultation",
        permanent: true
      },
      {
        source: "/linkedin",
        destination:
          "/contact?utm_source=linkedin&utm_medium=organic_social&utm_campaign=evergreen_profile&utm_content=linkedin_company_website#schedule-consultation",
        permanent: false
      }
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  }
};

export default nextConfig;
