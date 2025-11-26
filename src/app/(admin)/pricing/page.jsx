// src/app/(admin)/pricing/page.jsx
import { useEffect, useMemo, useState } from "react";
import { AdminPricingService } from "@/api/adminservice";

const CONDITION_TYPES = [
  "SEAT_TYPE",
  "SHOWTIME_FORMAT",
  "DAY_OF_WEEK",
  "TIME_RANGE",
  "CINEMA",
];

const MODIFIER_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"];

export default function AdminPricingPage() {
  const [priceBases, setPriceBases] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // form state
  const [baseForm, setBaseForm] = useState({
    name: "",
    basePrice: "",
  });
  const [modifierForm, setModifierForm] = useState({
    name: "",
    conditionType: "SEAT_TYPE",
    conditionValue: "",
    modifierType: "FIXED_AMOUNT",
    modifierValue: "",
  });
  const [ticketTypeForm, setTicketTypeForm] = useState({
    code: "",
    label: "",
    modifierType: "FIXED_AMOUNT",
    modifierValue: 0,
    active: true,
    sortOrder: 0,
  });

  const [savingSection, setSavingSection] = useState(null); // "base" | "modifier" | "ticket"
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const [baseRes, modRes, ticketRes] = await Promise.all([
        AdminPricingService.getAllPriceBases(),
        AdminPricingService.getAllPriceModifiers(),
        AdminPricingService.getTicketTypesAdmin(),
      ]);

      const unwrap = (res) =>
        Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      setPriceBases(unwrap(baseRes));
      setModifiers(unwrap(modRes));
      setTicketTypes(unwrap(ticketRes));
    } catch (err) {
      console.error("AdminPricing loadAll error:", err);
      setError(err?.message || "Không tải được dữ liệu pricing.");
    } finally {
      setLoading(false);
    }
  }

  const activePriceBase = useMemo(
    () => priceBases.find((b) => b.isActive),
    [priceBases]
  );

  // ========== HANDLERS ==========

  const handleBaseChange = (field, value) => {
    setBaseForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleCreateBase(e) {
    e.preventDefault();
    if (!baseForm.name || !baseForm.basePrice) {
      setError("Vui lòng nhập tên và giá base.");
      return;
    }

    try {
      setSavingSection("base");
      setError(null);
      setSuccess(null);

      const payload = {
        name: baseForm.name.trim(),
        basePrice: Number(baseForm.basePrice),
      };
      const res = await AdminPricingService.createPriceBase(payload);
      const created = res?.data || res;

      setPriceBases((prev) => [created, ...prev]);
      setBaseForm({ name: "", basePrice: "" });
      setSuccess("Thêm base price thành công.");
    } catch (err) {
      console.error("Create base price error:", err);
      setError(err?.message || "Thêm base price thất bại.");
    } finally {
      setSavingSection(null);
    }
  }

  const handleModifierChange = (field, value) => {
    setModifierForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleCreateModifier(e) {
    e.preventDefault();
    if (!modifierForm.name || !modifierForm.conditionValue) {
      setError("Vui lòng nhập đầy đủ thông tin modifier.");
      return;
    }

    try {
      setSavingSection("modifier");
      setError(null);
      setSuccess(null);

      const payload = {
        name: modifierForm.name.trim(),
        conditionType: modifierForm.conditionType,
        conditionValue: modifierForm.conditionValue.trim(),
        modifierType: modifierForm.modifierType,
        modifierValue: Number(modifierForm.modifierValue),
      };
      const res = await AdminPricingService.createPriceModifier(payload);
      const created = res?.data || res;
      setModifiers((prev) => [created, ...prev]);
      setModifierForm({
        name: "",
        conditionType: "SEAT_TYPE",
        conditionValue: "",
        modifierType: "FIXED_AMOUNT",
        modifierValue: "",
      });
      setSuccess("Thêm price modifier thành công.");
    } catch (err) {
      console.error("Create modifier error:", err);
      setError(err?.message || "Thêm price modifier thất bại.");
    } finally {
      setSavingSection(null);
    }
  }

  const handleTicketTypeChange = (field, value) => {
    setTicketTypeForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleCreateTicketType(e) {
    e.preventDefault();
    if (!ticketTypeForm.code || !ticketTypeForm.label) {
      setError("Vui lòng nhập code và label cho ticket type.");
      return;
    }

    try {
      setSavingSection("ticket");
      setError(null);
      setSuccess(null);

      const payload = {
        code: ticketTypeForm.code.trim(),
        label: ticketTypeForm.label.trim(),
        modifierType: ticketTypeForm.modifierType,
        modifierValue: Number(ticketTypeForm.modifierValue),
        active: ticketTypeForm.active,
        sortOrder: Number(ticketTypeForm.sortOrder) || 0,
      };

      const res = await AdminPricingService.createTicketType(payload);
      const created = res?.data || res;

      setTicketTypes((prev) => [...prev, created]);
      setTicketTypeForm({
        code: "",
        label: "",
        modifierType: "FIXED_AMOUNT",
        modifierValue: 0,
        active: true,
        sortOrder: 0,
      });
      setSuccess("Thêm ticket type thành công.");
    } catch (err) {
      console.error("Create ticket type error:", err);
      setError(err?.message || "Thêm ticket type thất bại.");
    } finally {
      setSavingSection(null);
    }
  }

  async function handleDeleteModifier(id) {
    if (!window.confirm("Xóa modifier này?")) return;
    try {
      setDeletingId(id);
      setError(null);
      setSuccess(null);
      await AdminPricingService.deletePriceModifier(id);
      setModifiers((prev) => prev.filter((m) => m.priceModifierId !== id));
      setSuccess("Xóa modifier thành công.");
    } catch (err) {
      console.error("Delete modifier error:", err);
      setError(err?.message || "Xóa modifier thất bại.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteTicketType(id) {
    if (!window.confirm("Xóa ticket type này?")) return;
    try {
      setDeletingId(id);
      setError(null);
      setSuccess(null);
      await AdminPricingService.deleteTicketType(id);
      setTicketTypes((prev) => prev.filter((t) => t.ticketTypeId !== id));
      setSuccess("Xóa ticket type thành công.");
    } catch (err) {
      console.error("Delete ticket type error:", err);
      setError(err?.message || "Xóa ticket type thất bại.");
    } finally {
      setDeletingId(null);
    }
  }

  // ========== RENDER ==========

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • PRICING
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Cấu hình giá vé
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Quản lý base price, các price modifier (theo loại ghế, suất chiếu…)
          và ticket types cho hệ thống.
        </p>
      </header>

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

      {/* 3 cột chính */}
      <section className="grid lg:grid-cols-[1.2fr,1.4fr] xl:grid-cols-[1.2fr,1.8fr] gap-6 lg:gap-8">
        {/* Left: base price + ticket types (form) */}
        <div className="space-y-6">
          {/* Base price */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0c001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-emerald-500/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />
            <div className="relative p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-white/80">
                  Base price
                </h2>
                {activePriceBase && (
                  <span className="inline-flex items-center rounded-2xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-emerald-100">
                    Active: {activePriceBase.name}
                  </span>
                )}
              </div>

              <form
                onSubmit={handleCreateBase}
                className="space-y-3 text-xs md:text-sm"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                    Tên base price
                  </label>
                  <input
                    type="text"
                    value={baseForm.name}
                    onChange={(e) => handleBaseChange("name", e.target.value)}
                    placeholder="Standard Base Price 2025..."
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={baseForm.basePrice}
                    onChange={(e) =>
                      handleBaseChange("basePrice", e.target.value)
                    }
                    placeholder="80000"
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSection === "base"}
                    className="rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {savingSection === "base"
                      ? "Đang lưu..."
                      : "Thêm / cập nhật"}
                  </button>
                </div>
              </form>

              {loading ? (
                <p className="text-[11px] text-white/60">Đang tải base price...</p>
              ) : priceBases.length === 0 ? (
                <p className="text-[11px] text-white/60">
                  Chưa có base price nào.
                </p>
              ) : (
                <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto text-[11px] text-white/70">
                  {priceBases.map((b) => (
                    <li
                      key={b.priceBaseId}
                      className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 border border-white/10"
                    >
                      <div>
                        <p className="font-semibold">{b.name}</p>
                        <p className="text-white/50">
                          {b.basePrice?.toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                      {b.isActive && (
                        <span className="text-[10px] text-emerald-300 font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Ticket types */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#150032]/90 via-[#070018] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
            <div className="relative p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-white/80">
                  Ticket types
                </h2>
                <span className="text-[11px] text-white/50">
                  {ticketTypes.length} loại vé
                </span>
              </div>

              <form
                onSubmit={handleCreateTicketType}
                className="space-y-3 text-xs md:text-sm"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                      Code
                    </label>
                    <input
                      type="text"
                      value={ticketTypeForm.code}
                      onChange={(e) =>
                        handleTicketTypeChange("code", e.target.value)
                      }
                      placeholder="adult"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                      Nhãn
                    </label>
                    <input
                      type="text"
                      value={ticketTypeForm.label}
                      onChange={(e) =>
                        handleTicketTypeChange("label", e.target.value)
                      }
                      placeholder="Người lớn"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                      Modifier type
                    </label>
                    <select
                      value={ticketTypeForm.modifierType}
                      onChange={(e) =>
                        handleTicketTypeChange(
                          "modifierType",
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    >
                      <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
                      <option value="PERCENTAGE">PERCENTAGE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                      Modifier value
                    </label>
                    <input
                      type="number"
                      value={ticketTypeForm.modifierValue}
                      onChange={(e) =>
                        handleTicketTypeChange(
                          "modifierValue",
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[11px] text-white/70">
                    <input
                      type="checkbox"
                      checked={ticketTypeForm.active}
                      onChange={(e) =>
                        handleTicketTypeChange("active", e.target.checked)
                      }
                      className="rounded border-white/30 bg-transparent text-violet-400 focus:ring-violet-400/50"
                    />
                    Active
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/60">
                      Sort order
                    </span>
                    <input
                      type="number"
                      value={ticketTypeForm.sortOrder}
                      onChange={(e) =>
                        handleTicketTypeChange("sortOrder", e.target.value)
                      }
                      className="w-20 rounded-2xl bg-white/5 border border-white/15 px-3 py-1.5 text-xs text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSection === "ticket"}
                    className="rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {savingSection === "ticket"
                      ? "Đang lưu..."
                      : "Thêm ticket type"}
                  </button>
                </div>
              </form>

              {loading ? (
                <p className="text-[11px] text-white/60">
                  Đang tải ticket types...
                </p>
              ) : ticketTypes.length === 0 ? (
                <p className="text-[11px] text-white/60">
                  Chưa có ticket type nào.
                </p>
              ) : (
                <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto text-[11px] text-white/70">
                  {ticketTypes
                    .slice()
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((t) => (
                      <li
                        key={t.ticketTypeId}
                        className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 border border-white/10"
                      >
                        <div>
                          <p className="font-semibold">
                            {t.label}{" "}
                            <span className="text-white/60">
                              ({t.code})
                            </span>
                          </p>
                          <p className="text-white/50">
                            {t.modifierType} {t.modifierValue}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteTicketType(t.ticketTypeId)
                          }
                          disabled={deletingId === t.ticketTypeId}
                          className="text-[10px] rounded-2xl border border-red-500/60 bg-red-500/10 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                          {deletingId === t.ticketTypeId
                            ? "Đang xóa..."
                            : "Xóa"}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right: modifiers list + form */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1b0035]/90 via-[#08001a] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-rose-500/20 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
          <div className="relative p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-white/80">
                Price modifiers
              </h2>
              <span className="text-[11px] text-white/50">
                {modifiers.length} modifiers
              </span>
            </div>

            <form
              onSubmit={handleCreateModifier}
              className="space-y-3 text-xs md:text-sm"
            >
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                  Tên modifier
                </label>
                <input
                  type="text"
                  value={modifierForm.name}
                  onChange={(e) =>
                    handleModifierChange("name", e.target.value)
                  }
                  placeholder="VIP Seat Premium..."
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-white/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                    Condition type
                  </label>
                  <select
                    value={modifierForm.conditionType}
                    onChange={(e) =>
                      handleModifierChange("conditionType", e.target.value)
                    }
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-white/10 transition-all"
                  >
                    {CONDITION_TYPES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                    Condition value
                  </label>
                  <input
                    type="text"
                    value={modifierForm.conditionValue}
                    onChange={(e) =>
                      handleModifierChange("conditionValue", e.target.value)
                    }
                    placeholder="VIP / 2D / WEEKEND…"
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[1.2fr,0.8fr] gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                    Modifier type
                  </label>
                  <select
                    value={modifierForm.modifierType}
                    onChange={(e) =>
                      handleModifierChange("modifierType", e.target.value)
                    }
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-white/10 transition-all"
                  >
                    {MODIFIER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                    Giá trị
                  </label>
                  <input
                    type="number"
                    value={modifierForm.modifierValue}
                    onChange={(e) =>
                      handleModifierChange(
                        "modifierValue",
                        e.target.value
                      )
                    }
                    placeholder="20000 hoặc 10 (%)"
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSection === "modifier"}
                  className="rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-black shadow-md shadow-amber-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {savingSection === "modifier"
                    ? "Đang lưu..."
                    : "Thêm modifier"}
                </button>
              </div>
            </form>

            {loading ? (
              <p className="text-[11px] text-white/60">
                Đang tải modifiers...
              </p>
            ) : modifiers.length === 0 ? (
              <p className="text-[11px] text-white/60">
                Chưa có price modifier nào.
              </p>
            ) : (
              <div className="mt-3 max-h-72 overflow-y-auto">
                <ul className="space-y-1 text-[11px] text-white/80">
                  {modifiers.map((m) => (
                    <li
                      key={m.priceModifierId}
                      className="flex items-start justify-between gap-2 rounded-2xl bg-white/5 px-3 py-2 border border-white/10"
                    >
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-white/60">
                          {m.conditionType} ={" "}
                          <span className="font-mono">
                            {m.conditionValue}
                          </span>
                        </p>
                        <p className="text-white/50">
                          {m.modifierType} {m.modifierValue}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteModifier(m.priceModifierId)
                        }
                        disabled={deletingId === m.priceModifierId}
                        className="mt-1 text-[10px] rounded-2xl border border-red-500/60 bg-red-500/10 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                      >
                        {deletingId === m.priceModifierId
                          ? "Đang xóa..."
                          : "Xóa"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
