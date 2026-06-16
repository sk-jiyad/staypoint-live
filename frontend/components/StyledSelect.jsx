"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// A themed single-select dropdown (notice-board look) — used for the Explore
// filters so the option list matches the flyer/ink/tape styling instead of the
// browser's native (un-styleable) <select> menu.
// `options` = array of { value, label }.
export default function StyledSelect({ value, onChange, options, id, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);

  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (v) => {
    onChange(v);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && active >= 0) choose(options[active].value);
      else setOpen((o) => !o);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className="field flex items-center justify-between gap-2 text-left cursor-pointer"
      >
        <span className="truncate">{current?.label}</span>
        <ChevronDown size={16} className="flex-none" aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-auto bg-flyer border-2 border-ink shadow-xl list-none m-0 p-0"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o.value);
              }}
              onMouseEnter={() => setActive(i)}
              className={`px-4 py-2 text-sm cursor-pointer ${
                o.value === value
                  ? "bg-tape font-semibold"
                  : i === active
                  ? "bg-tape/40"
                  : "hover:bg-tape/40"
              }`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
