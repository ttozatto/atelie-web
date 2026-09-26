/** Moldura vazia no lugar de uma obra que ainda está carregando. */
export function PhotoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-frame" />
      <div className="mt-4 h-5 w-2/3 bg-frame" />
      <div className="mt-2 h-3 w-1/3 bg-frame" />
    </div>
  );
}
