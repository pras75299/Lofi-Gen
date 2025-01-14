import { cn } from "@/lib/utils";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const MouseEnterContext = createContext<{
  mouseX: number;
  mouseY: number;
}>({
  mouseX: 0,
  mouseY: 0,
});

export const ThreeDCard = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMouseX(x);
    setMouseY(y);
  };

  const handleMouseLeave = () => {
    setMouseX(0);
    setMouseY(0);
  };

  return (
    <div
      className={cn("relative group", containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <MouseEnterContext.Provider value={{ mouseX, mouseY }}>
        <div
          className={cn(
            "relative h-full bg-[#3A561F] rounded-2xl p-8 transition-all duration-200 ease-in-out",
            "hover:shadow-2xl hover:scale-[1.02] transform-gpu",
            "before:absolute before:inset-0 before:rounded-2xl before:transition-all before:duration-200",
            "before:opacity-0 group-hover:before:opacity-100",
            "before:bg-gradient-to-br before:from-[#8EB486]/20 before:to-[#997C70]/20",
            className
          )}
        >
          {children}
        </div>
      </MouseEnterContext.Provider>
    </div>
  );
};

export const ThreeDCardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { mouseX, mouseY } = useContext(MouseEnterContext);

  const getTransform = () => {
    if (!mouseX || !mouseY) return "translate3d(0, 0, 0) rotateX(0) rotateY(0)";
    return `translate3d(${(mouseX - 150) / 20}px, ${
      (mouseY - 150) / 20
    }px, 20px) rotateX(${(mouseY - 150) / 20}deg) rotateY(${
      -(mouseX - 150) / 20
    }deg)`;
  };

  return (
    <h3
      className={cn(
        "text-xl font-semibold text-white transition-transform will-change-transform",
        className
      )}
      style={{ transform: getTransform() }}
    >
      {children}
    </h3>
  );
};

export const ThreeDCardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { mouseX, mouseY } = useContext(MouseEnterContext);

  const getTransform = () => {
    if (!mouseX || !mouseY) return "translate3d(0, 0, 0) rotateX(0) rotateY(0)";
    return `translate3d(${(mouseX - 150) / 30}px, ${
      (mouseY - 150) / 30
    }px, 10px) rotateX(${(mouseY - 150) / 30}deg) rotateY(${
      -(mouseX - 150) / 30
    }deg)`;
  };

  return (
    <p
      className={cn(
        "text-gray-400 transition-transform will-change-transform",
        className
      )}
      style={{ transform: getTransform() }}
    >
      {children}
    </p>
  );
};