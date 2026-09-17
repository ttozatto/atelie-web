import type { Metadata } from 'next';
import { AdminPanel } from '@/components/AdminPanel';

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <AdminPanel />
    </main>
  );
}
