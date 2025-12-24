// src/app/(admin)/pricing/page.jsx
import { useEffect, useMemo, useState } from "react";
import WarningModal from "@/components/shared/WarningModal";
import { AdminPricingService } from "@/api/adminservice";
import { toast } from "react-toastify";

const CONDITION_TYPES = [
  "SEAT_TYPE", // COUPLE
  "FORMAT", //2D 3D
  "DAY_TYPE", // WEEKEND , MONDAY, ....
  "TIME_RANGE", // MORNING , EVENING,...
  "ROOM_TYPE", //STANDARD, IMAX, STARIUM
];

const MODIFIER_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"];

export default function AdminPricingPage() {
  const [priceBases, setPriceBases] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  const getBaseId = (b) =>
    b?.priceBaseId || b?.id || b?.price_base_id || b?.priceBaseID;

  // ====== FORM STATE ======
  // Base price
  const [baseForm, setBaseForm] = useState({
    name: "",
    basePrice: "",
    isActive: true,
  });
  const [editingBaseId, setEditingBaseId] = useState(null);

  // Price modifier
  const [modifierForm, setModifierForm] = useState({
    name: "",
    conditionType: "SEAT_TYPE",
    conditionValue: "",
    modifierType: "FIXED_AMOUNT",
    modifierValue: "",
    isActive: true,
  });
  const [editingModifierId, setEditingModifierId] = useState(null);

  // Ticket type
  const [ticketTypeForm, setTicketTypeForm] = useState({
    code: "",
    label: "",
    modifierType: "FIXED_AMOUNT",
    modifierValue: 0,
    active: true,
    sortOrder: 0,
  });
  const [editingTicketTypeId, setEditingTicketTypeId] = useState(null);

  const [savingSection, setSavingSection] = useState(null); // "base" | "modifier" | "ticket"
  const [deletingId, setDeletingId] = useState(null);

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

  // Local UI state for form visibility
  const [showBaseForm, setShowBaseForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showModifierForm, setShowModifierForm] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
const [baseRes, modRes, ticketRes] = await Promise.all([
        AdminPricingService.getPriceBases(),
        AdminPricingService.getPriceModifiers(),
        AdminPricingService.getAdminTicketTypes(),
      ]);

      const unwrap = (res) =>
        Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      setPriceBases(unwrap(baseRes));
      setModifiers(unwrap(modRes));
      setTicketTypes(unwrap(ticketRes));
    } catch (err) {
      console.error("AdminPricing loadAll error:", err);
      const msg = err?.message || "Không tải được dữ liệu pricing.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const activePriceBase = useMemo(
    () => priceBases.find((b) => b.isActive),
    [priceBases]
  );

  // ========== HANDLERS: BASE PRICE ==========

  const resetBaseForm = () => {
    setEditingBaseId(null);
    setBaseForm({
      name: "",
      basePrice: "",
      isActive: true,
    });
  };

  const handleBaseChange = (field, value) => {
    setBaseForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditBase = (b) => {
    const id = getBaseId(b);
    setEditingBaseId(id);

    setBaseForm({
      name: b.name || "",
      basePrice:
        b.basePrice !== null && b.basePrice !== undefined
          ? String(b.basePrice)
          : "",
      isActive: !!b.isActive,
    });
setShowBaseForm(true);
  };

  const openCreateBase = () => {
    resetBaseForm();
setShowBaseForm(true);
  };

  async function handleSaveBase(e) {
    e.preventDefault();

    if (!baseForm.name.trim()) {
      const msg = "Vui lòng nhập tên base price.";
      toast.error(msg);
      return;
    }

    // Tạo mới: cần basePrice
    if (
      !editingBaseId &&
      (!baseForm.basePrice || Number(baseForm.basePrice) <= 0)
    ) {
      const msg = "Vui lòng nhập giá base > 0.";
      toast.error(msg);
      return;
    }

    try {
      setSavingSection("base");
if (editingBaseId) {
        // UPDATE
        const payload = {
          name: baseForm.name.trim(),
          isActive: !!baseForm.isActive,
        };

        const res = await AdminPricingService.updatePriceBase(
          editingBaseId,
          payload
        );
        const updated = res?.data || res;

        setPriceBases((prev) =>
          prev.map((b) => {
            const bid = getBaseId(b);
            if (bid !== editingBaseId) return b;
            return {
              ...b,
              ...updated,
              priceBaseId: updated?.priceBaseId || bid,
              id: updated?.id ?? b?.id,
            };
          })
        );

        toast.success("Cập nhật base price thành công.");
      } else {
        // CREATE
        const payload = {
          name: baseForm.name.trim(),
          basePrice: Number(baseForm.basePrice),
        };

        const res = await AdminPricingService.createPriceBase(payload);
        const created = res?.data || res;

        setPriceBases((prev) => [created, ...prev]);
        toast.success("Thêm base price thành công.");
      }

      resetBaseForm();
      setShowBaseForm(false);
    } catch (err) {
      console.error("Save base price error:", err);
      const msg = err?.message || "Lưu base price thất bại.";
      toast.error(msg);
    } finally {
      setSavingSection(null);
    }
  }

  // delete base price
  async function handleDeleteBase(id) {
    const confirmDelete = async () => {
      try {
        setDeletingId(id);
await AdminPricingService.deletePriceBase(id);

        setPriceBases((prev) => prev.filter((b) => getBaseId(b) !== id));
        toast.success("Xóa base price thành công.");
      } catch (err) {
        console.error("Delete base price error:", err);
        const msg =
          err?.message ||
          "Xóa base price thất bại. Có thể base price đang được sử dụng.";
        toast.error(msg);
      } finally {
        setDeletingId(null);
        closeWarning();
      }
    };

    showWarning(
      "Bạn chắc chắn muốn xóa base price này? Nếu đang được sử dụng, hệ thống có thể không cho phép xóa.",
      "Lưu ý!",
      confirmDelete
    );
  }

  // ========== HANDLERS: PRICE MODIFIER ==========

  const resetModifierForm = () => {
    setEditingModifierId(null);
    setModifierForm({
      name: "",
      conditionType: "SEAT_TYPE",
      conditionValue: "",
      modifierType: "FIXED_AMOUNT",
      modifierValue: "",
      isActive: true,
    });
  };

  const handleModifierChange = (field, value) => {
    setModifierForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditModifier = (m) => {
    setEditingModifierId(m.priceModifierId);
    setModifierForm({
      name: m.name || "",
      conditionType: m.conditionType || "SEAT_TYPE",
      conditionValue: m.conditionValue || "",
      modifierType: m.modifierType || "FIXED_AMOUNT",
      modifierValue:
        m.modifierValue !== null && m.modifierValue !== undefined
          ? String(m.modifierValue)
          : "",
      isActive: m.isActive ?? true,
    });
setShowModifierForm(true);
  };

  async function handleSaveModifier(e) {
    e.preventDefault();

    if (!modifierForm.name.trim()) {
      const msg = "Vui lòng nhập tên modifier.";
      toast.error(msg);
      return;
    }
    if (!editingModifierId && !modifierForm.conditionValue.trim()) {
      const msg = "Vui lòng nhập condition value khi tạo modifier mới.";
      toast.error(msg);
      return;
    }

    try {
      setSavingSection("modifier");
if (editingModifierId) {
        // UPDATE
        const payload = {
          name: modifierForm.name.trim(),
          isActive: !!modifierForm.isActive,
        };
        const res = await AdminPricingService.updatePriceModifier(
          editingModifierId,
          payload
        );
        const updated = res?.data || res;

        setModifiers((prev) =>
          prev.map((m) =>
            m.priceModifierId === updated.priceModifierId ? updated : m
          )
        );

        toast.success("Cập nhật price modifier thành công.");
      } else {
        // CREATE
        const payload = {
          name: modifierForm.name.trim(),
          conditionType: modifierForm.conditionType,
          conditionValue: modifierForm.conditionValue.trim(),
          modifierType: modifierForm.modifierType,
          modifierValue: Number(modifierForm.modifierValue),
          isActive: !!modifierForm.isActive,
        };
        const res = await AdminPricingService.createPriceModifier(payload);
        const created = res?.data || res;

        setModifiers((prev) => [created, ...prev]);
        toast.success("Thêm price modifier thành công.");
      }

      resetModifierForm();
      setShowModifierForm(false);
    } catch (err) {
      console.error("Save modifier error:", err);
      const msg = err?.message || "Lưu price modifier thất bại.";
      toast.error(msg);
    } finally {
      setSavingSection(null);
    }
  }

  async function handleDeleteModifier(id) {
    const confirmDelete = async () => {
      try {
        setDeletingId(id);
await AdminPricingService.deletePriceModifier(id);
        setModifiers((prev) => prev.filter((m) => m.priceModifierId !== id));

        toast.success("Xóa modifier thành công.");
      } catch (err) {
        console.error("Delete modifier error:", err);
        const msg = err?.message || "Xóa modifier thất bại.";
        toast.error(msg);
      } finally {
        setDeletingId(null);
        closeWarning();
      }
    };

    showWarning("Xóa modifier này?", "Lưu ý!", confirmDelete);
  }

  // ========== HANDLERS: TICKET TYPE ==========

  const resetTicketTypeForm = () => {
    setEditingTicketTypeId(null);
    setTicketTypeForm({
      code: "",
      label: "",
      modifierType: "FIXED_AMOUNT",
      modifierValue: 0,
      active: true,
      sortOrder: 0,
    });
  };

  const handleTicketTypeChange = (field, value) => {
    setTicketTypeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditTicketType = (t) => {
    setEditingTicketTypeId(t.ticketTypeId);
    setTicketTypeForm({
      code: t.code || "",
      label: t.label || "",
      modifierType: t.modifierType || "FIXED_AMOUNT",
      modifierValue:
        t.modifierValue !== null && t.modifierValue !== undefined
          ? t.modifierValue
          : 0,
      active: t.active ?? true,
      sortOrder: t.sortOrder ?? 0,
    });
setShowTicketForm(true);
  };

  async function handleSaveTicketType(e) {
    e.preventDefault();

    if (!ticketTypeForm.code.trim() && !editingTicketTypeId) {
      const msg = "Vui lòng nhập code cho ticket type.";
      toast.error(msg);
      return;
    }
    if (!ticketTypeForm.label.trim()) {
      const msg = "Vui lòng nhập label cho ticket type.";
      toast.error(msg);
      return;
    }

    try {
      setSavingSection("ticket");
if (editingTicketTypeId) {
        // UPDATE
        const payload = {
          label: ticketTypeForm.label.trim(),
          modifierType: ticketTypeForm.modifierType,
          modifierValue: Number(ticketTypeForm.modifierValue),
          active: !!ticketTypeForm.active,
          sortOrder: Number(ticketTypeForm.sortOrder) || 0,
        };
        const res = await AdminPricingService.updateTicketType(
          editingTicketTypeId,
          payload
        );
        const updated = res?.data || res;

        setTicketTypes((prev) =>
          prev.map((t) =>
            t.ticketTypeId === updated.ticketTypeId ? updated : t
          )
        );

        toast.success("Cập nhật ticket type thành công.");
      } else {
        // CREATE
        const payload = {
          code: ticketTypeForm.code.trim(),
          label: ticketTypeForm.label.trim(),
          modifierType: ticketTypeForm.modifierType,
          modifierValue: Number(ticketTypeForm.modifierValue),
          active: !!ticketTypeForm.active,
          sortOrder: Number(ticketTypeForm.sortOrder) || 0,
        };

        const res = await AdminPricingService.createTicketType(payload);
        const created = res?.data || res;

        setTicketTypes((prev) => [...prev, created]);
        toast.success("Thêm ticket type thành công.");
      }

      resetTicketTypeForm();
      setShowTicketForm(false);
    } catch (err) {
      console.error("Save ticket type error:", err);
      const msg = err?.message || "Lưu ticket type thất bại.";
      toast.error(msg);
    } finally {
      setSavingSection(null);
    }
  }

  async function handleDeleteTicketType(id) {
    const confirmDelete = async () => {
      try {
        setDeletingId(id);
await AdminPricingService.deleteTicketType(id);
        setTicketTypes((prev) => prev.filter((t) => t.ticketTypeId !== id));

        toast.success("Xóa ticket type thành công.");
      } catch (err) {
        console.error("Delete ticket type error:", err);
        const msg = err?.message || "Xóa ticket type thất bại.";
        toast.error(msg);
      } finally {
        setDeletingId(null);
        closeWarning();
      }
    };

    showWarning("Xóa ticket type này?", "Lưu ý!", confirmDelete);
  }

  // ========== RENDER ==========

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Shared warning modal */}
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
          ADMIN • PRICING
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Cấu hình giá vé
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Quản lý base price, các price modifier (theo loại ghế, suất chiếu…) và
          ticket types cho hệ thống.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* 2 cột chính, luôn cao ~80vh */}
      <section className="grid lg:grid-cols-[1.2fr,1.4fr] xl:grid-cols-[1.2fr,1.8fr] gap-6 lg:gap-8 items-start min-h-[70vh]">
        {/* Left: base price + ticket types */}
        <div className="flex flex-col gap-6">
          {/* Base price card */}
          <div className="relative flex-[1.1] rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0c001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-emerald-500/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />
            <div className="relative p-4 md:p-6 space-y-4 flex flex-col h-full">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-white/80">
                  Base price
                </h2>
                {activePriceBase && (
                  <span className="inline-flex items-center rounded-2xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-emerald-100">
                    Active: {activePriceBase.name}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    showBaseForm ? setShowBaseForm(false) : openCreateBase()
                  }
                  className="rounded-2xl px-3 py-1.5 text-[11px] font-semibold uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black hover:brightness-110 transition-all"
                >
                  {showBaseForm ? "Đóng form" : "+ Thêm base price"}
                </button>

                {editingBaseId && (
                  <span className="text-[11px] text-amber-200 border border-amber-400/40 bg-amber-500/10 px-3 py-1 rounded-2xl font-semibold uppercase tracking-[0.14em]">
                    Đang sửa
                  </span>
                )}
              </div>

              {/* Base form (collapsible) */}
              {showBaseForm && (
                <form
                  onSubmit={handleSaveBase}
                  className="space-y-3 text-xs md:text-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[2fr,1.4fr] gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                        Tên base price
                      </label>
                      <input
                        type="text"
                        value={baseForm.name}
                        onChange={(e) =>
                          handleBaseChange("name", e.target.value)
                        }
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
                        disabled={!!editingBaseId}
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-[11px] text-white/70">
                      <input
                        type="checkbox"
                        checked={baseForm.isActive}
                        onChange={(e) =>
                          handleBaseChange("isActive", e.target.checked)
                        }
                        className="rounded border-white/30 bg-transparent text-emerald-400 focus:ring-emerald-400/50"
                      />
                      ACTIVE
                    </label>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    {editingBaseId && (
                      <button
                        type="button"
                        onClick={() => {
                          resetBaseForm();
                          setShowBaseForm(false);
                        }}
                        className="text-[11px] font-semibold tracking-[0.16em] uppercase rounded-2xl border border-white/20 px-3 py-2 text-white/70 hover:bg-white/10 transition-all"
                      >
                        Hủy chỉnh sửa
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={savingSection === "base"}
                      className="ml-auto rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      {savingSection === "base"
                        ? "Đang lưu..."
                        : editingBaseId
                        ? "Lưu thay đổi"
                        : "Thêm mới"}
                    </button>
                  </div>
                </form>
              )}

              {/* List base price */}
              <div className="mt-2 flex-1 overflow-y-auto">
                {loading ? (
                  <p className="text-[11px] text-white/60">
                    Đang tải base price...
                  </p>
                ) : priceBases.length === 0 ? (
                  <p className="text-[11px] text-white/60">
                    Chưa có base price nào.
                  </p>
                ) : (
                  <ul className="space-y-1 text-[11px] text-white/70">
                    {priceBases.map((b) => {
                      const bid = getBaseId(b);
                      return (
                        <li
                          key={bid}
                          className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 border border-white/10 gap-3"
                        >
                          <div>
                            <p className="font-semibold flex items-center gap-2">
                              {b.name}
                              {b.isActive && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/60 text-emerald-300 font-semibold">
                                  ACTIVE
                                </span>
                              )}
                            </p>
                            <p className="text-white/50">
                              {b.basePrice?.toLocaleString("vi-VN")}₫
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditBase(b)}
                              className="text-[10px] rounded-2xl border border-white/30 bg-white/5 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/10 transition-all"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBase(bid)}
                              disabled={deletingId === bid}
                              className="text-[10px] rounded-2xl border border-red-500/60 bg-red-500/10 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {deletingId === bid ? "Đang xóa..." : "Xóa"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Ticket types card */}
          <div className="relative flex-[1] rounded-3xl overflow-hidden bg-gradient-to-br from-[#150032]/90 via-[#070018] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
            <div className="relative p-4 md:p-6 space-y-4 flex flex-col h-full">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-white/80">
                  Ticket types
                </h2>
                <span className="text-[11px] text-white/50">
                  {ticketTypes.length} loại vé
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowTicketForm((v) => !v)}
                  className="rounded-2xl px-3 py-1.5 text-[11px] font-semibold uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black hover:brightness-110 transition-all"
                >
                  {showTicketForm ? "Đóng" : "Thêm ticket type"}
                </button>
              </div>

              {/* Ticket form (collapsible) */}
              {showTicketForm && (
                <form
                  onSubmit={handleSaveTicketType}
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
                        disabled={!!editingTicketTypeId}
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                          handleTicketTypeChange("modifierType", e.target.value)
                        }
                        className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                        border border-cyan-400/60 px-3 py-2.5 text-xs md:text-sm font-semibold text-white
                        shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                        focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                        transition-all"
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

                  <div className="pt-2 flex items-center justify-between gap-3">
                    {editingTicketTypeId && (
                      <button
                        type="button"
                        onClick={resetTicketTypeForm}
                        className="text-[11px] font-semibold tracking-[0.16em] uppercase rounded-2xl border border-white/20 px-3 py-1.5 text-white/70 hover:bg-white/10 transition-all"
                      >
                        Hủy chỉnh sửa
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingSection === "ticket"}
                      className="ml-auto rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      {savingSection === "ticket"
                        ? "Đang lưu..."
                        : editingTicketTypeId
                        ? "Lưu thay đổi"
                        : "Thêm ticket type"}
                    </button>
                  </div>
                </form>
              )}

              {/* Ticket types list */}
              <div className="mt-2 flex-1 overflow-y-auto">
                {loading ? (
                  <p className="text-[11px] text-white/60">
                    Đang tải ticket types...
                  </p>
                ) : ticketTypes.length === 0 ? (
                  <p className="text-[11px] text-white/60">
                    Chưa có ticket type nào.
                  </p>
                ) : (
                  <ul className="space-y-1 text-[11px] text-white/70">
                    {ticketTypes
                      .slice()
                      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                      .map((t) => (
                        <li
                          key={t.ticketTypeId}
                          className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 border border-white/10 gap-3"
                        >
                          <div>
                            <p className="font-semibold flex items-center gap-2">
                              {t.label}{" "}
                              <span className="text-white/60">({t.code})</span>
                              {t.active === false && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/20 text-white/60">
                                  INACTIVE
                                </span>
                              )}
                            </p>
                            <p className="text-white/50">
                              {t.modifierType} {t.modifierValue}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditTicketType(t)}
                              className="text-[10px] rounded-2xl border border-white/30 bg-white/5 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/10 transition-all"
                            >
                              Sửa
                            </button>
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
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: modifiers list + form */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1b0035]/90 via-[#08001a] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-rose-500/20 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
          <div className="relative p-4 md:p-6 space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-white/80">
                Price modifiers
              </h2>
              <span className="text-[11px] text-white/50">
                {modifiers.length} modifiers
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowModifierForm((v) => !v)}
                className="rounded-2xl px-3 py-1.5 text-[11px] font-semibold uppercase bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-black hover:brightness-110 transition-all"
              >
                {showModifierForm ? "Đóng" : "Thêm modifier"}
              </button>
            </div>

            {/* Modifier form (collapsible) */}
            {showModifierForm && (
              <form
                onSubmit={handleSaveModifier}
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
                      disabled={!!editingModifierId}
                      className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                      border border-cyan-400/60 px-3 py-2.5 text-xs md:text-sm font-semibold text-white
                      shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                      focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                      transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                      disabled={!!editingModifierId}
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-white/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                      disabled={!!editingModifierId}
                      className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                      border border-cyan-400/60 px-3 py-2.5 text-xs md:text-sm font-semibold text-white
                      shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                      focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                      transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                        handleModifierChange("modifierValue", e.target.value)
                      }
                      placeholder="20000 hoặc 10 (%)"
                      disabled={!!editingModifierId}
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-white/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[11px] text-white/70">
                    <input
                      type="checkbox"
                      checked={modifierForm.isActive}
                      onChange={(e) =>
                        handleModifierChange("isActive", e.target.checked)
                      }
                      className="rounded border-white/30 bg-transparent text-amber-400 focus:ring-amber-400/50"
                    />
                    Active
                  </label>

                  {editingModifierId && (
                    <button
                      type="button"
                      onClick={resetModifierForm}
                      className="text-[11px] font-semibold tracking-[0.16em] uppercase rounded-2xl border border-white/20 px-3 py-1.5 text-white/70 hover:bg-white/10 transition-all"
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSection === "modifier"}
                    className="rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-black shadow-md shadow-amber-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {savingSection === "modifier"
                      ? "Đang lưu..."
                      : editingModifierId
                      ? "Lưu thay đổi"
                      : "Thêm modifier"}
                  </button>
                </div>
              </form>
            )}

            {/* Modifiers list */}
            <div className="mt-3 flex-1 overflow-y-auto">
              {loading ? (
                <p className="text-[11px] text-white/60">
                  Đang tải modifiers...
                </p>
              ) : modifiers.length === 0 ? (
                <p className="text-[11px] text-white/60">
                  Chưa có price modifier nào.
                </p>
              ) : (
                <ul className="space-y-1 text-[11px] text-white/80">
                  {modifiers.map((m) => (
                    <li
                      key={m.priceModifierId}
                      className="flex items-start justify-between gap-2 rounded-2xl bg-white/5 px-3 py-2 border border-white/10"
                    >
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {m.name}
                          {m.isActive === false && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/20 text-white/60">
                              INACTIVE
                            </span>
                          )}
                        </p>
                        <p className="text-white/60">
                          {m.conditionType} ={" "}
                          <span className="font-mono">{m.conditionValue}</span>
                        </p>
                        <p className="text-white/50">
                          {m.modifierType} {m.modifierValue}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditModifier(m)}
                          className="mt-1 text-[10px] rounded-2xl border border-white/30 bg-white/5 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/10 transition-all"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModifier(m.priceModifierId)}
                          disabled={deletingId === m.priceModifierId}
                          className="text-[10px] rounded-2xl border border-red-500/60 bg-red-500/10 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                          {deletingId === m.priceModifierId
                            ? "Đang xóa..."
                            : "Xóa"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
