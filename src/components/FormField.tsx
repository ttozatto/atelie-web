import type { ReactNode } from 'react';

/** Classe base dos inputs, selects e textareas dos formularios. */
export const inputClassName =
  'w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-ink disabled:opacity-60';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, hint, className = '', children }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-xs uppercase tracking-[0.12em] text-muted">
        {label}
      </label>
      {children}
      {hint ? <div className="text-xs leading-relaxed text-muted">{hint}</div> : null}
    </div>
  );
}
