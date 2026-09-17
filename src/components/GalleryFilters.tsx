import Link from 'next/link';
import { CATEGORY_LABELS } from '@/lib/format';
import { PHOTO_CATEGORIES, type PhotoCategory } from '@/lib/types';

interface GalleryFiltersProps {
  q: string;
  category?: PhotoCategory;
}

function galleryHref(q: string, category?: PhotoCategory): string {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  const query = params.toString();
  return query ? `/?${query}` : '/';
}

/**
 * Busca e filtro por categoria sem JavaScript no cliente: o formulario faz GET na
 * propria galeria e os filtros sao links. A URL guarda o estado, entao da para
 * compartilhar uma busca.
 */
export function GalleryFilters({ q, category }: GalleryFiltersProps) {
  const options: { value?: PhotoCategory; label: string }[] = [
    { label: 'Todas' },
    ...PHOTO_CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] })),
  ];

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <nav aria-label="Categorias" className="-mx-1 flex flex-wrap gap-x-1 gap-y-2">
        {options.map((option) => {
          const active = option.value === category;
          return (
            <Link
              key={option.label}
              href={galleryHref(q, option.value)}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                active ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      <form action="/" method="get" role="search" className="flex w-full gap-2 md:w-80">
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <label htmlFor="gallery-search" className="sr-only">
          Buscar obras
        </label>
        <input
          id="gallery-search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por título ou descrição"
          className="min-w-0 flex-1 border-b border-line bg-transparent py-2 text-sm outline-none placeholder:text-muted focus:border-ink"
        />
        <button
          type="submit"
          className="px-2 text-sm text-muted transition-colors hover:text-ink focus-visible:text-ink"
        >
          Buscar
        </button>
      </form>
    </div>
  );
}
