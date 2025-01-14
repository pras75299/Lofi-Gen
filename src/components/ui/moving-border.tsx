import React from "react";
import { cn } from "@/lib/utils";

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderClassName,
  ...props
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "relative p-[1px] bg-slate-800 overflow-hidden",
        containerClassName
      )}
      style={{
        borderRadius: "var(--radius)",
      }}
    >
      <div
        className={cn(
          "absolute inset-0",
          "bg-[linear-gradient(to_right,#818cf8,#c084fc,#818cf8)]",
          "animate-shimmer",
          "[background-size:200%_100%]",
          borderClassName
        )}
        style={{
          animationDuration: `${duration}ms`,
        }}
      />
      <div
        className={cn("relative bg-slate-900", className)}
        style={{
          borderRadius: "calc(var(--radius) - 1px)",
        }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};