'use client';

import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { StateMessage } from '@/components/StateMessage';

interface ErrorPageProps {
  reset: () => void;
}

/** Estado de erro das telas que buscam dados no servidor (ex.: API fora do ar). */
export default function ErrorPage({ reset }: ErrorPageProps) {
  const router = useRouter();

  function retry() {
    // refresh busca de novo os dados do servidor; reset limpa o estado de erro.
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <main className="px-5 sm:px-8">
      <StateMessage title="Não foi possível carregar" tone="danger">
        <p>O catálogo não respondeu. Tente de novo em alguns instantes.</p>
        <button
          type="button"
          onClick={retry}
          className="mt-6 border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Tentar de novo
        </button>
      </StateMessage>
    </main>
  );
}
