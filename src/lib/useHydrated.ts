import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * `false` no HTML do servidor e durante a hidratação; `true` depois que o React assumiu
 * a página.
 *
 * Formulários controlados usam isso para ficar desabilitados até a hidratação. Sem
 * isso, o HTML aparece antes do JavaScript e a pessoa consegue digitar num campo que o
 * React ainda não controla: na primeira re-renderização o React devolve o campo ao
 * estado (vazio) e o texto some. Pior: apertar Enter nessa janela faz o envio nativo do
 * formulário, um GET com os dados — inclusive a senha — na URL.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
