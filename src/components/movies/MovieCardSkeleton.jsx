export default function MovieCardSkeleton() {
  return (
    <div className="flex flex-col w-full animate-pulse">
      {/* Poster */}
      <div className="w-full aspect-[2/3] rounded-2xl bg-white/10" />
      {/* Title */}
      <div className="mt-3 h-3.5 rounded-full bg-white/10 w-4/5" />
      {/* Subtitle / genre */}
      <div className="mt-2 h-2.5 rounded-full bg-white/7 w-3/5" />
      {/* Tags row */}
      <div className="mt-2 flex gap-2">
        <div className="h-5 w-12 rounded-full bg-white/8" />
        <div className="h-5 w-16 rounded-full bg-white/8" />
      </div>
    </div>
  );
}
