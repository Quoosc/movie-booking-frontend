// src/app/(admin)/users/page.jsx
import { useEffect, useMemo, useState } from "react";
import { AdminUserService } from "@/api/adminservice";

const ROLE_OPTIONS = ["ADMIN", "USER"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // local editable role state
  const [roleDraft, setRoleDraft] = useState({}); // { userId: "ADMIN" }

  // ======= API CALLS =======

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = await AdminUserService.getUsers();
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setUsers(list);

      // init roleDraft
      const draft = {};
      list.forEach((u) => {
        draft[u.userId] = u.role || u.userRole || "USER";
      });
      setRoleDraft(draft);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err?.message || "Không tải được danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRoleDraft = (userId, role) => {
    setRoleDraft((prev) => ({ ...prev, [userId]: role }));
  };

  const handleUpdateRole = async (userId) => {
    const newRole = roleDraft[userId];
    if (!newRole) return;

    try {
      setUpdatingId(userId);
      setError(null);
      setSuccess(null);

      const payload = newRole; // PATCH /users/{userId}/role body là JSON string
      const res = await AdminUserService.updateUserRole(userId, payload);

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === userId
            ? {
                ...u,
                ...(res?.data || res),
                role: newRole,
              }
            : u
        )
      );
      setSuccess(`Cập nhật quyền cho user thành công (${newRole}).`);
    } catch (err) {
      console.error("Update role error:", err);
      setError(err?.message || "Cập nhật quyền thất bại.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa user này?")) return;

    try {
      setDeletingId(userId);
      setError(null);
      setSuccess(null);

      await AdminUserService.deleteUser(userId);

      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      setSuccess("Xóa user thành công.");
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err?.message || "Xóa user thất bại.");
    } finally {
      setDeletingId(null);
    }
  };

  // ======= DERIVED DATA =======

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const haystack = `${u.username || ""} ${u.email || ""} ${
          u.phoneNumber || ""
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (roleFilter !== "ALL") {
        const role = (u.role || u.userRole || "USER")?.toUpperCase();
        if (role !== roleFilter) return false;
      }

      return true;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    let admins = 0,
      members = 0,
      guests = 0;

    users.forEach((u) => {
      const role = (u.role || u.userRole || "USER")?.toUpperCase();
      if (role === "ADMIN") admins++;
      else if (role === "GUEST") guests++;
      else members++;
    });

    return { total, admins, members, guests };
  }, [users]);

  // ======= RENDER =======

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • USERS
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản lý tài khoản
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Xem, lọc và cập nhật quyền người dùng trong hệ thống CinesVerse.
        </p>
      </header>

      {/* Thống kê nhanh */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Tổng tài khoản"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Admin"
          value={stats.admins}
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
        <StatCard
          label="Member (USER)"
          value={stats.members}
          gradient="from-emerald-400/80 via-teal-400/80 to-cyan-400/80"
        />
      </section>

      {/* Bộ lọc + search */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo email, username, số điện thoại..."
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="w-full sm:w-52">
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Lọc theo quyền
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
               border border-cyan-400/60 px-4 py-2.5 text-xs md:text-sm font-semibold text-white
               shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
               focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
               transition-all"
              >
                <option value="ALL">Tất cả</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">Member (USER)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </section>

      {/* Thông báo lỗi / success */}
      {(error || success) && (
        <section className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {success}
            </div>
          )}
        </section>
      )}

      {/* Bảng users */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
              Danh sách người dùng
            </h2>
            <p className="text-[11px] text-white/40">
              Hiển thị{" "}
              <span className="font-semibold">{filteredUsers.length}</span> /{" "}
              <span className="font-semibold">{users.length}</span> users
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 pr-4 text-left">User</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Liên hệ
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    Loyalty
                  </th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 pl-4 pr-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Không tìm thấy user nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const role = (
                      roleDraft[u.userId] ||
                      u.role ||
                      u.userRole ||
                      "USER"
                    )?.toUpperCase();
                    const tierName = u.membershipTier?.name || "Member / Guest";
                    const points = u.loyaltyPoints ?? 0;

                    return (
                      <tr
                        key={u.userId}
                        className="border-b border-white/5 hover:bg-white/5/10"
                      >
                        {/* User */}
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-emerald-400 p-[1px]">
                                <div className="h-full w-full rounded-2xl bg-[#050012] flex items-center justify-center text-xs font-bold">
                                  {(u.username || u.email || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white line-clamp-1">
                                {u.username || u.email || "Không rõ tên"}
                              </div>
                              <div className="text-[11px] text-white/50">
                                ID:{" "}
                                <span className="font-mono text-[10px]">
                                  {u.userId?.slice(0, 8)}…
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-4 align-top hidden md:table-cell">
                          <div className="text-xs text-white/80">
                            {u.email || (
                              <span className="text-white/40">—</span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/60 mt-0.5">
                            {u.phoneNumber || (
                              <span className="text-white/40">
                                Chưa cập nhật
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Loyalty */}
                        <td className="py-3 px-4 align-top hidden lg:table-cell">
                          <div className="text-xs text-emerald-300 font-semibold">
                            {tierName.toUpperCase()}
                          </div>
                          <div className="text-[11px] text-white/60 mt-0.5">
                            Điểm tích lũy:{" "}
                            <span className="font-semibold text-emerald-200">
                              {points}
                            </span>
                          </div>
                        </td>

                        {/* Role select */}
                        <td className="py-3 px-4 align-top">
                          <select
                            value={role}
                            onChange={(e) =>
                              handleChangeRoleDraft(u.userId, e.target.value)
                            }
                            className="role-select rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
             border border-cyan-400/60 px-4 py-2 text-[11px] font-semibold text-white
             shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
             focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
             transition-all"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-4 pr-2 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateRole(u.userId)}
                              disabled={updatingId === u.userId}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {updatingId === u.userId ? "Đang lưu..." : "Lưu"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.userId)}
                              disabled={deletingId === u.userId}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {deletingId === u.userId ? "Đang xóa..." : "Xóa"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, gradient }) {
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
          {value}
        </p>
      </div>
    </div>
  );
}
