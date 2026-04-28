import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  spec?: string;
  className?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index = 0,
  spec,
  className,
}: FeatureCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl bg-cream/70 p-7",
        "shadow-inset-line transition-colors duration-300 hover:bg-cream",
        className
      )}
    >
      <div className="flex items-baseline justify-between">
        <span className="spec">{spec ?? `0${index + 1}`}</span>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 ease-out-soft group-hover:-rotate-6">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>

      <h3 className="mt-10 font-display text-2xl leading-[1.05] text-ink">
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        {description}
      </p>
    </motion.article>
  );
};
