// src/app/(admin)/users/page.jsx
import { useEffect, useMemo, useState } from "react";
import WarningModal from "@/components/shared/WarningModal";
import { AdminUserService } from "@/api/adminservice";
import { toast } from "react-toastify";

// Chỉ cho đổi giữa ADMIN/USER (đúng như rule UI của project)
const ROLE_OPTIONS_EDITABLE = ["ADMIN", "USER"];
// Nhưng để render select đúng value khi gặp GUEST
const ROLE_OPTIONS_RENDER = ["ADMIN", "USER", "GUEST"];

function getRole(u) {
  return (u?.role || u?.userRole || "USER")?.toUpperCase();
}

/**
 * Unwrap list từ các kiểu response:
 * - Axios: { data: { code, message, data: [...] } }
 * - Service đã trả wrapper: { code, message, data: [...] }
 * - Service trả trực tiếp array: [...]
 */
function unwrapList(res) {
  const level1 = res?.data ?? res;

  // array trực tiếp
  if (Array.isArray(level1)) return level1;

  // wrapper { code, message, data: [...] }
  if (level1 && typeof level1 === "object") {
    if (Array.isArray(level1.data)) return level1.data;

    // trường hợp { data: { code, message, data: [...] } }
    if (level1.data && typeof level1.data === "object") {
      if (Array.isArray(level1.data.data)) return level1.data.data;
    }
  }

  return [];
}

