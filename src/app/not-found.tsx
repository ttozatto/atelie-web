import Link from 'next/link';
import { StateMessage } from '@/components/StateMessage';

export default function NotFound() {
  return (
    <main className="px-5 sm:px-8">
      <StateMessage title="Obra não encontrada">
        <p>Ela pode ter sido removida ou ainda não foi publicada.</p>
        <Link href="/" className="mt-6 inline-block text-ink underline underline-offset-4">
          Voltar à galeria
        </Link>
      </StateMessage>
    </main>
  );
}
