import { fileURLToPath } from 'node:url';
const nextConfig = {
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: [
    '@blocknote/core',
    '@blocknote/react',
    '@blocknote/ariakit',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ]
  }
};
export default nextConfig;
