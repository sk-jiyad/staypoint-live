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
 */
export default function TearStrip({ text, count = 6, tornAt, to, label }) {
  const torn =
    tornAt !== undefined
      ? tornAt
      : Math.abs([...String(text)].reduce((a, c) => a + c.charCodeAt(0), 0)) % count;

  const strip = (
    <div className="tear-strip" aria-hidden={to ? undefined : true}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="tear-tab" data-torn={i === torn}>
          {text}
        </span>
      ))}
    </div>
  );

  if (!to) return strip;

  return (
    <Link to={to} className="tear-strip-link" aria-label={label}>
      {strip}
    </Link>
  );
}
