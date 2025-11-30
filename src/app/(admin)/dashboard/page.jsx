// src/app/(admin)/dashboard/page.jsx
import { useEffect, useMemo, useState } from "react";
import {
  AdminUserService,
  AdminMovieService,
  AdminCinemaService,
  AdminOrderService,
} from "@/api/adminservice";

function formatCurrency(vnd) {
  if (vnd == null) return "–";
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(vnd);
  } catch {
    return `${vnd}₫`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, moviesRes, cinemasRes, bookingsRes] = await Promise.all([
        // AdminUserService.getAllUsers(),
        AdminUserService.getAllUsers?.() ?? AdminUserService.getUsers?.(),
        AdminMovieService.getAllMovies?.() ?? AdminMovieService.getMovies?.(),
        AdminCinemaService.getAllCinemas?.() ??
          AdminCinemaService.getCinemas?.(),
        AdminOrderService.getAllBookings?.() ??
          AdminOrderService.getBookings?.(),
      ]);

      const unwrap = (res) =>
        Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      setUsers(unwrap(usersRes));
      setMovies(unwrap(moviesRes));
      setCinemas(unwrap(cinemasRes));
      setBookings(unwrap(bookingsRes));
    } catch (err) {
      console.error("AdminDashboard loadData error:", err);
      setError(err?.message || "Không tải được dữ liệu dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalMovies = movies.length;
    const totalCinemas = cinemas.length;
    const totalBookings = bookings.length;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    let todayRevenue = 0;
    let todayBookings = 0;

    bookings.forEach((b) => {
      const created = b.createdAt || b.bookingTime || b.paymentTime;
      if (!created) return;
      const d = new Date(created);
      if (Number.isNaN(d.getTime())) return;
      const ymd = d.toISOString().slice(0, 10);
      if (ymd === todayStr) {
        todayBookings += 1;
        const total = b.total ?? b.totalPrice ?? b.amount ?? 0;
        todayRevenue += total;
      }
    });

    return {
      totalUsers,
      totalMovies,
      totalCinemas,
      totalBookings,
      todayBookings,
      todayRevenue,
    };
  }, [users, movies, cinemas, bookings]);

  const latestBookings = useMemo(() => {
    const arr = [...bookings];
    arr.sort((a, b) => {
      const da = new Date(a.createdAt || a.bookingTime || 0).getTime();
      const db = new Date(b.createdAt || b.bookingTime || 0).getTime();
      return db - da;
    });
    return arr.slice(0, 6);
  }, [bookings]);

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • DASHBOARD
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tổng quan hệ thống
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Theo dõi nhanh số lượng user, phim, rạp và đơn đặt vé trên hệ thống
          CinesVerse.
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Tổng user"
          value={stats.totalUsers}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Tổng phim"
          value={stats.totalMovies}
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
        <StatCard
          label="Số rạp"
          value={stats.totalCinemas}
          gradient="from-emerald-400/80 via-teal-400/80 to-cyan-400/80"
        />
        <StatCard
          label="Tổng booking"
          value={stats.totalBookings}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
        <StatCard
          label="Booking hôm nay"
          value={stats.todayBookings}
          gradient="from-cyan-400/80 via-violet-500/80 to-fuchsia-400/80"
        />
        <StatCard
          label="Doanh thu hôm nay"
          value={formatCurrency(stats.todayRevenue)}
          gradient="from-emerald-400/80 via-lime-400/80 to-yellow-400/80"
          isMoney
        />
      </section>

      {/* 2 columns: recent bookings + quick summary */}
      <section className="grid lg:grid-cols-[2fr,1.2fr] gap-6 lg:gap-8">
        {/* Recent bookings */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
          <div className="relative p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-white/80">
                Booking mới nhất
              </h2>
              <span className="text-[11px] text-white/50">
                Hiển thị {latestBookings.length} đơn gần nhất
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-white/60">
                Đang tải dữ liệu...
              </div>
            ) : latestBookings.length === 0 ? (
              <div className="py-8 text-center text-sm text-white/60">
                Chưa có booking nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                      <th className="py-3 pr-4 text-left">Mã</th>
                      <th className="py-3 px-4 text-left">Khách hàng</th>
                      <th className="py-3 px-4 text-left hidden md:table-cell">
                        Thời gian
                      </th>
                      <th className="py-3 px-4 text-left">Tổng tiền</th>
                      <th className="py-3 pl-4 pr-2 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestBookings.map((b) => {
                      const code =
                        b.bookingCode || b.code || b.bookingId?.slice(0, 8);
                      const customer =
                        b.customerName ||
                        b.user?.username ||
                        b.user?.email ||
                        "Khách vãng lai";
                      const total = b.total ?? b.totalPrice ?? b.amount ?? 0;
                      const status = b.status || b.bookingStatus || "UNKNOWN";

                      return (
                        <tr
                          key={b.bookingId || b.id}
                          className="border-b border-white/5 hover:bg-white/5/10"
                        >
                          <td className="py-3 pr-4 font-mono text-[11px] text-white/90">
                            {code}
                          </td>
                          <td className="py-3 px-4 text-white/80">
                            <div className="line-clamp-1">{customer}</div>
                          </td>
                          <td className="py-3 px-4 text-white/60 hidden md:table-cell">
                            {formatDate(
                              b.createdAt || b.bookingTime || b.paymentTime
                            )}
                          </td>
                          <td className="py-3 px-4 text-emerald-200 font-semibold">
                            {formatCurrency(total)}
                          </td>
                          <td className="py-3 pl-4 pr-2 text-right">
                            <span className="inline-flex items-center rounded-2xl border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-white/80">
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary card */}
        <div className="space-y-4">
          <SummaryCard
            title="Hoạt động hệ thống"
            items={[
              {
                label: "User đang hoạt động",
                value: stats.totalUsers,
              },
              {
                label: "Phim đang quản lý",
                value: stats.totalMovies,
              },
              {
                label: "Rạp / chi nhánh",
                value: stats.totalCinemas,
              },
              {
                label: "Tổng số booking",
                value: stats.totalBookings,
              },
            ]}
          />
          <SummaryCard
            title="Hôm nay"
            items={[
              {
                label: "Số booking",
                value: stats.todayBookings,
              },
              {
                label: "Doanh thu",
                value: formatCurrency(stats.todayRevenue),
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, gradient, isMoney = false }) {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#12002b]/90 via-[#090017] to-black/95 backdrop-blur-xl shadow-xl">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 pointer-events-none`}
      />
      <div className="absolute -top-6 -right-10 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
      <div className="relative px-4 py-4 md:px-5 md:py-5">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
          {label}
        </p>
        <p className="mt-2 text-xl md:text-2xl font-black text-white">
          {isMoney ? (
            <span className="text-sm md:text-base">{value}</span>
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ title, items }) {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#150032]/90 via-[#080018] to-black/95 backdrop-blur-xl shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-400/20 opacity-40 pointer-events-none" />
      <div className="relative p-4 md:p-5 space-y-3">
        <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase text-white/80">
          {title}
        </h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between text-xs text-white/80"
            >
              <span className="text-white/60">{item.label}</span>
              <span className="font-semibold text-white">
                {item.value ?? "–"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
