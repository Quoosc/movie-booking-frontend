import { Outlet, Link } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r bg-white p-4">
        <div className="font-semibold mb-4">🎬 Admin</div>
        <nav className="space-y-2 text-sm">
          <div><Link className="hover:underline" to="/admin">Dashboard</Link></div>
          <div><Link className="hover:underline" to="/admin/movie">Movies</Link></div>
          <div><Link className="hover:underline" to="/admin/cinema">Cinemas</Link></div>
          <div><Link className="hover:underline" to="/admin/showtime">Showtimes</Link></div>
          <div><Link className="hover:underline" to="/admin/snack">Snacks</Link></div>
          <div><Link className="hover:underline" to="/admin/promotion">Promotions</Link></div>
          <div><Link className="hover:underline" to="/admin/report">Reports</Link></div>
        </nav>
      </aside>
      <main className="p-6"><Outlet /></main>
    </div>
  )
}