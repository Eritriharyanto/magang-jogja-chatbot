import useInView from "@/hooks/useInView";

/**
 * Wrap any block of content with <Reveal> to make it fade + slide up
 * the first time it scrolls into view.
 *
 * Props:
 * - delay: ms delay before the animation starts (for staggering a grid)
 * - as: which HTML tag to render (default "div")
 */
function Reveal({ children, delay = 0, as = "div", className = "" }) {
  const [ref, inView] = useInView();
  const Tag = as;

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
