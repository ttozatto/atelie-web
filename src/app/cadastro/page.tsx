import type { Metadata } from 'next';
import { CustomerForm } from '@/components/CustomerForm';

export const metadata: Metadata = { title: 'Cadastro' };

export default function CadastroPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 pb-24 sm:px-8">
      <section className="py-16 sm:py-20">
        <h1 className="font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
          Tenho interesse
        </h1>
        <p className="mt-5 leading-relaxed text-muted">
          Deixe seus dados para receber informações sobre as obras, formatos e disponibilidade.
        </p>
      </section>
      <CustomerForm />
    </main>
  );
}
