// src/components/contact/ContactSection.jsx

import { useState } from "react";
import { toast } from "react-toastify";
import { FaFacebookF } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { submitContactForm } from "../../api/contactService";
import { uploadFeedbackImage } from "../../api/cloudinaryService";

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || "23521309@gm.uit.edu.vn";
const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || "0969678599";
const CONTACT_ADDRESS =
  import.meta.env.VITE_CONTACT_ADDRESS ||
  "214 đường số 8, phường Linh Xuân, Thành phố Thủ Đức";
const FACEBOOK_URL = import.meta.env.VITE_CONTACT_FACEBOOK_URL;
const ZALO_URL = import.meta.env.VITE_CONTACT_ZALO_URL || "https://zalo.me";
const MAPS_URL =
  import.meta.env.VITE_CONTACT_MAPS_URL ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    CONTACT_ADDRESS,
  )}`;

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback form
  const [anonFeedback, setAnonFeedback] = useState("");
  const [anonImage, setAnonImage] = useState(null);      // { file, preview, url }
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmittingAnon, setIsSubmittingAnon] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const safeName = name.trim();
    const safeEmail = email.trim();
    const safeMessage = message.trim();

    if (!safeName || !safeEmail || !safeMessage) {
      toast.error("Vui lòng nhập đầy đủ họ tên, email và nội dung liên hệ.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(safeEmail)) {
      toast.error("Địa chỉ email không hợp lệ.");
      return;
    }

    if (safeMessage.length < 10) {
      toast.error("Nội dung liên hệ phải có ít nhất 10 ký tự.");
      return;
    }

    try {
      setIsSubmitting(true);

      const sourcePage =
        typeof window !== "undefined" ? window.location.pathname : "/contact";

      const result = await submitContactForm({
        name: safeName,
        email: safeEmail,
        message: safeMessage,
        sourcePage,
      });

      const mailSent = Boolean(result?.mailSent);
      toast.success(
        mailSent
          ? "Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất!"
          : "Tin nhắn đã được ghi nhận. Chúng tôi sẽ liên hệ lại sớm."
      );

      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      let errorText = "Không thể gửi liên hệ lúc này. Vui lòng thử lại sau vài phút.";

      if (error?.data?.errors) {
        const fieldErrors = Object.values(error.data.errors).flat();
        if (fieldErrors.length > 0) {
          errorText = mapBeErrorToVietnamese(fieldErrors[0]);
        }
      } else if (error?.status === 429) {
        errorText = "Bạn đã gửi quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.";
      } else if (error?.message && !error.message.startsWith("API error")) {
        errorText = mapBeErrorToVietnamese(error.message);
      }

      toast.error(errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  function mapBeErrorToVietnamese(msg) {
    if (!msg) return "Không thể gửi liên hệ lúc này. Vui lòng thử lại sau vài phút.";
    const m = msg.toLowerCase();
    if (m.includes("name") && (m.includes("required") || m.includes("field is required")))
      return "Vui lòng nhập họ và tên.";
    if (m.includes("email") && (m.includes("required") || m.includes("field is required")))
      return "Vui lòng nhập địa chỉ email.";
    if (m.includes("email") && (m.includes("valid") || m.includes("must be")))
      return "Địa chỉ email không hợp lệ.";
    if (m.includes("message") && (m.includes("required") || m.includes("field is required")))
      return "Vui lòng nhập nội dung liên hệ.";
    if (m.includes("message") && m.includes("at least"))
      return "Nội dung liên hệ phải có ít nhất 10 ký tự.";
    if (m.includes("message") && m.includes("must not be greater"))
      return "Nội dung liên hệ quá dài (tối đa 3000 ký tự).";
    return "Không thể gửi liên hệ lúc này. Vui lòng thử lại sau vài phút.";
  }

  const handleAnonImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Vui lòng chọn file ảnh."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ảnh không được vượt quá 5MB."); return; }

    const preview = URL.createObjectURL(file);
    setAnonImage({ file, preview, url: null });

    try {
      setUploadingImage(true);
      const { attachmentUrl } = await uploadFeedbackImage(file);
      setAnonImage({ file, preview, url: attachmentUrl });
    } catch {
      toast.error("Upload ảnh thất bại. Vui lòng thử lại.");
      setAnonImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAnonSubmit = async (e) => {
    e.preventDefault();
    const safe = anonFeedback.trim();
    if (!safe) { toast.error("Vui lòng nhập nội dung góp ý."); return; }
    if (safe.length < 10) { toast.error("Nội dung góp ý phải có ít nhất 10 ký tự."); return; }
    if (uploadingImage) { toast.error("Đang upload ảnh, vui lòng đợi."); return; }

    try {
      setIsSubmittingAnon(true);
      const sourcePage = typeof window !== "undefined" ? window.location.pathname : "/contact";
      await submitContactForm({
        message: safe,
        sourcePage,
        ...(anonImage?.url ? { attachmentUrl: anonImage.url } : {}),
      });
      toast.success("Góp ý của bạn đã được ghi nhận. Cảm ơn bạn!");
      setAnonFeedback("");
      setAnonImage(null);
    } catch (error) {
      let errorText = "Không thể gửi góp ý lúc này. Vui lòng thử lại sau vài phút.";
      if (error?.status === 429) errorText = "Bạn đã gửi quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.";
      toast.error(errorText);
    } finally {
      setIsSubmittingAnon(false);
    }
  };

  return (
    <section
      className="
        relative z-10 mt-20 mb-16
        max-w-6xl mx-auto px-4
      "
    >
      {/* Title */}
      <h2 className="text-center text-2xl md:text-3xl font-extrabold tracking-wide text-white mb-8">
        LIÊN HỆ VỚI CHÚNG TÔI
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] gap-8 items-stretch">
        {/* LEFT: SOCIAL CONTACT */}
        <div className="space-y-5">
          {/* Facebook */}
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="
              group relative flex items-center justify-between
              px-6 py-4
              rounded-2xl
              bg-gradient-to-r from-[#4b2fcb] via-[#6a42ff] to-[#2663ff]
              shadow-[0_10px_30px_rgba(0,0,0,0.55)]
              border border-white/10
              hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7)]
              transition-all duration-300
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  w-14 h-14 rounded-2xl
                  bg-white/10 flex items-center justify-center
                  text-[#ffffff] text-2xl
                  shadow-[0_0_18px_rgba(255,255,255,0.35)]
                "
              >
                <FaFacebookF />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/70 font-medium">
                  Hỗ trợ qua Fanpage
                </span>
                <span className="text-lg md:text-xl font-extrabold tracking-wide text-white">
                  FACEBOOK
                </span>
              </div>
            </div>
            <span className="hidden md:block text-sm text-white/80 group-hover:text-white">
              Nhắn tin ngay →
            </span>
          </a>

          {/* Zalo */}
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noreferrer"
            className="
              group relative flex items-center justify-between
              px-6 py-4
              rounded-2xl
              bg-gradient-to-r from-[#512b97] via-[#4b6bff] to-[#249fff]
              shadow-[0_10px_30px_rgba(0,0,0,0.55)]
              border border-white/10
              hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7)]
              transition-all duration-300
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  w-14 h-14 rounded-2xl
                  bg-white flex items-center justify-center
                  text-[#1677ff] text-2xl font-extrabold
                  shadow-[0_0_20px_rgba(36,159,255,0.6)]
                "
              >
                <SiZalo />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/70 font-medium">
                  Chat trực tiếp cùng CSKH
                </span>
                <span className="text-lg md:text-xl font-extrabold tracking-wide text-white">
                  ZALO CHAT
                </span>
              </div>
            </div>
            <span className="hidden md:block text-sm text-white/80 group-hover:text-white">
              Kết nối ngay →
            </span>
          </a>

          {/* Feedback form */}
          <div className="
            bg-[#1d3f97]/95 rounded-3xl px-6 md:px-7 py-6
            shadow-[0_14px_40px_rgba(0,0,0,0.75)] border border-white/10
          ">
            <h3 className="text-lg md:text-xl font-extrabold text-white mb-3">
              GÓP Ý
            </h3>

            <form onSubmit={handleAnonSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={5}
                  placeholder="Phản ánh về chất lượng dịch vụ, suất chiếu hoặc bất kỳ điều gì bạn muốn chúng tôi cải thiện..."
                  value={anonFeedback}
                  onChange={(e) => setAnonFeedback(e.target.value)}
                  maxLength={10000}
                  className="
                    w-full rounded-lg bg-white/5 border border-white/15
                    px-3 py-2 text-sm text-white
                    placeholder:text-white/50
                    resize-y
                    focus:outline-none focus:ring-2 focus:ring-[#FFE066]/70 focus:border-transparent
                  "
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-white/30 pointer-events-none">
                  {anonFeedback.length}/10000
                </span>
              </div>

              {/* Upload + Submit — cùng hàng */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="
                  inline-flex items-center gap-2 cursor-pointer
                  px-4 py-2.5 rounded-lg
                  bg-white/5 border border-white/15
                  text-xs text-white/70 font-medium
                  hover:bg-white/10 hover:text-white
                  transition-all select-none shrink-0
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4a3 3 0 014 0l4 4m-4-8a1 1 0 110-2 1 1 0 010 2zm6 8H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2z" />
                  </svg>
                  {uploadingImage ? "Đang tải..." : "Đính kèm ảnh minh chứng"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAnonImageChange}
                    disabled={uploadingImage}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmittingAnon || uploadingImage}
                  className="
                    px-6 py-2.5 rounded-lg shrink-0
                    bg-[#FFE066] text-[#111827]
                    text-sm font-extrabold tracking-wide
                    hover:brightness-105 hover:-translate-y-[1px]
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0
                    transition-all shadow-[0_8px_22px_rgba(0,0,0,0.65)]
                  "
                >
                  {isSubmittingAnon ? "ĐANG GỬI..." : "GỬI GÓP Ý"}
                </button>
              </div>

              {/* Preview ảnh */}
              {anonImage?.preview && (
                <div className="relative inline-block">
                  <img
                    src={anonImage.preview}
                    alt="preview"
                    className="h-20 w-auto rounded-lg object-cover border border-white/20"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center">
                      <span className="text-[10px] text-white">Đang upload...</span>
                    </div>
                  )}
                  {!uploadingImage && (
                    <button
                      type="button"
                      onClick={() => setAnonImage(null)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* RIGHT: CONTACT FORM */}
        <div
          className="
            bg-[#1d3f97]/95
            rounded-3xl
            px-6 md:px-7 py-6
            shadow-[0_14px_40px_rgba(0,0,0,0.75)]
            border border-white/10
          "
        >
          <h3 className="text-lg md:text-xl font-extrabold text-white mb-3">
            THÔNG TIN LIÊN HỆ
          </h3>

          <div className="space-y-1.5 text-xs text-white/85 mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineMail className="text-[#FFE066]" />
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="hover:text-white transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlinePhone className="text-[#FFE066]" />
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`}
                className="hover:text-white transition-colors"
              >
                {CONTACT_PHONE}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineLocationMarker className="text-[#FFE066]" />
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                {CONTACT_ADDRESS}
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full rounded-lg bg-white/5 border border-white/15
                px-3 py-2 text-sm text-white
                placeholder:text-white/50
                focus:outline-none focus:ring-2 focus:ring-[#FFE066]/70 focus:border-transparent
              "
            />
            <input
              type="email"
              placeholder="Địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full rounded-lg bg-white/5 border border-white/15
                px-3 py-2 text-sm text-white
                placeholder:text-white/50
                focus:outline-none focus:ring-2 focus:ring-[#FFE066]/70 focus:border-transparent
              "
            />
            <div className="relative">
              <textarea
                rows={5}
                placeholder="Nội dung liên hệ"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={10000}
                className="
                  w-full rounded-lg bg-white/5 border border-white/15
                  px-3 py-2 text-sm text-white
                  placeholder:text-white/50
                  resize-y
                  focus:outline-none focus:ring-2 focus:ring-[#FFE066]/70 focus:border-transparent
                "
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-white/30 pointer-events-none">
                {message.length}/10000
              </span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                mt-2 w-full md:w-auto
                px-8 py-2.5
                rounded-lg
                bg-[#FFE066]
                text-[#111827]
                text-sm font-extrabold tracking-wide
                hover:brightness-105 hover:-translate-y-[1px]
                disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0
                transition-all
                shadow-[0_8px_22px_rgba(0,0,0,0.65)]
              "
            >
              {isSubmitting ? "ĐANG GỬI..." : "GỬI NGAY"}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}
