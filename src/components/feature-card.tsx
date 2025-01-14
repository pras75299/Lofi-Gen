import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreeDCard, ThreeDCardTitle, ThreeDCardDescription } from "./ui/3d-card";

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) => {
  return (
    <ThreeDCard className={className}>
      <div className="relative z-10 h-full">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#5D8736]/20 text-[#5D8736] transition-colors group-hover:bg-[#5D8736] group-hover:text-white">
          <Icon className="h-6 w-6" />
        </div>
        <ThreeDCardTitle className="mb-2">{title}</ThreeDCardTitle>
        <ThreeDCardDescription>{description}</ThreeDCardDescription>
      </div>
    </ThreeDCard>
  );
};