function unwrapSingle(res) {
  const level1 = res?.data ?? res;

  // wrapper { code, message, data: {...} }
  if (
    level1 &&
    typeof level1 === "object" &&
    level1.data &&
    !Array.isArray(level1.data)
  ) {
    return level1.data;
  }

  // { data: { code, message, data: {...} } }
  if (
    level1 &&
    typeof level1 === "object" &&
    level1.data &&
    typeof level1.data === "object" &&
    level1.data.data &&
    !Array.isArray(level1.data.data)
  ) {
    return level1.data.data;
  }

  // fallback
  return level1;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error] = useState(null);
  const [success, setSuccess] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // local editable role state
  const [roleDraft, setRoleDraft] = useState({}); // { userId: "ADMIN" }

  // Shared warning modal
  const [warning, setWarning] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const showWarning = (message, title = "Lưu ý!", onConfirm = null) => {
    setWarning({ open: true, title, message, onConfirm });
  };
  const closeWarning = () =>
    setWarning({ open: false, title: "", message: "", onConfirm: null });

  // ======= API CALLS =======

  const fetchUsers = async () => {
    try {
      setLoading(true);
setSuccess(null);

      const res = await AdminUserService.getUsers();
      const list = unwrapList(res);

      setUsers(list);

      // init roleDraft
      const draft = {};
      list.forEach((u) => {
        draft[u.userId] = getRole(u);
      });
      setRoleDraft(draft);
    } catch (err) {
      console.error("Fetch users error:", err);
      const msg = err?.message || "Không tải được danh sách người dùng.";
toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeRoleDraft = (userId, role) => {
    setRoleDraft((prev) => ({ ...prev, [userId]: role }));
  };

  const handleUpdateRole = async (userId) => {
    const newRole = (roleDraft[userId] || "").toUpperCase();
    if (!newRole) return;

    // không cho đổi role cho GUEST (theo rule UI)
    if (newRole === "GUEST") {
      toast.info("GUEST là khách vãng lai, không hỗ trợ đổi role ở UI.");
      return;
    }

    try {
      setUpdatingId(userId);
setSuccess(null);

      // Backend của bạn: body là JSON string (ví dụ "ADMIN")
      const payload = newRole;
      const res = await AdminUserService.updateUserRole(userId, payload);
      const updated = unwrapSingle(res);

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === userId
            ? {
                ...u,
                ...(updated && typeof updated === "object" ? updated : {}),
                role: newRole,
              }
            : u
        )
      );

      toast.success(`Cập nhật quyền thành công (${newRole}).`);
    } catch (err) {
      console.error("Update role error:", err);
      const msg = err?.message || "Cập nhật quyền thất bại.";
toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = async () => {
      try {
        setDeletingId(userId);
setSuccess(null);

        await AdminUserService.deleteUser(userId);

        setUsers((prev) => prev.filter((u) => u.userId !== userId));
        toast.success("Xóa user thành công.");
      } catch (err) {
        console.error("Delete user error:", err);
        const msg = err?.message || "Xóa user thất bại.";
toast.error(msg);
      } finally {
        setDeletingId(null);
        closeWarning();
      }
    };

    showWarning("Bạn chắc chắn muốn xóa user này?", "Lưu ý!", confirmDelete);
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
        const role = getRole(u);
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
      const role = getRole(u);
      if (role === "ADMIN") admins++;
      else if (role === "GUEST") guests++;
      else members++;
    });

    return { total, admins, members, guests };
  }, [users]);

  // ======= RENDER =======

  return (
    <div className="space-y-8 lg:space-y-10">
      <WarningModal
        open={warning.open}
        title={warning.title}
        message={warning.message}
        onCancel={closeWarning}
        onConfirm={warning.onConfirm}
      />

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

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <StatCard
          label="Guest"
          value={stats.guests}
          gradient="from-amber-400/80 via-orange-400/70 to-rose-400/70"
        />
      </section>

      {/* Filters */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-end justify-between">
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
                <option value="GUEST">Guest</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all md:self-end"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </section>

      {/* Alerts */}
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

      {/* Table */}
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
                    const role = getRole(u);
                    const draftRole = (
                      roleDraft[u.userId] || role
                    )?.toUpperCase();

                    const isGuest = role === "GUEST";
                    const canEditRole = !isGuest; // guest: chỉ xem
                    const tierName =
                      u?.membershipTier?.name || u?.membershipTierName || "—";
                    const points = Number(u?.loyaltyPoints ?? 0);

                    const avatarUrl = u?.avatarUrl || u?.avatarURL;
                    const displayName = u.username || u.email || "U";

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
                                <div className="h-full w-full rounded-2xl bg-[#050012] flex items-center justify-center overflow-hidden">
                                  <UserAvatar url={avatarUrl} name={displayName} />
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
                            {u.email || <span className="text-white/40">—</span>}
                          </div>
                          <div className="text-[11px] text-white/60 mt-0.5">
                            {u.phoneNumber || (
                              <span className="text-white/40">Chưa cập nhật</span>
                            )}
                          </div>
                        </td>

                        {/* Loyalty */}
                        <td className="py-3 px-4 align-top hidden lg:table-cell">
                          {role === "ADMIN" ? (
                            <div className="text-xs text-white/40">—</div>
                          ) : (
                            <>
                              <div className="text-xs text-emerald-300 font-semibold">
                                {String(tierName).toUpperCase()}
                              </div>
                              <div className="text-[11px] text-white/60 mt-0.5">
                                Điểm tích lũy:{" "}
                                <span className="font-semibold text-emerald-200">
                                  {Number.isFinite(points) ? points : 0}
                                </span>
                              </div>
                            </>
                          )}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4 align-top">
                          <select
                            value={draftRole}
                            onChange={(e) =>
                              handleChangeRoleDraft(u.userId, e.target.value)
                            }
                            disabled={!canEditRole}
                            className={`role-select rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
             border border-cyan-400/60 px-4 py-2 text-[11px] font-semibold text-white
             shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
             focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
             transition-all ${!canEditRole ? "opacity-70 cursor-not-allowed" : ""}`}
                            title={
                              !canEditRole
                                ? "GUEST là khách vãng lai, UI không cho đổi role."
                                : ""
                            }
                          >
                            {ROLE_OPTIONS_RENDER.map((r) => (
                              <option
                                key={r}
                                value={r}
                                disabled={
                                  r === "GUEST" &&
                                  ROLE_OPTIONS_EDITABLE.indexOf("GUEST") === -1
                                }
                              >
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
                              disabled={updatingId === u.userId || !canEditRole}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                              title={!canEditRole ? "Không đổi role cho GUEST" : ""}
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

function UserAvatar({ url, name }) {
  const [broken, setBroken] = useState(false);
  const initial = (name || "U").charAt(0).toUpperCase();

  if (!url || broken) {
    return <span className="text-xs font-bold text-white">{initial}</span>;
  }

  return (
    <img
      src={url}
      alt={name || "avatar"}
      className="h-full w-full object-cover"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
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
        <p className="mt-2 text-xl md:text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}
