import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler: true,
  transpilePackages: ["@lireons/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
