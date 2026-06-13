import { useEffect } from "react";

/**
 * Reveals elements tagged with [data-reveal] as they scroll into view by
 * adding the `is-in` class. The CSS in index.css does the actual pin-up +
 * tape-slap animation. Honors prefers-reduced-motion: under "reduce" every
 * element is shown immediately with no movement.
 *
 * Stagger is read from each element's data-reveal-index, so siblings that
 * enter together cascade instead of popping in unison.
 *
 * Pass whatever changes which elements exist (e.g. the list length) as deps,
 * so the observer re-arms when new flyers mount.
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll("[data-reveal]:not(.is-in)");

    if (reduce) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number(entry.target.dataset.revealIndex || 0);
          entry.target.style.setProperty("--reveal-delay", `${Math.min(i, 8) * 65}ms`);
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
