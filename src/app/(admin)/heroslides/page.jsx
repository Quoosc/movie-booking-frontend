import { useEffect, useMemo, useState } from "react";
import { AdminCinemaService, AdminHeroSlideService } from "@/api/adminservice";
import { uploadPoster } from "@/api/cloudinaryService";
import { toast } from "react-toastify";

const EMPTY_SLIDE_FORM = {
  imageUrl: "",
  imageCloudinaryId: "",
};

function toList(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.data?.data)) return input.data.data;
  return [];
}

function normalizeSlide(item) {
  return {
    heroSlideId: item.heroSlideId || item.hero_slide_id || item.id,
    title: item.title || "Hero Slide",
    altText: item.altText || item.alt_text || "",
    imageUrl: item.imageUrl || item.image_url || "",
    imageCloudinaryId: item.imageCloudinaryId || item.image_cloudinary_id || "",
    sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0),
    isActive: Boolean(item.isActive ?? item.is_active ?? true),
  };
}

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState([]);
  const [cinemas, setCinemas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploadingSlideImage, setUploadingSlideImage] = useState(false);
  const [updatingCinemaImage, setUpdatingCinemaImage] = useState(false);
  const [uploadingCinemaImage, setUploadingCinemaImage] = useState(false);

  const [editingSlideId, setEditingSlideId] = useState(null);
  const [slideForm, setSlideForm] = useState(EMPTY_SLIDE_FORM);

  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [cinemaHeroImageUrl, setCinemaHeroImageUrl] = useState("");
  const [cinemaHeroImageCloudinaryId, setCinemaHeroImageCloudinaryId] =
    useState("");

  const selectedCinema = useMemo(
    () => cinemas.find((c) => (c.cinemaId || c.id) === selectedCinemaId),
    [cinemas, selectedCinemaId],
  );

  const stats = useMemo(() => {
    const total = slides.length;
    const active = slides.filter((s) => s.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [slides]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [slidesRes, cinemasRes] = await Promise.all([
        AdminHeroSlideService.getHeroSlides(),
        AdminCinemaService.getCinemas(),
      ]);

      const slideList = toList(slidesRes)
        .map(normalizeSlide)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const cinemaList = toList(cinemasRes);

      setSlides(slideList);
      setCinemas(cinemaList);

      if (cinemaList.length > 0) {
        const firstCinemaId = cinemaList[0].cinemaId || cinemaList[0].id;
        setSelectedCinemaId((prev) => prev || firstCinemaId);
      }
    } catch (err) {
      console.error("Load HeroSlide page data error:", err);
      toast.error(err?.message || "Không tải được dữ liệu HeroSlide");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedCinema) {
      setCinemaHeroImageUrl("");
      setCinemaHeroImageCloudinaryId("");
      return;
    }

    setCinemaHeroImageUrl(selectedCinema.heroImageUrl || "");
    setCinemaHeroImageCloudinaryId(selectedCinema.heroImageCloudinaryId || "");
  }, [selectedCinema]);

  const resetSlideForm = () => {
    setEditingSlideId(null);
    setSlideForm(EMPTY_SLIDE_FORM);
  };

  const handleUploadSlideImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSlideImage(true);
      const { posterUrl, posterCloudinaryId } = await uploadPoster(file);

      const normalizedCloudinaryId = posterCloudinaryId || null;

      if (editingSlideId) {
        const editingSlide = slides.find(
          (s) => s.heroSlideId === editingSlideId,
        );
        if (!editingSlide) {
          toast.error("Không tìm thấy HeroSlide cần chỉnh sửa");
          return;
        }

        await AdminHeroSlideService.updateHeroSlide(editingSlideId, {
          title:
            editingSlide.title || `Hero Slide ${editingSlide.sortOrder + 1}`,
          altText: editingSlide.altText || null,
          imageUrl: posterUrl,
          imageCloudinaryId: normalizedCloudinaryId,
          sortOrder: Number(editingSlide.sortOrder) || 0,
          isActive: Boolean(editingSlide.isActive),
        });

        toast.success("Đã cập nhật ảnh HeroSlide");
      } else {
        const nextSortOrder =
          slides.length > 0
            ? Math.max(...slides.map((s) => Number(s.sortOrder) || 0)) + 1
            : 0;

        await AdminHeroSlideService.createHeroSlide({
          title: `Hero Slide ${nextSortOrder + 1}`,
          altText: null,
          imageUrl: posterUrl,
          imageCloudinaryId: normalizedCloudinaryId,
          sortOrder: nextSortOrder,
          isActive: true,
        });

        toast.success("Đã thêm HeroSlide mới");
      }

      setSlideForm((prev) => ({
        ...prev,
        imageUrl: posterUrl,
        imageCloudinaryId: normalizedCloudinaryId || "",
      }));

      await loadData();
      resetSlideForm();
    } catch (err) {
      console.error("Upload HeroSlide image error:", err);
      toast.error(err?.message || "Upload ảnh HeroSlide thất bại");
    } finally {
      setUploadingSlideImage(false);
      e.target.value = "";
    }
  };

  const handleEditSlide = (slide) => {
    setEditingSlideId(slide.heroSlideId);
    setSlideForm({
      imageUrl: slide.imageUrl || "",
      imageCloudinaryId: slide.imageCloudinaryId || "",
    });
  };

  const handleDeleteSlide = async (heroSlideId) => {
    if (!heroSlideId) return;

    const confirmed = window.confirm("Bạn chắc chắn muốn xóa HeroSlide này?");
    if (!confirmed) return;

    try {
      await AdminHeroSlideService.deleteHeroSlide(heroSlideId);
      setSlides((prev) => prev.filter((s) => s.heroSlideId !== heroSlideId));
      toast.success("Xóa HeroSlide thành công");

      if (editingSlideId === heroSlideId) {
        resetSlideForm();
      }
    } catch (err) {
      console.error("Delete HeroSlide error:", err);
      toast.error(err?.message || "Xóa HeroSlide thất bại");
    }
  };

  const handleUploadCinemaImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedCinemaId) {
      toast.error("Vui lòng chọn rạp trước khi upload ảnh");
      e.target.value = "";
      return;
    }

    try {
      setUploadingCinemaImage(true);
      setUpdatingCinemaImage(true);
      const { posterUrl, posterCloudinaryId } = await uploadPoster(file);

      await AdminCinemaService.updateCinema(selectedCinemaId, {
        heroImageUrl: posterUrl,
        heroImageCloudinaryId: posterCloudinaryId || null,
      });

      setCinemaHeroImageUrl(posterUrl);
      setCinemaHeroImageCloudinaryId(posterCloudinaryId || "");

      setCinemas((prev) =>
        prev.map((cinema) => {
          const id = cinema.cinemaId || cinema.id;
          if (id !== selectedCinemaId) return cinema;
          return {
            ...cinema,
            heroImageUrl: posterUrl,
            heroImageCloudinaryId: posterCloudinaryId || null,
          };
        }),
      );

      toast.success("Cập nhật ảnh nền rạp thành công");
    } catch (err) {
      console.error("Save cinema image error:", err);
      toast.error(err?.message || "Cập nhật ảnh nền rạp thất bại");
    } finally {
      setUploadingCinemaImage(false);
      setUpdatingCinemaImage(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • HEROSLIDE
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản lý HeroSlide & ảnh nền rạp
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Thêm, sửa, xóa poster HeroSlide trên trang chủ và cập nhật ảnh nền lớn
          cho từng rạp chiếu.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Tổng HeroSlide"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Đang hiển thị"
          value={stats.active}
          gradient="from-emerald-400/80 via-teal-400/80 to-cyan-400/80"
        />
        <StatCard
          label="Đang ẩn"
          value={stats.inactive}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl p-5 md:p-6">
          <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80 mb-4">
            {editingSlideId ? "Đổi ảnh HeroSlide" : "Thêm HeroSlide mới"}
          </h2>

          <div className="space-y-4">
            <p className="text-xs text-white/60">
              Chỉ cần upload ảnh. Hệ thống sẽ tự tạo hoặc cập nhật HeroSlide.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase border border-cyan-400/70 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20 transition-all cursor-pointer">
                {uploadingSlideImage
                  ? editingSlideId
                    ? "Đang cập nhật..."
                    : "Đang thêm..."
                  : editingSlideId
                  ? "Upload ảnh để thay slide"
                  : "Upload ảnh để thêm slide"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadSlideImage}
                  className="hidden"
                  disabled={uploadingSlideImage}
                />
              </label>
            </div>

            {slideForm.imageUrl ? (
              <img
                src={slideForm.imageUrl}
                alt="HeroSlide preview"
                className="w-full h-44 rounded-2xl object-cover border border-white/10"
              />
            ) : null}

            <div className="flex flex-wrap gap-2">
              {editingSlideId ? (
                <button
                  type="button"
                  onClick={resetSlideForm}
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 transition-all"
                >
                  Hủy chỉnh sửa
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl p-5 md:p-6">
          <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80 mb-4">
            Danh sách HeroSlide
          </h2>

          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm text-white/60">Đang tải dữ liệu...</p>
            ) : slides.length === 0 ? (
              <p className="text-sm text-white/60">
                Chưa có HeroSlide nào. Hãy thêm slide đầu tiên.
              </p>
            ) : (
              slides.map((slide) => (
                <article
                  key={slide.heroSlideId}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <img
                      src={slide.imageUrl}
                      alt={slide.altText || slide.title}
                      className="w-full sm:w-44 h-24 rounded-xl object-cover border border-white/10"
                    />

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white line-clamp-1">
                        {slide.title || "HeroSlide"}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                        <span className="px-2 py-1 rounded-full border border-white/15 bg-white/5">
                          Sort: {slide.sortOrder}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full border ${
                            slide.isActive
                              ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                              : "border-amber-400/40 bg-amber-500/15 text-amber-200"
                          }`}
                        >
                          {slide.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSlide(slide)}
                          className="rounded-xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] border border-cyan-400/60 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20 transition-all"
                        >
                          Thay ảnh
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(slide.heroSlideId)}
                          className="rounded-xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] border border-rose-400/60 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20 transition-all"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl p-5 md:p-6 space-y-4">
        <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
          Ảnh nền lớn cho trang rạp
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Chọn rạp
              </label>
              <select
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
                className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
               border border-cyan-400/60 px-4 py-2.5 text-xs md:text-sm font-semibold text-white
               shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
               focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
               transition-all"
              >
                {cinemas.map((cinema) => {
                  const id = cinema.cinemaId || cinema.id;
                  const name = cinema.name || cinema.cinemaName || "Cinema";
                  return (
                    <option
                      key={id}
                      value={id}
                      className="bg-[#120426] text-white"
                    >
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase border border-cyan-400/70 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20 transition-all cursor-pointer">
                {uploadingCinemaImage || updatingCinemaImage
                  ? "Đang lưu ảnh..."
                  : "Upload ảnh nền từ Cloudinary"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCinemaImage}
                  className="hidden"
                  disabled={uploadingCinemaImage || updatingCinemaImage}
                />
              </label>
            </div>
          </div>

          <div>
            {cinemaHeroImageUrl ? (
              <img
                src={cinemaHeroImageUrl}
                alt={selectedCinema?.name || "Cinema hero"}
                className="w-full h-52 md:h-64 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-full h-52 md:h-64 rounded-2xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center text-sm text-white/50">
                Rạp này chưa có ảnh nền lớn
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, gradient }) {
  return (
    <article className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-5">
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${gradient}`}
      />
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 mb-2">
        {label}
      </p>
      <p className="text-2xl font-black text-white">{value}</p>
    </article>
  );
}
