
// src/components/movies/AllMoviesGrid.jsx
import MovieCard from "./MovieCard";

export default function AllMoviesGrid({ title, movies = [], onCollapse }) {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">
            {title}
          </h3>

          {onCollapse && (
            <button
              onClick={onCollapse}
              className="px-4 py-2 text-xs md:text-sm rounded-lg border border-white/30 text-white/80 hover:bg-white/10 transition"
            >
              ← Thu gọn
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {movies.map((m) => (
            <MovieCard key={m.id} m={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
