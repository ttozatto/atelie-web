'use client';

import { useState, type FormEvent } from 'react';
import { login, type Session } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import { FormField, inputClassName } from './FormField';

interface AdminLoginProps {
  onAuthenticated: (session: Session) => void;
}

/** Tela de entrada do painel: usuário e senha conferidos pela API. */
export function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      onAuthenticated(await login(username.trim(), password));
    } catch (caught) {
      setError(errorMessage(caught, { 401: 'Usuário ou senha inválidos.' }));
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-8 py-16 sm:py-24">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Painel</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Entre para publicar e editar as obras do catálogo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset disabled={submitting} className="flex flex-col gap-5">
          <FormField label="Usuário" htmlFor="username">
            <input
              id="username"
              name="username"
              required
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={inputClassName}
            />
          </FormField>

          <FormField label="Senha" htmlFor="password">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
            />
          </FormField>
        </fieldset>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="bg-ink px-6 py-3 text-sm text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="text-xs leading-relaxed text-muted">
        A sessão vale só para esta aba e termina ao recarregar a página.
      </p>
    </div>
  );
}
