'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ApiError } from '@/lib/api';
import { createCustomer, lookupCep, type CustomerPayload } from '@/lib/customers';
import { errorMessage } from '@/lib/errors';
import { maskCep, maskPhone, onlyDigits } from '@/lib/masks';
import { FormField, inputClassName } from './FormField';

const EMPTY_VALUES = {
  full_name: '',
  email: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
};

type FormValues = typeof EMPTY_VALUES;
type CepStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'unavailable' | 'api-unreachable';
type SubmitStatus =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; name: string }
  | { kind: 'error'; message: string };

const CEP_MESSAGES: Record<CepStatus, { text: string; tone: 'muted' | 'danger' } | null> = {
  idle: null,
  loading: { text: 'Buscando endereço…', tone: 'muted' },
  found: { text: 'Endereço preenchido. Confira e informe o número.', tone: 'muted' },
  'not-found': { text: 'CEP não encontrado. Confira ou preencha o endereço à mão.', tone: 'danger' },
  unavailable: {
    text: 'O serviço de CEP está fora do ar. Preencha o endereço à mão.',
    tone: 'danger',
  },
  'api-unreachable': {
    text: 'Não foi possível falar com o servidor. Preencha o endereço à mão.',
    tone: 'danger',
  },
};

/** 404 = CEP inexistente; 502/504 = ViaCEP com problema; sem resposta = API inacessivel. */
function cepStatusFromError(error: unknown): CepStatus {
  if (!(error instanceof ApiError)) return 'api-unreachable';
  return error.status === 404 ? 'not-found' : 'unavailable';
}

/** Checagens simples que o HTML nativo nao cobre. */
function findProblem(values: FormValues): string | null {
  const phoneDigits = onlyDigits(values.phone);
  if (phoneDigits && phoneDigits.length < 10) return 'Telefone incompleto: informe DDD e número.';
  if (onlyDigits(values.cep).length !== 8) return 'O CEP precisa ter 8 dígitos.';
  return null;
}

function toPayload(values: FormValues): CustomerPayload {
  const optional = (value: string) => value.trim() || null;
  return {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: optional(onlyDigits(values.phone)),
    cep: onlyDigits(values.cep),
    street: values.street.trim(),
    number: values.number.trim(),
    complement: optional(values.complement),
    district: optional(values.district),
    city: values.city.trim(),
    state: values.state.trim().toUpperCase(),
  };
}

