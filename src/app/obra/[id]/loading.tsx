/**
 * Esqueleto enquanto a obra carrega.
 *
 * Trade-off consciente: com este arquivo a resposta e enviada em streaming, entao uma
 * obra inexistente mostra a tela de "nao encontrada" com status 200 (o Next injeta
 * <meta name="robots" content="noindex">). Sem ele o status seria 404, mas a tela nao
 * teria estado de carregamento.
 */
export default function PhotoLoading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto max-w-6xl animate-pulse px-5 pb-24 pt-8 sm:px-8 sm:pt-12"
    >
      <span className="sr-only">Carregando obra…</span>
      <div className="h-4 w-32 bg-frame" />
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
        <div className="aspect-[4/5] bg-frame sm:aspect-[4/3] lg:aspect-auto lg:h-[calc(78vh+5rem)]" />
        <div>
          <div className="h-3 w-20 bg-frame" />
          <div className="mt-4 h-10 w-3/4 bg-frame" />
          <div className="mt-6 h-7 w-28 bg-frame" />
          <div className="mt-8 h-20 w-full bg-frame" />
        </div>
      </div>
    </main>
  );
}
