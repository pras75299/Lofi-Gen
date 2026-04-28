import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "ink";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-soft border border-ink",
  secondary:
    "bg-paper text-ink hover:bg-cream border border-ink/15",
  ghost:
    "bg-transparent text-ink hover:bg-ink/5 border border-transparent",
  ink:
    "bg-sienna text-paper hover:bg-[#B5563F] border border-sienna",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, iconLeft, iconRight, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "press group/btn inline-flex items-center justify-center rounded-full font-medium",
          "transition-colors duration-200 ease-out-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "cursor-pointer select-none whitespace-nowrap",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : iconLeft ? (
          <span className="inline-flex transition-transform duration-200 ease-out-soft group-hover/btn:-translate-x-0.5">
            {iconLeft}
          </span>
        ) : null}
        {children}
        {!loading && iconRight && (
          <span className="inline-flex transition-transform duration-200 ease-out-soft group-hover/btn:translate-x-0.5">
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
