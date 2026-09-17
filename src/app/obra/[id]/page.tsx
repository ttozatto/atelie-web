import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ApiError } from '@/lib/api';
import { CATEGORY_LABELS, MEDIUM_LABELS, formatPrice } from '@/lib/format';
import { getPhoto } from '@/lib/photos';
import type { Photo } from '@/lib/types';

interface PhotoPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Busca a obra publicada ou devolve null (id invalido, inexistente ou nao publicada).
 * O cache do React evita buscar duas vezes entre generateMetadata e a pagina.
 */
const loadPublishedPhoto = cache(async (rawId: string): Promise<Photo | null> => {
  if (!/^\d+$/.test(rawId)) return null;
  try {
    const photo = await getPhoto(Number(rawId));
    return photo.is_published ? photo : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const { id } = await params;
  const photo = await loadPublishedPhoto(id);
  return { title: photo?.title ?? 'Obra não encontrada' };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;
  const photo = await loadPublishedPhoto(id);
  if (!photo) notFound();

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
      <Link href="/" className="text-sm text-muted transition-colors hover:text-ink">
        ← Voltar à galeria
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
        <div className="bg-frame p-5 sm:p-10">
          <div className="relative aspect-[4/5] w-full sm:aspect-[4/3] lg:aspect-auto lg:h-[78vh]">
            <Image
              src={photo.image_path}
              alt={photo.title}
              fill
              priority
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-contain"
            />
          </div>
        </div>

        <article className="lg:sticky lg:top-12 lg:self-start">
          {photo.category ? (
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {CATEGORY_LABELS[photo.category]}
            </p>
          ) : null}
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {photo.title}
          </h1>
          <p className="mt-6 text-2xl tabular-nums">{formatPrice(photo.price_cents)}</p>

          {photo.description ? (
            <p className="mt-8 leading-relaxed text-muted">{photo.description}</p>
          ) : null}

          <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
            <div className="flex items-baseline justify-between gap-6 py-4">
              <dt className="text-muted">Suporte</dt>
              <dd>{MEDIUM_LABELS[photo.medium]}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-4">
              <dt className="text-muted">Formatos</dt>
              <dd>
                {photo.sizes.length > 0 ? (
                  <ul className="flex flex-wrap justify-end gap-2">
                    {photo.sizes.map((size) => (
                      <li key={size} className="border border-line px-2.5 py-1 tabular-nums">
                        {size}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">Sob consulta</span>
                )}
              </dd>
            </div>
          </dl>

          <Link
            href="/cadastro"
            className="mt-10 inline-block bg-ink px-8 py-3 text-sm text-paper transition-opacity hover:opacity-85"
          >
            Tenho interesse
          </Link>
        </article>
      </div>
    </main>
  );
}
