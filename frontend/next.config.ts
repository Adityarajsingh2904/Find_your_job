import type { NextConfig } from "next";

const nextConfig = {
  experimental:{
      staleTimes:{
          dynamic:0,
      },
  },
  eslint:{
    ignoreDuringBuilds:true,
  }
};

export default nextConfig;
