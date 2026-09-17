/** Estado de carregamento da grade: molduras vazias no lugar das obras. */
export function GallerySkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando obras…</span>
      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[4/5] bg-frame" />
            <div className="mt-4 h-5 w-2/3 bg-frame" />
            <div className="mt-2 h-3 w-1/3 bg-frame" />
          </div>
        ))}
      </div>
    </div>
  );
}
