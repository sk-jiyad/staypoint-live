import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * The tear-off tab strip from a lamppost flyer.
 * Each tab repeats the same text (a phone number, usually) the way real
 * to-let flyers do. One tab is already "torn" — somebody got there first.
 *
 * Props:
 *  - text:   string repeated on every tab
 *  - count:  number of tabs (default 6)
 *  - tornAt: index of the missing tab; pass -1 for none (default derived from text)
 *  - to:     optional route — wraps the strip in a Link
 *  - label:  accessible label when the strip is a link
 *  - tearable: when true, clicking a tab tears it off (it flutters down) and it
 *             grows back after a moment. Decorative; use on the non-link footer strip.
 */
export default function TearStrip({ text, count = 6, tornAt, to, label, tearable = false }) {
  const staticTorn =
    tornAt !== undefined
      ? tornAt
      : Math.abs([...String(text)].reduce((a, c) => a + c.charCodeAt(0), 0)) % count;

  // index -> "tearing" | "torn" | "growing"
  const [status, setStatus] = useState({});

  const tearOff = (i) => {
    if (!tearable || i === staticTorn || status[i]) return;
    setStatus((s) => ({ ...s, [i]: "tearing" }));
  };

  // tear-fall ends -> mark torn, then grow back; tear-grow ends -> clear.
  const onAnimEnd = (i) => {
    setStatus((prev) => {
      if (prev[i] === "tearing") {
        setTimeout(() => setStatus((s) => ({ ...s, [i]: "growing" })), 1800);
        return { ...prev, [i]: "torn" };
      }
      if (prev[i] === "growing") {
        const next = { ...prev };
        delete next[i];
        return next;
      }
      return prev;
    });
  };

  const strip = (
    <div className={"tear-strip" + (tearable ? " is-tearable" : "")} aria-hidden={to ? undefined : true}>
      {Array.from({ length: count }, (_, i) => {
        const st = status[i];
        return (
          <span
            key={i}
            className={"tear-tab" + (st === "tearing" ? " tearing" : "") + (st === "growing" ? " growing" : "")}
            data-torn={i === staticTorn || st === "torn"}
            onClick={tearable ? () => tearOff(i) : undefined}
            onAnimationEnd={tearable ? () => onAnimEnd(i) : undefined}
          >
            {text}
          </span>
        );
      })}
    </div>
  );

  if (!to) return strip;

  return (
    <Link to={to} className="tear-strip-link" aria-label={label}>
      {strip}
    </Link>
  );
}
