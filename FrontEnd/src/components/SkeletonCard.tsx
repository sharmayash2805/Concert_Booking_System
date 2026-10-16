const SkeletonCard = () => (
  <div className="overflow-hidden border-2 border-ink bg-paper">
    <div className="aspect-[16/10] bg-secondary" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-secondary rounded w-3/4" />
      <div className="h-4 bg-secondary rounded w-1/2" />
      <div className="flex gap-4">
        <div className="h-3 bg-secondary rounded w-20" />
        <div className="h-3 bg-secondary rounded w-16" />
      </div>
      <div className="h-9 bg-secondary rounded w-full mt-2" />
    </div>
  </div>
);

export default SkeletonCard;
