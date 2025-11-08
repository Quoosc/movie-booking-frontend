// src/components/logo/movie_booking_logo.jsx
import { Link } from 'react-router-dom';

export default function MovieBookingLogo({
  width = 280,
  height = 180,
  canClick = true,
  theme = 'light',
}) {
  const logoSrc = theme === 'light' ? '/cinestar_logo_light.png' : '/cinestar_logo_dark.png';

  const Img = (
    <div className="flex items-center justify-center h-full w-full">
      <img
        src={logoSrc}
        alt="Movie Booking • Cinestar"
        width={width}
        height={height}
        className="select-none"
        loading="eager"
      />
    </div>
  );

  return canClick ? (
    <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
      {Img}
    </Link>
  ) : (
    Img
  );
}
