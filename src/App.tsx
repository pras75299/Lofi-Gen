import { motion } from "motion/react";
import {
  Upload,
  Disc3,
  SlidersHorizontal,
  Sparkles,
  CassetteTape,
  Wand2,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureCard } from "./components/feature-card";
import { InfiniteMovingCards } from "./components/ui/infinite-moving-cards";
import { Layout } from "./components/layout/Layout";
import { Button } from "./components/ui/button";

const ease = [0.23, 1, 0.32, 1] as const;

const features = [
  {
    icon: Upload,
    spec: "01 / Intake",
    title: "Drop in. Hear it back.",
    description:
      "Drag any track — MP3, WAV, AAC. Your audio never leaves the browser. Processing happens locally.",
  },
  {
    icon: Disc3,
    spec: "02 / Texture",
    title: "Vinyl, tape, hiss.",
    description:
      "Authentic crackle modeled on dust grooves. Tape saturation. The kind of warm haze that makes a track feel found.",
  },
  {
    icon: SlidersHorizontal,
    spec: "03 / Control",
    title: "Fourteen parameters.",
    description:
      "Pitch, low-pass, reverb tail, spatial position, vocal reduction, compression. Move slowly. Listen carefully.",
  },
];

const presets = [
  { label: "CassetteTape Café", spec: "warm · slow", color: "bg-ochre" },
  { label: "Late Bedroom", spec: "soft · 70bpm", color: "bg-sienna" },
  { label: "Tape Rewind", spec: "wow & flutter", color: "bg-moss" },
  { label: "Rainy Window", spec: "low-pass", color: "bg-ink" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    title: "Producer",
    quote: "I used to chain three plugins for this. Now I drop a stem in and it sounds like a memory in twelve seconds.",
  },
  {
    name: "Marcus Rodriguez",
    title: "Bedroom producer",
    quote: "The pitch and tape saturation together — that's the sound I've been hunting for since 2019.",
  },
  {
    name: "Emily Taylor",
    title: "Creator",
    quote: "The vinyl crackle isn't a loop. You can hear it. It actually breathes with the track.",
  },
  {
    name: "Alex Kim",
    title: "Student",
    quote: "Made my entire study playlist over a weekend. Friends keep asking where I'm getting these.",
  },
  {
    name: "Jordan Lee",
    title: "Indie artist",
    quote: "The downloads sound finished. Not a demo, not a draft — finished.",
  },
];

function App() {
  return (
    <Layout>
      <Hero />
      <Marquee />
      <Features />
      <SoundSection />
      <Presets />
      <Testimonials />
      <FinalCTA />
    </Layout>
  );
}

/* ──────────────── Hero ──────────────── */

const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="grain" />
    <div className="mx-auto max-w-7xl px-6 md:px-10 pt-20 md:pt-28 pb-24 md:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="flex items-center gap-3"
      >
        <span className="tape-reel h-2.5 w-2.5 animate-tape" />
        <span className="spec">Now recording — v.02</span>
      </motion.div>

      <h1 className="mt-10 font-display text-[clamp(3rem,11vw,9.5rem)] leading-[0.88] tracking-[-0.04em] text-ink">
        <motion.span
          className="block"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
          style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144, "wght" 400' }}
        >
          Tape-soaked
        </motion.span>
        <motion.span
          className="block italic text-sienna"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.18 }}
          style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144, "wght" 400' }}
        >
          lo-fi, in the
        </motion.span>
        <motion.span
          className="block"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.31 }}
          style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144, "wght" 400' }}
        >
          browser.
        </motion.span>
      </h1>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.45 }}
          className="md:col-span-6 max-w-xl"
        >
          <p className="text-[17px] md:text-[19px] leading-relaxed text-ink-soft">
            Drop a track. Pull fourteen knobs. Hear it come back washed in dust,
            slowed by tape, blurred by rain. Nothing uploads — your stems stay
            on your laptop where they belong.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/create">
              <Button size="lg" iconRight={<ArrowUpRight className="h-4 w-4" />}>
                Open the studio
              </Button>
            </Link>
            <a href="#features" className="link-underline text-sm text-ink-soft hover:text-ink">
              See what's inside
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.55 }}
          className="md:col-span-6 md:col-start-8"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </div>
  </section>
);

