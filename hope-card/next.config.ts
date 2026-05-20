import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      'react-native': 'react-native-web',
    };
    return config;
  },
};

export default nextConfig;
