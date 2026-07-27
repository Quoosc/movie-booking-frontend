import { useEffect, useState } from "react";
import { getRelatedMovies } from "@/api/movieService";
import MovieCard from "@/components/movies/MovieCard";

export default function RelatedMovies({ movieId }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    let active = true;
    getRelatedMovies(movieId)
      .then((data) => {
        if (active) setMovies(data || []);
      })
      .catch(() => {
        if (active) setMovies([]);
      });
    return () => {
      active = false;
    };
  }, [movieId]);

  if (!movies.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#43e1ff]">Có thể bạn sẽ thích</p>
          <h2 className="mt-1 text-2xl font-black text-white">Phim liên quan</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {movies.slice(0, 4).map((movie) => <MovieCard key={movie.id} m={movie} />)}
      </div>
    </section>
  );
}
