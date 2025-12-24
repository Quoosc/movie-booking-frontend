// src/app/(admin)/snacks/page.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminCinemaService } from "@/api/adminservice";
import { uploadSnackImage } from "@/api/cloudinaryService";
import { toast } from "react-toastify";

export default function AdminSnacksPage() {
  const [snacks, setSnacks] = useState([]);
  const [cinemas, setCinemas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingSnackImage, setUploadingSnackImage] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef(null);

  const [error] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warning, setWarning] = useState({
    open: false,
    title: "Lưu ý!",
    message: "",
    onConfirm: null,
  });

  // filter
  const [search, setSearch] = useState("");
  const [cinemaFilter, setCinemaFilter] = useState("ALL");

  // form
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    cinemaId: "",
    description: "",
    imageUrl: "",
    imageCloudinaryId: "",
  });

  // upload image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      category: "",
      cinemaId: "",
      description: "",
      imageUrl: "",
      imageCloudinaryId: "",
    });

    // clear upload
    setImageFile(null);
    if (imagePreview?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {
        // ignore
      }
    }
    setImagePreview("");
  };

  const handleChangeForm = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const showWarning = (message, title = "Lưu ý!", onConfirm = null) => {
    setWarning({
      open: true,
      title: title || "Lưu ý!",
      message: message || "Bạn chắc chắn muốn thực hiện thao tác này?",
      onConfirm,
    });
  };

  const closeWarning = () =>
    setWarning((prev) => ({ ...prev, open: false, onConfirm: null }));

  const handlePickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSnackImage(true);
      const { imageUrl, imageCloudinaryId } = await uploadSnackImage(file);

      setForm((prev) => ({
        ...prev,
        imageUrl,
        imageCloudinaryId,
      }));

      // preview dùng URL cloudinary luôn (đỡ blob)
      setImagePreview(imageUrl);
      setImageFile(null);
      toast.success("Upload ảnh thành công!");
    } catch (err) {
      console.error(err);
toast.error(err?.message || "Upload ảnh thất bại");
    } finally {
      setUploadingSnackImage(false);
      toast.dismiss(toastId);
    }
  };

  // ====== LOAD DATA ======
  const loadData = async () => {
    try {
      setLoading(true);
setSuccess(null);

      const [snackRes, cinemaRes] = await Promise.all([
        AdminCinemaService.getSnacks(),
        AdminCinemaService.getCinemas(),
      ]);

      setSnacks(Array.isArray(snackRes) ? snackRes : snackRes?.data || []);
      setCinemas(Array.isArray(cinemaRes) ? cinemaRes : cinemaRes?.data || []);
    } catch (err) {
      console.error("Load snacks/cinemas error:", err);
} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // cleanup blob url when unmount
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // chỉ reload snacks sau create/update/delete
  const reloadSnacks = async () => {
    try {
      const snackRes = await AdminCinemaService.getSnacks();
      setSnacks(Array.isArray(snackRes) ? snackRes : snackRes?.data || []);
    } catch (err) {
      console.error("Reload snacks error:", err);
}
  };

  // ====== CRUD ======
  const handleSubmit = async (e) => {
    e.preventDefault();
setSuccess(null);
    const isEdit = !!editingId;

    const name = form.name.trim();
    const priceNumber = Number(form.price);
    const category = form.category.trim(); // ← vẫn giữ tên category ở form
    const description = form.description.trim();
    const manualImageUrl = form.imageUrl.trim();
    const manualImageCloudinaryId = (form.imageCloudinaryId || "").trim();
    const cinemaId = form.cinemaId || null;

    if (!name) {
return;
    }
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
return;
    }
    if (!category) {
return;
    }

    try {
      setSaving(true);

      // Nếu user chọn file -> upload Cloudinary trước
      let finalImageUrl = manualImageUrl || null;
      let finalImageCloudinaryId = manualImageCloudinaryId || null;

      if (imageFile) {
        const uploaded = await uploadSnackImage(imageFile);
        finalImageUrl = uploaded.imageUrl;
        finalImageCloudinaryId = uploaded.imageCloudinaryId;
      }

      const payload = {
        name,
        price: priceNumber,
        cinemaId,
        type: category || null, // BE cần field `type`
        description: description || null,
        imageUrl: finalImageUrl,
        imageCloudinaryId: finalImageCloudinaryId,
      };

      if (editingId) {
        await AdminCinemaService.updateSnack(editingId, payload);
        toast.success("Cập nhật snack thành công!");
      } else {
        await AdminCinemaService.createSnack(payload);
        toast.success("Tạo bắp nước mới thành công!");
      }

      await reloadSnacks();
      resetForm();
      setFormOpen(false);
    } catch (err) {
      console.error("Save snack error:", err);
toast.error(err?.message || "Lưu snack thất bại");
    } finally {
      setSaving(false);
      toast.dismiss(toastId);
    }
  };

  const handleEditSnack = (snack) => {
    const id = snack.snackId || snack.id;
    setEditingId(id);

    setForm({
      name: snack.name || "",
      price: snack.price != null ? String(snack.price) : "",
      category: snack.category || snack.type || "", // lấy từ type nếu BE trả về
      cinemaId: snack.cinemaId || "",
      description: snack.description || "",
      imageUrl: snack.imageUrl || "",
      imageCloudinaryId: snack.imageCloudinaryId || "",
    });
    setFormOpen(true);
    setTimeout(
      () =>
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );

    // clear file selection when switching to edit
    setImageFile(null);
    if (imagePreview?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {
        // ignore
      }
    }
    setImagePreview("");
setSuccess(null);
  };

  const handleDeleteSnack = async (snack) => {
    const id = snack.snackId || snack.id;
    if (!id) return;
    showWarning(
      "Bạn chắc chắn muốn xóa bắp nước / combo này?",
      "Lưu ý!",
      async () => {
        try {
          setDeletingId(id);
setSuccess(null);

          await AdminCinemaService.deleteSnack(id);
          setSnacks((prev) => prev.filter((s) => (s.snackId || s.id) !== id));
          toast.success("Xóa snack thành công!");
        } catch (err) {
          console.error("Delete snack error:", err);
toast.error(err?.message || "Xóa snack thất bại");
        } finally {
          setDeletingId(null);
          closeWarning();
        }
      }
    );
  };

  // ====== FILTERED DATA ======
  const cinemaMap = useMemo(() => {
    const map = {};
    cinemas.forEach((c) => {
      map[c.cinemaId || c.id] = c;
    });
    return map;
  }, [cinemas]);

  const filteredSnacks = useMemo(() => {
    return snacks.filter((s) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const haystack = `${s.name || ""} ${s.category || ""} ${s.type || ""} ${
          s.description || ""
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (cinemaFilter !== "ALL") {
        if ((s.cinemaId || "") !== cinemaFilter) return false;
      }

      return true;
    });
  }, [snacks, search, cinemaFilter]);

  // stats
  const stats = useMemo(() => {
    const total = snacks.length;
    const cinemaSet = new Set(
      snacks.map((s) => s.cinemaId).filter((id) => id && typeof id === "string")
    );
    const cinemaCount = cinemaSet.size;

    const totalPrice = snacks.reduce(
      (sum, s) => sum + (Number(s.price) || 0),
      0
    );
    const avgPrice = total > 0 ? Math.round(totalPrice / total) : 0;

    return { total, cinemaCount, avgPrice };
  }, [snacks]);

  // ====== RENDER ======
  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • SNACKS
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản lý bắp nước &amp; combo
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Tạo, chỉnh sửa và gán bắp nước / combo cho từng rạp để dùng trong flow
          đặt vé.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Tổng sản phẩm"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Số rạp có menu"
          value={stats.cinemaCount}
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
        <StatCard
          label="Giá trung bình (VNĐ)"
          value={stats.avgPrice.toLocaleString("vi-VN")}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
      </section>

      {/* Filter */}
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
                placeholder="Tìm theo tên, loại, mô tả..."
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="w-full sm:w-56">
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Lọc theo rạp
              </label>
              <select
                value={cinemaFilter}
                onChange={(e) => setCinemaFilter(e.target.value)}
                className="w-full rounded-full bg-gradient-to-r from-[#0b001f] via-[#0e0127] to-[#120033] border border-cyan-400/30 px-4 py-2.5 text-sm text-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] hover:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-300 transition-all"
              >
                <option value="ALL">Tất cả rạp</option>
                {cinemas.map((c) => (
                  <option key={c.cinemaId || c.id} value={c.cinemaId || c.id}>
                    {c.name || c.cinemaName || "Rạp không tên"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all md:self-end"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>

          <div className="flex items-center gap-2 md:self-end">
            <button
              type="button"
              onClick={() => {
                if (formOpen) {
                  setFormOpen(false);
                } else {
                  resetForm(); // mở form tạo mới thì reset
                  setFormOpen(true);
                  setTimeout(
                    () =>
                      formRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      }),
                    50
                  );
                }
              }}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-400 text-black shadow-lg shadow-emerald-500/30 hover:brightness-110 transition-all"
            >
              {formOpen ? "Đóng form" : "Thêm SNACKS"}
            </button>
          </div>
        </div>
      </section>

      {/* Error / Success */}
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

      {/* Form create / edit */}
      {formOpen && (
        <section
          ref={formRef}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/18 via-transparent to-cyan-500/18 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

          <div className="relative p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
                  {editingId
                    ? "Chỉnh sửa bắp nước / combo"
                    : "Thêm bắp nước / combo mới"}
                </h2>
                <p className="text-[11px] md:text-xs text-white/50 mt-1">
                  Nhập thông tin bắp nước, chọn rạp áp dụng và giá bán.
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setFormOpen(false);
                  }}
                  className="text-[11px] font-semibold tracking-[0.16em] uppercase rounded-2xl border border-white/20 px-3 py-1.5 text-white/70 hover:bg-white/10 transition-all"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChangeForm("name")}
                    placeholder="Bắp rang bơ, Combo 2 vé + 2 nước..."
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={handleChangeForm("price")}
                      placeholder="45000"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Loại / Category
                    </label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={handleChangeForm("category")}
                      placeholder="COMBO, POPCORN, DRINK..."
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                    Thuộc rạp
                  </label>
                  <select
                    value={form.cinemaId}
                    onChange={handleChangeForm("cinemaId")}
                    className="w-full rounded-full bg-gradient-to-r from-[#0b001f] via-[#0e0127] to-[#120033] border border-cyan-400/30 px-4 py-2.5 text-sm text-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] hover:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-300 transition-all"
                  >
                    <option value="">— Chọn chi nhánh —</option>
                    {cinemas.map((c) => (
                      <option
                        key={c.cinemaId || c.id}
                        value={c.cinemaId || c.id}
                      >
                        {c.name || c.cinemaName || "Rạp không tên"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                    Mô tả
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={handleChangeForm("description")}
                    placeholder="Ví dụ: Combo 1 bắp lớn + 2 nước ngọt 500ml..."
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all resize-none"
                  />
                </div>

                <div>
                  {/* <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Ảnh minh họa
                </label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={handleChangeForm("imageUrl")}
                  placeholder="https://.../combo.png"
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
                <p className="mt-2 text-[11px] text-white/45">
                  Dùng để hiển thị hình ảnh đẹp hơn trên trang đặt vé.
                </p> */}

                  {/* Upload file */}
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Upload ảnh
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePickImage}
                      disabled={saving}
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/15"
                    />

                    {uploadingSnackImage && (
                      <p className="mt-2 text-xs text-cyan-300">
                        Đang upload ảnh snack...
                      </p>
                    )}

                    {(imagePreview || form.imageUrl) && (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={imagePreview || form.imageUrl}
                          alt="snack-preview"
                          className="h-16 w-16 rounded-2xl object-cover border border-white/10"
                        />

                        {imageFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              if (imagePreview?.startsWith("blob:")) {
                                try {
                                  URL.revokeObjectURL(imagePreview);
                                } catch {
                                  // ignore
                                }
                              }
                              setImagePreview("");
                            }}
                            className="rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-white hover:bg-white/10 transition-all"
                          >
                            Bỏ ảnh đã chọn
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  ID Cloudinary (public_id)
                </label>
                <input
                  type="text"
                  value={form.imageCloudinaryId}
                  onChange={handleChangeForm("imageCloudinaryId")}
                  placeholder="folder/ten_anh_hoac_public_id"
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
              </div> */}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="flex-1 rounded-2xl border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Nhập lại
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 py-2.5 text-sm font-black text-black shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {saving
                      ? editingId
                        ? "Đang lưu..."
                        : "Đang tạo..."
                      : editingId
                      ? "Lưu thay đổi"
                      : "Thêm sản phẩm"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Table */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
              Danh sách bắp nước &amp; combo
            </h2>
            <p className="text-[11px] text-white/40">
              Hiển thị{" "}
              <span className="font-semibold">{filteredSnacks.length}</span> /{" "}
              <span className="font-semibold">{snacks.length}</span> items
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 pr-4 text-left">Sản phẩm</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Rạp áp dụng
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    Loại / Category
                  </th>
                  <th className="py-3 px-4 text-left">Giá</th>
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
                ) : filteredSnacks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Không có bắp nước / combo nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredSnacks.map((s) => {
                    const id = s.snackId || s.id;
                    const cinema =
                      cinemaMap[s.cinemaId] || cinemaMap[s.cinema_id] || null;

                    return (
                      <tr
                        key={id}
                        className="border-b border-white/5 hover:bg-white/10"
                      >
                        {/* Name + desc */}
                        <td className="py-3 pr-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              {s.imageUrl ? (
                                <img
                                  src={s.imageUrl}
                                  alt={s.name || "Snack"}
                                  className="h-12 w-12 rounded-2xl object-cover border border-white/10 shadow-lg"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-[1px]">
                                  <div className="h-full w-full rounded-2xl bg-[#050012] flex items-center justify-center text-xs font-bold">
                                    {(s.name || "S").charAt(0).toUpperCase()}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white line-clamp-1">
                                {s.name || "Sản phẩm không tên"}
                              </div>
                              {s.description && (
                                <div className="mt-1 text-[11px] text-white/60 line-clamp-2 max-w-md">
                                  {s.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Cinema */}
                        <td className="py-3 px-4 align-top hidden md:table-cell">
                          {cinema ? (
                            <>
                              <div className="text-xs text-white/80">
                                {cinema.name ||
                                  cinema.cinemaName ||
                                  "Rạp không tên"}
                              </div>
                              <div className="text-[11px] text-white/50 mt-0.5">
                                ID:{" "}
                                <span className="font-mono text-[10px]">
                                  {(cinema.cinemaId || cinema.id || "")
                                    .toString()
                                    .slice(0, 8)}
                                  …
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-[11px] text-white/40">
                              Menu chung
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 align-top hidden lg:table-cell">
                          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                            {s.category || s.type || "KHÁC"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 align-top">
                          <div className="text-xs font-semibold text-emerald-300">
                            {Number(s.price || 0).toLocaleString("vi-VN")} đ
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-4 pr-2 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditSnack(s)}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSnack(s)}
                              disabled={deletingId === id}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {deletingId === id ? "Đang xóa..." : "Xóa"}
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

      {warning.open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#7b5cff] to-[#ec4899] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.95)]">
            <div className="rounded-3xl bg-[#050018]/95 px-6 py-6 text-center">
              <h3 className="text-[13px] sm:text-[14px] font-extrabold tracking-[0.28em] text-white uppercase mb-2">
                {warning.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-white/80 mb-6 leading-relaxed">
                {warning.message}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={closeWarning}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[11px] sm:text-[12px] font-extrabold tracking-[0.2em] uppercase border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-all"
                >
                  Hủy
                </button>
                {typeof warning.onConfirm === "function" && (
                  <button
                    onClick={warning.onConfirm}
                    className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-[11px] sm:text-[12px] font-extrabold tracking-[0.2em] uppercase bg-gradient-to-r from-[#ffe700] to-[#facc15] text-black shadow-[0_0_18px_rgba(255,231,0,0.95)] hover:brightness-110 transition-all"
                  >
                    Xác nhận
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
