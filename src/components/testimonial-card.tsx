import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const TestimonialCard = ({
  testimonial,
  className,
}: {
  testimonial: {
    name: string;
    title: string;
    image: string;
    quote: string;
  };
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-[#FDF7F4] p-8 hover:bg-[#8EB486]/10 transition-colors duration-500",
        "border border-[#997C70]/20",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#8EB486]/0 before:to-[#997C70]/0 before:opacity-0 before:transition-opacity before:duration-500",
        "hover:before:opacity-100",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="relative z-10 flex items-center gap-4 mb-6">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-[#8EB486] ring-offset-2 ring-offset-[#FDF7F4] transition-all duration-500 group-hover:ring-[#997C70]"
        />
        <div>
          <h4 className="text-lg font-semibold text-[#685752] group-hover:text-[#8EB486] transition-colors duration-500">
            {testimonial.name}
          </h4>
          <p className="text-sm text-[#997C70]">{testimonial.title}</p>
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
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </div>
    </motion.div>
  );
};