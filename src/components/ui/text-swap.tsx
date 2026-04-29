import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TextSwapProps {
  value: string;
  className?: string;
}

/**
 * transitions-dev t-text-swap, in React. The element keeps the text it was
 * mounted with on the first render; whenever `value` changes, runs the
 * three-phase exit / swap / enter sequence.
 */
export const TextSwap = ({ value, className }: TextSwapProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const previous = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || previous.current === value) return;

    const dur = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--text-swap-dur")
    ) || 200;

    el.classList.add("is-exit");
    const timer = setTimeout(() => {
      el.textContent = value;
      el.classList.remove("is-exit");
      el.classList.add("is-enter-start");
      void el.offsetHeight; // force reflow so the next change transitions
      el.classList.remove("is-enter-start");
      previous.current = value;
    }, dur);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={cn("t-text-swap", className)}>
      {previous.current}
    </span>
  );
};
