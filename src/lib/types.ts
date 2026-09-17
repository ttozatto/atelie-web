/** Tipos espelhando os schemas da atelie-api. */

export const PHOTO_CATEGORIES = ['retrato', 'paisagem', 'urbano', 'autoral'] as const;
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];

export const PHOTO_MEDIUMS = ['print', 'quadro'] as const;
export type PhotoMedium = (typeof PHOTO_MEDIUMS)[number];

export interface Photo {
  id: number;
  title: string;
  description: string | null;
  category: PhotoCategory | null;
  medium: PhotoMedium;
  sizes: string[];
  price_cents: number;
  image_path: string;
  is_published: boolean;
  created_at: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export function isPhotoCategory(value: string | undefined): value is PhotoCategory {
  return PHOTO_CATEGORIES.some((category) => category === value);
}
