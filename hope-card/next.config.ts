import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      'react-native': 'react-native-web',
    };
    return config;
  },
};

export default nextConfig;
