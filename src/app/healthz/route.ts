/**
 * Healthcheck do contêiner web.
 *
 * Nao renderiza pagina nem chama a API: responde se o servidor Next esta de pe. Usar a
 * galeria como healthcheck acoplava a saude do web a da API e, como a galeria responde em
 * streaming, o `wget --spider` fechava a conexao no meio e gerava erro no log a cada 10 s.
 */
export function GET() {
  return Response.json({ status: 'ok' });
}
