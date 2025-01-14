import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    name: string;
    title: string;
    image: string;
    quote: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      setStart(true);
    }
  }

  const getSpeed = () => {
    switch (speed) {
      case "fast":
        return "40s";
      case "normal":
        return "60s";
      case "slow":
        return "80s";
      default:
        return "60s";
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          "--duration": getSpeed(),
          "--direction": direction === "left" ? "forwards" : "reverse",
        } as React.CSSProperties}
      >
        {items.map((item, idx) => (
          <li
            className="w-[350px] max-w-full relative flex-shrink-0"
            key={item.name + idx}
          >
            <div className="group relative overflow-hidden rounded-2xl bg-[#FDF7F4] p-8 hover:bg-[#8EB486]/10 transition-colors duration-500 border border-[#997C70]/20 h-full">
              <div className="relative z-10 flex items-center gap-4 mb-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#8EB486] ring-offset-2 ring-offset-[#FDF7F4] transition-all duration-500 group-hover:ring-[#997C70]"
                />
                <div>
                  <h4 className="text-lg font-semibold text-[#685752] group-hover:text-[#8EB486] transition-colors duration-500">
                    {item.name}
                  </h4>
                  <p className="text-sm text-[#997C70]">{item.title}</p>
                </div>
              </div>
              <div className="relative">
                <svg
                  className="absolute -left-3 -top-3 h-8 w-8 text-[#8EB486]/20 group-hover:text-[#8EB486]/40 transition-colors duration-500"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="relative z-10 text-[#685752] text-lg leading-relaxed transition-colors duration-500 group-hover:text-[#997C70]">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};