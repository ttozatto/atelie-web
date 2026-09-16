/**
 * Unico ponto que resolve a URL da atelie-api.
 *
 * Dentro do Compose existem dois caminhos para a mesma API:
 * - codigo de servidor (Server Components, route handlers) fala com http://api:8000
 *   pela rede interna do Docker  -> API_INTERNAL_URL
 * - codigo de navegador fala com http://localhost:8000, que e o que o host expoe
 *   -> NEXT_PUBLIC_API_URL
 */

const INTERNAL_BASE_URL = process.env.API_INTERNAL_URL ?? 'http://api:8000';
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/** Base correta para o ambiente onde o codigo esta executando. */
export function apiBaseUrl(): string {
  return typeof window === 'undefined' ? INTERNAL_BASE_URL : PUBLIC_BASE_URL;
}

/** Monta a URL absoluta de um caminho da API, ex.: apiUrl('/api/photos'). */
export function apiUrl(path: string): string {
  return `${apiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Erro de resposta da API, com o status HTTP e o `detail` devolvido. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'detail' in body) {
      const detail = (body as { detail: unknown }).detail;
      if (typeof detail === 'string') {
        return detail;
      }
    }
  } catch {
    // resposta sem corpo JSON: cai no texto padrao abaixo
  }
  return `Erro ${response.status} ao falar com a API`;
}

/** Executa uma requisicao na API e devolve o JSON tipado, ou lanca ApiError. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), { cache: 'no-store', ...init });
  if (!response.ok) {
    throw new ApiError(response.status, await readErrorDetail(response));
  }
  return (await response.json()) as T;
}
