const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
