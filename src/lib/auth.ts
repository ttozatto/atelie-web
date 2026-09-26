import { apiFetch } from './api';

export interface Session {
  username: string;
  /** Token enviado no header X-Admin-Token das rotas de escrita. */
  token: string;
}

/**
 * POST /api/auth/login — troca usuário e senha pelo token do painel.
 *
 * As credenciais ficam na API (variáveis de ambiente), nunca no código da interface.
 */
export function login(username: string, password: string): Promise<Session> {
  return apiFetch<Session>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}
