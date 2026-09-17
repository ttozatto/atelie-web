import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6 px-5 py-6 sm:px-8">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Ateliê
        </Link>
        <nav aria-label="Principal" className="text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-ink">
            Galeria
          </Link>
        </nav>
      </div>
    </header>
  );
}