export function CustomerForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [cepStatus, setCepStatus] = useState<CepStatus>('idle');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const numberRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  // Ultimo CEP consultado: evita consulta repetida e descarta respostas atrasadas.
  const lastLookupRef = useRef('');

  function setField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleCepBlur() {
    const cep = onlyDigits(values.cep);
    if (cep.length !== 8 || cep === lastLookupRef.current) return;

    lastLookupRef.current = cep;
    setCepStatus('loading');
    try {
      const address = await lookupCep(cep);
      if (lastLookupRef.current !== cep) return;
      setValues((current) => ({
        ...current,
        street: address.street,
        district: address.district,
        city: address.city,
        state: address.state,
      }));
      setCepStatus('found');
      // CEP geral de cidade vem sem logradouro: nesse caso o foco vai para a rua.
      (address.street ? numberRef : streetRef).current?.focus();
    } catch (error) {
      if (lastLookupRef.current !== cep) return;
      lastLookupRef.current = ''; // permite tentar de novo ao sair do campo
      setCepStatus(cepStatusFromError(error));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = findProblem(values);
    if (problem) {
      setSubmitStatus({ kind: 'error', message: problem });
      return;
    }

    setSubmitStatus({ kind: 'submitting' });
    try {
      const customer = await createCustomer(toPayload(values));
      setSubmitStatus({ kind: 'success', name: customer.full_name.split(' ')[0] });
      setValues(EMPTY_VALUES);
      setCepStatus('idle');
      lastLookupRef.current = '';
    } catch (error) {
      setSubmitStatus({
        kind: 'error',
        message: errorMessage(error, {
          409: 'Já existe um cadastro com este e-mail.',
          422: 'Alguns campos não foram aceitos. Confira os dados e tente de novo.',
        }),
      });
    }
  }

  if (submitStatus.kind === 'success') {
    return (
      <div role="status" className="border-y border-line py-16 text-center">
        <p className="font-serif text-3xl">Obrigada, {submitStatus.name}.</p>
        <p className="mt-3 text-muted">Seu cadastro foi recebido. Entraremos em contato.</p>
        <button
          type="button"
          onClick={() => setSubmitStatus({ kind: 'idle' })}
          className="mt-8 text-sm underline underline-offset-4"
        >
          Fazer outro cadastro
        </button>
      </div>
    );
  }

  const submitting = submitStatus.kind === 'submitting';
  const cepMessage = CEP_MESSAGES[cepStatus];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-12">
      <fieldset disabled={submitting} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <legend className="mb-6 font-serif text-2xl">Seus dados</legend>

        <FormField label="Nome completo" htmlFor="full_name" className="sm:col-span-2">
          <input
            id="full_name"
            name="full_name"
            required
            minLength={3}
            maxLength={120}
            autoComplete="name"
            value={values.full_name}
            onChange={(event) => setField('full_name', event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="E-mail" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={values.email}
            onChange={(event) => setField('email', event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Telefone (opcional)" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(11) 98888-7777"
            pattern="\(\d{2}\) \d{4,5}-\d{4}"
            title="DDD e número, ex.: (11) 98888-7777"
            value={values.phone}
            onChange={(event) => setField('phone', maskPhone(event.target.value))}
            className={inputClassName}
          />
        </FormField>
      </fieldset>

      <fieldset disabled={submitting} className="grid grid-cols-6 gap-5">
        <legend className="mb-6 font-serif text-2xl">Endereço</legend>

        <FormField
          label="CEP"
          htmlFor="cep"
          className="col-span-6 sm:col-span-2"
          hint={
            <span
              aria-live="polite"
              className={cepMessage?.tone === 'danger' ? 'text-danger' : undefined}
            >
              {cepMessage?.text ?? 'Preenchemos o endereço a partir do CEP.'}
            </span>
          }
        >
          <input
            id="cep"
            name="cep"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="01001-000"
            pattern="\d{5}-\d{3}"
            title="CEP com 8 dígitos, ex.: 01001-000"
            aria-busy={cepStatus === 'loading'}
            value={values.cep}
            onChange={(event) => {
              setField('cep', maskCep(event.target.value));
              if (cepStatus !== 'loading') setCepStatus('idle');
            }}
            onBlur={handleCepBlur}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Rua" htmlFor="street" className="col-span-6 sm:col-span-4">
          <input
            ref={streetRef}
            id="street"
            name="street"
            required
            maxLength={200}
            autoComplete="address-line1"
            value={values.street}
            onChange={(event) => setField('street', event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Número" htmlFor="number" className="col-span-2">
          <input
            ref={numberRef}
            id="number"
            name="number"
            required
            maxLength={20}
            value={values.number}
            onChange={(event) => setField('number', event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Complemento" htmlFor="complement" className="col-span-4">
          <input
            id="complement"
            name="complement"
            maxLength={100}
            autoComplete="address-line2"
            value={values.complement}
            onChange={(event) => setField('complement', event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Bairro" htmlFor="district" className="col-span-6 sm:col-span-2">
          <input
            id="district"
            name="district"
            maxLength={100}
            value={values.district}
            onChange={(event) => setField('district', event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Cidade" htmlFor="city" className="col-span-4 sm:col-span-3">
          <input
            id="city"
            name="city"
            required
            maxLength={100}
            autoComplete="address-level2"
            value={values.city}
            onChange={(event) => setField('city', event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="UF" htmlFor="state" className="col-span-2 sm:col-span-1">
          <input
            id="state"
            name="state"
            required
            maxLength={2}
            pattern="[A-Za-z]{2}"
            title="Sigla do estado, ex.: SP"
            autoComplete="address-level1"
            value={values.state}
            onChange={(event) => setField('state', event.target.value.toUpperCase())}
            className={`${inputClassName} uppercase`}
          />
        </FormField>
      </fieldset>

      <div className="flex flex-col items-start gap-4 border-t border-line pt-8">
        {submitStatus.kind === 'error' ? (
          <p role="alert" className="text-sm text-danger">
            {submitStatus.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink px-8 py-3 text-sm text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {submitting ? 'Enviando…' : 'Enviar cadastro'}
        </button>
      </div>
    </form>
  );
}
