'use client';

import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@/lib/errors';
import { listPhotos } from '@/lib/photos';
import type { Photo } from '@/lib/types';
import { AdminPhotoRow } from './AdminPhotoRow';
import { FormField, inputClassName } from './FormField';
import { NewPhotoForm } from './NewPhotoForm';
import { StateMessage } from './StateMessage';

type ListState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; photos: Photo[] };

export function AdminPanel() {
  // Placeholder de MVP academico, nao autenticacao: o token vive so neste estado
  // em memoria. Nao vai para localStorage, cookie nem URL, e some ao recarregar.
  const [token, setToken] = useState('');
  const [list, setList] = useState<ListState>({ kind: 'loading' });
  const [notice, setNotice] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    setList({ kind: 'loading' });
    try {
      const page = await listPhotos({ limit: 100 });
      setList({ kind: 'ready', photos: page.items });
    } catch (error) {
      setList({ kind: 'error', message: errorMessage(error) });
    }
  }, []);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  function updatePhotos(change: (photos: Photo[]) => Photo[]) {
    setList((current) =>
      current.kind === 'ready' ? { kind: 'ready', photos: change(current.photos) } : current,
    );
  }

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-6 border-b border-line pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Painel</h1>
          <p className="mt-3 text-sm text-muted">Cadastre, edite e exclua as obras do catálogo.</p>
        </div>
        <FormField
          label="Token do painel"
          htmlFor="admin-token"
          className="w-full md:w-80"
          hint={
            token
              ? 'Fica só na memória desta aba e some ao recarregar.'
              : 'Sem token o painel só lê. Cole o valor de ADMIN_TOKEN.'
          }
        >
          <input
            id="admin-token"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={token}
            onChange={(event) => setToken(event.target.value.trim())}
            className={inputClassName}
          />
        </FormField>
      </section>

      <section aria-labelledby="new-photo-title" className="flex flex-col gap-8">
        <h2 id="new-photo-title" className="font-serif text-3xl">
          Nova obra
        </h2>
        <NewPhotoForm
          token={token}
          onCreated={(photo) => {
            updatePhotos((photos) => [photo, ...photos]);
            setNotice(`“${photo.title}” cadastrada.`);
          }}
        />
      </section>

      <section aria-labelledby="photos-title" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="photos-title" className="font-serif text-3xl">
            Obras
          </h2>
          <p role="status" className="text-sm text-muted">
            {notice}
          </p>
        </div>

        {list.kind === 'loading' ? (
          <p aria-busy="true" className="animate-pulse py-16 text-center text-sm text-muted">
            Carregando obras…
          </p>
        ) : null}

        {list.kind === 'error' ? (
          <StateMessage title="Não foi possível carregar as obras" tone="danger">
            <p>{list.message}</p>
            <button
              type="button"
              onClick={() => void loadPhotos()}
              className="mt-6 border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Tentar de novo
            </button>
          </StateMessage>
        ) : null}

        {list.kind === 'ready' && list.photos.length === 0 ? (
          <StateMessage title="Nenhuma obra cadastrada">
            Use o formulário acima para cadastrar a primeira.
          </StateMessage>
        ) : null}

        {list.kind === 'ready' && list.photos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-t border-line text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-3 font-normal">
                    Obra
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal">
                    Categoria
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal">
                    Preço
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.photos.map((photo) => (
                  <AdminPhotoRow
                    key={photo.id}
                    photo={photo}
                    token={token}
                    onUpdated={(updated) => {
                      updatePhotos((photos) =>
                        photos.map((item) => (item.id === updated.id ? updated : item)),
                      );
                      setNotice(`“${updated.title}” atualizada.`);
                    }}
                    onDeleted={(deleted) => {
                      updatePhotos((photos) => photos.filter((item) => item.id !== deleted.id));
                      setNotice(`“${deleted.title}” excluída.`);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
