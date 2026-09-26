import { apiFetch } from './api';
import type { Page, Photo, PhotoCategory } from './types';

/** Quantas obras a galeria carrega por vez, no servidor e na rolagem. */
export const GALLERY_PAGE_SIZE = 6;

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

function adminHeaders(token: string): HeadersInit {
  return { 'X-Admin-Token': token };
}

/** POST /api/photos — multipart com a imagem e os metadados. */
export function createPhoto(data: FormData, token: string): Promise<Photo> {
  return apiFetch<Photo>('/api/photos', { method: 'POST', body: data, headers: adminHeaders(token) });
}

/** PUT /api/photos/{id} — metadados; imagem nova e opcional. */
export function updatePhoto(id: number, data: FormData, token: string): Promise<Photo> {
  return apiFetch<Photo>(`/api/photos/${id}`, {
    method: 'PUT',
    body: data,
    headers: adminHeaders(token),
  });
}

/** DELETE /api/photos/{id} — apaga o registro e o arquivo. */
export function deletePhoto(id: number, token: string): Promise<{ detail: string }> {
  return apiFetch<{ detail: string }>(`/api/photos/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(token),
  });
}
