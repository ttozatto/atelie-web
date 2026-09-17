import { apiFetch } from './api';
import type { Page, Photo, PhotoCategory } from './types';

export interface PhotoFilters {
  q?: string;
  category?: PhotoCategory;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}

/** GET /api/photos */
export function listPhotos(filters: PhotoFilters = {}): Promise<Page<Photo>> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.isPublished !== undefined) params.set('is_published', String(filters.isPublished));
  params.set('limit', String(filters.limit ?? 100));
  params.set('offset', String(filters.offset ?? 0));

  return apiFetch<Page<Photo>>(`/api/photos?${params.toString()}`);
}

/** GET /api/photos/{id} */
export function getPhoto(id: number): Promise<Photo> {
  return apiFetch<Photo>(`/api/photos/${id}`);
}
