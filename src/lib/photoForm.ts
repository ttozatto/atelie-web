import { parsePriceToCents } from './format';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Checagem local do arquivo antes do upload; a API valida de novo. */
export function validateImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Envie uma imagem jpg, png ou webp.';
  if (file.size > MAX_IMAGE_BYTES) return 'A imagem passa de 10 MB.';
  return null;
}

type BuildResult = { data: FormData } | { error: string };

/**
 * Converte os campos do formulario de obra no multipart que a API espera:
 * preco "180,00" vira price_cents, checkbox vira "true"/"false" e campos
 * opcionais vazios nao sao enviados.
 */
export function buildPhotoFormData(fields: FormData): BuildResult {
  const text = (name: string) => String(fields.get(name) ?? '').trim();

  const priceCents = parsePriceToCents(text('price'));
  if (priceCents === null) return { error: 'Preço inválido. Use o formato 180,00.' };

  const data = new FormData();
  data.set('title', text('title'));
  data.set('medium', text('medium'));
  data.set('sizes', text('sizes'));
  data.set('price_cents', String(priceCents));
  data.set('is_published', fields.get('is_published') === 'on' ? 'true' : 'false');
  if (text('description')) data.set('description', text('description'));
  if (text('category')) data.set('category', text('category'));

  const image = fields.get('image');
  if (image instanceof File && image.size > 0) {
    const imageError = validateImage(image);
    if (imageError) return { error: imageError };
    data.set('image', image);
  }

  return { data };
}
