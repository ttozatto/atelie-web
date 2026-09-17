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
