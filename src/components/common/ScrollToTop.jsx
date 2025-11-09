import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { animate } from "framer-motion";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log("🌀 ScrollToTop triggered:", pathname);

    // Cuộn mượt bằng framer-motion
    const controls = animate(window.scrollY, 0, {
      duration: 1.2, // Tăng lên 1.2s để mượt hơn
      ease: [0.16, 1, 0.3, 1], // easing kiểu cubic-bezier "luxury" smooth
      onUpdate: (latest) => window.scrollTo(0, latest),
    });

    return () => controls.stop();
  }, [pathname]);

  return null;
}
