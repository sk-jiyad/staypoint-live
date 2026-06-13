import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 to `end` once the number is known and the element scrolls
 * into view. While `end` is null/undefined (e.g. still loading) it shows a dash.
 * Honors prefers-reduced-motion by jumping straight to the final value.
 *
 * Usage: <CountUp end={count} className="disp text-2xl mono-data" />
 */
export default function CountUp({ end, duration = 1100, className }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [display, setDisplay] = useState(end == null ? null : 0);

  // fire once when it scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // run (or re-run) the count when we're visible and the value is known
  useEffect(() => {
    if (end == null) {
      setDisplay(null);
      return;
    }
    if (!inView) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || end === 0) {
      setDisplay(end);
      return;
    }

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {display == null ? "—" : display}
    </span>
  );
}
