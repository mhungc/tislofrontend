/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Habilitar source maps para debugging
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = isServer ? 'eval-source-map' : 'cheap-module-source-map'
    }
    return config
  }
}

module.exports = nextConfig