'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { ADMIN_WRITE_ERRORS, errorMessage } from '@/lib/errors';
import { CATEGORY_LABELS, formatPrice } from '@/lib/format';
import { buildPhotoFormData } from '@/lib/photoForm';
import { deletePhoto, updatePhoto } from '@/lib/photos';
import type { Photo } from '@/lib/types';
import { PhotoFields } from './PhotoFields';

interface AdminPhotoRowProps {
  photo: Photo;
  token: string;
  onUpdated: (photo: Photo) => void;
  onDeleted: (photo: Photo) => void;
}

type Mode = 'view' | 'edit' | 'confirm-delete';

const COLUMN_COUNT = 5;

export function AdminPhotoRow({ photo, token, onUpdated, onDeleted }: AdminPhotoRowProps) {
  const [mode, setMode] = useState<Mode>('view');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function changeMode(next: Mode) {
    setError(null);
    setMode(next);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = buildPhotoFormData(new FormData(event.currentTarget));
    if ('error' in result) {
      setError(result.error);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const updated = await updatePhoto(photo.id, result.data, token);
      setMode('view');
      onUpdated(updated);
    } catch (caught) {
      setError(errorMessage(caught, ADMIN_WRITE_ERRORS));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await deletePhoto(photo.id, token);
      onDeleted(photo);
    } catch (caught) {
      setError(errorMessage(caught, ADMIN_WRITE_ERRORS));
      setBusy(false);
    }
  }

  if (mode === 'edit') {
    return (
      <tr className="border-b border-line bg-frame/60">
        <td colSpan={COLUMN_COUNT} className="px-4 py-6">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <p className="font-serif text-xl">Editando “{photo.title}”</p>
            <PhotoFields idPrefix={`edit-${photo.id}`} photo={photo} />
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={busy}
                className="bg-ink px-5 py-2 text-sm text-paper transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {busy ? 'Salvando…' : 'Salvar'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => changeMode('view')}
                className="text-sm text-muted hover:text-ink"
              >
                Cancelar
              </button>
              {error ? (
                <p role="alert" className="text-sm text-danger">
                  {error}
                </p>
              ) : null}
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line align-middle">
      <td className="px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="relative size-14 shrink-0 bg-frame">
            <Image src={photo.image_path} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <span className="font-serif text-lg leading-tight">{photo.title}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted">
        {photo.category ? CATEGORY_LABELS[photo.category] : '—'}
      </td>
      <td className="px-4 py-3 tabular-nums">{formatPrice(photo.price_cents)}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${
            photo.is_published ? 'bg-ink text-paper' : 'border border-line text-muted'
          }`}
        >
          {photo.is_published ? 'Publicada' : 'Rascunho'}
        </span>
      </td>
      <td className="px-4 py-3">
        {mode === 'confirm-delete' ? (
          <div className="flex flex-wrap items-center justify-end gap-3" role="group">
            <span className="text-sm">Excluir obra e imagem?</span>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="bg-danger px-3 py-1 text-sm text-paper disabled:opacity-40"
            >
              {busy ? 'Excluindo…' : 'Excluir'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => changeMode('view')}
              className="text-sm text-muted hover:text-ink"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-4 text-sm">
            <button
              type="button"
              onClick={() => changeMode('edit')}
              className="underline-offset-4 hover:underline disabled:opacity-40"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => changeMode('confirm-delete')}
              className="text-danger underline-offset-4 hover:underline disabled:opacity-40"
            >
              Excluir
            </button>
          </div>
        )}
        {error ? (
          <p role="alert" className="mt-2 text-right text-xs text-danger">
            {error}
          </p>
        ) : null}
      </td>
    </tr>
  );
}
