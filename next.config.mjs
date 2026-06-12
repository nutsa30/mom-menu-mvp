const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.mommenu.ge' }],
        destination: 'https://mommenu.ge/:path*',
        permanent: true,
      },
    ];
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
