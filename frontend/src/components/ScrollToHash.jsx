import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Beri waktu sedikit supaya elemen tujuan sudah ter-render dulu.
      const id = hash.replace("#", "");
      const timeout = setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => clearTimeout(timeout);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default ScrollToHash;
