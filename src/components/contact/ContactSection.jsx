// src/components/contact/ContactSection.jsx

import { FaFacebookF } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";

export default function ContactSection() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted");
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
            href="#"
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
            href="#"
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
              <span>23521309@gm.uit.edu.vn</span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlinePhone className="text-[#FFE066]" />
              <span>0969678599</span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineLocationMarker className="text-[#FFE066]" />
              <span>214 đường số 8, phường Linh Xuân, Thành phố Thủ Đức</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Họ và tên"
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
              className="
                mt-2 w-full md:w-auto
                px-8 py-2.5
                rounded-lg
                bg-[#FFE066]
                text-[#111827]
                text-sm font-extrabold tracking-wide
                hover:brightness-105 hover:-translate-y-[1px]
                transition-all
                shadow-[0_8px_22px_rgba(0,0,0,0.65)]
              "
            >
              GỬI NGAY
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
