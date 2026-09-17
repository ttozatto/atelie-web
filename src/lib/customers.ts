import { apiFetch } from './api';

export interface Address {
  cep: string;
  street: string;
  district: string;
  city: string;
  state: string;
}

export interface CustomerPayload {
  full_name: string;
  email: string;
  phone: string | null;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  district: string | null;
  city: string;
  state: string;
}

export interface Customer extends CustomerPayload {
  id: number;
  created_at: string;
}

/** GET /api/cep/{cep} — a API consulta o ViaCEP; o navegador nunca fala com ele. */
export function lookupCep(cep: string): Promise<Address> {
  return apiFetch<Address>(`/api/cep/${cep}`);
}

/** POST /api/customers */
export function createCustomer(payload: CustomerPayload): Promise<Customer> {
  return apiFetch<Customer>('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
