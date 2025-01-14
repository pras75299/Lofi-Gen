import { cn } from "@/lib/utils";
import React from "react";

export const MeteorPreview = () => {
  const meteors = new Array(20).fill(true);
  return (
    <div className="h-full w-full absolute inset-0">
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-1/2 before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent"
          )}
          style={{
            top: 0,
            left: Math.random() * window.innerWidth + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.random() * (10 - 2) + 2 + "s",
          }}
        ></span>
      ))}
    </div>
  );
};