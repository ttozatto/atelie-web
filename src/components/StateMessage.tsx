import type { ReactNode } from 'react';

interface StateMessageProps {
  title: string;
  children?: ReactNode;
  tone?: 'neutral' | 'danger';
}

/** Mensagem centralizada para os estados vazio e de erro. */
export function StateMessage({ title, children, tone = 'neutral' }: StateMessageProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center"
    >
      <p className={`font-serif text-2xl ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}>
        {title}
      </p>
      {children ? <div className="text-sm leading-relaxed text-muted">{children}</div> : null}
    </div>
  );
}
