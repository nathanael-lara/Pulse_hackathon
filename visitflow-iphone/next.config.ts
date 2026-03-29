import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ANTHROPIC_KEY: process.env.ANTHROPIC_API_KEY ?? '',
    NEXT_PUBLIC_OPENAI_KEY: process.env.OPENAI_API_KEY ?? '',
  },
};

export default nextConfig;
