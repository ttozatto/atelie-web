import { ApiError } from './api';

/**
 * Traduz uma falha de chamada a API numa mensagem para a tela.
 * `byStatus` permite que cada tela diga o que um status significa para ela.
 */
export function errorMessage(
  error: unknown,
  byStatus: Partial<Record<number, string>> = {},
): string {
  if (error instanceof ApiError) {
    return byStatus[error.status] ?? `Algo deu errado (erro ${error.status}). Tente de novo.`;
  }
  // fetch lanca TypeError quando nem chega a falar com a API.
  return 'Não foi possível falar com a API. Confira se ela está no ar.';
}

/** Significado dos status nas rotas de escrita de fotos, para o painel. */
export const ADMIN_WRITE_ERRORS: Partial<Record<number, string>> = {
  401: 'Token inválido. Confira o valor de ADMIN_TOKEN.',
  404: 'Esta obra não existe mais.',
  413: 'A imagem passa de 10 MB.',
  415: 'Formato não suportado. Envie jpg, png ou webp.',
  422: 'Alguns campos não foram aceitos. Confira e tente de novo.',
};
