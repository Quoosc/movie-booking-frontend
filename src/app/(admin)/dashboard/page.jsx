// src/app/(admin)/dashboard/page.jsx
import { useEffect, useMemo, useState } from "react";
import {
  AdminUserService,
  AdminMovieService,
  AdminCinemaService,
  AdminOrderService,
} from "@/api/adminservice";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

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

function pad2(n) {
  return String(n).padStart(2, "0");
}

// yyyy-mm-dd (local)
function toLocalYMD(d) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

// unwrap list từ nhiều kiểu response (giống chuẩn wrapper {code,message,data})
function unwrapList(res) {
  const level1 = res?.data ?? res;
  if (Array.isArray(level1)) return level1;

  if (level1 && typeof level1 === "object") {
    if (Array.isArray(level1.data)) return level1.data;

    // axios: { data: { code, message, data: [...] } }
    if (level1.data && typeof level1.data === "object") {
      if (Array.isArray(level1.data.data)) return level1.data.data;
    }
  }
  return [];
}

function getPaymentTime(p) {
  // tùy backend field tên gì, tao ưu tiên mấy field phổ biến
  return (
    p?.paymentTime ||
    p?.paidAt ||
    p?.createdAt ||
    p?.updatedAt ||
    p?.time ||
    null
  );
}

