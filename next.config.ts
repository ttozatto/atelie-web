import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Necessario para a imagem Docker multi-stage enxuta.
  output: 'standalone',
};

export default nextConfig;
