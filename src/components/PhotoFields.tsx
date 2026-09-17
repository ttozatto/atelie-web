import { CATEGORY_LABELS, MEDIUM_LABELS, centsToPriceInput } from '@/lib/format';
import { PHOTO_CATEGORIES, PHOTO_MEDIUMS, type Photo } from '@/lib/types';
import { FormField, inputClassName } from './FormField';

interface PhotoFieldsProps {
  /** Prefixo dos ids, para varios formularios coexistirem na mesma pagina. */
  idPrefix: string;
  /** Obra sendo editada; ausente no cadastro de uma nova. */
  photo?: Photo;
}

/**
 * Campos de metadados de uma obra, nao controlados. O formulario que os envolve le os
 * valores com FormData e monta o multipart com buildPhotoFormData.
 */
export function PhotoFields({ idPrefix, photo }: PhotoFieldsProps) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
      <FormField label="Título" htmlFor={id('title')} className="sm:col-span-6">
        <input
          id={id('title')}
          name="title"
          required
          defaultValue={photo?.title}
          className={inputClassName}
        />
      </FormField>

      <FormField label="Descrição" htmlFor={id('description')} className="sm:col-span-6">
        <textarea
          id={id('description')}
          name="description"
          rows={3}
          defaultValue={photo?.description ?? ''}
          className={inputClassName}
        />
      </FormField>

      <FormField label="Categoria" htmlFor={id('category')} className="sm:col-span-3">
        <select
          id={id('category')}
          name="category"
          defaultValue={photo?.category ?? ''}
          className={inputClassName}
        >
          <option value="">Sem categoria</option>
          {PHOTO_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Suporte" htmlFor={id('medium')} className="sm:col-span-3">
        <select
          id={id('medium')}
          name="medium"
          required
          defaultValue={photo?.medium ?? 'print'}
          className={inputClassName}
        >
          {PHOTO_MEDIUMS.map((medium) => (
            <option key={medium} value={medium}>
              {MEDIUM_LABELS[medium]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Formatos"
        htmlFor={id('sizes')}
        hint="Separados por vírgula"
        className="sm:col-span-3"
      >
        <input
          id={id('sizes')}
          name="sizes"
          placeholder="A4, A3, 30x40"
          defaultValue={photo?.sizes.join(', ')}
          className={inputClassName}
        />
      </FormField>

      <FormField label="Preço (R$)" htmlFor={id('price')} className="sm:col-span-3">
        <input
          id={id('price')}
          name="price"
          required
          inputMode="decimal"
          placeholder="180,00"
          pattern="\d+(,\d{1,2})?"
          title="Valor em reais, ex.: 180,00"
          defaultValue={photo ? centsToPriceInput(photo.price_cents) : undefined}
          className={inputClassName}
        />
      </FormField>

      <label className="flex items-center gap-3 text-sm sm:col-span-6">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={photo?.is_published ?? true}
          className="size-4 accent-ink"
        />
        Publicada na galeria
      </label>
    </div>
  );
}
