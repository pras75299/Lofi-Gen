import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    name: string;
    title: string;
    quote: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (containerRef.current && scroller) {
      scroller.querySelectorAll("[data-clone='true']").forEach((node) => node.remove());
      Array.from(scroller.children).forEach((item) => {
        const dup = item.cloneNode(true) as HTMLElement;
        dup.setAttribute("aria-hidden", "true");
        dup.dataset.clone = "true";
        scroller.appendChild(dup);
      });
      setStart(true);
    }

    return () => {
      scroller?.querySelectorAll("[data-clone='true']").forEach((node) => node.remove());
    };
  }, []);

  const duration = speed === "fast" ? "40s" : speed === "normal" ? "60s" : "90s";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-10 max-w-7xl overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          "--duration": duration,
          "--direction": direction === "left" ? "forwards" : "reverse",
        } as React.CSSProperties}
      >
        {items.map((item, idx) => (
          <li
            key={item.name + idx}
            className="w-[360px] max-w-[80vw] flex-shrink-0"
          >
            <figure className="relative h-full rounded-2xl bg-cream/70 p-7 shadow-inset-line transition-colors duration-300 hover:bg-cream">
              <svg
                aria-hidden="true"
                viewBox="0 0 32 32"
                fill="currentColor"
                className="h-5 w-5 text-sienna/60"
              >
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <blockquote className="mt-4 font-display text-[19px] leading-snug text-ink">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-line">
                <div
                  aria-hidden="true"
                  className="grid h-10 w-10 place-items-center rounded-full bg-ochre/25 text-[12px] font-medium text-ink ring-1 ring-line"
                >
                  {getInitials(item.name)}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-ink">{item.name}</div>
                  <div className="text-ink-mute text-[13px]">{item.title}</div>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
