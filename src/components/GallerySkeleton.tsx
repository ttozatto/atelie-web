import { GALLERY_PAGE_SIZE } from '@/lib/photos';
import { PhotoCardSkeleton } from './PhotoCardSkeleton';

/** Estado de carregamento da grade inteira, usado na primeira busca. */
export function GallerySkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando obras…</span>
      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: GALLERY_PAGE_SIZE }, (_, index) => (
          <PhotoCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
