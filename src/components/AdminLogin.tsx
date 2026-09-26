'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { login, type Session } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import { useHydrated } from '@/lib/useHydrated';
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
  const hydrated = useHydrated();
  const usernameRef = useRef<HTMLInputElement>(null);

  // O campo nasce desabilitado (ver useHydrated), entao o autofocus do HTML nao pega:
  // o foco vai para o usuario assim que o formulario fica utilizavel.
  useEffect(() => {
    if (hydrated) usernameRef.current?.focus();
  }, [hydrated]);

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

      {/* method="post": se algum envio nativo escapar, a senha nao vai para a URL. */}
      <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset disabled={submitting || !hydrated} className="flex flex-col gap-5">
          <FormField label="Usuário" htmlFor="username">
            <input
              id="username"
              name="username"
              required
              autoComplete="username"
              ref={usernameRef}
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
          disabled={submitting || !hydrated}
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
