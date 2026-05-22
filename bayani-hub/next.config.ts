import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for ENDUSERWEB's react-native-web dependency.
  // Using turbopack resolveAlias instead of webpack (Next.js 16+)
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
    },
    resolveExtensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ],
  },
  transpilePackages: ['react-native-web'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
