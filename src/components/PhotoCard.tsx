import Image from 'next/image';
import Link from 'next/link';
import { CATEGORY_LABELS, MEDIUM_LABELS, formatPrice } from '@/lib/format';
import type { Photo } from '@/lib/types';

interface PhotoCardProps {
  photo: Photo;
  priority?: boolean;
}

export function PhotoCard({ photo, priority = false }: PhotoCardProps) {
  const details = [photo.category ? CATEGORY_LABELS[photo.category] : null, MEDIUM_LABELS[photo.medium]]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={`/obra/${photo.id}`} className="group block">
      {/* Passe-partout: a foto nunca e cortada, a moldura se adapta a ela. */}
      <div className="aspect-[4/5] bg-frame p-6 transition-colors group-hover:bg-line sm:p-8">
        <div className="relative h-full w-full">
          <Image
            src={photo.image_path}
            alt={photo.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-contain"
          />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-serif text-xl leading-tight">{photo.title}</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{details}</p>
        </div>
        <p className="shrink-0 text-sm tabular-nums text-muted">{formatPrice(photo.price_cents)}</p>
      </div>
    </Link>
  );
}
