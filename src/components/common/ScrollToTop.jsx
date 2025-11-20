import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { animate } from "framer-motion";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log("🌀 ScrollToTop triggered:", pathname);
    const controls = animate(window.scrollY, 0, {
      duration: 1.2, 
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => window.scrollTo(0, latest),
    });

    return () => controls.stop();
  }, [pathname]);

  return null;
}
