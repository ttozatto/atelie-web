import type { NextConfig } from 'next';
import { INTERNAL_BASE_URL } from './src/lib/api';

const nextConfig: NextConfig = {
  // Necessario para a imagem Docker multi-stage enxuta.
  output: 'standalone',

  // As imagens das obras vivem na API. Servindo /media pelo proprio Next, o next/image
  // trata o image_path como imagem local e o otimizador (que roda no servidor) busca o
  // arquivo pela rede interna do Docker. O navegador nunca precisa do host da API.
  async rewrites() {
    return [{ source: '/media/:path*', destination: `${INTERNAL_BASE_URL}/media/:path*` }];
  },
};

export default nextConfig;
