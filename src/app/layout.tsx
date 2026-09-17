import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import './globals.css';

// next/font baixa as fontes no build e as serve do proprio Next: nenhuma requisicao
// externa sai do navegador do visitante.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Ateliê — fotografias em print e quadro', template: '%s — Ateliê' },
  description: 'Catálogo de fotografias autorais em print e quadro.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
