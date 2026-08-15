import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref to attach to an element and a boolean that flips to true
 * once the element scrolls into view. Only triggers once (good for
 * one-shot "fade up on scroll" animations, avoids re-animating on every
 * scroll up/down).
 */
function useInView({ threshold = 0.2, rootMargin = "0px 0px -60px 0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect users who've asked for reduced motion: just show immediately.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}

export default useInView;