const HeroVisual = () => (
  <div className="relative">
    {/* Tape device card */}
    <div className="relative rounded-2xl bg-cream border border-line shadow-lift overflow-hidden">
      {/* Top strip / brand */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <CassetteTape className="h-4 w-4 text-sienna" strokeWidth={1.5} />
          <span className="spec">LOFIGEN — TYPE II</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse-soft" />
          <span className="spec">REC</span>
        </div>
      </div>

      {/* Reels */}
      <div className="relative px-8 py-10 bg-paper">
        <div className="flex items-center justify-between">
          <Reel />
          <div className="h-px flex-1 bg-line mx-6" />
          <Reel reverse />
        </div>

        {/* Faux track label */}
        <div className="mt-8 rounded-md bg-ochre/30 border border-ochre/50 px-4 py-3">
          <div className="flex items-baseline justify-between">
            <p className="font-display italic text-ink text-[18px] leading-none" style={{ fontVariationSettings: '"SOFT" 100, "wght" 500' }}>
              memory.wav
            </p>
            <span className="spec">2:14 / 90 bpm</span>
          </div>
          <Waveform />
        </div>

        {/* Knobs */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {["VINYL", "TAPE", "REVERB", "TEMPO"].map((label, i) => (
            <Knob key={label} label={label} value={[0.7, 0.55, 0.4, 0.85][i]} idx={i} />
          ))}
        </div>
      </div>
    </div>

    {/* Floating spec card */}
    <div className="absolute -left-8 -bottom-6 hidden md:block">
      <div className="rounded-xl bg-ink text-paper px-4 py-3 shadow-lift">
        <div className="spec text-paper/60">Processing</div>
        <div className="font-display text-2xl leading-none mt-1" style={{ fontVariationSettings: '"SOFT" 80, "wght" 500' }}>
          0.0s latency
        </div>
      </div>
    </div>
  </div>
);

const Reel = ({ reverse }: { reverse?: boolean }) => (
  <div
    className="tape-reel grid h-20 w-20 place-items-center animate-tape"
    style={reverse ? { animationDirection: "reverse" } : undefined}
  >
    <div className="h-3 w-3 rounded-full bg-ink" />
  </div>
);

const Waveform = () => (
  <svg viewBox="0 0 200 28" className="mt-3 h-7 w-full text-sienna" preserveAspectRatio="none">
    {Array.from({ length: 60 }, (_, i) => {
      const h = 4 + Math.abs(Math.sin(i * 0.7)) * 18 + Math.cos(i * 0.3) * 5;
      return (
        <rect
          key={i}
          x={i * 3.4}
          y={(28 - h) / 2}
          width="2"
          height={h}
          fill="currentColor"
          opacity={0.45 + (i % 7) * 0.06}
        />
      );
    })}
  </svg>
);

const Knob = ({ label, value, idx }: { label: string; value: number; idx: number }) => {
  const angle = -135 + value * 270;
  // Each knob drifts on its own slow sine — feels like it's listening
  const driftDuration = 5 + idx * 1.3;
  return (
    <div className="text-center">
      <div className="relative mx-auto h-12 w-12 rounded-full bg-paper border border-ink/15 shadow-card overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute inset-1 rounded-full"
          style={{
            background:
              "conic-gradient(from -135deg, rgba(26,23,20,0.06) 0 270deg, transparent 270deg)",
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-full bg-ink rounded-full origin-bottom"
          style={{ transformOrigin: "50% 100%" }}
          animate={{ rotate: [angle - 4, angle + 4, angle - 4] }}
          transition={{ duration: driftDuration, ease: "easeInOut", repeat: Infinity }}
        />
        <span
          className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/40"
        />
      </div>
      <div className="spec mt-1.5">{label}</div>
    </div>
  );
};

/* ──────────────── Marquee strip ──────────────── */

const Marquee = () => (
  <section className="border-y border-line py-4 bg-cream/40 overflow-hidden">
    <div className="flex animate-scroll whitespace-nowrap"
         style={{ "--duration": "60s", "--direction": "forwards" } as React.CSSProperties}>
      {[...Array(2)].map((_, dup) => (
        <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
          {[
            "CassetteTape saturation",
            "Vinyl crackle",
            "Tape hiss",
            "Bit crush",
            "Spatial pan",
            "Pitch shift",
            "Wow & flutter",
            "Vocal reduction",
            "Reverb tail",
          ].map((t) => (
            <span key={t + dup} className="flex items-center gap-6 px-6">
              <span className="font-display text-[28px] italic text-ink"
                    style={{ fontVariationSettings: '"SOFT" 100, "wght" 400' }}>
                {t}
              </span>
              <span className="text-sienna text-2xl">✺</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </section>
);

/* ──────────────── Features ──────────────── */

const Features = () => (
  <section id="features" className="py-28 md:py-40">
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-16 md:mb-20">
        <div className="md:col-span-4">
          <span className="spec">§ Features</span>
        </div>
        <div className="md:col-span-8">
          <h2 className="font-display text-[clamp(2rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em] text-ink"
              style={{ fontVariationSettings: '"SOFT" 80, "opsz" 144, "wght" 400' }}>
            Three things you'll<br />
            <span className="italic text-sienna">actually feel.</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <FeatureCard key={f.title} {...f} index={i} />
        ))}
      </div>
    </div>
  </section>
);

/* ──────────────── Sound section: bento ──────────────── */

const SoundSection = () => (
  <section id="sound" className="py-24 md:py-32 bg-ink text-paper">
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 mb-16">
        <div className="md:col-span-5">
          <span className="spec text-paper/50">§ Engine</span>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em] text-paper"
              style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144, "wght" 400' }}>
            DSP, not a<br />
            <span className="italic text-sienna-soft">filter pack.</span>
          </h2>
        </div>
        <p className="md:col-span-6 md:col-start-7 self-end text-[17px] leading-relaxed text-paper/70">
          Built on the Web Audio API with offline rendering. Convolutions for the
          reverb tail, FFT for vocal isolation, oversampled bit-crush for the grit.
          You get a tool, not a preset menu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
        <BentoCard
          className="md:col-span-3 md:row-span-2 min-h-[280px]"
          spec="01"
          title="Real-time"
          body="Move a knob, hear it. Sub-frame audio graph means there's no rebuild between every parameter change."
          accent={<EngineAnim />}
        />
        <BentoCard
          className="md:col-span-3"
          spec="02"
          title="Offline export"
          body="WAV export uses Tone.Offline — sample-accurate, render the whole timeline at full quality, no clicks."
        />
        <BentoCard
          className="md:col-span-3"
          spec="03"
          title="Local first"
          body="Audio decodes in the browser. Stems don't leave your machine unless you choose to save them."
        />
      </div>
    </div>
  </section>
);

interface BentoCardProps {
  className?: string;
  spec: string;
  title: string;
  body: string;
  accent?: React.ReactNode;
}

const BentoCard = ({ className, spec, title, body, accent }: BentoCardProps) => (
  <div className={`relative overflow-hidden rounded-2xl border border-paper/10 bg-paper/[0.04] p-7 ${className ?? ""}`}>
    <div className="flex items-baseline justify-between">
      <span className="spec text-paper/50">{spec}</span>
      <Sparkles className="h-3.5 w-3.5 text-sienna-soft" strokeWidth={1.5} />
    </div>
    <h3 className="mt-10 font-display text-3xl text-paper" style={{ fontVariationSettings: '"SOFT" 100, "wght" 400' }}>
      {title}
    </h3>
    <p className="mt-3 text-[15px] leading-relaxed text-paper/60 max-w-md">{body}</p>
    {accent}
  </div>
);

const EngineAnim = () => (
  <div className="absolute right-6 bottom-6 left-6 h-24 flex items-center gap-[3px]">
    {Array.from({ length: 56 }, (_, i) => {
      const h = 24 + Math.abs(Math.sin(i * 0.42)) * 50 + Math.cos(i * 0.22) * 10;
      const opacity = 0.3 + (i % 5) * 0.14;
      return (
        <span
          key={i}
          className="flex-1 rounded-sm bg-sienna-soft animate-bar will-change-transform origin-center"
          style={{
            height: `${h}%`,
            opacity,
            animationDelay: `${(i % 12) * 60}ms`,
            animationDuration: `${1400 + (i % 7) * 80}ms`,
          }}
        />
      );
    })}
  </div>
);

/* ──────────────── Presets ──────────────── */

const Presets = () => (
  <section id="presets" className="py-24 md:py-32">
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <span className="spec">§ Presets</span>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-ink"
              style={{ fontVariationSettings: '"SOFT" 80, "wght" 400' }}>
            Four starting points,<br />
            <span className="italic text-sienna">infinite endings.</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {presets.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: i * 0.06, ease }}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-line"
          >
            <div className={`absolute inset-0 ${p.color} opacity-90 transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]`} />
            <div className="grain" />
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-paper">
              <span className="spec text-paper/70">PRESET 0{i + 1}</span>
              <div>
                <div className="font-display text-[28px] leading-tight"
                     style={{ fontVariationSettings: '"SOFT" 100, "wght" 500' }}>
                  {p.label}
                </div>
                <div className="spec text-paper/70 mt-1">{p.spec}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ──────────────── Testimonials ──────────────── */

const Testimonials = () => (
  <section id="voices" className="py-24 md:py-32 border-t border-line">
    <div className="mx-auto max-w-7xl px-6 md:px-10 mb-12 md:mb-16">
      <span className="spec">§ Voices</span>
      <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-ink max-w-3xl"
          style={{ fontVariationSettings: '"SOFT" 80, "wght" 400' }}>
        Producers who came<br />
        <span className="italic text-sienna">for the sound, stayed for the workflow.</span>
      </h2>
    </div>
    <InfiniteMovingCards items={testimonials} speed="slow" />
  </section>
);

/* ──────────────── CTA ──────────────── */

const FinalCTA = () => (
  <section id="cta" className="py-32 md:py-40 bg-sienna text-paper relative overflow-hidden">
    <div className="grain" />
    <div className="mx-auto max-w-5xl px-6 md:px-10 text-center relative">
      <Wand2 className="mx-auto h-6 w-6 text-paper/80 mb-6" strokeWidth={1.4} />
      <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.92] tracking-[-0.03em]"
          style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144, "wght" 400' }}>
        Press record.<br />
        <span className="italic">Wait twelve seconds.</span>
      </h2>
      <p className="mt-8 text-lg text-paper/85 max-w-xl mx-auto">
        Free to start. No sign-up. Stems stay on your machine.
      </p>

      <div className="mt-10 flex justify-center">
        <Link to="/create">
          <Button variant="secondary" size="lg" iconRight={<ArrowUpRight className="h-4 w-4" />}>
            Open the studio
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default App;