function getPaymentAmount(p) {
  const raw =
    p?.amount ?? p?.totalAmount ?? p?.finalAmount ?? p?.payAmount ?? p?.total;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function getPaymentStatus(p) {
  return String(p?.status || p?.paymentStatus || "").toUpperCase();
}

function getPaymentMethod(p) {
  return String(p?.method || p?.paymentMethod || "").toUpperCase();
}

function startOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isoLocal(d) {
  // backend thường ăn ISO
  return d.toISOString();
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const map = {};
  payload.forEach((it) => {
    map[it.dataKey] = it.value;
  });

  return (
    <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/70">
        {label}
      </div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/60">Doanh thu</span>
          <span className="font-semibold text-emerald-200">
            {formatCurrency(map.revenue ?? 0)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/60">SUCCESS</span>
          <span className="font-semibold text-cyan-200">{map.success ?? 0}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/60">PENDING</span>
          <span className="font-semibold text-amber-200">{map.pending ?? 0}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/60">FAILED</span>
          <span className="font-semibold text-rose-200">{map.failed ?? 0}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/60">REFUNDED</span>
          <span className="font-semibold text-violet-200">
            {map.refunded ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      setLoading(true);
// 14 ngày gần nhất (tính theo local)
      const now = new Date();
      const end = endOfDayLocal(now);
      const start = startOfDayLocal(new Date(now));
      start.setDate(start.getDate() - 13);

      const [usersRes, moviesRes, cinemasRes, paymentsRes] = await Promise.all([
        AdminUserService.getUsers?.(),
        AdminMovieService.getMovies?.(),
        AdminCinemaService.getCinemas?.(),
        // ✅ dùng đúng API mày đưa: GET /api/payments/search
        AdminOrderService.searchPayments?.({
          startDate: isoLocal(start),
          endDate: isoLocal(end),
        }),
      ]);

      setUsers(unwrapList(usersRes));
      setMovies(unwrapList(moviesRes));
      setCinemas(unwrapList(cinemasRes));
      setPayments(unwrapList(paymentsRes));
    } catch (err) {
      console.error("AdminDashboard loadData error:", err);
} finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    // build 14 days buckets
    const now = new Date();
    const start = startOfDayLocal(new Date(now));
    start.setDate(start.getDate() - 13);

    const buckets = new Map(); // ymd -> row
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const ymd = toLocalYMD(d);
      buckets.set(ymd, {
        ymd,
        label: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`,
        revenue: 0,
        success: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
      });
    }

    payments.forEach((p) => {
      const t = getPaymentTime(p);
      if (!t) return;

      const d = new Date(t);
      if (Number.isNaN(d.getTime())) return;

      const ymd = toLocalYMD(d);
      const row = buckets.get(ymd);
      if (!row) return;

      const st = getPaymentStatus(p);
      const amt = getPaymentAmount(p);

      if (st === "SUCCESS") {
        row.success += 1;
        row.revenue += amt;
      } else if (st === "PENDING") row.pending += 1;
      else if (st === "REFUNDED") row.refunded += 1;
      else if (st === "FAILED" || st === "REFUND_FAILED") row.failed += 1;
      else if (st === "REFUND_PENDING") row.pending += 1; // gom pending cho dễ nhìn
    });

    return Array.from(buckets.values());
  }, [payments]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalMovies = movies.length;
    const totalCinemas = cinemas.length;

    // stats theo payments (vì dashboard giờ lấy từ payments/search)
    const totalPayments = payments.length;

    const todayYmd = toLocalYMD(new Date());
    let todayRevenue = 0;
    let todaySuccess = 0;

    payments.forEach((p) => {
      const t = getPaymentTime(p);
      if (!t) return;
      const d = new Date(t);
      if (Number.isNaN(d.getTime())) return;

      if (toLocalYMD(d) !== todayYmd) return;

      const st = getPaymentStatus(p);
      if (st === "SUCCESS") {
        todaySuccess += 1;
        todayRevenue += getPaymentAmount(p);
      }
    });

    return {
      totalUsers,
      totalMovies,
      totalCinemas,
      totalPayments,
      todaySuccess,
      todayRevenue,
    };
  }, [users, movies, cinemas, payments]);

  const latestPayments = useMemo(() => {
    const arr = [...payments];
    arr.sort((a, b) => {
      const ta = new Date(getPaymentTime(a) || 0).getTime();
      const tb = new Date(getPaymentTime(b) || 0).getTime();
      return tb - ta;
    });
    return arr.slice(0, 6);
  }, [payments]);

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
          Thống kê nhanh theo dữ liệu trong 14
          ngày gần nhất.
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
          label="Tổng giao dịch"
          value={stats.totalPayments}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
        <StatCard
          label="SUCCESS hôm nay"
          value={stats.todaySuccess}
          gradient="from-cyan-400/80 via-violet-500/80 to-fuchsia-400/80"
        />
        <StatCard
          label="Doanh thu hôm nay"
          value={formatCurrency(stats.todayRevenue)}
          gradient="from-emerald-400/80 via-lime-400/80 to-yellow-400/80"
          isMoney
        />
      </section>

      {/* Chart */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
        <div className="relative p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
                Biểu đồ doanh thu & số giao dịch (14 ngày)
              </h2>
              
            </div>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          <div className="h-[320px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-white/60">
                Đang tải dữ liệu chart...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-white/60">
                Không có dữ liệu để vẽ chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `${Math.round(v / 1000000)}M`
                        : v >= 1000
                        ? `${Math.round(v / 1000)}K`
                        : `${v}`
                    }
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 12,
                    }}
                  />

                  {/* Bar: revenue */}
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="rgba(52, 211, 153, 0.55)"
                    stroke="rgba(52, 211, 153, 0.9)"
                    radius={[10, 10, 0, 0]}
                  />

                  {/* Line: success count */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="success"
                    name="SUCCESS"
                    stroke="rgba(34, 211, 238, 0.95)"
                    strokeWidth={3}
                    dot={false}
                  />

                  {/* Optional: có thể bật thêm line pending/refunded/failed nếu muốn */}
                  {/* <Line yAxisId="right" type="monotone" dataKey="pending" name="PENDING" stroke="rgba(251, 191, 36, 0.9)" strokeWidth={2} dot={false} /> */}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* 2 columns: recent payments + quick summary */}
      <section className="grid lg:grid-cols-[2fr,1.2fr] gap-6 lg:gap-8">
        {/* Recent payments */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
          <div className="relative p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-white/80">
                Giao dịch mới nhất
              </h2>
              <span className="text-[11px] text-white/50">
                Hiển thị {latestPayments.length} giao dịch gần nhất
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-white/60">
                Đang tải dữ liệu...
              </div>
            ) : latestPayments.length === 0 ? (
              <div className="py-8 text-center text-sm text-white/60">
                Chưa có giao dịch nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                      <th className="py-3 pr-4 text-left">Mã</th>
                      <th className="py-3 px-4 text-left">Booking</th>
                      <th className="py-3 px-4 text-left hidden md:table-cell">
                        Thời gian
                      </th>
                      <th className="py-3 px-4 text-left">Số tiền</th>
                      <th className="py-3 pl-4 pr-2 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestPayments.map((p) => {
                      const pid = p.paymentId || p.id || "";
                      const code = pid ? pid.slice(0, 8) : "—";
                      const bookingId = p.bookingId ? p.bookingId.slice(0, 8) : "—";
                      const total = getPaymentAmount(p);
                      const status = getPaymentStatus(p) || "UNKNOWN";
                      const time = getPaymentTime(p);

                      return (
                        <tr
                          key={pid || Math.random()}
                          className="border-b border-white/5 hover:bg-white/5/10"
                        >
                          <td className="py-3 pr-4 font-mono text-[11px] text-white/90">
                            {code}
                          </td>
                          <td className="py-3 px-4 text-white/80 font-mono text-[11px]">
                            {bookingId}…
                          </td>
                          <td className="py-3 px-4 text-white/60 hidden md:table-cell">
                            {formatDate(time)}
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

        {/* Summary cards */}
        <div className="space-y-4">
          <SummaryCard
            title="Hoạt động hệ thống"
            items={[
              { label: "User", value: stats.totalUsers },
              { label: "Phim", value: stats.totalMovies },
              { label: "Rạp", value: stats.totalCinemas },
              { label: "Giao dịch", value: stats.totalPayments },
            ]}
          />
          <SummaryCard
            title="Hôm nay"
            items={[
              { label: "SUCCESS", value: stats.todaySuccess },
              { label: "Doanh thu", value: formatCurrency(stats.todayRevenue) },
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
          {isMoney ? <span className="text-sm md:text-base">{value}</span> : value}
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
              <span className="font-semibold text-white">{item.value ?? "–"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
