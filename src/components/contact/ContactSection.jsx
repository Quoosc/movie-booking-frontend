// src/components/contact/ContactSection.jsx

import { useState } from "react";
import { FaFacebookF } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { submitContactForm } from "../../api/contactService";

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
  const [submitFeedback, setSubmitFeedback] = useState({
    type: "",
    text: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const safeName = name.trim();
    const safeEmail = email.trim();
    const safeMessage = message.trim();

    if (!safeName || !safeEmail || !safeMessage) {
      setSubmitFeedback({
        type: "error",
        text: "Vui lòng nhập đầy đủ họ tên, email và nội dung liên hệ.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitFeedback({ type: "", text: "" });

      const sourcePage =
        typeof window !== "undefined" ? window.location.pathname : "/contact";

      const result = await submitContactForm({
        name: safeName,
        email: safeEmail,
        message: safeMessage,
        sourcePage,
      });

      const mailSent = Boolean(result?.mailSent);
      setSubmitFeedback({
        type: "success",
        text: mailSent
          ? "Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất."
          : "Tin nhắn đã được ghi nhận.",
      });

      setName(""); 
      setEmail("");
      setMessage("");
    } catch (error) {
      setSubmitFeedback({
        type: "error",
        text:
          error?.message ||
          "Không thể gửi liên hệ lúc này. Vui lòng thử lại sau vài phút.",
      });
    } finally {
      setIsSubmitting(false);
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
            <textarea
              rows={4}
              placeholder="Thông tin liên hệ hoặc phản ánh"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="
                w-full rounded-lg bg-white/5 border border-white/15
                px-3 py-2 text-sm text-white
                placeholder:text-white/50
                resize-none
                focus:outline-none focus:ring-2 focus:ring-[#FFE066]/70 focus:border-transparent
              "
            />
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

            {submitFeedback.text ? (
              <p
                className={`text-xs font-semibold ${
                  submitFeedback.type === "success"
                    ? "text-emerald-300"
                    : "text-rose-300"
                }`}
              >
                {submitFeedback.text}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
