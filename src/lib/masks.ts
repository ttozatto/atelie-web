/** Mascaras de digitacao. A API sempre recebe so os digitos. */

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** 01001000 -> 01001-000 */
export function maskCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

/** 11988887777 -> (11) 98888-7777 ; 1133334444 -> (11) 3333-4444 */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const local = digits.slice(2);
  if (local.length <= 4) return `(${areaCode}) ${local}`;

  const splitAt = local.length === 9 ? 5 : 4;
  return `(${areaCode}) ${local.slice(0, splitAt)}-${local.slice(splitAt)}`;
}
