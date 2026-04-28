import { useEffect, useRef, useState, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
}

export const Modal = ({ open, onClose, children, label }: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Stays mounted through the close transition, then unmounts.
  const [mounted, setMounted] = useState(open);
  // Drives `.is-open` / `.is-closing` on the surface + backdrop.
  const [phase, setPhase] = useState<"open" | "closing" | "idle">("idle");

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Next frame so the initial transform/opacity registers before .is-open swaps in.
      const raf = requestAnimationFrame(() => setPhase("open"));
      return () => cancelAnimationFrame(raf);
    }

    if (!mounted) return;
    setPhase("closing");
    const closeMs = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")
    ) || 150;
    const t = setTimeout(() => {
      setPhase("idle");
      setMounted(false);
    }, closeMs);
    return () => clearTimeout(t);
  }, [open, mounted]);

  // Lock body scroll while mounted
  useEffect(() => {
    if (!mounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mounted]);

  // Esc-to-close + initial focus
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    if (phase === "open") dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [mounted, phase, onClose]);

  if (!mounted) return null;

  const stateClass = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className={`t-modal-backdrop absolute inset-0 bg-ink/40 backdrop-blur-[3px] cursor-default ${stateClass}`}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`t-modal relative w-full max-w-md outline-none ${stateClass}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="press absolute -top-3 -right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink text-paper hover:bg-ink-soft transition-colors shadow-lift cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};
