import type { PhotoCategory, PhotoMedium } from './types';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 18000 -> "R$ 180,00" */
export function formatPrice(priceCents: number): string {
  return BRL.format(priceCents / 100);
}

export const CATEGORY_LABELS: Record<PhotoCategory, string> = {
  retrato: 'Retrato',
  paisagem: 'Paisagem',
  urbano: 'Urbano',
  autoral: 'Autoral',
};

export const MEDIUM_LABELS: Record<PhotoMedium, string> = {
  print: 'Print',
  quadro: 'Quadro',
};

/** "180,00" | "180" | "R$ 180,5" -> 18050 ; formato invalido -> null */
export function parsePriceToCents(raw: string): number | null {
  const normalized = raw.trim().replace(/^R\$\s*/, '');
  if (!/^\d+(,\d{1,2})?$/.test(normalized)) return null;
  const [reais, cents = ''] = normalized.split(',');
  return Number(reais) * 100 + Number(cents.padEnd(2, '0'));
}

/** 18050 -> "180,50", para preencher o campo de preco na edicao. */
export function centsToPriceInput(priceCents: number): string {
  const reais = Math.floor(priceCents / 100);
  const cents = String(priceCents % 100).padStart(2, '0');
  return `${reais},${cents}`;
}
