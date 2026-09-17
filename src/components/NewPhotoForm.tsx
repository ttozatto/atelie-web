'use client';

import Image from 'next/image';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ADMIN_WRITE_ERRORS, errorMessage } from '@/lib/errors';
import { ACCEPTED_IMAGE_TYPES, buildPhotoFormData, validateImage } from '@/lib/photoForm';
import { createPhoto } from '@/lib/photos';
import type { Photo } from '@/lib/types';
import { FormField, inputClassName } from './FormField';
import { PhotoFields } from './PhotoFields';

interface NewPhotoFormProps {
  token: string;
  onCreated: (photo: Photo) => void;
}

export function NewPhotoForm({ token, onCreated }: NewPhotoFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Muda a cada envio bem-sucedido para recriar os campos nao controlados vazios.
  const [formKey, setFormKey] = useState(0);

  // Libera a URL temporaria do preview quando ela e trocada ou o componente sai.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const imageError = validateImage(file);
    setError(imageError);
    setPreviewUrl(imageError ? null : URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = buildPhotoFormData(new FormData(event.currentTarget));
    if ('error' in result) {
      setError(result.error);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const photo = await createPhoto(result.data, token);
      setPreviewUrl(null);
      setFormKey((key) => key + 1);
      onCreated(photo);
    } catch (caught) {
      setError(errorMessage(caught, ADMIN_WRITE_ERRORS));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      key={formKey}
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
    >
      <div className="flex flex-col gap-3">
        <FormField
          label="Imagem"
          htmlFor="new-image"
          hint="jpg, png ou webp, até 10 MB"
        >
          <input
            id="new-image"
            name="image"
            type="file"
            required
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleImageChange}
            className={`${inputClassName} file:mr-3 file:border-0 file:bg-frame file:px-3 file:py-1 file:text-sm`}
          />
        </FormField>
        <div className="relative aspect-[4/5] bg-frame">
          {previewUrl ? (
            // Preview local (blob:), antes do upload: nao passa pelo otimizador.
            <Image src={previewUrl} alt="Pré-visualização" fill unoptimized className="object-contain p-4" />
          ) : (
            <p className="absolute inset-0 flex items-center justify-center text-xs text-muted">
              Pré-visualização
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <PhotoFields idPrefix="new" />
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saving || !token}
            className="bg-ink px-6 py-2.5 text-sm text-paper transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {saving ? 'Enviando…' : 'Cadastrar obra'}
          </button>
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
