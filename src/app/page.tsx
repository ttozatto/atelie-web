import { Suspense } from 'react';
import { GalleryFilters } from '@/components/GalleryFilters';
import { GallerySkeleton } from '@/components/GallerySkeleton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { StateMessage } from '@/components/StateMessage';
import { CATEGORY_LABELS } from '@/lib/format';
import { GALLERY_PAGE_SIZE, listPhotos } from '@/lib/photos';
import { isPhotoCategory, type PhotoCategory } from '@/lib/types';

interface GalleryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const rawCategory = typeof params.category === 'string' ? params.category : undefined;
  const category = isPhotoCategory(rawCategory) ? rawCategory : undefined;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <section className="py-16 sm:py-24">
        <h1 className="max-w-2xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl">
          Fotografias em print e quadro
        </h1>
        <p className="mt-5 max-w-lg leading-relaxed text-muted">
          Uma seleção de obras autorais. Formatos, suporte e preço de cada imagem estão na
          página da obra.
        </p>
      </section>

      <GalleryFilters q={q} category={category} />

      <div className="mt-12">
        {/* A key reinicia o Suspense a cada busca, mostrando o carregamento de novo. */}
        <Suspense key={`${q}|${category ?? ''}`} fallback={<GallerySkeleton />}>
          <GalleryResults q={q} category={category} />
        </Suspense>
      </div>
    </main>
  );
}

async function GalleryResults({ q, category }: { q: string; category?: PhotoCategory }) {
  // Só a primeira página vem do servidor; o resto a galeria busca conforme a rolagem.
  const page = await listPhotos({
    q: q || undefined,
    category,
    isPublished: true,
    limit: GALLERY_PAGE_SIZE,
  });

  if (page.items.length === 0) {
    const filtered = Boolean(q || category);
    return (
      <StateMessage title={filtered ? 'Nenhuma obra encontrada' : 'O catálogo ainda está vazio'}>
        {filtered
          ? 'Tente outra busca ou volte para todas as categorias.'
          : 'As obras aparecem aqui assim que forem publicadas.'}
      </StateMessage>
    );
  }

  const summary = [
    `${page.total} ${page.total === 1 ? 'obra' : 'obras'}`,
    category ? `em ${CATEGORY_LABELS[category]}` : null,
    q ? `para “${q}”` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <p className="mb-8 text-sm text-muted" aria-live="polite">
        {summary}
      </p>
      <PhotoGallery
        initialPhotos={page.items}
        total={page.total}
        q={q}
        category={category}
      />
    </>
  );
}
