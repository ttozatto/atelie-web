'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/errors';
import { GALLERY_PAGE_SIZE, listPhotos } from '@/lib/photos';
import type { Photo, PhotoCategory } from '@/lib/types';
import { PhotoCard } from './PhotoCard';
import { PhotoCardSkeleton } from './PhotoCardSkeleton';

/**
 * Distância do fim da lista em que a próxima página começa a ser buscada. Perto o
 * bastante para as molduras de carregamento aparecerem na tela de quem está rolando.
 */
const PREFETCH_MARGIN = '200px';

interface PhotoGalleryProps {
  /** Primeira página, já renderizada no servidor. */
  initialPhotos: Photo[];
  total: number;
  q: string;
  category?: PhotoCategory;
}

/**
 * Grade com rolagem infinita.
 *
 * A primeira página vem do servidor (bom para a primeira pintura e para quem não tem
 * JavaScript); as seguintes são buscadas pelo navegador, `GALLERY_PAGE_SIZE` por vez,
 * quando a sentinela no fim da lista entra em cena.
 */
export function PhotoGallery({ initialPhotos, total, q, category }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Evita disparar duas buscas ao mesmo tempo numa rolagem rápida.
  const loadingRef = useRef(false);

  const remaining = total - photos.length;
  const hasMore = remaining > 0;

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const page = await listPhotos({
        q: q || undefined,
        category,
        isPublished: true,
        limit: GALLERY_PAGE_SIZE,
        offset: photos.length,
      });
      // Descarta repetidos, caso o catálogo mude entre uma página e outra.
      setPhotos((current) => {
        const vistos = new Set(current.map((photo) => photo.id));
        return [...current, ...page.items.filter((photo) => !vistos.has(photo.id))];
      });
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [category, photos.length, q]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    // Sem mais obras, com erro na tela ou sem suporte ao observador: nada a observar.
    if (!sentinel || !hasMore || error || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: PREFETCH_MARGIN },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loadMore]);

  return (
    <>
      <ul
        aria-busy={loading}
        className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
      >
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <PhotoCard photo={photo} priority={index < 3} />
          </li>
        ))}

        {/* Enquanto a próxima página vem, as molduras dela já ocupam o lugar na grade:
            o sinal de carregamento aparece onde a pessoa está olhando. */}
        {loading
          ? Array.from({ length: Math.min(GALLERY_PAGE_SIZE, remaining) }, (_, index) => (
              <li key={`carregando-${index}`} aria-hidden="true">
                <PhotoCardSkeleton />
              </li>
            ))
          : null}
      </ul>

      {/* Indicador presa à janela: as molduras acima podem estar fora da área visível
          quando a rolagem dispara a busca, e este aviso aparece de qualquer jeito. */}
      {loading ? (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center px-5"
        >
          <span className="flex items-center gap-3 border border-line bg-paper/95 px-5 py-2.5 text-sm shadow-sm">
            <span className="size-3.5 animate-spin rounded-full border-2 border-line border-t-ink" />
            Carregando mais obras…
          </span>
        </div>
      ) : null}

      <div className="mt-14 flex flex-col items-center gap-4 text-sm text-muted">
        <p aria-live="polite">
          {loading
            ? 'Carregando mais obras…'
            : hasMore
              ? `${photos.length} de ${total} obras`
              : photos.length > GALLERY_PAGE_SIZE
                ? 'Você chegou ao fim do catálogo.'
                : null}
        </p>

        {error ? (
          <>
            <p role="alert" className="text-danger">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadMore()}
              className="border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Tentar de novo
            </button>
          </>
        ) : null}

        {/* Sentinela: entrar em cena é o que dispara a próxima página. */}
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>
    </>
  );
}
